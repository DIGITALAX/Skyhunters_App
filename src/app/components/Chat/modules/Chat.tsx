import { FunctionComponent, JSX } from "react";
import { CambioElementoProps } from "../../Common/types/common.types";
import { IoMdSend } from "react-icons/io";
import useChat from "../hooks/useChat";
import { Usuario } from "../types/chat.types";

const Chat: FunctionComponent<CambioElementoProps> = ({
  dict,
}): JSX.Element => {
  const { mensajes, prompt, setPrompt, setMensajes } = useChat();
  return (
    <div
      className={`relative w-full pb-10 h-full flex flex-col gap-10 ${
        mensajes?.length > 0
          ? "justify-between items-start"
          : "items-center justify-center"
      }`}
    >
      {mensajes?.length > 0 && (
        <div className="relative w-full h-full overflow-y-scroll flex justify-end items-end">
          <div className="relative w-full h-fit items-start justify-end flex flex-col gap-3">
            {mensajes?.map((valor, indice) => {
              return (
                <div
                  key={indice}
                  className={`relative text-white text-sm font-mana w-full h-fit flex ${
                    valor.usuario == Usuario.Humano
                      ? "justify-end text-right"
                      : "justify-start text-left"
                  }`}
                >
                  <div
                    className={`relative w-fit p-2 rounded-md h-fit flex items-center justify-center  ${
                      valor.usuario == Usuario.Humano && "bg-ligero"
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
      <div
        className={`relative w-full h-fit flex ${
          mensajes?.length > 0
            ? "items-start justify-start"
            : "items-center justify-center"
        } `}
      >
        <div
          className={`relative flex flex-row gap-2 items-start justify-start rounded-md bg-ligero h-10 px-2 py-1 ${
            mensajes?.length > 0 ? "w-full" : "w-1/2"
          }`}
        >
          <input
            onChange={(e) => setPrompt(e.target.value)}
            className="font-bit text-white text-xs focus:outline-none relative w-full h-full rounded-md bg-ligero"
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
            <IoMdSend size={20} color="white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
