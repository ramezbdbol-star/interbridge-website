import { useLocation } from 'wouter';
import { ArrowRight, Globe, Languages, MapPin } from 'lucide-react';
import { EditableSection, EditableText, EditableButton } from '@/components/EditableComponents';
import { serviceCategories, getServicePath } from '@/data/serviceData';
import { getTheme } from '@/data/serviceThemes';
import { useContent } from '@/lib/contentContext';

export function HeroSection() {
  const { isEditMode, isSectionVisible } = useContent();
  const [, setLocation] = useLocation();
  const visible = isSectionVisible('hero');

  return (
    <EditableSection id="hero" name="Hero">
      <section
        className={`relative pt-28 pb-16 lg:pt-40 lg:pb-24 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden ${!visible && isEditMode ? 'opacity-40' : ''}`}
      >
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center bg-blue-800/50 rounded-full px-4 py-1.5 border border-blue-700 mb-8">
                <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                <EditableText
                  id="hero-badge"
                  defaultText="Your China Sourcing Partner"
                  className="text-sm font-medium tracking-wide text-blue-100"
                  element="span"
                />
              </div>

              <EditableText
                id="hero-headline"
                defaultText="Direct Factory Access. Zero Middlemen."
                element="h1"
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
              />

              <EditableText
                id="hero-description"
                defaultText="Your bilingual partner for sourcing, quality control, translation, legal services, and more. From small-batch orders to full business setup — we connect you directly to China."
                element="p"
                className="text-lg text-blue-100 max-w-xl leading-relaxed mb-10 mx-auto lg:mx-0"
              />

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                <EditableButton
                  id="hero-cta-primary"
                  defaultText="Start Your Project"
                  defaultLink="#contact"
                  className="bg-white text-blue-900 px-8 py-4 rounded-lg font-bold hover:bg-blue-50 transition-colors flex items-center justify-center"
                  icon={<ArrowRight className="ml-2" size={20} />}
                />
                <EditableButton
                  id="hero-cta-secondary"
                  defaultText="Explore Our Services"
                  defaultLink="#services"
                  className="border border-blue-400/30 bg-blue-900/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-900/40 transition-colors"
                />
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-6 sm:gap-8 pt-8 border-t border-blue-800/50">
                <div className="flex items-center gap-2 text-blue-200">
                  <Globe size={18} className="text-blue-400" />
                  <span className="text-sm font-medium">7 Service Categories</span>
                </div>
                <div className="flex items-center gap-2 text-blue-200">
                  <Languages size={18} className="text-blue-400" />
                  <span className="text-sm font-medium">100% Bilingual</span>
                </div>
                <div className="flex items-center gap-2 text-blue-200">
                  <MapPin size={18} className="text-blue-400" />
                  <span className="text-sm font-medium">Based in Guangzhou</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-2xl blur opacity-20"></div>
              <div className="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                <div className="px-6 pt-5 pb-3">
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Our Services</span>
                </div>

                <div className="px-4 pb-4 space-y-0.5">
                  {serviceCategories.map((category) => {
                    const theme = getTheme(category.color);
                    const IconComponent = category.icon;

                    return (
                      <button
                        key={category.id}
                        onClick={() => setLocation(getServicePath(category))}
                        className="flex items-center gap-3.5 w-full px-3 py-3 rounded-xl hover:bg-white/5 transition-all group text-left"
                        data-testid={`hero-service-${category.id}`}
                      >
                        <div className={`${theme.iconBg} w-10 h-10 rounded-lg flex items-center justify-center ${theme.text} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <IconComponent size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-white leading-tight">{category.title}</h3>
                          <p className="text-slate-400 text-xs leading-snug mt-0.5 line-clamp-1">{category.description}</p>
                        </div>
                        <ArrowRight size={14} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 opacity-0 group-hover:opacity-100" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:hidden -mx-4 px-4">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {serviceCategories.map((category) => {
                  const theme = getTheme(category.color);
                  const IconComponent = category.icon;

                  return (
                    <button
                      key={category.id}
                      onClick={() => setLocation(getServicePath(category))}
                      className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 flex-shrink-0 hover:bg-white/15 transition-colors"
                    >
                      <div className={`${theme.iconBg} w-8 h-8 rounded-lg flex items-center justify-center ${theme.text} flex-shrink-0`}>
                        <IconComponent size={16} />
                      </div>
                      <span className="text-white text-sm font-medium whitespace-nowrap">{category.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </EditableSection>
  );
}
