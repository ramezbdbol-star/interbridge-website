import { useContent } from '@/lib/contentContext';
import { EditableSection } from '@/components/EditableComponents';
import { FurnitureForm } from '@/components/forms/FurnitureForm';
import {
  Armchair,
  Palette,
  Search,
  Gem,
  Truck,
  Ruler,
  HomeIcon,
  CheckCircle2,
} from 'lucide-react';

export function FurnitureSection() {
  const { isEditMode, isSectionVisible } = useContent();
  const visible = isSectionVisible('furniture');

  const services = [
    {
      icon: Armchair,
      title: 'Custom Furniture Manufacturing',
      description:
        'Bespoke pieces built to your exact specifications — sofas, tables, beds, cabinetry — at direct factory prices.',
    },
    {
      icon: Palette,
      title: 'Interior Design Consultation',
      description:
        'Professional design planning for homes, offices, hotels, and commercial spaces with mood boards and 3D renders.',
    },
    {
      icon: Search,
      title: 'Showroom & Factory Visits',
      description:
        'Accompanied visits to furniture showrooms and manufacturing facilities across Guangdong with expert interpretation.',
    },
    {
      icon: Gem,
      title: 'Material Sourcing & Selection',
      description:
        'Access to premium materials — hardwood, marble, leather, fabrics — sourced directly from suppliers at wholesale prices.',
    },
    {
      icon: Truck,
      title: 'Shipping & Logistics',
      description:
        'End-to-end delivery coordination from the factory floor to your doorstep, including customs and freight management.',
    },
    {
      icon: Ruler,
      title: 'Full Project Management',
      description:
        'Complete design-to-delivery management for large-scale furnishing projects — residences, hotels, offices, and developments.',
    },
  ];

  const valuePoints = [
    'Save 50-70% compared to retail prices outside China',
    'Same luxury quality and craftsmanship, direct from the source',
    'On-site quality inspection before every shipment',
    'Fully custom designs with no minimum order for personal projects',
  ];

  return (
    <EditableSection id="furniture" name="Furniture & Design">
      <section
        id="furniture"
        className={`py-20 lg:py-24 bg-gradient-to-b from-slate-900 via-amber-950 to-slate-900 text-white ${!visible && isEditMode ? 'opacity-40' : ''}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 bg-amber-900/50 text-amber-300 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-6">
              <HomeIcon className="w-4 h-4" />
              Furniture & Interior Design
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6">
              Luxury Furniture & Interior Design.
              <br />
              <span className="text-amber-400">Factory Prices.</span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Access China's world-class furniture manufacturing and interior design talent directly. Get the same luxury
              quality found in high-end showrooms worldwide — at a fraction of the cost.
            </p>
          </div>

          {/* Service Cards */}
          <div className="mb-14">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, i) => (
                <div
                  key={i}
                  className="bg-white/5 rounded-xl p-6 border border-slate-700 hover:border-amber-500/50 transition-colors group"
                >
                  <div className="bg-amber-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-600/30 transition-colors">
                    <service.icon className="w-6 h-6 text-amber-400" />
                  </div>
                  <h4 className="font-bold text-white mb-2">{service.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{service.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Value Proposition */}
          <div className="bg-slate-800/50 rounded-2xl p-6 sm:p-8 mb-14 border border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <Gem className="w-6 h-6 text-amber-400" />
              <h3 className="text-2xl font-bold text-amber-400">Why Source Furniture from China?</h3>
            </div>
            <p className="text-slate-300 mb-8">
              China produces over 70% of the world's furniture. The same factories supplying top international brands are
              available to you directly — no retail markup, no middlemen. Whether you're furnishing a single room or an
              entire hotel, we guarantee prices you won't find anywhere else for the same level of quality.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {valuePoints.map((point, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Consultation Form */}
          <div className="bg-gradient-to-r from-amber-900/30 to-slate-900/50 rounded-2xl p-6 sm:p-8 border border-slate-700">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-12">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-4">Request a Free Design Consultation</h3>
                <p className="text-slate-300 mb-6">
                  Tell us about your project. Our team will provide a detailed proposal with design options, pricing, and
                  timelines — completely free, no obligation.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>Free consultation & project estimate</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>Response within 24-48 hours</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>Personalized design mood boards & pricing</span>
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
    </EditableSection>
  );
}
