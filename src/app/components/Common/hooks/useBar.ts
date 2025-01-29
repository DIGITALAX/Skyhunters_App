import { useState } from "react";

const useBar = () => {

    const [abrirBar, setAbrirBar] = useState<boolean>(false);


    return {
        abrirBar, setAbrirBar
    }

}

export default useBar;