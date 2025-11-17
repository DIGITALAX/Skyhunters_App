import ManageEntry from "@/app/components/Manage/modules/ManageEntry";
import { getDictionary } from "../dictionaries";
import { tParams } from "../layout";

export default async function Manage({ params }: { params: tParams }) {
  const { lang } = await params;
  const dict = await (getDictionary as (locale: any) => Promise<any>)(lang);
  return <ManageEntry dict={dict} />;
}
