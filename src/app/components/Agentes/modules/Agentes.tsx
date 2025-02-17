import { FunctionComponent, JSX } from "react";
import { CambioElementoProps } from "../../Common/types/common.types";
import useAgentes from "../hooks/useAgentes";
import { INFURA_GATEWAY, PEGATINAS } from "@/app/lib/constants";
import Image from "next/legacy/image";
import descripcionRegex from "@/app/lib/helpers/descripcionRegex";

const Agentes: FunctionComponent<CambioElementoProps> = ({
  dict,
}): JSX.Element => {
  const { agentesCargando, agentes } = useAgentes();
  return (
    <div className="relative w-full h-full items-center flex flex-col gap-20 justify-center font-nerdC">
      <div
        className="relative text-sm uppercase w-3/4 h-full flex text-white text-center items-center justify-center whitespace-inline"
        dangerouslySetInnerHTML={{
          __html: descripcionRegex(dict?.Home?.agents || "", false),
        }}
      ></div>
      <div
        className="relative w-full h-full flex overflow-y-scroll"
        id="scroll"
      >
        <div
          className={`relative w-full h-fit flex items-start justify-center flex flex-wrap overflow-y-scroll pb-10 ${
            agentesCargando ? "gap-20" : "gap-6"
          }`}
        >
          {agentesCargando
            ? PEGATINAS?.sort(() => Math.random() - 0.5).map(
                (imagen, indice) => {
                  return (
                    <div
                      key={indice}
                      className="relative flex w-fit h-fit animate-pulse"
                    >
                      <div className="relative w-20 sm:w-40 lg:w-72 h-20 lg:h-52 flex">
                        <Image
                          layout="fill"
                          objectFit="contain"
                          draggable={false}
                          src={`${INFURA_GATEWAY}/ipfs/${imagen}`}
                        />
                      </div>
                    </div>
                  );
                }
              )
            : agentes.map((agente, indice) => {
                return (
                  <div
                    key={indice}
                    className="relative flex w-fit h-fit cursor-pointer hover:opacity-70"
                  >
                    <div className="relative w-28 h-28 md:w-44 md:h-44 lg:w-60 lg:h-60 flex">
                      <Image
                        draggable={false}
                        layout="fill"
                        objectFit="cover"
                        src={`${INFURA_GATEWAY}/ipfs/${agente?.cover}`}
                      />
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
};

export default Agentes;
