import { FunctionComponent, JSX } from "react";
import { CambioElementoProps } from "../../Common/types/common.types";
import useEquipo from "../hooks/useEquipo";
import Image from "next/legacy/image";
import { INFURA_GATEWAY, PEGATINAS } from "@/app/lib/constants";

const Equipo: FunctionComponent<CambioElementoProps> = ({
  dict,
}): JSX.Element => {
  const { modulos, modulosCargando } = useEquipo();
  return (
    <div className="relative w-full h-full items-center flex flex-col gap-20 justify-center font-nerdC">
      <div className="relative w-full h-full flex flex-col items-center justify-center gap-12">
        <div className="relative text-lg uppercase w-[calc(100vw-7rem)] sm:w-[70vw] h-fit flex text-white text-center items-center justify-center overflow-x-scroll gap-20">
          {PEGATINAS?.sort(() => Math.random() - 0.5).map(
            (pegatina, indice) => {
              return (
                <div
                  key={indice}
                  className={`relative flex w-fit h-fit ${
                    modulosCargando && "animate-pulse"
                  }`}
                >
                  <div className="relative w-16 h-16 md:w-32 md:h-32 flex">
                    <Image
                      layout="fill"
                      objectFit="contain"
                      draggable={false}
                      src={`${INFURA_GATEWAY}/ipfs/${pegatina}`}
                    />
                  </div>
                </div>
              );
            }
          )}
        </div>
        <div className="relative text-lg uppercase w-full h-fit flex text-white text-center items-center justify-center">
          {dict.Home.make}
        </div>
        <div className="relative text-lg uppercase w-[calc(100vw-7rem)] sm:w-[70vw] h-fit flex text-white text-center items-center justify-center overflow-x-scroll gap-20">
          {PEGATINAS?.sort(() => Math.random() - 0.5).map(
            (pegatina, indice) => {
              return (
                <div
                  key={indice}
                  className={`relative flex w-fit h-fit ${
                    modulosCargando && "animate-pulse"
                  }`}
                >
                  <div className="relative w-16 h-16 md:w-32 md:h-32 flex">
                    <Image
                      layout="fill"
                      objectFit="contain"
                      draggable={false}
                      src={`${INFURA_GATEWAY}/ipfs/${pegatina}`}
                    />
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
      <div
        className="relative w-full h-full flex overflow-y-scroll"
        id="scroll"
      >
        <div
          className={`relative w-full h-fit flex items-start justify-center flex flex-wrap overflow-y-scroll pb-10 ${
            modulosCargando ? "gap-20" : "gap-6"
          }`}
        >
          {modulosCargando
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
            : modulos.map((modulo, indice) => {
                return (
                  <div
                    key={indice}
                    className="relative flex w-fit h-fit cursor-pointer hover:opacity-70"
                  >
                    <div className="relative w-60 h-60 flex">
                      {/* <Image
                        draggable={false}
                        layout="fill"
                        objectFit="cover"
                        src={`${INFURA_GATEWAY}/ipfs/${}`}
                      /> */}
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
};

export default Equipo;
