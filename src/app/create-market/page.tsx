"use client";

import { MARKET_CATEGORIES } from "../constants/marketValidation";
import useCreate from "../components/Create/hooks/useCreate";
import { useContext } from "react";
import { AppContext } from "../lib/Providers";

export default function CreateMarket() {
  const {
    isConnected,
    creating,
    liquidityApproved,
    approveLiquidity,
    handleCreateMarket,
    validation,
    createValues,
    setCreateValues,
    validateCreateInputs,
    minInitialLiquidity,
  } = useCreate();
  const context = useContext(AppContext);
  
  const validationErrors = validateCreateInputs();
  const hasLiquidity = Number(createValues.initialLiquidity) > 0;
  const minLiquidityInMona = minInitialLiquidity ? Number(minInitialLiquidity) / 10 ** 18 : 0.001;
  return (
    <main className="border-2 border-gray-400 p-4 bg-gray-100">
      <h2 className="text-lg text-blue-800 mb-3">Create New Market</h2>

      {!isConnected && (
        <div className="border border-yellow-600 bg-yellow-100 p-2 mb-3 text-xs">
          Please connect your wallet to create markets
        </div>
      )}

      {!context?.roles?.creator && isConnected && (
        <div className="border border-red-600 bg-red-100 p-2 mb-3 text-xs">
          You need Creator role to create markets. Check your roles in the Manage section.
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="border border-red-600 bg-red-100 p-2 mb-3 text-xs">
          <div className="font-bold text-red-800 mb-1">Validation Errors:</div>
          {validationErrors.map((error, i) => (
            <div key={i}>• {error}</div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <div className="border-2 border-black bg-white p-3">
          <h3 className="text-md font-bold text-black mb-2">BASIC INFORMATION</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block mb-1 font-bold text-xs">Category:</label>
              <select
                value={createValues.category}
                onChange={(e) => setCreateValues({...createValues, category: e.target.value})}
                className="w-full border-2 border-black p-1 text-xs bg-white"
              >
                <option value="">Select a category</option>
                {Object.entries(MARKET_CATEGORIES).map(([key, cat]) => (
                  <option key={key} value={key}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {createValues.category && (
                <div className="mt-2 p-2 bg-gray-100 border border-black text-xs">
                  <p className="font-bold mb-1">Example questions:</p>
                  <ul className="space-y-1">
                    {MARKET_CATEGORIES[
                      createValues.category as keyof typeof MARKET_CATEGORIES
                    ].exampleQuestions.map((q, i) => (
                      <li key={i}>• {q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label className="block mb-1 font-bold text-xs">Question:</label>
              <input
                type="text"
                value={createValues.question}
                onChange={(e) => setCreateValues({...createValues, question: e.target.value})}
                className="w-full border-2 border-black p-1 text-xs"
                placeholder="Will X happen by Y date?"
              />

              {!validation.valid && validation.errors.length > 0 && (
                <div className="mt-1 text-red-600 text-xs">
                  {validation.errors.map((error, i) => (
                    <p key={i}>• {error}</p>
                  ))}
                </div>
              )}

              {validation.valid && createValues.question && (
                <div className="mt-1 text-green-600 text-xs">
                  ✓ Valid question format
                </div>
              )}
            </div>

            <div>
              <label className="block mb-1 font-bold text-xs">End Date:</label>
              <input
                type="datetime-local"
                value={createValues.endDate}
                onChange={(e) => setCreateValues({...createValues, endDate: e.target.value})}
                min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                className="border-2 border-black p-1 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="border-2 border-black bg-white p-3">
          <h3 className="text-md font-bold text-black mb-2">RESOLUTION INFORMATION</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block mb-1 font-bold text-xs">Primary Source:</label>
              <input
                type="text"
                value={createValues.source}
                onChange={(e) => setCreateValues({...createValues, source: e.target.value})}
                className="w-full border-2 border-black p-1 text-xs"
                placeholder="e.g., Official API, verified data source..."
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-xs">Failover Source:</label>
              <input
                type="text"
                value={createValues.failoverSource}
                onChange={(e) => setCreateValues({...createValues, failoverSource: e.target.value})}
                className="w-full border-2 border-black p-1 text-xs"
                placeholder="e.g., Backup API, manual resolution..."
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-xs">Rounding Method:</label>
              <select
                value={createValues.roundingMethod}
                onChange={(e) => setCreateValues({...createValues, roundingMethod: e.target.value})}
                className="w-full border-2 border-black p-1 text-xs bg-white"
              >
                <option value="">Select rounding method</option>
                <option value="standard">Standard</option>
                <option value="up">Round Up</option>
                <option value="down">Round Down</option>
                <option value="nearest">Nearest</option>
                <option value="truncate">Truncate</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border-2 border-black bg-white p-3">
          <h3 className="text-md font-bold text-black mb-2">MARKET PARAMETERS</h3>
          
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block mb-1 font-bold text-xs">Precision:</label>
              <input
                type="text"
                value={createValues.precision}
                onChange={(e) => setCreateValues({...createValues, precision: e.target.value})}
                className="w-full border-2 border-black p-1 text-xs"
                placeholder="10000"
              />
              <div className="text-xs text-gray-600 mt-1">Default: 10000</div>
            </div>

            <div>
              <label className="block mb-1 font-bold text-xs">Min Price:</label>
              <input
                type="text"
                value={createValues.minPrice}
                onChange={(e) => setCreateValues({...createValues, minPrice: e.target.value})}
                className="w-full border-2 border-black p-1 text-xs"
                placeholder="100"
              />
              <div className="text-xs text-gray-600 mt-1">Default: 100</div>
            </div>

            <div>
              <label className="block mb-1 font-bold text-xs">Max Price:</label>
              <input
                type="text"
                value={createValues.maxPrice}
                onChange={(e) => setCreateValues({...createValues, maxPrice: e.target.value})}
                className="w-full border-2 border-black p-1 text-xs"
                placeholder="9900"
              />
              <div className="text-xs text-gray-600 mt-1">Default: 9900</div>
            </div>
          </div>
        </div>

        <div className="border-2 border-black bg-white p-3">
          <h3 className="text-md font-bold text-black mb-2">INITIAL LIQUIDITY (OPTIONAL)</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block mb-1 font-bold text-xs">Liquidity Amount (MONA):</label>
              <input
                type="text"
                value={createValues.initialLiquidity}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0)) {
                    setCreateValues({...createValues, initialLiquidity: value});
                  }
                }}
                className="w-full border-2 border-black p-1 text-xs"
                placeholder={`Amount in MONA (minimum ${minLiquidityInMona} MONA)`}
              />
              <div className="text-xs text-gray-600 mt-1">
                Optional: Provide initial liquidity to bootstrap your market (minimum {minLiquidityInMona} MONA)
              </div>
            </div>

            {hasLiquidity && (
              <>
                <div>
                  <label className="block mb-1 font-bold text-xs">Initial Answer Preference:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setCreateValues({...createValues, initialAnswer: "yes"})}
                      className={`px-2 py-1 border-2 border-black text-xs ${
                        createValues.initialAnswer === "yes" ? "bg-black text-white" : "bg-white"
                      }`}
                    >
                      YES
                    </button>
                    <button
                      onClick={() => setCreateValues({...createValues, initialAnswer: "no"})}
                      className={`px-2 py-1 border-2 border-black text-xs ${
                        createValues.initialAnswer === "no" ? "bg-black text-white" : "bg-white"
                      }`}
                    >
                      NO
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-bold text-xs">Initial Buy Price:</label>
                    <input
                      type="text"
                      value={createValues.initialBuyPrice}
                      onChange={(e) => setCreateValues({...createValues, initialBuyPrice: e.target.value})}
                      className="w-full border-2 border-black p-1 text-xs"
                      placeholder="e.g., 4000"
                    />
                    <div className="text-xs text-gray-600 mt-1">Must be ≥ min price</div>
                  </div>

                  <div>
                    <label className="block mb-1 font-bold text-xs">Initial Sell Price:</label>
                    <input
                      type="text"
                      value={createValues.initialSellPrice}
                      onChange={(e) => setCreateValues({...createValues, initialSellPrice: e.target.value})}
                      className="w-full border-2 border-black p-1 text-xs"
                      placeholder="e.g., 6000"
                    />
                    <div className="text-xs text-gray-600 mt-1">Must be ≤ max price</div>
                  </div>
                </div>

                {!liquidityApproved && (
                  <div className="border border-red-600 bg-red-100 p-2">
                    <div className="font-bold text-red-800">LIQUIDITY APPROVAL REQUIRED</div>
                    <div className="text-xs text-red-700 mb-2">
                      You need to approve MONA spending for initial liquidity
                    </div>
                    <button
                      onClick={approveLiquidity}
                      disabled={creating}
                      className="bg-red-600 text-white px-3 py-1 text-xs border border-black"
                    >
                      {creating ? "APPROVING..." : "APPROVE LIQUIDITY"}
                    </button>
                  </div>
                )}

                {liquidityApproved && (
                  <div className="border border-green-600 bg-green-100 p-2">
                    <div className="font-bold text-green-800">✓ LIQUIDITY APPROVED</div>
                    <div className="text-xs text-green-700">
                      Ready to create market with initial liquidity
                    </div>
                  </div>
                )}
              </>
            )}
        </div>
        </div>

        <button
          onClick={handleCreateMarket}
          disabled={
            creating ||
            validationErrors.length > 0 ||
            !isConnected ||
            !context?.roles?.creator ||
            (hasLiquidity && !liquidityApproved)
          }
          className={`w-full px-4 py-3 border-2 border-black font-bold text-xs ${
            !creating &&
            validationErrors.length === 0 &&
            isConnected &&
            context?.roles?.creator &&
            (!hasLiquidity || liquidityApproved)
              ? "bg-blue-600 text-white cursor-pointer"
              : "bg-gray-400 text-gray-700 cursor-not-allowed"
          }`}
        >
          {creating ? "CREATING MARKET..." : "CREATE MARKET"}
        </button>
      </div>
    </main>
  );
}
