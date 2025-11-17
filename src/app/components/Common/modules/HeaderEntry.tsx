"use client";

import { usePathname, useRouter } from "next/navigation";
import { FunctionComponent, JSX, useContext } from "react";
import useRole from "../hooks/useRole";
import { AppContext } from "@/app/lib/Providers";
import { ConnectKitButton } from "connectkit";

const HeaderEntry: FunctionComponent<{ dict: any }> = ({
  dict
}): JSX.Element => {
  const router = useRouter();
  const path = usePathname();
  const { roleLoading } = useRole();
  const context = useContext(AppContext);

  return (
    <div className="relative w-full h-fit flex flex-col gap-3">
      <div className="relative flex flex-col gap-2 sm:flex-row items-center justify-center border-b-2 border-black pb-2 mb-5">
        <div className="text-center flex-1">
          <div className="text-video-effect">
            <svg
              viewBox="0 0 1200 300"
              role="img"
              aria-labelledby="skyhuntersTextClip"
              className="text-video-effect__svg"
            >
              <defs>
                <mask id="skyhuntersTextMask" maskUnits="userSpaceOnUse">
                  <rect width="1200" height="300" fill="#000" />
                  <text
                    x="50%"
                    y="55%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#fff"
                    fontSize="130"
                    fontWeight="700"
                    letterSpacing="6"
                    fontFamily="'Frick','Web',sans-serif"
                  >
                    SKYHUNTERS
                  </text>
                </mask>
              </defs>

              <g mask="url(#skyhuntersTextMask)">
                <foreignObject width="1200" height="300">
                  <div
                    className="h-full w-full"
                  >
                    <video
                      className="h-full w-full object-cover"
                      draggable={false}
                      loop
                      muted
                      autoPlay
                      playsInline
                    >
                      <source
                        src="/videos/glitchoutback.mp4"
                        type="video/mp4"
                      />
                    </video>
                  </div>
                </foreignObject>
              </g>

              <text
                x="50%"
                y="55%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="none"
                stroke="#0f172a"
                strokeWidth="5"
                fontSize="130"
                fontWeight="700"
                letterSpacing="6"
                fontFamily="'Frick','Web',sans-serif"
              >
                SKYHUNTERS
              </text>
            </svg>
          </div>
          <p className="text-sm text-gray-500">{dict?.header_tagline}</p>
        </div>
        <div className="relative sm:absolute right-0 top-0">
          <ConnectKitButton.Custom>
            {({ isConnected, show, truncatedAddress, ensName }) => {
              return (
                <button
                  onClick={show}
                  className="px-2 py-1 cursor-pointer border-2 bg-gray-300 border-[#dfdfdf] text-xs"
                  style={{
                    borderStyle: "outset",
                  }}
                >
                  {isConnected
                    ? ensName ?? truncatedAddress
                    : dict?.header_connect_wallet}
                </button>
              );
            }}
          </ConnectKitButton.Custom>
        </div>
      </div>

      <div className="mb-5 text-xs text-center">
        {[
          { route: "/", title: dict?.nav_explore },
          { route: "/create-market", title: dict?.nav_create },
          { route: "/manage", title: dict?.nav_manage },
          { route: "/council", title: dict?.nav_council },
        ].map((elemento, i) => {
          return (
            <button
              key={i}
              className={`px-2 py-1 mx-0.5 cursor-pointer border-2 ${
                (i == 0 && path == "/") ||
                (i !== 0 && path.includes(elemento.route))
                  ? "bg-gray-500 text-white"
                  : "bg-gray-300"
              } ${
                ((i == 0 && path == "/") ||
                  (i !== 0 && path.includes(elemento.route))) &&
                "border border-[#dfdfdf]"
              }`}
              style={{
                borderStyle:
                  (i == 0 && path == "/") ||
                  (i !== 0 && path.includes(elemento.route))
                    ? "inset"
                    : "outset",
              }}
              onClick={() => router.push(elemento.route)}
            >
              {elemento.title}
            </button>
          );
        })}
      </div>
      <div className="mb-3 text-xs text-center border-t border-gray-300 pt-3">
        <div className="font-bold mb-2">{dict?.header_roles_title}</div>
        {roleLoading ? (
          <div className="text-gray-500">{dict?.header_roles_loading}</div>
        ) : (
          <div className="flex flex-row flex-wrap gap-1 items-center justify-center w-full h-fit">
            <div>
              {dict?.role_creator}: {context?.roles?.creator ? dict?.common_true : dict?.common_false}
            </div>
            <div>
              {dict?.role_proposer}: {context?.roles?.proposer ? dict?.common_true : dict?.common_false}
            </div>
            <div>
              {dict?.role_blacklister}: {context?.roles?.blacklister ? dict?.common_true : dict?.common_false}
            </div>
            <div>
              {dict?.role_council}: {context?.roles?.council ? dict?.common_true : dict?.common_false}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderEntry;
