export interface HeroSection {
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  tagline: string;
  ctaPrimary: CTA;
  ctaSecondary: CTA;
}

export interface CTA {
  text: string;
  link: string;
}

export interface WhatIsModonty {
  title: string;
  description: string;
  points: string[];
  coreConcept: string;
}

export interface HowItWorks {
  title: string;
  steps: WorkStep[];
  closing: string;
}

export interface WorkStep {
  number: number;
  title: string;
  description: string;
  benefits?: string[];
  features?: string[];
}

export interface ValueProposition {
  title: string;
  points: ValuePoint[];
}

export interface ValuePoint {
  title: string;
  description: string;
}

export interface TargetAudience {
  title: string;
  description: string;
  problems: string[];
  audiences: AudienceCategory[];
}

export interface AudienceCategory {
  category: string;
  description: string;
}

export interface Pricing {
  title: string;
  description: string;
  offer: string;
  plans: PricingPlan[];
}

export interface PricingPlan {
  id: string;
  name: string;
  nameAr: string;
  articlesPerMonth: number;
  price: number;
  priceAr: string;
  currency: string;
  duration: number;
  durationAr: string;
  popular: boolean;
  features: string[];
}

export interface WhyStrong {
  title: string;
  points: ValuePoint[];
}

export interface ChallengesSolved {
  title: string;
  description: string;
  problems: string[];
  solutions: ValuePoint[];
}

export interface Collaboration {
  title: string;
  description: string;
  ourPart: string[];
  yourPart: {
    title: string;
    items: string[];
  };
  result: string;
}

export interface FinalCTA {
  title: string;
  description: string;
  ctas: CTADetail[];
}

export interface CTADetail extends CTA {
  primary: boolean;
}

export interface LandingContent {
  hero: HeroSection;
  whatIsModonty: WhatIsModonty;
  howItWorks: HowItWorks;
  valueProposition: ValueProposition;
  targetAudience: TargetAudience;
  pricing: Pricing;
  whyStrong: WhyStrong;
  challengesSolved: ChallengesSolved;
  collaboration: Collaboration;
  finalCta: FinalCTA;
  meta: {
    brandName: string;
    tagline: string;
    description: string;
  };
}
























