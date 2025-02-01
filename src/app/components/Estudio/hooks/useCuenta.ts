import { useEffect, useState } from "react";

import { Escena, Sprite } from "../types/Estudio.types";

const useCuenta = (
  etiqueta: undefined | string,
  escenas: Escena[]
) => {
  const [npcCargando, setNPCCargando] = useState<boolean>(false);
  const [npc, setNpc] = useState<Sprite | undefined>();

  const llamaNPC = async () => {
    setNPCCargando(true);
    try {
      // const datos = await getProfile(
      //   {
      //     forProfileId: (npc as Sprite)?.perfil_id
      //       ? "0x0" + (npc as Sprite)?.perfil_id.toString(16)?.split("0x")?.[1]
      //       : (npc as string),
      //   },
      //   lensConectado?.id
      // );

      // setPerfil(datos?.data?.profile as Profile);

      // if (typeof npc == "string") {
      if (
        escenas?.some((e) =>
          e.sprites?.some(
            (s) =>
              "0x0" + s.perfil_id?.toString(16)?.split("0x")?.[1] == etiqueta
          )
        )
      ) {
        const sprite = escenas
          ?.find((e) =>
            e.sprites?.find(
              (s) =>
                "0x0" + s.perfil_id?.toString(16)?.split("0x")?.[1] == etiqueta
            )
          )
          ?.sprites?.find(
            (n) =>
              "0x0" + n.perfil_id?.toString(16)?.split("0x")?.[1] == etiqueta
          )!;

        setNpc({ ...sprite });
      }
      // } else {
      //   const sprite = escenas
      //     ?.find((e) =>
      //       e.sprites?.find(
      //         (s) =>
      //           "0x0" + s.perfil_id?.toString(16)?.split("0x")?.[1] ==
      //           "0x0" + npc?.perfil_id.toString(16)?.split("0x")?.[1]
      //       )
      //     )
      //     ?.sprites?.find(
      //       (n) =>
      //         "0x0" + n.perfil_id?.toString(16)?.split("0x")?.[1] ==
      //         "0x0" + npc?.perfil_id.toString(16)?.split("0x")?.[1]
      //     )!;

      // const datos = await getProfiles(
      //   {
      //     where: {
      //       profileIds: sprite.prompt.amigos?.flatMap(
      //         (a) => "0x0" + a?.toString(16)?.split("0x")?.[1]
      //       ),
      //     },
      //   },
      //   lensConectado?.id
      // );

      //   const amigos = sprite.prompt.amigos.map((amigo) =>
      //     escenas
      //       .flatMap((s) => s.sprites)
      //       .find((s) => Number(s.perfil_id) == Number(amigo))
      //   )?.map((a, i) => ({
      //     ...a,
      //     handle: datos?.data?.profiles?.items?.[i]?.handle?.suggestedFormatted
      //       ?.localName,
      //   })) as (Sprite & {
      //     handle: string;
      // })[];

      // setEsNPC({ ...sprite, amigos });
      // }
    } catch (err: any) {
      console.error(err.message);
    }
    setNPCCargando(false);
  };

  useEffect(() => {
    if (npc) {
      llamaNPC();
    } else {
      setNpc(undefined);
    }
  }, [npc]);

  return {
    npcCargando,
    npc,
  };
};

export default useCuenta;
