import { FunctionComponent, JSX } from "react";

const FooterEntry: FunctionComponent<{ dict: any }> = ({ dict }): JSX.Element => {
  return (
    <div className="text-center mt-5 text-gray-500 border-t-2 border-black pt-2">
      <p>{dict?.footer_note}</p>
    </div>
  );
};

export default FooterEntry;
