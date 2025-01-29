import { FunctionComponent } from "react";
import { JSX } from "react/jsx-runtime";
import { BarProps } from "../types/common.types";
import { TiHeart } from "react-icons/ti";

const Bar: FunctionComponent<BarProps> = ({
  setAbrirBar,
  router,
  abrirBar
}): JSX.Element => {
  return (
    <div className="absolute bg-blanco top-0 z-10 left-0 w-10 h-full flex justify-between items-center flex-col px-2 py-4">
      <div
        className="relative w-fit h-fit flex items-center justify-center text-2xl cursor-pointer"
        onClick={() => {
          router.push("/");
          setAbrirBar(false);
        }}
      >
        🤑
      </div>
      <div className="relative w-fit h-fit flex items-center justify-center flex-col gap-4">
        <div
          className="relative w-fit h-fit flex items-center justify-center cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setAbrirBar(false);
          }}
        >
          <TiHeart
            size={20}
          />
        </div>
        <div
          className="relative w-fit h-fit flex items-center justify-center cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setAbrirBar(false);
          }}
        >
          <TiHeart
            size={20}
          />
        </div>
        <div
          className="relative w-fit h-fit flex items-center justify-center cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setAbrirBar(false);
          }}
        >
          <TiHeart
            size={20}
          />
        </div>
        <div
          className="relative w-fit h-fit flex items-center justify-center cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setAbrirBar(false);
          }}
        >
          <TiHeart
            size={20}
          />
        </div>
        <div
          className="relative w-fit h-fit flex items-center justify-center cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setAbrirBar(false);
          }}
        >
          <TiHeart
            size={20}
          />
        </div>
      </div>
      <div className="relative w-fit h-fit flex items-center justify-center flex-col gap-4">
        <div
          className="relative w-fit h-fit flex items-center justify-center cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setAbrirBar(false);
          }}
        >
          <TiHeart size={20}/>
        </div>
        <div
          className="relative w-fit h-fit flex items-center justify-center cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setAbrirBar(false);
          }}
        >
          <TiHeart
            size={20}
          />
        </div>
      </div>
    </div>
  );
};

export default Bar;
