import { FunctionComponent, useState } from "react";
import { JSX } from "react/jsx-runtime";
import { RightBarProps,  } from "../types/common.types";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/app/lib/constants";
import JuegoDeVida from "./JuegoDeVida";

const RightBar: FunctionComponent<RightBarProps> = ({
  setAbrirBar,
  router,
  abrirBar,
  dict,
  lensConectado,
}): JSX.Element => {
  const [bg, setBg] = useState<number>(0);
  return (
    <div
      className={`absolute bg-black top-0 z-10 h-full flex justify-between items-center flex-col py-4 gap-4 ${
        abrirBar ? "w-fit pl-2 pr-3 -left-[6.9rem]" : "left-0 w-10 px-2"
      }`}
    >
      <div className="relative w-fit h-fit flex items-center justify-center flex-col gap-2">
        <div
          className={`relative w-6 h-5 flex items-center justify-center cursor-pointer ${
            abrirBar && "rotate-180"
          }`}
          onClick={() => setAbrirBar(!abrirBar)}
        >
          <Image
            layout="fill"
            src={`${INFURA_GATEWAY}/ipfs/QmTCnN7P3UcYUHehqntbCgTDPqgaFHD9Vc28JZJQ6FSHRq`}
            draggable={false}
          />
        </div>
      </div>
      {abrirBar && (
        <div
          className={`relative w-full h-full flex justify-between flex-col gap-4 items-start`}
        >
          <div className="relative w-full h-fit flex">
            <div className="relative w-32 h-20 flex border border-masa rounded-lg">
              <JuegoDeVida />
            </div>
          </div>
          <div className="relative w-full h-full flex items-center justify-start gap-2"></div>
        </div>
      )}
      <div className="relative w-full h-fit flex flex-col items-center justify-start gap-6">
        <div className="relative w-full h-px bg-brillo"></div>
        <div className="relative w-fit h-fit gap-2 flex flex-col items-center justify-center">
          {[
            {
              name: "Github",
              imagen: "QmQTQvwtoy6JFpKz8jyVsyaFpRRMawLQab3zN4F52bnb2P",
              enlace: "https://github.com/digitalax",
            },
            {
              name: "Discord",
              enlace: "https://discord.com/invite/wz7Bxg4feG",
              imagen: "QmPmhbhZwaNz3qYNpDKbhzSW5RSEUxNqYEff8nZKMwXMxD",
            },
            {
              name: "Mirror",
              enlace: "https://blog.digitalax.xyz/",
              imagen: "QmZysUddsySgbxFsiodC9zibsMcS9GHq5v7Y6EU65rd2Kr",
            },
            {
              name: "Lens",
              enlace: "https://cypher.digitalax.xyz/autograph/digitalax",
              imagen: "QmXxN8tj8hdpHtA5kdnvEsTBRAKdS29kXsnTtg6jpUUAu2",
            },
          ].map((item, index) => {
            return (
              <div
                key={index}
                className="relative w-fit h-fit flex cursor-pointer"
                onClick={() => window.open(item.enlace)}
                title={item.name}
              >
                <div className="relative w-5 h-5 flex">
                  <Image
                    draggable={false}
                    layout="fill"
                    src={`${INFURA_GATEWAY}/ipfs/${item.imagen}`}
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

export default RightBar;
