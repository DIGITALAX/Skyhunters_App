export const FORBIDDEN_TERMS = [
  'price',
  'usd', 
  'dollar',
  'worth',
  'value',
  'cost',
  'trading',
  'pump',
  'dump',
  'moon',
  'bear',
  'bull',
  'eur',
  'gbp',
  'jpy',
  'cny',
  'btc price',
  'eth price',
  'floor price'
]

export const MARKET_CATEGORIES = {
  SOCIAL: {
    id: 'social',
    name: 'Social Metrics',
    description: 'Engagement, followers, content performance',
    relatedApps: ['X', 'Lens', 'Farcaster', 'YouTube', 'TikTok', 'Instagram'],
    exampleQuestions: [
      'Will @vitalik reach 5M followers on X by March 2025?',
      'Will this Lens post get 10K collects by next week?',
      'Will video XYZ reach 1M views on YouTube by Dec 31?',
      'Will @account get 100K likes on their next post?'
    ]
  },
  
  ADOPTION: {
    id: 'adoption',
    name: 'App & Protocol Adoption', 
    description: 'Downloads, users, registrations',
    relatedApps: ['Orb', 'Hey', 'ENS', 'Lens Protocol', 'Farcaster', 'Buttrfly'],
    exampleQuestions: [
      'Will Orb reach 100K downloads by Q1 2025?',
      'Will Lens Protocol have 1M profiles by June?',
      'Will ENS register 100K domains this month?',
      'Will app X have 10K daily active users by year end?'
    ]
  },
  
  MARKETPLACE: {
    id: 'marketplace',
    name: 'Marketplace Activity',
    description: 'Sales, listings, unique participants',
    relatedApps: ['OpenSea', 'Zora', 'Sound.xyz', 'Lens Collect', 'Mirror'],
    exampleQuestions: [
      'Will 10K NFTs be sold on Zora by March?',
      'Will Sound.xyz have 1K artists by Q2?',
      'Will marketplace X have 5K unique sellers by Dec?',
      'Will 100K articles be published on Mirror this year?'
    ]
  },
  
  COMMUNITY: {
    id: 'community',
    name: 'Community Growth',
    description: 'Members, participation, events',
    relatedApps: ['Discord', 'Telegram', 'DAOs', 'Snapshot', 'Guild'],
    exampleQuestions: [
      'Will DAO X reach 10K members by Q2?',
      'Will 100 proposals pass on Snapshot this month?',
      'Will Discord Y exceed 50K members?',
      'Will community Z hold 20 events this quarter?'
    ]
  }
}

export const REQUIRED_PATTERNS = {
  question: /^Will .+\?$/,
  minLength: 20,
  maxLength: 200
}

export function validateMarketQuestion(question: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const lower = question.toLowerCase()
  
  for (const term of FORBIDDEN_TERMS) {
    if (lower.includes(term)) {
      errors.push(`Cannot include "${term}" - no price speculation allowed`)
    }
  }
  
  if (!REQUIRED_PATTERNS.question.test(question)) {
    errors.push('Question must start with "Will" and end with "?"')
  }
  
  if (question.length < REQUIRED_PATTERNS.minLength) {
    errors.push('Question too short (min 20 characters)')
  }
  
  if (question.length > REQUIRED_PATTERNS.maxLength) {
    errors.push('Question too long (max 200 characters)')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}