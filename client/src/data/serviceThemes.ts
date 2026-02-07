// Pre-computed Tailwind class strings per service theme
// Avoids dynamic class interpolation (which breaks Tailwind JIT)

export interface ServiceTheme {
  bg: string;
  hoverBg: string;
  text: string;
  iconBg: string;
  borderColor: string;
  gradient: string;
  bgLight: string;
  badgeBg: string;
  badgeText: string;
}

export const serviceThemes: Record<string, ServiceTheme> = {
  blue: {
    bg: 'bg-blue-600',
    hoverBg: 'hover:bg-blue-50',
    text: 'text-blue-600',
    iconBg: 'bg-blue-100',
    borderColor: 'border-blue-200',
    gradient: 'from-blue-500 to-blue-700',
    bgLight: 'bg-blue-50',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
  },
  emerald: {
    bg: 'bg-emerald-600',
    hoverBg: 'hover:bg-emerald-50',
    text: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
    borderColor: 'border-emerald-200',
    gradient: 'from-emerald-500 to-emerald-700',
    bgLight: 'bg-emerald-50',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
  },
  violet: {
    bg: 'bg-violet-600',
    hoverBg: 'hover:bg-violet-50',
    text: 'text-violet-600',
    iconBg: 'bg-violet-100',
    borderColor: 'border-violet-200',
    gradient: 'from-violet-500 to-violet-700',
    bgLight: 'bg-violet-50',
    badgeBg: 'bg-violet-100',
    badgeText: 'text-violet-700',
  },
  amber: {
    bg: 'bg-amber-600',
    hoverBg: 'hover:bg-amber-50',
    text: 'text-amber-600',
    iconBg: 'bg-amber-100',
    borderColor: 'border-amber-200',
    gradient: 'from-amber-500 to-amber-700',
    bgLight: 'bg-amber-50',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
  },
  rose: {
    bg: 'bg-rose-600',
    hoverBg: 'hover:bg-rose-50',
    text: 'text-rose-600',
    iconBg: 'bg-rose-100',
    borderColor: 'border-rose-200',
    gradient: 'from-rose-500 to-rose-700',
    bgLight: 'bg-rose-50',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-700',
  },
  red: {
    bg: 'bg-red-600',
    hoverBg: 'hover:bg-red-50',
    text: 'text-red-600',
    iconBg: 'bg-red-100',
    borderColor: 'border-red-200',
    gradient: 'from-red-500 to-red-700',
    bgLight: 'bg-red-50',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-700',
  },
};

export function getTheme(color: string): ServiceTheme {
  return serviceThemes[color] || serviceThemes.blue;
}
