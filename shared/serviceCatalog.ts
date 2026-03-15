export interface ServiceLinkItem {
  id: string;
  title: string;
  description: string;
  path: string;
}

export const serviceCatalog: ServiceLinkItem[] = [
  {
    id: "sourcing",
    title: "Product Sourcing",
    description: "Factory sourcing, supplier screening, pricing support, and production coordination.",
    path: "/services/product-sourcing",
  },
  {
    id: "quality",
    title: "Quality Assurance",
    description: "Factory audits, in-line inspections, and shipment release checks.",
    path: "/services/quality-assurance",
  },
  {
    id: "interpretation",
    title: "Translation & Interpretation",
    description: "On-site and remote bilingual support for meetings, factory visits, and trade fairs.",
    path: "/services/translation-interpretation",
  },
  {
    id: "company",
    title: "Business Setup & Legal",
    description: "Entity setup, contract support, compliance, and operational guidance in China.",
    path: "/services/business-setup-legal",
  },
  {
    id: "tours",
    title: "China Tours & Market Visits",
    description: "Factory tours, sourcing trips, and guided market visits on the ground.",
    path: "/services/china-tours-market-visits",
  },
  {
    id: "dispute",
    title: "Trade Dispute Resolution",
    description: "Commercial dispute support, evidence gathering, and supplier escalation help.",
    path: "/services/trade-dispute-resolution",
  },
  {
    id: "furniture",
    title: "Furniture & Interior Design",
    description: "Furniture sourcing, OEM coordination, and design/manufacturing support.",
    path: "/services/furniture-interior-design",
  },
];
