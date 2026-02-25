import {
  Armchair,
  Building2,
  Languages,
  MapPin,
  Search,
  Shield,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

export interface ServiceFaqItem {
  question: string;
  answer: string;
}

export interface StandardServiceDetail {
  heroSubtitle: string;
  overviewTitle: string;
  overview: string;
  deliverablesTitle: string;
  deliverables: string[];
  processTitle: string;
  processSteps: string[];
  benefitsTitle: string;
  benefits: string[];
  faqs: ServiceFaqItem[];
}

export interface ServiceCategory {
  id: string;
  slug: string;
  icon: LucideIcon;
  color: string;
  title: string;
  description: string;
  subServices: string[];
  previewPoints: string[];
  pageVariant: 'standard' | 'tradeguard' | 'furniture';
  detail?: StandardServiceDetail;
}

// Single source of truth for all service categories
// Used by Navigation, ServicesOverview, Hero, and ServiceDetail pages
export const serviceCategories: ServiceCategory[] = [
  {
    id: 'sourcing',
    slug: 'product-sourcing',
    icon: Search,
    color: 'blue',
    title: 'Product Sourcing',
    description: 'Find reliable factories and get the best deals — from samples to bulk orders.',
    subServices: [
      'Product Sourcing — Finding factories & suppliers',
      'Factory Matching — Verified manufacturers',
      'Sample Procurement — Order & ship samples',
      'Supplier Verification — Background checks',
      'Price Negotiation — Best factory-direct prices',
      'OEM/ODM Solutions — Custom manufacturing',
      'Bulk Order Management — Large-scale purchases',
    ],
    previewPoints: ['Supplier matching', 'Price negotiation', 'Bulk order management'],
    pageVariant: 'standard',
    detail: {
      heroSubtitle:
        'Work directly with vetted factories in China while we handle screening, negotiation, and execution control.',
      overviewTitle: 'Source Better, Faster, and Safer',
      overview:
        'We remove the guesswork from sourcing by combining local factory access, bilingual negotiation, and strict supplier validation. You get reliable pricing and a clear path from inquiry to production.',
      deliverablesTitle: 'What You Receive',
      deliverables: [
        'Qualified supplier shortlist with factory profiles',
        'Sample coordination and side-by-side comparison',
        'Negotiated pricing and commercial terms in writing',
        'Production timeline and order monitoring support',
      ],
      processTitle: 'How We Deliver This Service',
      processSteps: [
        'Requirement briefing and target pricing alignment',
        'Factory screening based on capability and credibility',
        'Sample and quotation review with tradeoff guidance',
        'Supplier selection, negotiation, and order kickoff',
      ],
      benefitsTitle: 'Why Clients Use InterBridge for Sourcing',
      benefits: [
        'Reduce supplier risk before deposits are paid',
        'Avoid language and negotiation misalignment',
        'Improve cost structure without sacrificing quality',
        'Get a local partner that protects your interests on the ground',
      ],
      faqs: [
        {
          question: 'Can you help if I already have a supplier?',
          answer:
            'Yes. We can verify, benchmark, and renegotiate with your current supplier so you have stronger leverage and transparency.',
        },
        {
          question: 'Do you support low MOQ projects?',
          answer:
            'Yes. We can source factories that accept smaller volumes, then scale to larger production as your demand grows.',
        },
        {
          question: 'How quickly can sourcing begin?',
          answer:
            'We typically begin supplier screening immediately after your briefing and provide initial options within a few working days.',
        },
      ],
    },
  },
  {
    id: 'quality',
    slug: 'quality-assurance',
    icon: ShieldCheck,
    color: 'emerald',
    title: 'Quality Assurance',
    description: 'Protect your investment with thorough quality checks at every production stage.',
    subServices: [
      'Factory Audits — On-site assessments',
      'Pre-Production Inspection — Material checks',
      'During Production Check (DUPRO) — Mid-production QC',
      'Pre-Shipment Inspection (PSI) — Final verification',
      'Product Testing & Certification — Lab testing',
      'Defect Analysis & Reporting — Documentation',
    ],
    previewPoints: ['Factory audits', 'In-line inspections', 'Pre-shipment QC reports'],
    pageVariant: 'standard',
    detail: {
      heroSubtitle:
        'Protect your order before it ships with structured inspections, practical reporting, and local follow-through.',
      overviewTitle: 'Quality Control That Prevents Costly Surprises',
      overview:
        'Our QA workflow covers pre-production, in-production, and pre-shipment checkpoints so defects are caught early. We document findings clearly and support corrective actions with factories.',
      deliverablesTitle: 'What You Receive',
      deliverables: [
        'Inspection plan tailored to product risk level',
        'Photo/video evidence with pass-fail criteria',
        'Defect classification and corrective action requests',
        'Shipment release recommendation based on QC outcome',
      ],
      processTitle: 'How We Deliver This Service',
      processSteps: [
        'Define product standards and acceptance criteria',
        'Schedule inspections with production milestones',
        'Execute checks and issue detailed QC findings',
        'Coordinate rework, re-inspection, and release decisions',
      ],
      benefitsTitle: 'Why This Matters',
      benefits: [
        'Catch issues before final payment and shipment',
        'Lower return rates and brand damage risk',
        'Make objective decisions with documented evidence',
        'Keep suppliers accountable with local oversight',
      ],
      faqs: [
        {
          question: 'Do you inspect every order?',
          answer:
            'Inspection scope is flexible. We recommend checkpoints based on order value, product complexity, and supplier history.',
        },
        {
          question: 'Can you work with my own QC checklist?',
          answer:
            'Yes. We can use your checklist directly or combine it with our framework for stronger coverage.',
        },
        {
          question: 'What happens if inspection fails?',
          answer:
            'We provide a corrective action route, coordinate with the factory, and can re-inspect before shipment release.',
        },
      ],
    },
  },
  {
    id: 'interpretation',
    slug: 'translation-interpretation',
    icon: Languages,
    color: 'violet',
    title: 'Translation & Interpretation',
    description: 'Bridge the language gap with professional bilingual assistance on the ground.',
    subServices: [
      'Factory Visit Interpretation — On-site translators',
      'Trade Fair Accompaniment — Canton Fair, Yiwu Fair',
      'Business Meeting Translation — Live interpretation',
      'Document Translation — Contracts, specs, invoices',
      'Video Call Interpretation — Remote translation',
      'Cultural Business Consulting — Chinese business etiquette',
    ],
    previewPoints: ['Factory visit support', 'Trade fair interpreting', 'Contract/document translation'],
    pageVariant: 'standard',
    detail: {
      heroSubtitle:
        'Communicate clearly in high-stakes business conversations with experienced bilingual support.',
      overviewTitle: 'Speak with Confidence Across Language and Culture',
      overview:
        'We support negotiations, supplier meetings, trade fairs, and documentation with precise interpretation and translation. Beyond language, we help bridge business culture and reduce misunderstandings.',
      deliverablesTitle: 'What You Receive',
      deliverables: [
        'On-site or remote live interpretation support',
        'Bilingual meeting facilitation and recap notes',
        'Document translation for contracts/specifications',
        'Practical cultural guidance for smoother communication',
      ],
      processTitle: 'How We Deliver This Service',
      processSteps: [
        'Context briefing and terminology alignment',
        'Session support during meetings or site visits',
        'Clarification of technical and commercial points',
        'Post-session summary and action follow-up support',
      ],
      benefitsTitle: 'Why Clients Rely on This Service',
      benefits: [
        'Avoid costly misunderstandings in negotiations',
        'Increase trust and clarity with suppliers',
        'Move faster in meetings and trade fair visits',
        'Improve contract and specification accuracy',
      ],
      faqs: [
        {
          question: 'Can you support technical product discussions?',
          answer:
            'Yes. We prepare terminology in advance and support technical discussions in manufacturing and sourcing contexts.',
        },
        {
          question: 'Do you offer remote interpretation?',
          answer:
            'Yes. We provide interpretation for video calls and remote meetings when in-person support is not required.',
        },
        {
          question: 'Can translated documents be used in formal business?',
          answer:
            'Yes. We provide clear and professional translations suitable for business operations and negotiation workflows.',
        },
      ],
    },
  },
  {
    id: 'company',
    slug: 'business-setup-legal',
    icon: Building2,
    color: 'amber',
    title: 'Business Setup & Legal',
    description: 'Company formation, legal services, and office solutions for your China operations.',
    subServices: [
      'Foreign-Owned Company (WFOE) Registration',
      'Business License Application — Permits & licenses',
      'Corporate Bank Account — Chinese & offshore',
      'Work Visa & Residence Permit — Z-visa processing',
      'Registered Business Address — Guangzhou/Shenzhen',
      'Annual Compliance & Accounting — Tax filing',
      'Cross-border Legal Consulting — Non-litigation',
      'Inheritance & Estate Planning — International',
      'Foreign IP Rights Protection — Patents, trademarks',
      'Contract Review & Drafting — Bilingual',
      'Virtual Office Solutions — Professional address',
      'Shared Workspace Rentals — Flexible spaces',
      'Meeting Room Booking — Hourly & daily',
    ],
    previewPoints: ['Company registration', 'Compliance support', 'Contract/legal guidance'],
    pageVariant: 'standard',
    detail: {
      heroSubtitle:
        'Launch and run your China operations with practical legal, compliance, and operational support.',
      overviewTitle: 'Build the Right Legal and Operational Foundation',
      overview:
        'From company setup to annual compliance, we coordinate key legal and business tasks with trusted local partners. The result is faster execution and fewer regulatory surprises.',
      deliverablesTitle: 'What You Receive',
      deliverables: [
        'Setup roadmap based on your business model',
        'Entity registration and license coordination support',
        'Contract drafting/review and legal risk checkpoints',
        'Compliance calendar and operational support guidance',
      ],
      processTitle: 'How We Deliver This Service',
      processSteps: [
        'Business model review and legal pathway selection',
        'Document preparation and filing coordination',
        'Banking/operations setup and compliance planning',
        'Ongoing support for legal and administrative needs',
      ],
      benefitsTitle: 'Why This Service Is Valuable',
      benefits: [
        'Reduce setup delays from avoidable paperwork errors',
        'Get clearer visibility into legal obligations and timelines',
        'Operate with stronger contract and compliance discipline',
        'Access bilingual support for cross-border business decisions',
      ],
      faqs: [
        {
          question: 'Can you help both new companies and existing ones?',
          answer:
            'Yes. We support new registrations as well as compliance/legal improvements for existing entities.',
        },
        {
          question: 'Do you support contract review in Chinese and English?',
          answer:
            'Yes. We assist with bilingual contract drafting and review to reduce ambiguity and risk.',
        },
        {
          question: 'Is this only for large companies?',
          answer:
            'No. We support startups, SMEs, and large organizations with scalable legal and operational guidance.',
        },
      ],
    },
  },
  {
    id: 'experiences',
    slug: 'china-tours-market-visits',
    icon: MapPin,
    color: 'rose',
    title: 'China Tours & Market Visits',
    description: 'Discover the region with curated tours, markets, and local insider access.',
    subServices: [
      'Guangzhou City Tours — Historic sites & food',
      'Shenzhen Tech Tours — Electronics & innovation',
      'Premium Shopping — High-end malls & wholesale',
      'Underground Market Adventures — Exclusive access',
      'Cantonese Food & Culture — Dim sum trails',
      'Factory Town Visits — Dongguan, Foshan',
      'Canton Fair VIP Assistance — Full support',
      'Custom Itinerary Planning — Business + leisure',
    ],
    previewPoints: ['Market visit planning', 'Trade fair support', 'Business + leisure itineraries'],
    pageVariant: 'standard',
    detail: {
      heroSubtitle:
        'Make every day in China productive with guided market visits, supplier trips, and tailored local support.',
      overviewTitle: 'Explore with Purpose, Not Guesswork',
      overview:
        'We design itineraries that blend sourcing goals with practical logistics and local insight. Whether you are attending trade fairs or visiting factory towns, we keep your schedule efficient and valuable.',
      deliverablesTitle: 'What You Receive',
      deliverables: [
        'Custom itinerary aligned to business priorities',
        'Local route/logistics planning and coordination',
        'On-ground support for markets, fairs, and meetings',
        'Post-visit summary with recommended next actions',
      ],
      processTitle: 'How We Deliver This Service',
      processSteps: [
        'Planning call to define goals and locations',
        'Daily itinerary design with travel optimization',
        'On-site bilingual support and schedule management',
        'Follow-up recommendations after the visit',
      ],
      benefitsTitle: 'Why Clients Choose This Experience',
      benefits: [
        'Save time with locally optimized movement',
        'Reach better suppliers and markets faster',
        'Avoid language and navigation friction',
        'Combine productivity with local cultural context',
      ],
      faqs: [
        {
          question: 'Can tours be fully customized?',
          answer:
            'Yes. Every itinerary is tailored to your sourcing interests, travel dates, and business priorities.',
        },
        {
          question: 'Do you support Canton Fair visits?',
          answer:
            'Yes. We provide structured support for Canton Fair attendance, including planning and on-site coordination.',
        },
        {
          question: 'Is this only for tourism purposes?',
          answer:
            'No. Most clients use this service for supplier discovery, market research, and business networking.',
        },
      ],
    },
  },
  {
    id: 'tradeguard',
    slug: 'trade-dispute-resolution',
    icon: Shield,
    color: 'red',
    title: 'Trade Dispute Resolution',
    description: 'Recover funds and hold dishonest suppliers accountable with local enforcement power.',
    subServices: [
      'Corporate Background Deep-Dive',
      'On-Site Factory Verification',
      'Legal Demand Letters',
      'Mediation & Negotiation',
      'Asset & Credit Investigation',
      'Recovery Action Plan',
    ],
    previewPoints: ['Dispute diagnostics', 'Local legal pressure', 'Recovery action planning'],
    pageVariant: 'tradeguard',
  },
  {
    id: 'furniture',
    slug: 'furniture-interior-design',
    icon: Armchair,
    color: 'amber',
    title: 'Furniture & Interior Design',
    description: 'Luxury custom furniture and interior design at direct factory prices.',
    subServices: [
      'Custom Furniture Manufacturing',
      'Interior Design Consultation',
      'Showroom & Factory Visits',
      'Material Sourcing & Selection',
      'Shipping & Logistics',
      'Full Project Management',
    ],
    previewPoints: ['Custom manufacturing', 'Design consultation', 'End-to-end delivery'],
    pageVariant: 'furniture',
  },
];

// Navigation-only categories (the 5 main ones shown in nav dropdowns)
export const navServiceCategories = serviceCategories.slice(0, 5);

export function getServiceBySlug(slug: string): ServiceCategory | undefined {
  return serviceCategories.find((service) => service.slug === slug);
}

export function getServicePath(service: Pick<ServiceCategory, 'slug'>): string {
  return `/services/${service.slug}`;
}
