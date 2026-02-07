import { useContent } from '@/lib/contentContext';
import { EditableSection, EditableText, EditableContainer } from '@/components/EditableComponents';
import { FileText, Search, Users, ShieldCheck, Ship } from 'lucide-react';

export function ProcessSection() {
  const { isEditMode, isSectionVisible } = useContent();
  const visible = isSectionVisible('process');

  const steps = [
    { id: 'step-1', icon: <FileText size={24} />, num: '01' },
    { id: 'step-2', icon: <Search size={24} />, num: '02' },
    { id: 'step-3', icon: <Users size={24} />, num: '03' },
    { id: 'step-4', icon: <ShieldCheck size={24} />, num: '04' },
    { id: 'step-5', icon: <Ship size={24} />, num: '05' },
  ];

  const defaultSteps = [
    { title: 'Share Your Requirements', desc: 'Tell us about your product, target price, and quantity.' },
    { title: 'Factory Matching', desc: 'We screen and shortlist factories that fit your criteria.' },
    { title: 'Negotiation & Samples', desc: 'We negotiate terms and arrange sample production.' },
    { title: 'Quality Inspection', desc: 'Pre-shipment checks ensure your order meets standards.' },
    { title: 'Logistics & Delivery', desc: 'We coordinate shipping to get your goods delivered.' },
  ];

  return (
    <EditableSection id="process" name="Process">
      <section id="process" className={`py-20 lg:py-24 bg-white ${!visible && isEditMode ? 'opacity-40' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <EditableText
              id="process-badge"
              defaultText="How It Works"
              className="text-blue-700 font-bold uppercase tracking-widest text-sm"
              element="span"
            />
            <EditableText
              id="process-title"
              defaultText="How It Works"
              element="h2"
              className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4"
            />
          </div>

          <div className="relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 -translate-y-1/2"></div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8">
              {steps.map((step, i) => (
                <EditableContainer key={step.id} id={step.id} label={`Step ${i + 1}`}>
                  <div className="relative bg-white rounded-xl p-6 text-center lg:pt-16">
                    <div className="lg:absolute lg:top-0 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 bg-blue-900 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg mx-auto mb-4 lg:mb-0">
                      {step.num}
                    </div>
                    <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 mx-auto mb-4">
                      {step.icon}
                    </div>
                    <EditableText
                      id={`${step.id}-title`}
                      defaultText={defaultSteps[i].title}
                      element="h3"
                      className="font-bold text-slate-900 mb-2"
                    />
                    <EditableText
                      id={`${step.id}-desc`}
                      defaultText={defaultSteps[i].desc}
                      element="p"
                      className="text-slate-600 text-sm"
                    />
                  </div>
                </EditableContainer>
              ))}
            </div>
          </div>
        </div>
      </section>
    </EditableSection>
  );
}
