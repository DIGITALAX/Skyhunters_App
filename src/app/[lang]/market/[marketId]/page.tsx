import { getDictionary } from "@/app/[lang]/dictionaries";
import { tParams } from "@/app/[lang]/layout";
import MarketEntry from "@/app/components/Market/modules/MarketEntry";

export default async function Manage({ params }: { params: tParams }) {
  const { lang } = await params;
  const dict = await (getDictionary as (locale: any) => Promise<any>)(lang);
  return <MarketEntry dict={dict} />;
}
