import AppHeader from "@/components/AppHeader";
import ZukanClient from "./ZukanClient";

export const metadata = { title: "でんしゃ ずかん | でんしゃ・えき たんけんたい" };

export default async function ZukanPage({ searchParams }: PageProps<"/zukan">) {
  // ?train=xxx（車掌さんマイクからのジャンプ）はサーバー側で読み取って props で渡す。
  // クライアントで useSearchParams を使うと Suspense 境界が必要になり、
  // 静的プリレンダリングとの相性が悪いため。
  const sp = await searchParams;
  const train = typeof sp.train === "string" ? sp.train : null;

  return (
    <>
      <AppHeader title="電車《でんしゃ》 図鑑《ずかん》" emoji="📖" color="#0b57d0" />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-10">
        <ZukanClient initialTrainId={train} />
      </main>
    </>
  );
}
