import { getDictionary } from "@/app/[lang]/dictionaries";
import HeaderEntry from "./HeaderEntry";
import { tParams } from "@/app/[lang]/layout";

export default async function Header({ params }: { params: tParams }) {
  const { lang } = await params;
  const dict = await (getDictionary as (locale: any) => Promise<any>)(
    lang ?? "en"
  );
  return <HeaderEntry dict={dict} />;
}
