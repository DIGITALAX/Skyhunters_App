"use client";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useContext } from "react";
import { ModalContext } from "@/app/providers";
import Bar from "./Bar";
import useBar from "../hooks/useBar";
import Cambio from "./Cambio";

export default function Entry({ dict, lang }: { dict: any; lang: string }) {
  const router = useRouter();
  const { abrirBar, setAbrirBar, pantalla, setPantalla } = useBar();
  const { isConnected } = useAccount();
  const contexto = useContext(ModalContext);
  return (
    <div className="relative w-full h-screen bg-negro flex items-start justify-center flex-row overflow-scroll-none">
      <div className="relative w-fit h-full flex">
        <div className="relative w-10 h-full flex">
          <Bar
            pantalla={pantalla}
            setPantalla={setPantalla}
            router={router}
            setAbrirBar={setAbrirBar}
            abrirBar={abrirBar}
            dict={dict}
          />
        </div>
      </div>
      <div className="relative w-full h-full flex items-start justify-center pt-5 px-6">
        <Cambio dict={dict} pantalla={pantalla} />
      </div>
    </div>
  );
}
