import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Layers } from 'lucide-react';
import { useContent } from '@/lib/contentContext';

import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';

import { HeroSection } from '@/components/sections/HeroSection';
import { ServicesOverview } from '@/components/sections/ServicesOverview';
import { ProcessSection } from '@/components/sections/ProcessSection';
import { FaqSection } from '@/components/sections/FaqSection';
import { SocialProofSection } from '@/components/sections/SocialProofSection';
import { BookNowSection } from '@/components/sections/BookNowSection';
import { ContactSection } from '@/components/sections/ContactSection';

import { AdminFloatingToolbar } from '@/components/admin/AdminFloatingToolbar';
import { SectionManager } from '@/components/admin/SectionManager';
import { InlineSectionAdder } from '@/components/admin/InlineSectionAdder';
import { CustomSectionRenderer } from '@/components/admin/CustomSectionRenderer';

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showSectionPanel, setShowSectionPanel] = useState(true);
  const { isEditMode, getSectionOrder, isSectionVisible, getCustomSections } = useContent();
  const [location] = useLocation();

  const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index);

  const scrollToSection = (id: string, behavior: ScrollBehavior = 'smooth') => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior });
      const nextHash = `#${id}`;
      if (window.location.hash !== nextHash) {
        window.history.replaceState(null, '', `/#${id}`);
      }
    }
  };

  const sectionOrder = getSectionOrder();
  const sectionOrderKey = sectionOrder.join('|');
  const customSections = getCustomSections();

  useEffect(() => {
    const scrollFromHash = () => {
      if (window.location.pathname !== '/' || !window.location.hash) {
        return;
      }

      const targetId = decodeURIComponent(window.location.hash.slice(1));
      if (!targetId) {
        return;
      }

      let attempts = 0;
      const maxAttempts = 12;

      const attemptScroll = () => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          return;
        }

        if (attempts < maxAttempts) {
          attempts += 1;
          window.setTimeout(attemptScroll, 80);
        }
      };

      window.setTimeout(attemptScroll, 40);
    };

    scrollFromHash();
    window.addEventListener('hashchange', scrollFromHash);

    return () => {
      window.removeEventListener('hashchange', scrollFromHash);
    };
  }, [location, sectionOrderKey]);

  const renderSection = (sectionId: string) => {
    if (!isSectionVisible(sectionId) && !isEditMode) return null;

    if (sectionId.startsWith('custom-')) {
      const customSection = customSections.find((s) => s.id === sectionId);
      if (customSection) {
        return <CustomSectionRenderer key={sectionId} section={customSection} />;
      }
      return null;
    }

    switch (sectionId) {
      case 'hero':
        return <HeroSection key={sectionId} />;
      case 'services':
        return <ServicesOverview key={sectionId} />;
      case 'process':
        return <ProcessSection key={sectionId} />;
      case 'faq':
        return <FaqSection key={sectionId} openFaq={openFaq} toggleFaq={toggleFaq} />;
      case 'reviews':
        return <SocialProofSection key={sectionId} />;
      case 'book-now':
        return <BookNowSection key={sectionId} />;
      case 'contact':
        return <ContactSection key={sectionId} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <AdminFloatingToolbar />

      {isEditMode && showSectionPanel && <SectionManager onClose={() => setShowSectionPanel(false)} />}

      {isEditMode && !showSectionPanel && (
        <button
          onClick={() => setShowSectionPanel(true)}
          className="fixed left-6 top-1/2 -translate-y-1/2 z-50 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 hover:bg-slate-50 transition-colors"
          title="Show section manager"
          data-testid="button-show-sections"
        >
          <Layers className="w-5 h-5 text-blue-600" />
        </button>
      )}

      <Navigation scrollToSection={scrollToSection} />

      <main>
        {sectionOrder.map((sectionId, index) => (
          <div key={sectionId}>
            {isEditMode && <InlineSectionAdder position={index} />}
            {renderSection(sectionId)}
          </div>
        ))}
        {isEditMode && <InlineSectionAdder position={sectionOrder.length} />}
      </main>

      <Footer />
    </div>
  );
}
