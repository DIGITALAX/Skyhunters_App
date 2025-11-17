import { getDictionary } from "../[lang]/dictionaries";
import Wrapper from "../components/Common/modules/Wrapper";
import ManageEntry from "../components/Manage/modules/ManageEntry";

export default async function Manage() {
  const dict = await (getDictionary as (locale: any) => Promise<any>)("en");
  return <Wrapper dict={dict} page={<ManageEntry dict={dict} />}></Wrapper>;
}
