"use client";

import { usePathname, useRouter } from "next/navigation";
import { FunctionComponent, JSX, useContext } from "react";
import useRole from "../hooks/useRole";
import { AppContext } from "@/app/lib/Providers";

const Header: FunctionComponent = (): JSX.Element => {
  const router = useRouter();
  const path = usePathname();
  const { roleLoading } = useRole();
  const context = useContext(AppContext);

  return (
    <div className="relative w-full h-fit flex flex-col gap-3">
      <div className="text-center border-b-2 border-black pb-2 mb-5">
        <h1 className="text-2xl text-blue-800">Skyhunters</h1>
        <p className="text-sm text-gray-500">Prediction Market Platform</p>
      </div>

      <div className="mb-5 text-xs text-center">
        {[
          { route: "/", title: "Explore Markets" },
          { route: "/create-market", title: "Create Market" },
          { route: "/manage", title: "Manage" },
          { route: "/council", title: "Council" },
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
        <div className="font-bold mb-2">Roles:</div>
        {roleLoading ? (
          <div className="text-gray-500">Loading...</div>
        ) : (
          <div className="flex flex-row flex-wrap gap-1 items-center justify-center w-full h-fit">
            <div>Creator: {context?.roles?.creator ? "TRUE" : "FALSE"}</div>
            <div>Proposer: {context?.roles?.proposer ? "TRUE" : "FALSE"}</div>
            <div>
              Blacklister: {context?.roles?.blacklister ? "TRUE" : "FALSE"}
            </div>
            <div>Council: {context?.roles?.council ? "TRUE" : "FALSE"}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
