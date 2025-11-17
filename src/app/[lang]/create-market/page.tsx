import CreateMarketEntry from "@/app/components/Create/modules/CreateMarketEntry";
import { getDictionary } from "../dictionaries";
import { tParams } from "../layout";

export default async function CreateMarket({ params }: { params: tParams }) {
  const { lang } = await params;
  const dict = await (getDictionary as (locale: any) => Promise<any>)(lang);
  return <CreateMarketEntry dict={dict} />;
}
