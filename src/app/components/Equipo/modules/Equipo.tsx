import { FunctionComponent, JSX } from "react";
import { CambioElementoProps } from "../../Common/types/common.types";
import useEquipo from "../hooks/useEquipo";

const Equipo: FunctionComponent<CambioElementoProps> = ({
  dict,
}): JSX.Element => {
  const { modulos, modulosCargando } = useEquipo();
  return (
    <div className="relative w-full h-full items-center flex flex-col gap-20 justify-between">
      <div className="relative font-vcr text-5xl text-white text-center">
        {dict?.Home.make}
      </div>
      <div className="relative w-full h-fit flex items-start justify-between flex flex-wrap gap-5 overflow-y-scroll">
        {!modulosCargando
          ? Array.from({ length: 12 }).map((_, indice) => {
              return (
                <div
                  key={indice}
                  className="relative flex w-72 h-72 rounded-md border border-ligero bg-gris animate-pulse"
                ></div>
              );
            })
          : modulos.map((modulo, indice) => {
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

export default Equipo;
