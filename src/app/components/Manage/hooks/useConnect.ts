import { usePathname, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
export function useConnect() {
  const { address, isConnected, isConnecting } = useAccount();
  const router = useRouter();
  const path = usePathname();

  const changeLanguage = () => {
    const segments = path.split("/");
    segments[1] = path.includes("/en/") ? "es" : "en";
    const newPath = segments.join("/");

    document.cookie = `NEXT_LOCALE=${
      path.includes("/en/") ? "es" : "en"
    }; path=/; SameSite=Lax`;

    router.push(newPath);
  };

  return {
    address,
    isConnected,
    changeLanguage,
    isConnecting,
  };
}
