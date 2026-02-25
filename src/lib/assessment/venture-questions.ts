export interface VentureQuestion {
  key: string;
  label: string;
  type: "free-text" | "multi-select" | "single-select" | "ranking";
  required: boolean;
  description?: string;
  options?: { value: string; label: string }[];
  minLength?: number;
  allowCustom?: boolean;
}

export interface VentureSection {
  key: string;
  title: string;
  description: string;
  questions: VentureQuestion[];
}

export const VENTURE_SECTIONS: VentureSection[] = [
  {
    key: "passions",
    title: "Passions & Interests",
    description: "What energizes you? What could you work on for years without losing interest?",
    questions: [
      {
        key: "personal-passions",
        label: "What topics or problems are you personally passionate about?",
        type: "free-text",
        required: true,
        minLength: 50,
      },
      {
        key: "industries-excited",
        label: "Which industries or sectors excite you?",
        type: "multi-select",
        required: true,
        allowCustom: true,
        options: [
          { value: "health", label: "Health & Wellness" },
          { value: "fintech", label: "FinTech / Financial Services" },
          { value: "edtech", label: "Education & Learning" },
          { value: "climate", label: "Climate & Sustainability" },
          { value: "ai-ml", label: "AI / Machine Learning" },
          { value: "saas", label: "SaaS / B2B Software" },
          { value: "ecommerce", label: "E-commerce / Marketplace" },
          { value: "creator", label: "Creator Economy" },
          { value: "devtools", label: "Developer Tools" },
          { value: "proptech", label: "Real Estate / PropTech" },
          { value: "foodtech", label: "Food & Agriculture" },
          { value: "mobility", label: "Mobility & Transportation" },
          { value: "gaming", label: "Gaming & Entertainment" },
          { value: "hr-future-work", label: "HR / Future of Work" },
          { value: "cybersecurity", label: "Cybersecurity" },
        ],
      },
      {
        key: "hobbies-side-projects",
        label: "Describe hobbies or side projects that hint at what you'd love to build",
        type: "free-text",
        required: true,
        minLength: 50,
      },
    ],
  },
  {
    key: "problem-spaces",
    title: "Problem Spaces",
    description: "What problems have you seen firsthand that need solving?",
    questions: [
      {
        key: "problems-experienced",
        label: "What problems have you personally experienced that frustrated you?",
        type: "free-text",
        required: true,
        minLength: 50,
      },
      {
        key: "problems-observed",
        label: "What problems have you observed others struggling with?",
        type: "free-text",
        required: true,
        minLength: 50,
      },
      {
        key: "industry-inefficiencies",
        label: "What industry inefficiencies have you noticed from your work experience?",
        type: "free-text",
        required: true,
        minLength: 50,
      },
    ],
  },
  {
    key: "customer-preference",
    title: "Customer Preferences",
    description: "Who do you want to serve and sell to?",
    questions: [
      {
        key: "target-customer",
        label: "Who is your ideal customer?",
        type: "multi-select",
        required: true,
        options: [
          { value: "consumers", label: "Individual consumers (B2C)" },
          { value: "smb", label: "Small & medium businesses" },
          { value: "enterprise", label: "Enterprise / large companies" },
          { value: "developers", label: "Developers / technical users" },
          { value: "creators", label: "Creators / freelancers" },
          { value: "students", label: "Students / learners" },
          { value: "government", label: "Government / public sector" },
          { value: "nonprofits", label: "Nonprofits / NGOs" },
        ],
      },
      {
        key: "customer-relationship",
        label: "What kind of relationship do you want with customers?",
        type: "free-text",
        required: true,
        minLength: 30,
      },
    ],
  },
  {
    key: "business-model",
    title: "Business Model Preferences",
    description: "How do you want to make money?",
    questions: [
      {
        key: "revenue-models",
        label: "Which revenue models appeal to you?",
        type: "multi-select",
        required: true,
        options: [
          { value: "subscription", label: "Subscription / SaaS" },
          { value: "marketplace", label: "Marketplace / transaction fees" },
          { value: "one-time", label: "One-time purchase" },
          { value: "freemium", label: "Freemium" },
          { value: "advertising", label: "Advertising" },
          { value: "licensing", label: "Licensing / white-label" },
          { value: "consulting", label: "Consulting / services + product" },
          { value: "hardware", label: "Physical product / hardware" },
        ],
      },
      {
        key: "revenue-timeline",
        label: "How quickly do you want to see revenue?",
        type: "single-select",
        required: true,
        options: [
          { value: "immediate", label: "Day 1 — charge from the start" },
          { value: "3-months", label: "Within 3 months" },
          { value: "6-months", label: "Within 6 months" },
          { value: "12-months", label: "Within 12 months (VC-backed growth)" },
          { value: "flexible", label: "Flexible — depends on opportunity" },
        ],
      },
      {
        key: "scale-ambition",
        label: "What scale do you want to reach?",
        type: "single-select",
        required: true,
        options: [
          { value: "lifestyle", label: "Lifestyle business ($100K-$1M ARR)" },
          { value: "mid", label: "Mid-scale ($1M-$10M ARR)" },
          { value: "venture", label: "Venture-scale ($10M+ ARR)" },
          { value: "moonshot", label: "Moonshot ($100M+ ARR)" },
          { value: "no-preference", label: "No preference" },
        ],
      },
    ],
  },
  {
    key: "technology",
    title: "Technology Preferences",
    description: "What technologies do you want to work with or leverage?",
    questions: [
      {
        key: "tech-interests",
        label: "Which technologies interest you?",
        type: "multi-select",
        required: true,
        allowCustom: true,
        options: [
          { value: "web-apps", label: "Web applications" },
          { value: "mobile", label: "Mobile apps" },
          { value: "ai-ml", label: "AI / Machine Learning" },
          { value: "blockchain", label: "Blockchain / Web3" },
          { value: "iot", label: "IoT / Hardware" },
          { value: "ar-vr", label: "AR / VR" },
          { value: "low-code", label: "Low-code / No-code" },
          { value: "api", label: "APIs / Developer tools" },
          { value: "data", label: "Data / Analytics" },
          { value: "automation", label: "Automation / RPA" },
        ],
      },
      {
        key: "tech-advantage",
        label: "Do you have any technical moat or advantage?",
        type: "free-text",
        required: true,
        minLength: 30,
      },
    ],
  },
  {
    key: "existing-ideas",
    title: "Existing Ideas",
    description: "Share any ideas you've already been thinking about.",
    questions: [
      {
        key: "ideas-list",
        label: "Describe any startup ideas you've been considering (one per paragraph)",
        type: "free-text",
        required: false,
        minLength: 0,
      },
      {
        key: "ideas-why-not",
        label: "For ideas you've considered and rejected, why?",
        type: "free-text",
        required: false,
        minLength: 0,
      },
    ],
  },
  {
    key: "anti-preferences",
    title: "Anti-Preferences",
    description: "What do you NOT want to do?",
    questions: [
      {
        key: "industries-avoid",
        label: "Are there industries or sectors you want to avoid?",
        type: "free-text",
        required: true,
        minLength: 20,
      },
      {
        key: "models-avoid",
        label: "Are there business models you don't want?",
        type: "free-text",
        required: true,
        minLength: 20,
      },
      {
        key: "other-constraints",
        label: "Any other constraints or things you want to avoid?",
        type: "free-text",
        required: false,
        minLength: 0,
      },
    ],
  },
];
