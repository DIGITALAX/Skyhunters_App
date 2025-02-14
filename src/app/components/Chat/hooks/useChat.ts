import { useState } from "react";
import { Eliza, Usuario } from "../types/chat.types";

const useChat = () => {
  const [mensajes, setMensajes] = useState<
    { contenido: string; usuario: Usuario }[]
  >([]);
  const [elizaLoading, setElizaLoading] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>("");

  const handleEliza = (tipo: Eliza) => {
    setElizaLoading(true);
    try {
    } catch (err: any) {
      console.error(err.message);
    }
    setElizaLoading(false);
  };

  return {
    mensajes,
    prompt,
    setPrompt,
    setMensajes,
    handleEliza,
    elizaLoading,
  };
};

export default useChat;
