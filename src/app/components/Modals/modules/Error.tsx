import { AppContext } from "@/app/lib/Providers";
import { useContext } from "react";

export const Error = () => {
  const context = useContext(AppContext);

  if (!context?.errorData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white border border-black max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-4 py-3 border-b border-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-500 border border-black flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
              <div className="text-lg">Error</div>
            </div>
            <button
              onClick={context.hideError}
              className="text-xl hover:bg-gray-100 px-2 py-1"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-4">
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {context.errorData.message}
          </p>
        </div>

        <div className="border-t border-black p-3">
          <div className="flex justify-end">
            <button
              onClick={context.hideError}
              className="px-4 py-2 text-xs border border-black bg-black text-white hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
