import { getDictionary } from "@/app/[lang]/dictionaries";
import { tParams } from "@/app/[lang]/layout";
import { ModalsEntry } from "../../Modals/modules/ModalsEntry";

export default async function Modals({ params }: { params: tParams }) {
  const { lang } = await params;
  const dict = await (getDictionary as (locale: any) => Promise<any>)(
    lang ?? "en"
  );
  return <ModalsEntry dict={dict} />;
}
