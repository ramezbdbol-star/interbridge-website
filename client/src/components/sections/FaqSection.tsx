import { useContent } from '@/lib/contentContext';
import { EditableSection, EditableText, EditableContainer } from '@/components/EditableComponents';
import { ChevronDown } from 'lucide-react';

interface FaqSectionProps {
  openFaq: number | null;
  toggleFaq: (i: number) => void;
}

export function FaqSection({ openFaq, toggleFaq }: FaqSectionProps) {
  const { isEditMode, isSectionVisible } = useContent();
  const visible = isSectionVisible('faq');

  const faqs = [{ id: 'faq-1' }, { id: 'faq-2' }, { id: 'faq-3' }, { id: 'faq-4' }, { id: 'faq-5' }];

  const defaultFaqs = [
    {
      q: 'What are your service fees?',
      a: 'Our fees vary based on the scope of work. Sourcing typically starts at 5-8% of order value, with fixed fees for interpretation and QC services. Contact us for a custom quote.',
    },
    {
      q: 'Do you handle shipping and customs?',
      a: 'We coordinate with trusted freight forwarders and can manage the logistics process. We also provide guidance on customs documentation.',
    },
    {
      q: 'What if I need a very small order?',
      a: 'We work with factories that accept lower MOQs. While pricing per unit may be higher, we can still find quality suppliers for orders as low as 50 units.',
    },
    {
      q: 'How do I know the factory is reliable?',
      a: 'We conduct thorough background checks, including business licenses, production capacity, and past export history. We also arrange factory visits when possible.',
    },
    {
      q: 'Can you help with product development?',
      a: 'Yes! We support OEM/ODM projects from concept to production, including design refinement, sampling, and manufacturing.',
    },
  ];

  return (
    <EditableSection id="faq" name="FAQ">
      <section id="faq" className={`py-20 lg:py-24 bg-slate-50 ${!visible && isEditMode ? 'opacity-40' : ''}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <EditableText
              id="faq-badge"
              defaultText="Questions & Answers"
              className="text-blue-700 font-bold uppercase tracking-widest text-sm"
              element="span"
            />
            <EditableText
              id="faq-title"
              defaultText="Common Questions"
              element="h2"
              className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4"
            />
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <EditableContainer key={faq.id} id={faq.id} label={`FAQ ${i + 1}`}>
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between"
                    data-testid={`faq-toggle-${i}`}
                  >
                    <EditableText
                      id={`${faq.id}-q`}
                      defaultText={defaultFaqs[i].q}
                      element="span"
                      className="font-bold text-slate-900"
                    />
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ml-4 ${openFaq === i ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5">
                      <EditableText
                        id={`${faq.id}-a`}
                        defaultText={defaultFaqs[i].a}
                        element="p"
                        className="text-slate-600 leading-relaxed"
                      />
                    </div>
                  )}
                </div>
              </EditableContainer>
            ))}
          </div>
        </div>
      </section>
    </EditableSection>
  );
}
