import { Direccion } from "../components/Estudio/types/Estudio.types";

export const configurarDireccion = (
  key: string,
  direccion: Direccion
): string => {
  return `${direccion}-${key}`;
};
const AUTH_STORAGE_KEY = "LH_STORAGE_KEY";

interface authToken {
  token: {
    accessToken: string;
    refreshToken: string;
  };
}
