import { FunctionComponent, JSX } from "react";
import { CambioElementoProps } from "../../Common/types/common.types";
import usePiscinas from "../hooks/usePiscinas";

const Piscinas: FunctionComponent<CambioElementoProps> = ({
  dict,
}): JSX.Element => {
  const { piscinas, piscinasCargando } = usePiscinas();
  return (
    <div className="relative w-full h-full items-center flex flex-col gap-20 justify-between">
      <div className="relative font-vcr text-5xl text-white text-center">
        {dict?.Home.Piscinas}
      </div>
      <div className="relative w-full h-fit flex items-start justify-between flex flex-wrap gap-5 overflow-y-scroll">
        {!piscinasCargando
          ? Array.from({ length: 12 }).map((_, indice) => {
              return (
                <div
                  key={indice}
                  className="relative flex w-72 h-72 rounded-md border border-ligero bg-gris animate-pulse"
                ></div>
              );
            })
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
  );
};

export default Piscinas;
