import {
  Armchair,
  CheckCircle2,
  Gem,
  HomeIcon,
  Palette,
  Ruler,
  Search,
  Truck,
} from 'lucide-react';
import { EditableText } from '@/components/EditableComponents';
import { FurnitureForm } from '@/components/forms/FurnitureForm';

interface FurnitureServiceContentProps {
  contentIdPrefix: string;
}

export function FurnitureServiceContent({ contentIdPrefix }: FurnitureServiceContentProps) {
  const services = [
    {
      icon: Armchair,
      title: 'Custom Furniture Manufacturing',
      description: 'Bespoke pieces built to your specifications at direct factory pricing.',
    },
    {
      icon: Palette,
      title: 'Interior Design Consultation',
      description: 'Professional design direction for homes, offices, hotels, and commercial spaces.',
    },
    {
      icon: Search,
      title: 'Showroom & Factory Visits',
      description: 'Guided visits with bilingual support across key furniture hubs in Guangdong.',
    },
    {
      icon: Gem,
      title: 'Material Sourcing & Selection',
      description: 'Access premium materials directly from suppliers without retail markups.',
    },
    {
      icon: Truck,
      title: 'Shipping & Logistics',
      description: 'End-to-end coordination from factory release to destination delivery.',
    },
    {
      icon: Ruler,
      title: 'Full Project Management',
      description: 'Design-to-delivery management for full-space and multi-room projects.',
    },
  ];

  const valuePoints = [
    'Save 50-70% versus typical overseas retail channels',
    'Access luxury-level craftsmanship directly from source factories',
    'Use pre-shipment quality checks before dispatch',
    'Get custom project execution without typical showroom overhead',
  ];

  return (
    <section className="pt-28 pb-20 lg:pt-32 lg:pb-24 bg-gradient-to-b from-slate-900 via-amber-950 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 bg-amber-900/50 text-amber-300 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-6">
            <HomeIcon className="w-4 h-4" />
            <EditableText
              id={`${contentIdPrefix}-badge`}
              defaultText="Furniture & Interior Design"
              element="span"
            />
          </span>
          <EditableText
            id={`${contentIdPrefix}-title`}
            defaultText="Luxury Furniture & Interior Design at Factory Prices"
            element="h1"
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6"
          />
          <EditableText
            id={`${contentIdPrefix}-subtitle`}
            defaultText="Access world-class furniture manufacturing and design talent in China with end-to-end bilingual support."
            element="p"
            className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
          />
        </div>

        <div className="mb-14">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div
                key={service.title}
                className="bg-white/5 rounded-xl p-6 border border-slate-700 hover:border-amber-500/50 transition-colors group"
              >
                <div className="bg-amber-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-600/30 transition-colors">
                  <service.icon className="w-6 h-6 text-amber-400" />
                </div>
                <EditableText
                  id={`${contentIdPrefix}-service-title-${index}`}
                  defaultText={service.title}
                  element="h3"
                  className="font-bold text-white mb-2"
                />
                <EditableText
                  id={`${contentIdPrefix}-service-description-${index}`}
                  defaultText={service.description}
                  element="p"
                  className="text-slate-400 text-sm leading-relaxed"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-6 sm:p-8 mb-14 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <Gem className="w-6 h-6 text-amber-400" />
            <EditableText
              id={`${contentIdPrefix}-value-title`}
              defaultText="Why Source Furniture from China?"
              element="h2"
              className="text-2xl font-bold text-amber-400"
            />
          </div>
          <EditableText
            id={`${contentIdPrefix}-value-description`}
            defaultText="The same manufacturers serving premium global brands are available directly when your sourcing is structured correctly."
            element="p"
            className="text-slate-300 mb-8"
          />
          <div className="grid sm:grid-cols-2 gap-4">
            {valuePoints.map((point, index) => (
              <div key={point} className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <EditableText
                  id={`${contentIdPrefix}-value-point-${index}`}
                  defaultText={point}
                  element="span"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-900/30 to-slate-900/50 rounded-2xl p-6 sm:p-8 border border-slate-700">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12">
            <div>
              <EditableText
                id={`${contentIdPrefix}-form-title`}
                defaultText="Request a Free Design Consultation"
                element="h2"
                className="text-2xl sm:text-3xl font-bold mb-4"
              />
              <EditableText
                id={`${contentIdPrefix}-form-description`}
                defaultText="Share your project goals. We will return with design direction, sourcing options, and estimated timelines."
                element="p"
                className="text-slate-300 mb-6"
              />
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Free consultation and estimate</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Response within 24-48 hours</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Personalized sourcing and mood board direction</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>No commitment required</span>
                </div>
              </div>
            </div>
            <div>
              <FurnitureForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
