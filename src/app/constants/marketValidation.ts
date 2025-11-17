export const FORBIDDEN_TERMS = [
  "price",
  "usd",
  "dollar",
  "worth",
  "value",
  "cost",
  "trading",
  "pump",
  "dump",
  "moon",
  "bear",
  "bull",
  "eur",
  "gbp",
  "jpy",
  "cny",
  "btc price",
  "eth price",
  "floor price",
];

export const MARKET_CATEGORIES = {
  SOCIAL: {
    id: "social",
    name: "Decentralized social traction",
    description:
      "Signal propagation across Lens-native feeds, CC0 media networks, and federated crypto forums.",
    relatedApps: [
      "Lens",
      "Chromadin",
      "Hey",
      "Orb",
      "Cypher Search",
      "Kinora",
      "CC0 W3F Forum",
    ],
    exampleQuestions: [
      "Will Lens profile ZZZ log 40K mirrors within the next 10 days?",
      "Will Chromadin stream ZZZ cross 8K mints inside its first 72 hours?",
      "Will orb reach ZZZ downloads before Lens Token first mint?",
      "Will the CC0 W3F Forum reach 200 new posts before W3FW ends?",
    ],
  },
  APPS: {
    id: "apps",
    name: "Ecosystem Apps",
    description:
      "Tracking install velocity and sticky sessions across digitalax-powered clients and creator ops stacks.",
    relatedApps: ["KinoraSDK", "Coin Op App", "Cypher Search", "TripleA"],
    exampleQuestions: [
      "Will KinoraSDK integrations top 50 live apps before the next quarterly drop?",
      "Will Coin Op App register 15K unique downloads in July?",
      "Will Cypher Search queries exceed 250K in a single week?",
      "Will TripleA vaults onboard 2K new creators by the time the next Autograph Quarterly ships?",
    ],
  },
  EVM: {
    id: "onchain",
    name: "EVM Onchain Actions",
    description:
      "Measuring raw contract triggers, multi-sig executions, and weird composability moments across the stack.",
    relatedApps: ["KinoraSDK", "Coin Op App", "FGO", "FGO Futures", "Ionic"],
    exampleQuestions: [
      "Will Ionic reach 2K appraisals before the next NFT is submitted?",
      "Will Coin Op App process 1K new Parent NFTs minted to the market before the next GDN drop?",
      "Will FGO Futures physical rights trading reach ZZZ liquidity before the next fulfiller onboards?",
      "Will FGO reach ZZZ newly created infrastructures and template NFTs minted by Feb?",
    ],
  },

  MARKETPLACE: {
    id: "marketplace",
    name: "Creator Liquidity & Drops",
    description:
      "Follow the flows for editions, couture, and microbrand primitives stitched to public ledgers.",
    relatedApps: [
      "TripleA",
      "Cypher Search",
      "Chromadin",
      "GDN",
      "Autograph Quarterly",
      "Microbrands",
      "FGO"
    ],
    exampleQuestions: [
      "Will TripleA agents mint ZZZ prompt on the next hoodie?",
      "Will Cypher Search catalog ZZZ new physical fashion collections within the next 30 days?",
      "Will FGO Parent NFTs approve and fulfill ZZZ units?",
      "Will GDN auctions distribute 300 bespoke microbrand lots before New Year?",
    ],
  },

  TOKENS: {
    id: "token",
    name: "Token Liquidity & Velocity",
    description:
      "Pulse checks on MONA-era treasuries, guild credits, and high-frequency settlement loops.",
    relatedApps: ["MONA", "GDN", "W3F", "IONIC", "GENESIS"],
    exampleQuestions: [
      "Will MONA increase unique wallet count to ZZZ?",
      "Will Ionic complete all round 1 mints before Jan?",
      "Will W3F credits cycle through 9K wallets this quarter?",
      "Will all round 1 Genesis mints activate settler bot activity on FGO Futures?",
    ],
  },

  INFRA: {
    id: "infra",
    name: "Infra Velocity",
    description:
      "Throughput across the garment supply MPC, zero-waste logistics, and encrypted fulfillment rails.",
    relatedApps: [
      "Fractional Garment Ownership",
      "Coin Op Zero Waste Packing + Export",
      "FGO Physical Rights Futures",
      "FGO Supply Coordination",
      "FGO Supplier Futures",
      "E2E Fulfillment Encryption",
    ],
    exampleQuestions: [
      "Will Fractional Garment Ownership clear ZZZ forks?",
      "Will Coin Op Zero Waste Packing + Export sync 1,200 shipments this season?",
      "Will FGO Supplier Futures queue 800 active contracts by Q4?",
      "Will E2E Fulfillment Encryption process 10K signed proofs within the next 45 days?",
    ],
  },
};

export const REQUIRED_PATTERNS = {
  minLength: 20,
  maxLength: 200,
};

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function validateMarketQuestion(
  question: string,
  dict: {
    create_question_prefix: string;
    create_validation_forbidden_template: string;
    create_validation_question_pattern: string;
    create_validation_question_short_template: string;
    create_validation_question_long_template: string;
  }
): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const lower = question.toLowerCase();
  const prefix = dict?.create_question_prefix;
  const pattern = new RegExp(`^${escapeRegex(prefix)}\\s.+\\?$`);

  for (const term of FORBIDDEN_TERMS) {
    if (lower.includes(term)) {
      errors.push(
        dict?.create_validation_forbidden_template.replace("{term}", term)
      );
    }
  }

  if (!pattern.test(question)) {
    errors.push(
      dict?.create_validation_question_pattern.replace("{prefix}", prefix)
    );
  }

  if (question.length < REQUIRED_PATTERNS.minLength) {
    errors.push(
      dict?.create_validation_question_short_template.replace(
        "{min}",
        REQUIRED_PATTERNS.minLength.toString()
      )
    );
  }

  if (question.length > REQUIRED_PATTERNS.maxLength) {
    errors.push(
      dict?.create_validation_question_long_template.replace(
        "{max}",
        REQUIRED_PATTERNS.maxLength.toString()
      )
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
