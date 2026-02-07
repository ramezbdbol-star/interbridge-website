import { useContent } from '@/lib/contentContext';
import { EditableSection, EditableText, EditableButton } from '@/components/EditableComponents';
import { ArrowRight, Globe, Languages, MapPin } from 'lucide-react';

interface HeroSectionProps {
  scrollToSection: (id: string) => void;
}

export function HeroSection({ scrollToSection }: HeroSectionProps) {
  const { isEditMode, isSectionVisible } = useContent();
  const visible = isSectionVisible('hero');

  return (
    <EditableSection id="hero" name="Hero">
      <section
        className={`relative pt-28 pb-16 lg:pt-40 lg:pb-28 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden ${!visible && isEditMode ? 'opacity-40' : ''}`}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center bg-blue-800/50 rounded-full px-4 py-1.5 border border-blue-700 mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
              <EditableText
                id="hero-badge"
                defaultText="Your China Sourcing Partner"
                className="text-sm font-medium tracking-wide text-blue-100"
                element="span"
              />
            </div>

            {/* Headline */}
            <EditableText
              id="hero-headline"
              defaultText="Direct Factory Access. Zero Middlemen."
              element="h1"
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
            />

            {/* Description */}
            <EditableText
              id="hero-description"
              defaultText="Your bilingual partner for sourcing, quality control, translation, legal services, and more. From small-batch orders to full business setup — we connect you directly to China."
              element="p"
              className="text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed mb-10"
            />

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <EditableButton
                id="hero-cta-primary"
                defaultText="Start Your Project"
                defaultLink="#contact"
                className="bg-white text-blue-900 px-8 py-4 rounded-lg font-bold hover:bg-blue-50 transition-colors flex items-center justify-center text-lg"
                icon={<ArrowRight className="ml-2" size={20} />}
              />
              <EditableButton
                id="hero-cta-secondary"
                defaultText="Explore Our Services"
                defaultLink="#services"
                className="border border-blue-400/30 bg-blue-900/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-900/40 transition-colors text-lg"
              />
            </div>

            {/* Stat Bar */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10 pt-8 border-t border-blue-800/50">
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
        </div>
      </section>
    </EditableSection>
  );
}
