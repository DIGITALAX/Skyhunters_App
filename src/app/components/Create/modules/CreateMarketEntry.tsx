"use client";

import { useContext } from "react";
import useCreate from "../hooks/useCreate";
import { AppContext } from "@/app/lib/Providers";
import { MARKET_CATEGORIES } from "@/app/constants/marketValidation";

export default function CreateMarketEntry({ dict }: { dict: any }) {
  const {
    isConnected,
    creating,
    liquidityApproved,
    approveLoading,
    approveLiquidity,
    handleCreateMarket,
    validation,
    createValues,
    setCreateValues,
    validateCreateInputs,
    minInitialLiquidity,
  } = useCreate(dict);
  const context = useContext(AppContext);

  const validationErrors = validateCreateInputs();
  const hasLiquidity = Number(createValues.initialLiquidity) > 0;
  const minLiquidityInMona = minInitialLiquidity
    ? (Number(minInitialLiquidity) / 1e18).toFixed(18).replace(/\.?0+$/, "")
    : "0.000001";
  return (
    <main className="border-2 border-gray-400 p-4 bg-gray-100">
      <h2 className="text-lg text-blue-800 mb-3">{dict?.create_title}</h2>

      {!isConnected && (
        <div className="border border-yellow-600 bg-yellow-100 p-2 mb-3 text-xs">
          {dict?.create_connect_wallet_notice}
        </div>
      )}

      {!context?.roles?.creator && isConnected && (
        <div className="border border-red-600 bg-red-100 p-2 mb-3 text-xs">
          {dict?.create_creator_role_notice}
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="border border-red-600 bg-red-100 p-2 mb-3 text-xs">
          <div className="font-bold text-red-800 mb-1">
            {dict?.create_validation_title}
          </div>
          {validationErrors.map((error, i) => (
            <div key={i}>• {error}</div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <div className="border-2 border-black bg-white p-3">
          <h3 className="text-md font-bold text-black mb-2">
            {dict?.create_basic_info_title}
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block mb-1 font-bold text-xs">
                {dict?.create_category_label}
              </label>
              <select
                value={createValues.category}
                onChange={(e) =>
                  setCreateValues({ ...createValues, category: e.target.value })
                }
                className="w-full border-2 border-black p-1 text-xs bg-white"
              >
                <option value="">{dict?.create_category_placeholder}</option>
                {Object.entries(MARKET_CATEGORIES).map(([key, cat]) => (
                  <option key={key} value={key}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {createValues.category && (
                <div className="mt-2 p-3 bg-gray-100 border border-black text-xs space-y-2">
                  <div>
                  <p className="font-bold mb-1 text-[11px] tracking-wide">
                    {MARKET_CATEGORIES[
                      createValues.category as keyof typeof MARKET_CATEGORIES
                    ].name.toUpperCase()}
                  </p>
                    <p className="text-[11px] leading-snug">
                      {
                        MARKET_CATEGORIES[
                          createValues.category as keyof typeof MARKET_CATEGORIES
                        ].description
                      }
                    </p>
                  </div>

                  <div>
                    <p className="font-bold mb-1">
                      {dict?.create_category_related}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {MARKET_CATEGORIES[
                        createValues.category as keyof typeof MARKET_CATEGORIES
                      ].relatedApps
                        .filter((app) => app)
                        .map((app) => (
                          <span
                            key={app}
                            className="px-2 py-0.5 border border-black bg-white text-[11px]"
                          >
                            {app}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-bold mb-1">
                      {dict?.create_category_examples}
                    </p>
                    <ul className="space-y-1">
                      {MARKET_CATEGORIES[
                        createValues.category as keyof typeof MARKET_CATEGORIES
                      ].exampleQuestions.map((q, i) => (
                        <li key={i}>• {q}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block mb-1 font-bold text-xs">
                {dict?.create_question_label}
              </label>
              <input
                type="text"
                value={createValues.question}
                onChange={(e) =>
                  setCreateValues({ ...createValues, question: e.target.value })
                }
                className="w-full border-2 border-black p-1 text-xs"
                placeholder={dict?.create_question_placeholder}
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
                  {dict?.create_question_valid}
                </div>
              )}
            </div>

            <div>
              <label className="block mb-1 font-bold text-xs">
                {dict?.create_end_date_label}
              </label>
              <input
                type="datetime-local"
                value={createValues.endDate}
                onChange={(e) =>
                  setCreateValues({ ...createValues, endDate: e.target.value })
                }
                min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                className="border-2 border-black p-1 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="border-2 border-black bg-white p-3">
          <h3 className="text-md font-bold text-black mb-2">
            {dict?.create_resolution_title}
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block mb-1 font-bold text-xs">
                {dict?.create_source_label}
              </label>
              <input
                type="text"
                value={createValues.source}
                onChange={(e) =>
                  setCreateValues({ ...createValues, source: e.target.value })
                }
                className="w-full border-2 border-black p-1 text-xs"
                placeholder={dict?.create_source_placeholder}
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-xs">
                {dict?.create_failover_label}
              </label>
              <input
                type="text"
                value={createValues.failoverSource}
                onChange={(e) =>
                  setCreateValues({
                    ...createValues,
                    failoverSource: e.target.value,
                  })
                }
                className="w-full border-2 border-black p-1 text-xs"
                placeholder={dict?.create_failover_placeholder}
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-xs">
                {dict?.create_rounding_label}
              </label>
              <select
                value={createValues.roundingMethod}
                onChange={(e) =>
                  setCreateValues({
                    ...createValues,
                    roundingMethod: e.target.value,
                  })
                }
                className="w-full border-2 border-black p-1 text-xs bg-white"
              >
                <option value="">{dict?.create_rounding_placeholder}</option>
                <option value="standard">{dict?.create_rounding_standard}</option>
                <option value="up">{dict?.create_rounding_up}</option>
                <option value="down">{dict?.create_rounding_down}</option>
                <option value="nearest">{dict?.create_rounding_nearest}</option>
                <option value="truncate">{dict?.create_rounding_truncate}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border-2 border-black bg-white p-3">
          <h3 className="text-md font-bold text-black mb-2">
            {dict?.create_market_params_title}
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block mb-1 font-bold text-xs">
                {dict?.create_precision_label}
              </label>
              <input
                type="text"
                value={createValues.precision}
                onChange={(e) =>
                  setCreateValues({
                    ...createValues,
                    precision: e.target.value,
                  })
                }
                className="w-full border-2 border-black p-1 text-xs"
                placeholder="10000"
              />
              <div className="text-xs text-gray-600 mt-1">
                {dict?.create_precision_help}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-bold text-xs">
                  {dict?.create_min_probability_label}
                </label>
                <input
                  type="number"
                  value={createValues.minPrice}
                  onChange={(e) =>
                    setCreateValues({ ...createValues, minPrice: e.target.value })
                  }
                  min="1"
                  max="9999"
                  className="w-full border-2 border-black p-1 text-xs"
                  placeholder="100"
                />
                <div className="text-xs text-gray-600 mt-1">
                  {dict?.create_min_probability_help}
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold text-xs">
                  {dict?.create_max_probability_label}
                </label>
                <input
                  type="number"
                  value={createValues.maxPrice}
                  onChange={(e) =>
                    setCreateValues({ ...createValues, maxPrice: e.target.value })
                  }
                  min="1"
                  max="9999"
                  className="w-full border-2 border-black p-1 text-xs"
                  placeholder="9900"
                />
                <div className="text-xs text-gray-600 mt-1">
                  {dict?.create_max_probability_help}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-2 border-black bg-white p-3">
          <h3 className="text-md font-bold text-black mb-2">
            {dict?.create_liquidity_title}
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block mb-1 font-bold text-xs">
                {dict?.create_liquidity_amount_label}
              </label>
              <input
                type="text"
                value={createValues.initialLiquidity}
                onChange={(e) => {
                  const value = e.target.value;
                  if (
                    value === "" ||
                    (!isNaN(Number(value)) && Number(value) >= 0)
                  ) {
                    setCreateValues({
                      ...createValues,
                      initialLiquidity: value,
                    });
                  }
                }}
                className="w-full border-2 border-black p-1 text-xs"
                placeholder={`${dict?.create_liquidity_amount_placeholder} ${minLiquidityInMona} MONA)`}
              />
              <div className="text-xs text-gray-600 mt-1">
                {dict?.create_liquidity_optional_prefix} {minLiquidityInMona} MONA)
              </div>
            </div>

            {hasLiquidity && (
              <>
                <div>
                  <label className="block mb-1 font-bold text-xs">
                    {dict?.create_initial_answer_label}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        setCreateValues({
                          ...createValues,
                          initialAnswer: "yes",
                        })
                      }
                      className={`px-2 py-1 border-2 border-black text-xs ${
                        createValues.initialAnswer === "yes"
                          ? "bg-black text-white"
                          : "bg-white"
                      }`}
                    >
                      {dict?.common_yes}
                    </button>
                    <button
                      onClick={() =>
                        setCreateValues({
                          ...createValues,
                          initialAnswer: "no",
                        })
                      }
                      className={`px-2 py-1 border-2 border-black text-xs ${
                        createValues.initialAnswer === "no"
                          ? "bg-black text-white"
                          : "bg-white"
                      }`}
                    >
                      {dict?.common_no}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-bold text-xs">
                      {dict?.create_lower_sell_label}
                    </label>
                    <input
                      type="number"
                      value={createValues.initialBuyPrice}
                      onChange={(e) =>
                        setCreateValues({
                          ...createValues,
                          initialBuyPrice: e.target.value,
                        })
                      }
                      min={Number(createValues.minPrice || 100) / 10000}
                      max={Number(createValues.maxPrice || 9900) / 10000}
                      step="0.01"
                      className="w-full border-2 border-black p-1 text-xs"
                      placeholder={dict?.create_buy_price_placeholder}
                    />
                    <div className="text-xs text-gray-600 mt-1">
                      {dict?.create_lower_sell_help_prefix}{" "}
                      {Number(createValues.minPrice || 100) / 10000})
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 font-bold text-xs">
                      {dict?.create_higher_sell_label}
                    </label>
                    <input
                      type="number"
                      value={createValues.initialSellPrice}
                      onChange={(e) =>
                        setCreateValues({
                          ...createValues,
                          initialSellPrice: e.target.value,
                        })
                      }
                      min={Number(createValues.minPrice || 100) / 10000}
                      max={Number(createValues.maxPrice || 9900) / 10000}
                      step="0.01"
                      className="w-full border-2 border-black p-1 text-xs"
                      placeholder={dict?.create_sell_price_placeholder}
                    />
                    <div className="text-xs text-gray-600 mt-1">
                      {dict?.create_higher_sell_help_prefix}{" "}
                      {Number(createValues.maxPrice || 9900) / 10000})
                    </div>
                  </div>
                </div>

                {!liquidityApproved && (
                  <div className="border border-red-600 bg-red-100 p-2">
                    <div className="font-bold text-red-800">
                      {dict?.create_liquidity_approval_title}
                    </div>
                    <div className="text-xs text-red-700 mb-2">
                      {dict?.create_liquidity_approval_body}
                    </div>
                    <button
                      onClick={approveLiquidity}
                      disabled={approveLoading}
                      className="bg-red-600 text-white px-3 py-1 text-xs border border-black disabled:opacity-50"
                    >
                      {approveLoading
                        ? dict?.create_liquidity_approving
                        : dict?.create_liquidity_approve_cta}
                    </button>
                  </div>
                )}

                {liquidityApproved && (
                  <div className="border border-green-600 bg-green-100 p-2">
                    <div className="font-bold text-green-800">
                      {dict?.create_liquidity_approved_title}
                    </div>
                    <div className="text-xs text-green-700">
                      {dict?.create_liquidity_approved_body}
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
          {creating ? dict?.create_button_creating : dict?.create_button_create}
        </button>
      </div>
    </main>
  );
}
