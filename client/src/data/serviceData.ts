import {
  Search,
  ShieldCheck,
  Languages,
  Building2,
  MapPin,
  Shield,
  Armchair,
} from 'lucide-react';

export interface ServiceCategory {
  id: string;
  icon: typeof Search;
  color: string;
  title: string;
  description: string;
  subServices: string[];
}

// Single source of truth for all service categories
// Used by Navigation, ServicesOverview, and Hero
export const serviceCategories: ServiceCategory[] = [
  {
    id: 'sourcing',
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
  },
  {
    id: 'quality',
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
  },
  {
    id: 'interpretation',
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
  },
  {
    id: 'company',
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
  },
  {
    id: 'experiences',
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
  },
  {
    id: 'tradeguard',
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
  },
  {
    id: 'furniture',
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
  },
];

// Navigation-only categories (the 5 main ones shown in nav dropdowns)
export const navServiceCategories = serviceCategories.slice(0, 5);
