import { useState } from "react";
import { Usuario } from "../types/chat.types";

const useChat = () => {
  const [mensajes, setMensajes] = useState<
    { contenido: string; usuario: Usuario }[]
  >([]);
  const [prompt, setPrompt] = useState<string>("");
  return {
    mensajes,
    prompt,
    setPrompt,
    setMensajes,
  };
};

export default useChat;
