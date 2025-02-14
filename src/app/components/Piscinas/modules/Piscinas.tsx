import { FunctionComponent, JSX } from "react";
import { CambioElementoProps } from "../../Common/types/common.types";
import usePiscinas from "../hooks/usePiscinas";
import Image from "next/legacy/image";
import { INFURA_GATEWAY, PEGATINAS } from "@/app/lib/constants";

const Piscinas: FunctionComponent<CambioElementoProps> = ({
  dict,
}): JSX.Element => {
  const { piscinas, piscinasCargando } = usePiscinas();
  return (
    <div className="relative w-full h-full items-center flex flex-col gap-20 justify-center font-nerdC">
      <div className="relative text-lg uppercase w-full h-full flex text-white text-center items-center justify-center">
        SOME BIG AMOUNT OF TEXT GOES HERE DESCRIBING THE POOLS
        <br />
        <br />
        BUT WHAT ABOUT THE POOL PAGES THEMSELVES?
        <br />
        <br />
        WHAT ABOUT THE SPECIFIC LOGIC OF WHAT THE POOLS ARE DOING?
      </div>
      <div className="relative w-full h-full flex overflow-y-scroll" id="scroll">
        <div className="relative w-full h-fit flex items-start justify-between flex flex-wrap gap-20 overflow-y-scroll pb-10">
          {!piscinasCargando
            ? PEGATINAS?.sort(() => Math.random() - 0.5).map(
                (imagen, indice) => {
                  return (
                    <div
                      key={indice}
                      className="relative flex w-fit h-fit animate-pulse"
                    >
                      <div className="relative w-72 h-72 flex">
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
            : piscinas.map((piscina, indice) => {
                return (
                  <div
                    key={indice}
                    className="relative flex w-72 h-72 rounded-md border border-ligero bg-gris"
                  ></div>
                );
              })}
        </div>
      </div>
    </div>
  );
};

export default Piscinas;
