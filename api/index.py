"""
でんしゃ・えき たんけんたい のバックエンド (FastAPI)。

Vercel では api/index.py が 1つの Python Serverless Function になり、
next.config.ts の rewrites で /api/py/* がここに流れてくる。
ローカル開発では uvicorn を 8000番で立て、同じパスで待ち受ける。

提供するもの:
  GET /api/py/health          疎通確認
  GET /api/py/ruby?text=...   動的テキストへのルビ振り（pykakasi）
  GET /api/py/image?title=... Wikipedia/Wikimedia の代表画像プロキシ
  GET /api/py/odpt/...        ODPT APIのラッパー（APIキー未設定でも落ちない）
"""

from __future__ import annotations

import os
import re
import time
from typing import Any
from urllib.parse import quote

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# 社内プロキシやウイルス対策ソフトが TLS を検査している環境では、
# certifi のCAだけでは外部HTTPSが検証できない。OSの証明書ストアも見にいく。
try:
    import truststore

    truststore.inject_into_ssl()
except Exception:  # truststore が無くても動作は続ける
    pass

app = FastAPI(
    title="train-explorer API",
    description="こども向け鉄道アプリのバックエンド",
    docs_url="/api/py/docs",
    openapi_url="/api/py/openapi.json",
)

def env(name: str, default: str) -> str:
    """
    環境変数を読む。**未設定だけでなく空文字も既定値に倒す。**

    os.environ.get(name, default) だと、キーが存在して値が空のときに ""
    が返る。Vercel は .env.example を取り込むと変数を空で作ることがあり、
    それで float("") がインポート時に例外を投げて関数ごと 500 になった。
    """
    return os.environ.get(name, "").strip() or default


def env_number(name: str, default: float) -> float:
    """数値の環境変数。空でも壊れた値でも既定値に倒す（設定ミスで落とさない）。"""
    try:
        return float(env(name, str(default)))
    except ValueError:
        return default


# ローカルで Next.js(3000) から叩けるように緩めに許可する。
# 本番は同一オリジン(rewrites経由)なので CORS は実質使われない。
app.add_middleware(
    CORSMiddleware,
    allow_origins=env("CORS_ALLOW_ORIGINS", "*").split(","),
    allow_methods=["GET"],
    allow_headers=["*"],
)

# Wikimedia は User-Agent ポリシーが厳しく、連絡先の無いUAは 403 になる。
# フォークするなど連絡先を変えたいときだけ WIKI_USER_AGENT で上書きする。
USER_AGENT = env(
    "WIKI_USER_AGENT",
    "train-explorer/0.1 (https://github.com/jumperyky/train-explorer) python-httpx",
)
WIKI_API = "https://ja.wikipedia.org/w/api.php"
COMMONS_API = "https://commons.wikimedia.org/w/api.php"
ODPT_BASE = env("ODPT_BASE_URL", "https://api.odpt.org/api/v4")

# ---------------------------------------------------------------- キャッシュ
# Serverless の同一インスタンスが生きている間だけ効く、素朴なTTLキャッシュ。
# 本格運用時は Vercel KV / Upstash 等に差し替える。
_CACHE: dict[str, tuple[float, Any]] = {}
_CACHE_TTL = env_number("CACHE_TTL_SECONDS", 3600)


def cache_get(key: str) -> Any | None:
    hit = _CACHE.get(key)
    if not hit:
        return None
    expires_at, value = hit
    if expires_at < time.time():
        _CACHE.pop(key, None)
        return None
    return value


def cache_set(key: str, value: Any) -> None:
    _CACHE[key] = (time.time() + _CACHE_TTL, value)


# ------------------------------------------------------------------- health


@app.get("/api/py/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "ruby_engine": "pykakasi" if _kakasi() else "unavailable",
        "odpt_token_configured": bool(env("ODPT_ACCESS_TOKEN", "")),
    }


# --------------------------------------------------------------------- ruby

_KANJI_RE = re.compile(r"[一-鿿々〆]")
_TRAILING_KANA_RE = re.compile(r"[ぁ-ゖ]+$")


def _split_okurigana(word: str) -> tuple[str, str]:
    """「走って」→ ("走", "って")。末尾のひらがな（送り仮名）を切り出す。"""
    m = _TRAILING_KANA_RE.search(word)
    if not m:
        return word, ""
    return word[: m.start()], m.group(0)
_kakasi_instance: Any = None
_kakasi_tried = False


def _kakasi() -> Any:
    """pykakasi は未インストールでも API 全体を落とさない（遅延ロード）。"""
    global _kakasi_instance, _kakasi_tried
    if _kakasi_tried:
        return _kakasi_instance
    _kakasi_tried = True
    try:
        import pykakasi  # type: ignore

        _kakasi_instance = pykakasi.kakasi()
    except Exception:
        _kakasi_instance = None
    return _kakasi_instance


class RubyResponse(BaseModel):
    text: str
    ruby: str
    engine: str


@app.get("/api/py/ruby", response_model=RubyResponse)
def ruby(text: str = Query(..., min_length=1, max_length=200)) -> RubyResponse:
    """
    漢字を含むテキストを「漢字《よみ》」記法（青空文庫式）に変換する。
    フロントの lib/ruby.ts がこの記法を <ruby> に描画する。
    《》で読みの範囲が閉じるので、送り仮名や助詞をルビが飲み込まない。
    """
    kks = _kakasi()
    if kks is None:
        # pykakasi が無い環境でも 200 を返す（フロントは元テキストを表示するだけ）
        return RubyResponse(text=text, ruby=text, engine="none")

    out: list[str] = []
    for item in kks.convert(text):
        orig = item.get("orig", "")
        hira = item.get("hira", "")
        if orig and hira and orig != hira and _KANJI_RE.search(orig):
            # pykakasi は「走って」を orig=走って / hira=はしって のように
            # 送り仮名ごと返す。送り仮名は親文字から外し、ルビは漢字だけに振る。
            base, okurigana = _split_okurigana(orig)
            reading = hira[: len(hira) - len(okurigana)] if okurigana else hira
            out.append(f"{base}《{reading}》{okurigana}")
        else:
            out.append(orig)
    return RubyResponse(text=text, ruby="".join(out), engine="pykakasi")


# -------------------------------------------------------------------- image


class ImageResponse(BaseModel):
    title: str
    imageUrl: str | None = None
    pageUrl: str | None = None
    extract: str | None = None


# MediaWiki は要求幅を許可済みのサイズに切り上げる（480 → 500px, 約80KB）。
# カードは高さ160px、詳細モーダルでも幅512pxなので500pxで足りる。
# 640 を指定すると 960px・約200KB になり、11枚で2MBを超えてしまう。
IMAGE_WIDTH = int(env_number("IMAGE_WIDTH", 480))


@app.get("/api/py/image", response_model=ImageResponse)
async def image(title: str = Query(..., min_length=1, max_length=120)) -> ImageResponse:
    """
    車両名・駅名をキーに、日本語版Wikipediaの代表画像とみだし文を返す。

    サムネイルの幅は pithumbsize で MediaWiki に依頼する。
    upload.wikimedia.org のURLを自前で書き換えてはいけない:
    許可された幅以外は 400「Use thumbnail sizes listed on ...」で弾かれ、
    しかも許可される幅は画像ごとに違う。MediaWiki に発行させれば必ず有効なURLになる。
    """
    key = f"image:{title}"
    cached = cache_get(key)
    if cached is not None:
        return ImageResponse(**cached)

    params = {
        "action": "query",
        "format": "json",
        "formatversion": "2",
        "redirects": "1",
        "prop": "pageimages|extracts",
        "piprop": "thumbnail",
        "pithumbsize": str(IMAGE_WIDTH),
        "exintro": "1",
        "explaintext": "1",
        "exsentences": "2",
        "titles": title,
    }
    try:
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
            res = await client.get(
                WIKI_API,
                params=params,
                headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
            )
        res.raise_for_status()
        pages = (res.json().get("query") or {}).get("pages") or []
        page = pages[0] if pages else {}
        if page.get("missing"):
            payload = ImageResponse(title=title).model_dump()
        else:
            resolved = page.get("title") or title
            thumb = page.get("thumbnail") or {}
            payload = ImageResponse(
                title=title,
                imageUrl=thumb.get("source"),
                pageUrl=f"https://ja.wikipedia.org/wiki/{quote(resolved.replace(' ', '_'))}",
                extract=page.get("extract"),
            ).model_dump()
    except (httpx.HTTPError, ValueError, KeyError):
        # 画像が取れなくてもフロントは内蔵イラストにフォールバックする
        payload = ImageResponse(title=title).model_dump()

    cache_set(key, payload)
    return ImageResponse(**payload)


# -------------------------------------------------------------------- photo


class PhotoResponse(BaseModel):
    file: str
    imageUrl: str | None = None
    """表示用サムネイルのURL"""
    descriptionUrl: str | None = None
    """Commons のファイル解説ページ。クレジットのリンク先"""
    artist: str | None = None
    license: str | None = None
    licenseUrl: str | None = None
    attributionRequired: bool = True


_TAG_RE = re.compile(r"<[^>]+>")


def _plain(html: str | None) -> str | None:
    """extmetadata の値はHTML断片で返ってくるのでタグを落とす。"""
    if not html:
        return None
    return _TAG_RE.sub("", html).strip() or None


@app.get("/api/py/photo", response_model=PhotoResponse)
async def photo(
    file: str = Query(..., min_length=1, max_length=200),
) -> PhotoResponse:
    """
    Commons のファイルを直接指定して、サムネイルURLと**クレジット情報**を返す。

    CC BY-SA の写真は表示にクレジットが要る（AttributionRequired=true）ので、
    画像URLだけでなく撮影者とライセンスも一緒に返し、UI側で必ず出せるようにする。
    サムネイル幅は iiurlwidth で Commons に発行させる（幅の自前書き換えは 400 になる）。
    """
    name = file if file.lower().startswith("file:") else f"File:{file}"
    key = f"photo:{name}"
    cached = cache_get(key)
    if cached is not None:
        return PhotoResponse(**cached)

    params = {
        "action": "query",
        "format": "json",
        "formatversion": "2",
        "prop": "imageinfo",
        "iiprop": "url|extmetadata",
        "iiurlwidth": str(IMAGE_WIDTH),
        "titles": name,
    }
    try:
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
            res = await client.get(
                COMMONS_API,
                params=params,
                headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
            )
        res.raise_for_status()
        pages = (res.json().get("query") or {}).get("pages") or []
        page = pages[0] if pages else {}
        info = (page.get("imageinfo") or [{}])[0]
        meta = info.get("extmetadata") or {}
        required = (meta.get("AttributionRequired") or {}).get("value")
        payload = PhotoResponse(
            file=name,
            imageUrl=info.get("thumburl") or info.get("url"),
            descriptionUrl=info.get("descriptionurl"),
            artist=_plain((meta.get("Artist") or {}).get("value")),
            license=_plain((meta.get("LicenseShortName") or {}).get("value")),
            licenseUrl=_plain((meta.get("LicenseUrl") or {}).get("value")),
            # 不明なときは「必要」に倒す（表示しすぎる方が安全）
            attributionRequired=str(required).lower() != "false",
        ).model_dump()
    except (httpx.HTTPError, ValueError, KeyError, IndexError):
        payload = PhotoResponse(file=name).model_dump()

    cache_set(key, payload)
    return PhotoResponse(**payload)


# --------------------------------------------------------------------- ODPT


@app.get("/api/py/odpt/{resource:path}")
async def odpt(resource: str, request_params: str | None = None) -> Any:
    """
    公共交通オープンデータセンター(ODPT) APIの薄いラッパー。
    ODPT_ACCESS_TOKEN が未設定のうちは 503 を返し、
    フロントはモックデータのまま動き続ける。
    """
    token = env("ODPT_ACCESS_TOKEN", "")
    if not token:
        raise HTTPException(
            status_code=503,
            detail="ODPT_ACCESS_TOKEN is not configured. アプリはモックデータで動作中です。",
        )

    key = f"odpt:{resource}:{request_params}"
    cached = cache_get(key)
    if cached is not None:
        return cached

    params: dict[str, str] = {"acl:consumerKey": token}
    if request_params:
        for pair in request_params.split("&"):
            if "=" in pair:
                k, v = pair.split("=", 1)
                params[k] = v

    async with httpx.AsyncClient(timeout=10.0) as client:
        res = await client.get(
            f"{ODPT_BASE}/{resource}", params=params, headers={"User-Agent": USER_AGENT}
        )
    if res.status_code >= 400:
        raise HTTPException(status_code=res.status_code, detail="ODPT request failed")

    data = res.json()
    cache_set(key, data)
    return data
