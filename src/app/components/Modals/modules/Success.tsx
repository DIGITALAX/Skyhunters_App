import { useContext } from "react";
import { getCurrentNetwork } from "@/app/lib/constants";
import { AppContext } from "@/app/lib/Providers";

export const Success = ({ dict }: { dict: any }) => {
  const context = useContext(AppContext);

  if (!context?.successData) return null;

  const network = getCurrentNetwork();
  const explorerUrl = context.successData.txHash
    ? `${network.blockExplorer}/tx/${context.successData.txHash}`
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white border border-black max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-4 py-3 border-b border-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-500 border border-black flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <div className="text-lg">{dict?.modal_success_title}</div>
            </div>
            <button
              onClick={context.hideSuccess}
              className="text-xl hover:bg-gray-100 px-2 py-1"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <p className="text-sm leading-relaxed">
              {context.successData.message}
            </p>
          </div>

          {context.successData.txHash && (
            <div className="border border-black p-3">
              <div className="text-xs mb-2">{dict?.modal_tx_hash}</div>
              {explorerUrl ? (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs break-all font-mono break-all text-blue-600 hover:text-blue-800 underline transition-colors"
                >
                  {context.successData.txHash}
                </a>
              ) : (
                <div className="text-xs font-mono break-all text-gray-600">
                  {context.successData.txHash}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-black p-3">
          <div className="flex justify-end">
            <button
              onClick={context.hideSuccess}
              className="px-4 py-2 text-xs border border-black bg-black text-white hover:bg-gray-800 transition-colors"
            >
              {dict?.modal_close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
