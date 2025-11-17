import { getDictionary } from "@/app/[lang]/dictionaries";
import Wrapper from "@/app/components/Common/modules/Wrapper";
import MarketEntry from "@/app/components/Market/modules/MarketEntry";

export default async function Manage() {
  const dict = await (getDictionary as (locale: any) => Promise<any>)("en");
  return <Wrapper dict={dict} page={<MarketEntry dict={dict} />}></Wrapper>;
}
