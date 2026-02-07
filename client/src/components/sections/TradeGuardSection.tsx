import { useContent } from '@/lib/contentContext';
import { EditableSection } from '@/components/EditableComponents';
import { DisputeCaseForm } from '@/components/forms/DisputeCaseForm';
import {
  Shield,
  AlertTriangle,
  Package,
  Building2,
  DollarSign,
  SearchCheck,
  MapPin,
  Scale,
  Handshake,
  FileSearch,
  Target,
  CheckCircle2,
} from 'lucide-react';

export function TradeGuardSection() {
  const { isEditMode, isSectionVisible } = useContent();
  const visible = isSectionVisible('tradeguard');

  const scenarios = [
    {
      icon: Package,
      title: 'The "Golden Sample" Bait & Switch',
      description:
        'You received a perfect sample, but the delivered goods were trash — wrong materials, poor quality, or completely broken items. Now the factory blames shipping or won\'t respond.',
    },
    {
      icon: Building2,
      title: 'The "Ghost" Manufacturer',
      description:
        'You paid a deposit to a professional-looking supplier. Suddenly, their email bounces, phone disconnects, and you realize the "factory" was a shell company that vanished with your money.',
    },
    {
      icon: DollarSign,
      title: 'The "Ransom" Price Hike',
      description:
        'Production is done, but the factory demands an extra 20% before releasing your goods, citing "rising costs" not in the contract. Your shipment is being held hostage.',
    },
  ];

  const services = [
    {
      icon: SearchCheck,
      title: 'Corporate Background Deep-Dive',
      description:
        'We verify business licenses, check litigation records, and confirm if the "factory" is a real manufacturer or just a middleman.',
    },
    {
      icon: MapPin,
      title: 'On-Site Factory Verification',
      description:
        "Our team visits the physical location. If they're ghosting you digitally, we show up at their gate — physical presence forces responses.",
    },
    {
      icon: Scale,
      title: 'Legal Demand Letters',
      description:
        'Through our partner Law Firm, we issue formal legal notices in Chinese. You become a legal threat, not just another foreign buyer.',
    },
    {
      icon: Handshake,
      title: 'Mediation & Negotiation',
      description:
        'We bridge the cultural and language gap to negotiate settlements, refunds, or corrective manufacturing without expensive court battles.',
    },
    {
      icon: FileSearch,
      title: 'Asset & Credit Investigation',
      description:
        "Before you sue, we check if they have assets to seize — ensuring you don't throw good money after bad.",
    },
    {
      icon: Target,
      title: 'Recovery Action Plan',
      description:
        'We create a strategic plan tailored to your situation, combining legal, on-ground, and negotiation tactics for maximum recovery.',
    },
  ];

  return (
    <EditableSection id="tradeguard" name="Trade Guard">
      <section
        id="tradeguard"
        className={`py-20 lg:py-24 bg-gradient-to-b from-slate-900 via-red-950 to-slate-900 text-white ${!visible && isEditMode ? 'opacity-40' : ''}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 bg-red-900/50 text-red-300 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-6">
              <Shield className="w-4 h-4" />
              Trade Recovery & Legal Support
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6">
              Deal Gone Wrong?
              <br />
              <span className="text-red-400">Don't Write It Off. Fight Back.</span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              We combine local enforcement power with legal expertise to resolve disputes, recover funds, and hold
              dishonest suppliers accountable.
            </p>
          </div>

          {/* Problem Scenarios */}
          <div className="bg-slate-800/50 rounded-2xl p-6 sm:p-8 mb-14 border border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <h3 className="text-2xl font-bold text-amber-400">Is This You?</h3>
            </div>
            <p className="text-slate-300 mb-8">
              Sourcing from China offers incredible opportunities, but it comes with risks. If you're facing a nightmare
              scenario — where communication has stopped, quality is unacceptable, or your deposit has vanished — you are
              not alone, and you are not helpless.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {scenarios.map((scenario, i) => (
                <div
                  key={i}
                  className="bg-slate-900/50 rounded-xl p-6 border border-slate-700 hover:border-red-500/50 transition-colors"
                >
                  <scenario.icon className="w-10 h-10 text-red-400 mb-4" />
                  <h4 className="font-bold text-white mb-2">{scenario.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{scenario.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recovery Toolkit */}
          <div className="mb-14">
            <div className="text-center mb-10">
              <h3 className="text-3xl font-bold mb-4">Our Recovery & Protection Toolkit</h3>
              <p className="text-slate-300 max-w-2xl mx-auto">
                Most overseas buyers think their money is gone forever because they don't have a local presence.{' '}
                <span className="text-white font-semibold">We do.</span>
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, i) => (
                <div
                  key={i}
                  className="bg-white/5 rounded-xl p-6 border border-slate-700 hover:border-blue-500/50 transition-colors group"
                >
                  <div className="bg-blue-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600/30 transition-colors">
                    <service.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h4 className="font-bold text-white mb-2">{service.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{service.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Case Assessment Form */}
          <div className="bg-gradient-to-r from-red-900/30 to-blue-900/30 rounded-2xl p-6 sm:p-8 border border-slate-700">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-12">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-4">Get a Free Case Assessment</h3>
                <p className="text-slate-300 mb-6">
                  Tell us about your situation. Our team will review your case and provide an honest assessment of your
                  options — no obligation, no pressure.
                </p>
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
                    <span>Honest assessment of recovery options</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>All information kept strictly confidential</span>
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
    </EditableSection>
  );
}
