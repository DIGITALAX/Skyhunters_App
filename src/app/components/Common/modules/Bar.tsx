import { FunctionComponent } from "react";
import { JSX } from "react/jsx-runtime";
import { BarProps, Pantalla } from "../types/common.types";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/lib/constants";

const Bar: FunctionComponent<BarProps> = ({
  setAbrirBar,
  router,
  abrirBar,
  setPantalla,
  pantalla,
  dict,
}): JSX.Element => {
  return (
    <div
      className={`absolute bg-gris top-0 z-10 left-0 h-full flex justify-between items-center flex-col py-4 ${
        abrirBar ? "w-fit pl-2 pr-3" : "w-10 px-2"
      }`}
    >
      <div className="relative w-fit h-fit flex items-center justify-center flex-col gap-2">
        <div
          className="relative w-fit h-fit flex items-center justify-center cursor-pointer rounded-md border border-ligero bg-ligero"
          onClick={() => {
            router.push("/");
            setAbrirBar(false);
          }}
        >
          <div className="relative flex w-6 h-6 rounded-md">
            <Image
              draggable={false}
              layout="fill"
              className="rounded-md"
              objectFit="cover"
              src={`${INFURA_GATEWAY}/ipfs/QmNSMGVcf96uDvxuzZXUc6A2kh541vJs44uuumGyoabRWY`}
            />
          </div>
        </div>
        <div
          className="relative w-fit h-fit flex items-center justify-center cursor-pointer text-2xl text-ligero hover:text-white font-mana"
          onClick={() => setAbrirBar(!abrirBar)}
        >
          {abrirBar ? "<" : ">"}
        </div>
      </div>
      <div
        className={`relative w-fit h-fit flex justify-center flex-col gap-4 ${
          abrirBar ? "items-start" : "items-center"
        }`}
      >
        {[
          {
            pantalla: Pantalla.Chat,
            imagen: "QmNSMGVcf96uDvxuzZXUc6A2kh541vJs44uuumGyoabRWY",
          },
          {
            pantalla: Pantalla.Piscinas,
            imagen: "QmNSMGVcf96uDvxuzZXUc6A2kh541vJs44uuumGyoabRWY",
          },
          {
            pantalla: Pantalla.Crear,
            imagen: "QmNSMGVcf96uDvxuzZXUc6A2kh541vJs44uuumGyoabRWY",
          },
          {
            pantalla: Pantalla.Estudio,
            imagen: "QmNSMGVcf96uDvxuzZXUc6A2kh541vJs44uuumGyoabRWY",
          },
          {
            pantalla: Pantalla.Agentes,
            imagen: "QmNSMGVcf96uDvxuzZXUc6A2kh541vJs44uuumGyoabRWY",
          },
        ].map((elemento, indice) => {
          return (
            <div
              key={indice}
              className="relative w-fit h-fit flex flex-row gap-3 items-center justify-center cursor-pointer hover:opacity-70"
              onClick={() => setPantalla(elemento.pantalla)}
              title={dict?.Home[elemento.pantalla]}
            >
              <div
                className={`relative flex w-6 h-6 rounded-md bg-ligero border ${
                  pantalla == elemento.pantalla
                    ? "border-white"
                    : "border-ligero opacity-85"
                }`}
              >
                <Image
                  draggable={false}
                  layout="fill"
                  className="rounded-md"
                  objectFit="cover"
                  src={`${INFURA_GATEWAY}/ipfs/${elemento.imagen}`}
                />
              </div>
              {abrirBar && (
                <div   className={`relative text-xs font-bit w-fit h-fit flex items-center justify-center text-left hover:text-white ${
                  pantalla == elemento.pantalla ? "text-white" : "text-ligero"
                }`}>
                  {dict?.Home[elemento.pantalla]}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="relative w-fit h-fit flex items-center justify-center">
        <div
          className="relative w-fit hover:opacity-70 flex-row gap-3 h-fit flex items-center justify-center cursor-pointer"
          onClick={() => setPantalla(Pantalla.Cuenta)}
          title={dict?.Home.Cuenta}
        >
          <div
            className={`relative flex w-6 h-6 rounded-md bg-ligero border ${
              pantalla == Pantalla.Cuenta
                ? "border-white"
                : "border-ligero opacity-85"
            }`}
          >
            <Image
              draggable={false}
              layout="fill"
              className="rounded-md"
              objectFit="cover"
              src={`${INFURA_GATEWAY}/ipfs/QmNSMGVcf96uDvxuzZXUc6A2kh541vJs44uuumGyoabRWY`}
            />
          </div>
          {abrirBar && (
            <div
              className={`relative text-xs font-bit w-fit h-fit flex items-center justify-center text-left hover:text-white ${
                pantalla == Pantalla.Cuenta ? "text-white" : "text-ligero"
              }`}
            >
              {dict?.Home.Cuenta}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bar;
