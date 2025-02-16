import { FunctionComponent, JSX, useContext } from "react";
import { CambioElementoProps } from "../../Common/types/common.types";
import dynamic from "next/dynamic";
import useEstudio from "../hooks/useEstudio";
import { ModalContext } from "@/app/providers";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/app/lib/constants";
import { Escena, Sprite } from "../types/Estudio.types";
const Juego = dynamic(() => import("../modules/Juego"), {
  ssr: false,
});

const Estudio: FunctionComponent<CambioElementoProps> = ({
  dict,
}): JSX.Element => {
  const contexto = useContext(ModalContext);
  const { npc, setCargando, setNpc, cargando } = useEstudio(
    contexto?.escena!,
    contexto?.setEscena!
  );

  return (
    <div className="relative flex w-full h-full flex-col items-start justify-between gap-6 overflow-y-scroll font-nerdS">
      <div className="relative w-full h-fit flex items-center justify-center">
        <div className="relative w-[calc(100vw-7rem)] sm:w-[calc(100vw-20rem)] h-[30rem] bg-gradient-to-r from-naranja border border-naranja to-[#D84599] p-2 flex overflow-hidden rounded-md items-center justify-center">
          <Juego
            escena={contexto?.escena!}
            escenas={contexto?.escenas!}
            setEscenas={contexto?.setEscenas!}
            setNpc={setNpc}
            setCargando={setCargando}
            cargando={cargando}
            npc={npc}
          />
        </div>
      </div>
      <div className="relative w-full h-fit flex flex-col lg:flex-row gap-6 md:gap-3 items-center justify-between">
        <div className="relative w-full h-fit p-4 items-center justify-center flex flex-col gap-10 overflow-x-scroll">
          <div className="relative w-full h-fit flex items-start lg:items-center justify-center gap-5 flex-col lg:flex-row bottom-0">
            <div className="relative w-full lg:w-fit h-fit flex items-center justify-start lg:justify-center text-[#9CF38C] uppercase text-center">
              {dict.Home.player}
            </div>
            <div className="relative w-full h-fit flex items-start justify-start overflow-x-auto max-w-[calc(100vw-8rem)] sm:max-w-[calc(100vw-14rem)]">
              <div className="relative scroll-container h-fit flex items-start justify-start gap-4">
                {contexto?.escenas
                  ?.find((es) => es?.clave == contexto?.escena)!
                  ?.sprites.map((sprite: Sprite, index: number) => {
                    return (
                      <div
                        key={index}
                        className="relative w-fit h-fit flex items-center justify-center cursor-pointer hover:opacity-70"
                        onClick={() => setNpc(sprite.etiqueta)}
                      >
                        <div
                          className={`relative w-28 h-40 flex items-center justify-center ${
                            npc === sprite.etiqueta &&
                            "border border-amarillo opacity-70"
                          }`}
                        >
                          <div className="relative w-full h-full flex items-center justify-center">
                            <Image
                              layout="fill"
                              draggable={false}
                              src={`${INFURA_GATEWAY}/ipfs/${sprite.tapa}`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
          <div className="relative w-full h-fit flex items-start lg:items-center justify-center lg:justify-start gap-5 flex-col lg:flex-row bottom-0">
            <div className="relative w-full lg:w-fit h-fit flex items-center justify-start lg:justify-center text-rosa uppercase text-center">
              {dict.Home.scene}
            </div>
            <div className="relative w-full max-w-[calc(100vw-8rem)] sm:max-w-[calc(100vw-14rem)] lg:max-w-[36rem] h-fit flex items-start justify-start overflow-x-auto">
              <div className="relative scroll-container h-fit flex items-start justify-start gap-4">
                {contexto?.escenas.map((cuarto: Escena, index: number) => {
                  return (
                    <div
                      key={index}
                      className="relative w-fit h-fit flex items-center justify-center cursor-pointer hover:opacity-70"
                      onClick={() => contexto?.setEscena?.(cuarto.clave)}
                    >
                      <div
                        className={`relative w-36 h-24 flex items-center justify-center rounded-md ${
                          contexto?.escena === cuarto.clave &&
                          "border border-amarillo opacity-70"
                        }`}
                      >
                        <div className="rounded-md relative w-full h-full flex items-center justify-center">
                          <Image
                            layout="fill"
                            className="rounded-md"
                            draggable={false}
                            src={`${INFURA_GATEWAY}/ipfs/${cuarto.imagen}`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="relative w-fit h-fit lg:h-full flex overflow-y-scroll text-white items-start justify-center md:justify-end">
          <div className="relative w-fit max-w-80 h-fit flex items-start justify-center md:justify-end text-center md:text-right">
            TEXT ABOUT WHAT'S HAPPENING HERE
            <br />
            <br />
            TEXT ABOUT WHAT'S HAPPENING HERE
            <br />
            <br />
            TEXT ABOUT WHAT'S HAPPENING HERE
            <br />
            <br />
            TEXT ABOUT WHAT'S HAPPENING HERE
            <br />
            <br />
            TEXT ABOUT WHAT'S HAPPENING HERE
          </div>
        </div>
      </div>
    </div>
  );
};

export default Estudio;
