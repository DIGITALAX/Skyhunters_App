import { FunctionComponent, useState } from "react";
import { JSX } from "react/jsx-runtime";
import { LeftBarProps, Pantalla } from "../types/common.types";
import Image from "next/legacy/image";
import { FONDOS, INFURA_GATEWAY } from "@/app/lib/constants";

const LeftBar: FunctionComponent<LeftBarProps> = ({
  setAbrirBar,
  router,
  abrirBar,
  setPantalla,
  pantalla,
  dict,
  lensConectado,
}): JSX.Element => {
  const [bg, setBg] = useState<number>(0);
  return (
    <div
      className={`absolute bg-black top-0 z-10 left-0 h-full flex justify-between items-center flex-col py-4 ${
        abrirBar ? "w-fit pl-2 pr-3" : "w-10 px-2"
      }`}
    >
      <div className="absolute top-0 left-0 w-full h-full flex">
        <div className="relative w-full h-full flex">
          <Image
            src={`${INFURA_GATEWAY}/ipfs/${FONDOS[bg]}`}
            draggable={false}
            objectFit="cover"
            layout="fill"
            key={bg}
          />
        </div>
        <div className="absolute top-0 left-0 w-full h-full flex bg-black/50"></div>
      </div>
      <div className="relative w-fit h-fit flex items-center justify-center flex-col gap-2">
        <div
          className="relative w-fit h-fit flex items-center justify-center cursor-pointer font-arc text-lg uppercase text-center text-white"
          onClick={() => {
            router.push("/");
            setAbrirBar(false);
          }}
        >
          {abrirBar ? "SKYHUNTERS" : ""}
        </div>
        <div
          className="relative w-fit h-fit flex items-center justify-center cursor-pointer text-2xl text-white hover:text-white font-mana"
          onClick={() => {
            if (!abrirBar) {
              setBg(bg < FONDOS.length - 1 ? bg + 1 : 0);
            }

            setAbrirBar(!abrirBar);
          }}
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
            imagen: "QmZ3UxCFwNwHibNoTB5ZnnariYCtzHnEPTwFbZRj4WTLSw",
          },
          {
            pantalla: Pantalla.Piscinas,
            imagen: "QmPDkqAJdB8GXXJPkDnpNQ7k2QrpsGef7zFT1UFYAasg4n",
          },
          {
            pantalla: Pantalla.Equipo,
            imagen: "QmbiVbR7qSf2W4AHzjwLkBDBQaJrnSbF1ezf4hbQeQ86R4",
          },
          {
            pantalla: Pantalla.Estudio,
            imagen: "QmZS3diNJ5jQQG6qHDh7quvWQCqgLuazHhSiVLNp45b99s",
          },
          {
            pantalla: Pantalla.Agentes,
            imagen: "Qmcbzv2iNcck6cYh7AhqQdbW1FyoaUvjRuLFfD4jRSozSj",
          },
        ].map((elemento, indice) => {
          return (
            <div
              key={indice}
              className="relative w-fit h-fit flex flex-row gap-3 items-center justify-center cursor-pointer hover:opacity-70"
              onClick={() => setPantalla(elemento.pantalla)}
              title={dict?.Home[elemento.pantalla]}
            >
              <div className="relative w-fit h-fit fled">
                <div className={`relative flex w-6 h-6 rounded-sm`}>
                  <Image
                    draggable={false}
                    layout="fill"
                    className="rounded-md"
                    objectFit="cover"
                    src={`${INFURA_GATEWAY}/ipfs/${elemento.imagen}`}
                  />
                </div>
              </div>
              {abrirBar && (
                <div
                  className={`relative uppercase text-sm w-full h-fit flex items-center font-nerdS justify-center text-center hover:text-amarillo ${
                    pantalla == elemento.pantalla
                      ? "text-amarillo"
                      : "text-white"
                  }`}
                >
                  {`<< ${dict?.Home[elemento.pantalla]} >>`}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="relative w-full h-fit flex flex-col items-center justify-start gap-6">
        <div className="relative w-full h-px bg-rosa"></div>
        <div className="relative w-fit h-fit flex items-center justify-center">
          <div
            className="relative w-fit hover:opacity-70 flex-row gap-3 h-fit flex items-center justify-center cursor-pointer"
            onClick={() => setPantalla(Pantalla.Cuenta)}
            title={dict?.Home.Cuenta}
          >
            <div className="relative flex w-fit h-fit">
              <div className={`relative flex w-7 h-7 rounded-xl`}>
                <Image
                  draggable={false}
                  layout="fill"
                  className="rounded-xl"
                  objectFit="cover"
                  src={`${INFURA_GATEWAY}/ipfs/${
                    lensConectado?.profile?.metadata?.picture
                      ? lensConectado?.profile?.metadata?.picture?.split(
                          "ipfs://"
                        )?.[1]
                      : "QmX5Uk9WeqsVHoNQhUP3fzTasv3J6zuat4L5L6zmaTVzBW"
                  }`}
                />
              </div>
              <div className="absolute top-0 right-0 flex w-full h-full">
                <Image
                  layout="fill"
                  src={`${INFURA_GATEWAY}/ipfs/QmPUeqHkTaTj2SHDdrizNhFSxzFPJpTLpkEZTtTKNsQUwV`}
                />
              </div>
            </div>
            {abrirBar && (
              <div
                className={`relative text-sm font-nerdS w-fit h-fit flex items-center justify-center text-left uppercase hover:text-amarillo ${
                  pantalla == Pantalla.Cuenta ? "text-amarillo" : "text-white"
                }`}
              >
                {lensConectado?.sessionClient
                  ? lensConectado?.profile?.address?.slice(0, 10) + "..."
                  : `<< ${dict?.Home.Cuenta} >>`}
              </div>
            )}
          </div>
        </div>
        {abrirBar && (
          <div className="relative w-full h-fit flex flex-col gap-2 justify-start items-start text-sm text-left">
            {[
              { name: "About Skyhunters", router: () => router.push("/about") },
              {
                name: "Account & Settings",
                router: () => router.push("/account"),
              },
            ].map((item, index) => {
              return (
                <div
                  key={index}
                  className="relative whitespace-nowrap w-fit h-fit flex text-noche hover:text-amarillo font-nerdS cursor-pointer"
                  onClick={() => item.router()}
                >
                  {item.name}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftBar;
