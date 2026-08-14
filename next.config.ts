import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  /**
   * /api/py/* を Python(FastAPI) 側へ流す。
   * - 開発: ローカルの uvicorn (127.0.0.1:8000)
   * - 本番: Vercel の Python Serverless Function (api/index.py)
   * バックエンドを別サービス(Render等)に置く場合は API_ORIGIN を設定すれば切り替わる。
   */
  async rewrites() {
    const origin = process.env.API_ORIGIN;
    if (origin) {
      return [{ source: "/api/py/:path*", destination: `${origin}/api/py/:path*` }];
    }
    return [
      {
        source: "/api/py/:path*",
        destination: isDev ? "http://127.0.0.1:8000/api/py/:path*" : "/api/",
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
