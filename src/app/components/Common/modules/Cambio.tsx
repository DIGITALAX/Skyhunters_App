import { FunctionComponent, JSX } from "react";
import { CambioProps, Pantalla } from "../types/common.types";
import Crear from "../../Crear/modules/Crear";
import Estudio from "../../Estudio/modules/Estudio";
import Chat from "../../Chat/modules/Chat";
import Agentes from "../../Agentes/modules/Agentes";
import Cuenta from "../../Cuenta/modules/Cuenta";
import Piscinas from "../../Piscinas/modules/Piscinas";

const Cambio: FunctionComponent<CambioProps> = ({
  pantalla,
  dict,
}): JSX.Element => {
  switch (pantalla) {
    case Pantalla.Crear:
      return <Crear dict={dict} />;

    case Pantalla.Cuenta:
      return <Cuenta dict={dict} />;

    case Pantalla.Estudio:
      return <Estudio dict={dict} />;

    case Pantalla.Piscinas:
      return <Piscinas dict={dict} />;

    case Pantalla.Agentes:
      return <Agentes dict={dict} />;

    default:
      return <Chat dict={dict} />;
  }
};

export default Cambio;
