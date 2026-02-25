import { useState } from 'react';
import { CheckCircle2, ChevronDown, Circle, ArrowRight } from 'lucide-react';
import { EditableText } from '@/components/EditableComponents';
import { getTheme } from '@/data/serviceThemes';
import type { ServiceCategory } from '@/data/serviceData';

interface StandardServiceContentProps {
  service: ServiceCategory;
  contentIdPrefix: string;
}

export function StandardServiceContent({ service, contentIdPrefix }: StandardServiceContentProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const theme = getTheme(service.color);
  const IconComponent = service.icon;
  const detail = service.detail;

  if (!detail) {
    return null;
  }

  return (
    <>
      <section className="pt-28 pb-16 lg:pt-32 lg:pb-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <EditableText
              id={`${contentIdPrefix}-hero-badge`}
              defaultText="Service Detail"
              element="span"
              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${theme.badgeBg} ${theme.badgeText}`}
            />
            <div className="mt-6 flex items-center gap-3">
              <div className={`${theme.iconBg} ${theme.text} w-12 h-12 rounded-xl flex items-center justify-center`}>
                <IconComponent size={24} />
              </div>
              <EditableText
                id={`${contentIdPrefix}-hero-title`}
                defaultText={service.title}
                element="h1"
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold"
              />
            </div>
            <EditableText
              id={`${contentIdPrefix}-hero-subtitle`}
              defaultText={detail.heroSubtitle}
              element="p"
              className="mt-5 text-lg text-blue-100 leading-relaxed"
            />

            <div className="mt-8 grid sm:grid-cols-3 gap-3">
              {service.previewPoints.map((point, index) => (
                <div key={point} className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm">
                  <EditableText
                    id={`${contentIdPrefix}-hero-point-${index}`}
                    defaultText={point}
                    element="span"
                    className="text-slate-100"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10">
          <div>
            <EditableText
              id={`${contentIdPrefix}-overview-title`}
              defaultText={detail.overviewTitle}
              element="h2"
              className="text-3xl font-extrabold text-slate-900"
            />
            <EditableText
              id={`${contentIdPrefix}-overview-text`}
              defaultText={detail.overview}
              element="p"
              className="mt-4 text-slate-600 leading-relaxed"
            />

            <div className="mt-8">
              <EditableText
                id={`${contentIdPrefix}-benefits-title`}
                defaultText={detail.benefitsTitle}
                element="h3"
                className="text-xl font-bold text-slate-900"
              />
              <ul className="mt-4 space-y-3">
                {detail.benefits.map((benefit, index) => (
                  <li key={benefit} className="flex items-start gap-3 text-slate-700">
                    <CheckCircle2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${theme.text}`} />
                    <EditableText
                      id={`${contentIdPrefix}-benefit-${index}`}
                      defaultText={benefit}
                      element="span"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
            <EditableText
              id={`${contentIdPrefix}-deliverables-title`}
              defaultText={detail.deliverablesTitle}
              element="h3"
              className="text-xl font-bold text-slate-900"
            />
            <ul className="mt-5 space-y-3">
              {detail.deliverables.map((item, index) => (
                <li key={item} className="flex items-start gap-3 text-slate-700">
                  <ArrowRight className={`w-4 h-4 mt-1 flex-shrink-0 ${theme.text}`} />
                  <EditableText
                    id={`${contentIdPrefix}-deliverable-${index}`}
                    defaultText={item}
                    element="span"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EditableText
            id={`${contentIdPrefix}-process-title`}
            defaultText={detail.processTitle}
            element="h2"
            className="text-3xl font-extrabold text-slate-900 text-center"
          />
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {detail.processSteps.map((step, index) => (
              <div key={step} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className={`w-10 h-10 rounded-full ${theme.iconBg} ${theme.text} font-bold flex items-center justify-center`}>
                  {(index + 1).toString().padStart(2, '0')}
                </div>
                <EditableText
                  id={`${contentIdPrefix}-process-step-${index}`}
                  defaultText={step}
                  element="p"
                  className="mt-4 text-slate-700 leading-relaxed"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <EditableText
            id={`${contentIdPrefix}-faq-title`}
            defaultText="Frequently Asked Questions"
            element="h2"
            className="text-3xl font-extrabold text-slate-900 text-center"
          />

          <div className="mt-10 space-y-4">
            {detail.faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div key={faq.question} className="rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-6 py-4 bg-white text-left flex items-center justify-between"
                    data-testid={`service-faq-toggle-${service.id}-${index}`}
                  >
                    <EditableText
                      id={`${contentIdPrefix}-faq-q-${index}`}
                      defaultText={faq.question}
                      element="span"
                      className="font-bold text-slate-900"
                    />
                    <ChevronDown
                      className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 bg-slate-50">
                      <div className="flex items-start gap-3 pt-1">
                        <Circle className={`w-3 h-3 mt-1.5 ${theme.text} fill-current`} />
                        <EditableText
                          id={`${contentIdPrefix}-faq-a-${index}`}
                          defaultText={faq.answer}
                          element="p"
                          className="text-slate-700 leading-relaxed"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
