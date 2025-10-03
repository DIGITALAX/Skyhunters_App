import { FunctionComponent, JSX } from "react";

const Footer: FunctionComponent = (): JSX.Element => {
  return (
    <div className="text-center mt-5 text-gray-500 border-t-2 border-black pt-2">
      <p>Skyhunters v1.0 - Powered by $MONA</p>
    </div>
  );
};

export default Footer;
