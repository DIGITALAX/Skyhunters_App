import { FunctionComponent, JSX } from "react";
import { CambioElementoProps } from "../../Common/types/common.types";
import useChat from "../hooks/useChat";
import { Eliza, Usuario } from "../types/chat.types";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/app/lib/constants";

const Chat: FunctionComponent<CambioElementoProps> = ({
  dict,
}): JSX.Element => {
  const {
    mensajes,
    prompt,
    setPrompt,
    setMensajes,
    handleEliza,
    elizaLoading,
  } = useChat();
  return (
    <div
      className={`relative w-full pb-10 h-full flex flex-col gap-10 ${
        mensajes?.length > 0 || elizaLoading
          ? "justify-between items-start"
          : "items-center justify-center"
      }`}
    >
      {(mensajes?.length > 0 || elizaLoading) && (
        <div className="relative w-full h-full overflow-y-scroll flex justify-end items-end">
          <div className="relative w-full h-fit items-start justify-end flex flex-col gap-3 font-nerdC text-lg">
            {mensajes?.map((valor, indice) => {
              return (
                <div
                  key={indice}
                  className={`relative text-white w-full h-fit flex ${
                    valor.usuario == Usuario.Humano
                      ? "justify-end text-right"
                      : "justify-start text-left"
                  }`}
                >
                  <div
                    className={`relative w-fit p-2 rounded-md h-fit flex items-center justify-center  ${
                      valor.usuario == Usuario.Humano && "bg-black"
                    }`}
                  >
                    {valor.contenido}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {mensajes?.length < 1 && !elizaLoading && (
        <div className="relative w-full h-fit flex flex-col gap-2 items-center justify-center">
          <div className="relative w-fit h-fit flex font-arc text-white">
            {dict?.Home.atajos}
          </div>
          <div className="relative w-fit h-fit flex flex-wrap gap-2 items-center justify-center">
            {[
              {
                imagen: "QmTGxwrGCfWJopPj7AaLNV1SRcV5mwDVgbjrLN2kHpfETA",
                titulo: dict?.Home.spectate,
                tipo: Eliza.Studio,
              },
              {
                imagen: "QmY5EHxxqyug63AXEMrKd2tQYJCt4VjBTcE6BqioyxFTZN",
                titulo: dict?.Home.coinop,
                tipo: Eliza.CoinOp,
              },
              {
                imagen: "QmNwVkUU89SznVLT9BotDG1ZP3XxC4uSFg3ekuYQzHK4Lm",
                titulo: dict?.Home.tripleA,
                tipo: Eliza.TripleA,
              },
              {
                imagen: "QmV85NivB8HN3jPeAPg7bESFe6W5659vy8iiSwbmsupEuP",
                titulo: dict?.Home.airdrop,
                tipo: Eliza.Airdrop,
              },
            ].map((item, index) => {
              return (
                <div
                  key={index}
                  className="relative w-fit h-fit flex items-center justify-center cursor-pointer hover:opacity-70"
                  title={item.titulo}
                  onClick={() => handleEliza(item.tipo)}
                >
                  <div className="relative w-10 h-10 sm:w-16 sm:h-16 md:w-28 md:h-28 flex">
                    <Image
                      draggable={false}
                      layout="fill"
                      objectFit="contain"
                      src={`${INFURA_GATEWAY}/ipfs/${item.imagen}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div
        className={`relative w-full h-fit flex ${
          mensajes?.length > 0 || elizaLoading
            ? "items-start justify-start"
            : "items-center justify-center"
        } `}
      >
        <div
          className={`relative flex flex-row gap-2 items-start justify-start rounded-md bg-black h-10 px-2 py-1 ${
            mensajes?.length > 0 || elizaLoading ? "w-full" : "w-full sm:w-3/4 lg:w-1/2"
          }`}
        >
          <input
            onChange={(e) => setPrompt(e.target.value)}
            className="font-nerdS text-xs uppercase text-ama focus:outline-none relative w-full h-full rounded-md bg-black placeholder:text-ama"
            value={prompt}
            placeholder={dict?.Home.placeholder}
            onKeyDown={(e) => {
              if (e.key == "Enter" && prompt?.trim() !== "") {
                setMensajes([
                  ...mensajes,
                  {
                    contenido: prompt,
                    usuario: Usuario.Humano,
                  },
                ]);
                setPrompt("");
              }
            }}
          />
          <div
            className={`relative w-fit h-full flex items-center justify-center ${
              prompt?.trim() !== ""
                ? "cursor-pointer hover:opacity-70"
                : "opacity-50"
            }`}
            onClick={() => {
              if (prompt?.trim() !== "") {
                setMensajes([
                  ...mensajes,
                  {
                    contenido: prompt,
                    usuario: Usuario.Humano,
                  },
                ]);
                setPrompt("");
              }
            }}
          >
            <div className="relative w-5 h-5 flex">
              <Image
                draggable={false}
                layout="fill"
                src={`${INFURA_GATEWAY}/ipfs/QmPhN6mi9CdNo4RHmcqfUgxHayZhaZwLktH6Apd8yp6n3P`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
