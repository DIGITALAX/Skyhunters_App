import CouncilEntry from "@/app/components/Council/modules/CouncilEntry";
import { getDictionary } from "../dictionaries";
import { tParams } from "../layout";

export default async function Council({ params }: { params: tParams }) {
  const { lang } = await params;
  const dict = await (getDictionary as (locale: any) => Promise<any>)(lang);
  return <CouncilEntry dict={dict} />;
}
