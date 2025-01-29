import Entry from "../components/Common/modules/Entry";
import { getDictionary } from "./dictionaries";

export default async function IndexPage({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const dict = await (getDictionary as (locale: any) => Promise<any>)(lang);
  return <Entry dict={dict} lang={lang} />;
}
