"use client";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useContext } from "react";
import { ModalContext } from "@/app/providers";
import LeftBar from "./LeftBar";
import RightBar from "./RightBar";
import useBar from "../hooks/useBar";
import Cambio from "./Cambio";

export default function Entry({ dict, lang }: { dict: any; lang: string }) {
  const router = useRouter();
  const {
    abrirBarIzquierdo,
    setAbrirBarIzquierdo,
    abrirBarDerecho,
    setAbrirBarDerecho,
    pantalla,
    setPantalla,
  } = useBar();
  const { isConnected } = useAccount();
  const contexto = useContext(ModalContext);
  return (
    <div className="relative w-full h-screen bg-black flex items-start justify-center flex-row overflow-scroll-none">
      <div className="relative w-fit h-full flex">
        <div className="relative w-10 h-full flex">
          <LeftBar
            pantalla={pantalla}
            setPantalla={setPantalla}
            router={router}
            setAbrirBar={setAbrirBarIzquierdo}
            abrirBar={abrirBarIzquierdo}
            dict={dict}
            lensConectado={contexto?.lensConectado}
          />
        </div>
      </div>
      <div className="relative w-full h-full flex p-8">
        <div className="relative w-full h-full flex items-start justify-center pt-5 px-6 bg-oscuro border border-brillo rounded-md">
          <Cambio dict={dict} pantalla={pantalla} />
        </div>
      </div>
      <div className="relative w-fit h-full flex">
        <div className="relative w-10 h-full flex">
          <RightBar
            router={router}
            setAbrirBar={setAbrirBarDerecho}
            abrirBar={abrirBarDerecho}
            dict={dict}
            lensConectado={contexto?.lensConectado}
          />
        </div>
      </div>
    </div>
  );
}
