import Footer from "../components/Common/modules/Footer";
import Header from "../components/Common/modules/Header";
import Modals from "../components/Common/modules/Modals";

export type tParams = Promise<{ lang: string }>;
export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "es" }];
}

export default function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: tParams;
}>) {
  return (
    <div className="max-w-3xl text-xs mx-auto">
      <Header params={params} />
      {children}
      <Footer params={params} />
      <Modals params={params} />
    </div>
  );
}
