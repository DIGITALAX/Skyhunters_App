import { getDictionary } from "../[lang]/dictionaries";
import Wrapper from "../components/Common/modules/Wrapper";
import CouncilEntry from "../components/Council/modules/CouncilEntry";

export default async function Home() {
  const dict = await (getDictionary as (locale: any) => Promise<any>)("en");
  return <Wrapper dict={dict} page={<CouncilEntry dict={dict} />}></Wrapper>;
}
