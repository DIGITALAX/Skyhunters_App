import Link from "next/link";
import { getDictionary } from "./../dictionaries";

export default async function NotFound({
  params,
}: {
  params: { lang: string };
}) {
  const { lang } = await params;
  const dict = await (getDictionary as (locale: any) => Promise<any>)(lang);
  return (
    <div className="relative w-full h-screen flex items-center justify-center text-center text-sm text-white break-words">
      <Link
        className="cursor-pointer w-fit h-fit flex items-center justify-center"
        href="/"
      >
        {dict[404].nada}
      </Link>
    </div>
  );
}
