import { getDictionary } from "../[lang]/dictionaries";
import Wrapper from "../components/Common/modules/Wrapper";
import CreateMarketEntry from "../components/Create/modules/CreateMarketEntry";

export default async function CreateMarket() {
  const dict = await (getDictionary as (locale: any) => Promise<any>)("en");
  return <Wrapper dict={dict} page={<CreateMarketEntry dict={dict} />}></Wrapper>;
}
