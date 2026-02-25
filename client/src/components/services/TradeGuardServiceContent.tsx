import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  DollarSign,
  FileSearch,
  Handshake,
  MapPin,
  Package,
  Scale,
  SearchCheck,
  Shield,
  Target,
} from 'lucide-react';
import { EditableText } from '@/components/EditableComponents';
import { DisputeCaseForm } from '@/components/forms/DisputeCaseForm';

interface TradeGuardServiceContentProps {
  contentIdPrefix: string;
}

export function TradeGuardServiceContent({ contentIdPrefix }: TradeGuardServiceContentProps) {
  const scenarios = [
    {
      icon: Package,
      title: 'The "Golden Sample" Bait & Switch',
      description:
        'You received a perfect sample, but the delivered goods were poor quality, wrong materials, or damaged items.',
    },
    {
      icon: Building2,
      title: 'The "Ghost" Manufacturer',
      description:
        'You paid a deposit to a seemingly legitimate supplier, then communication stopped and the company vanished.',
    },
    {
      icon: DollarSign,
      title: 'The "Ransom" Price Hike',
      description:
        'Production is complete, but the supplier demands unexpected extra payment before releasing your shipment.',
    },
  ];

  const services = [
    {
      icon: SearchCheck,
      title: 'Corporate Background Deep-Dive',
      description: 'License verification, litigation checks, and structure validation before escalation.',
    },
    {
      icon: MapPin,
      title: 'On-Site Factory Verification',
      description: 'Local physical verification to force response and gather actionable evidence.',
    },
    {
      icon: Scale,
      title: 'Legal Demand Letters',
      description: 'Formal legal notices in Chinese through partner legal channels.',
    },
    {
      icon: Handshake,
      title: 'Mediation & Negotiation',
      description: 'Bilingual negotiation support for recoveries, settlements, and corrective production.',
    },
    {
      icon: FileSearch,
      title: 'Asset & Credit Investigation',
      description: 'Pre-litigation due diligence so action plans are financially realistic.',
    },
    {
      icon: Target,
      title: 'Recovery Action Plan',
      description: 'Prioritized legal and operational next steps tailored to your specific dispute case.',
    },
  ];

  return (
    <section className="pt-28 pb-20 lg:pt-32 lg:pb-24 bg-gradient-to-b from-slate-900 via-red-950 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 bg-red-900/50 text-red-300 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-6">
            <Shield className="w-4 h-4" />
            <EditableText
              id={`${contentIdPrefix}-badge`}
              defaultText="Trade Recovery & Legal Support"
              element="span"
            />
          </span>
          <EditableText
            id={`${contentIdPrefix}-title`}
            defaultText="Deal Gone Wrong? Don't Write It Off. Fight Back."
            element="h1"
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6"
          />
          <EditableText
            id={`${contentIdPrefix}-subtitle`}
            defaultText="We combine local enforcement power with legal expertise to resolve disputes, recover funds, and hold dishonest suppliers accountable."
            element="p"
            className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
          />
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-6 sm:p-8 mb-14 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <EditableText
              id={`${contentIdPrefix}-scenarios-title`}
              defaultText="Is This Your Situation?"
              element="h2"
              className="text-2xl font-bold text-amber-400"
            />
          </div>
          <EditableText
            id={`${contentIdPrefix}-scenarios-intro`}
            defaultText="If communication has stopped, quality collapsed, or your deposit is trapped, we help you move from uncertainty to actionable recovery steps."
            element="p"
            className="text-slate-300 mb-8"
          />
          <div className="grid md:grid-cols-3 gap-6">
            {scenarios.map((scenario, index) => (
              <div
                key={scenario.title}
                className="bg-slate-900/50 rounded-xl p-6 border border-slate-700 hover:border-red-500/50 transition-colors"
              >
                <scenario.icon className="w-10 h-10 text-red-400 mb-4" />
                <EditableText
                  id={`${contentIdPrefix}-scenario-title-${index}`}
                  defaultText={scenario.title}
                  element="h3"
                  className="font-bold text-white mb-2"
                />
                <EditableText
                  id={`${contentIdPrefix}-scenario-description-${index}`}
                  defaultText={scenario.description}
                  element="p"
                  className="text-slate-400 text-sm leading-relaxed"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mb-14">
          <div className="text-center mb-10">
            <EditableText
              id={`${contentIdPrefix}-toolkit-title`}
              defaultText="Our Recovery Toolkit"
              element="h2"
              className="text-3xl font-bold mb-4"
            />
            <EditableText
              id={`${contentIdPrefix}-toolkit-subtitle`}
              defaultText="Most overseas buyers lose leverage because they lack local presence. We provide that presence."
              element="p"
              className="text-slate-300 max-w-2xl mx-auto"
            />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div
                key={service.title}
                className="bg-white/5 rounded-xl p-6 border border-slate-700 hover:border-blue-500/50 transition-colors group"
              >
                <div className="bg-blue-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600/30 transition-colors">
                  <service.icon className="w-6 h-6 text-blue-400" />
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

        <div className="bg-gradient-to-r from-red-900/30 to-blue-900/30 rounded-2xl p-6 sm:p-8 border border-slate-700">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12">
            <div>
              <EditableText
                id={`${contentIdPrefix}-form-title`}
                defaultText="Get a Free Case Assessment"
                element="h2"
                className="text-2xl sm:text-3xl font-bold mb-4"
              />
              <EditableText
                id={`${contentIdPrefix}-form-description`}
                defaultText="Tell us what happened. We will review your case and provide an honest view of your recovery options."
                element="p"
                className="text-slate-300 mb-6"
              />
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Free initial consultation</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Response within 24-48 hours</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Practical, realistic recovery pathway</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Strict confidentiality</span>
                </div>
              </div>
            </div>
            <div>
              <DisputeCaseForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
