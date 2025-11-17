"use client";

import { JSX } from "react";
import { ModalsEntry } from "../../Modals/modules/ModalsEntry";
import HeaderEntry from "./HeaderEntry";
import FooterEntry from "./FooterEntry";

export default function Wrapper({
  dict,
  page,
}: {
  dict: any;
  page: JSX.Element;
}) {
  return (
    <div className="max-w-3xl text-xs mx-auto">
      <HeaderEntry dict={dict} />
      {page}
      <FooterEntry dict={dict} />
      <ModalsEntry dict={dict} />
    </div>
  );
}
