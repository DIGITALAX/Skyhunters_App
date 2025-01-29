"use client";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useContext } from "react";
import { ModalContext } from "@/app/providers";
import Bar from "./Bar";
import useBar from "../hooks/useBar";

export default function Entry({ dict, lang }: { dict: any; lang: string }) {
  const router = useRouter();
  const { abrirBar, setAbrirBar } = useBar();
  const { isConnected } = useAccount();
  const contexto = useContext(ModalContext);
  return (
    <div
      className="relative w-full h-screen bg-cielo flex items-start justify-center flex-row overflow-scroll-none"
      onClick={(e) => {
        e.stopPropagation();
        setAbrirBar(false);
      }}
    >
      <Bar router={router} setAbrirBar={setAbrirBar} abrirBar={abrirBar} />
      <div className="relative w-full h-full flex items-start justify-center pt-5"></div>
    </div>
  );
}
