import { Link } from 'wouter';
import { ArrowRight, CalendarDays, MessageCircle, Smartphone } from 'lucide-react';
import { EditableText } from '@/components/EditableComponents';
import { getTheme } from '@/data/serviceThemes';

interface ServiceDualCtaProps {
  serviceTitle: string;
  serviceColor: string;
  contentIdPrefix: string;
}

export function ServiceDualCta({ serviceTitle, serviceColor, contentIdPrefix }: ServiceDualCtaProps) {
  const theme = getTheme(serviceColor);

  return (
    <section className="py-16 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 sm:p-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <EditableText
                id={`${contentIdPrefix}-cta-badge`}
                defaultText="Next Step"
                element="span"
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${theme.badgeBg} ${theme.badgeText}`}
              />
              <EditableText
                id={`${contentIdPrefix}-cta-title`}
                defaultText={`Ready to move forward with ${serviceTitle}?`}
                element="h3"
                className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900"
              />
              <EditableText
                id={`${contentIdPrefix}-cta-description`}
                defaultText="Book a consultation for formal planning, or message us on WhatsApp/WeChat for quick questions and clarifications."
                element="p"
                className="mt-3 text-slate-600 leading-relaxed"
              />
            </div>

            <div className="space-y-3">
              <Link
                href="/#book-now"
                className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-bold text-white transition-colors ${theme.bg} hover:opacity-90`}
                data-testid="service-cta-book-now"
              >
                <CalendarDays className="w-5 h-5" />
                Book Now
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="https://wa.me/8615325467680"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
                data-testid="service-cta-whatsapp"
              >
                <MessageCircle className="w-5 h-5 text-green-600" />
                WhatsApp Support
              </a>

              <div className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-slate-700">
                <Smartphone className="w-5 h-5 text-[#07C160]" />
                WeChat ID: <span className="font-bold">Voguishgirl</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
