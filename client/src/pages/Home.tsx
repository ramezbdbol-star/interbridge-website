import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAdmin } from '@/lib/adminContext';
import { useContent } from '@/lib/contentContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  X,
  Save,
  Settings,
  LogOut,
  Loader2,
  Layers,
} from 'lucide-react';

// Layout
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';

// Sections
import { HeroSection } from '@/components/sections/HeroSection';
import { ServicesOverview } from '@/components/sections/ServicesOverview';
import { ProcessSection } from '@/components/sections/ProcessSection';
import { FaqSection } from '@/components/sections/FaqSection';
import { SocialProofSection } from '@/components/sections/SocialProofSection';
import { TradeGuardSection } from '@/components/sections/TradeGuardSection';
import { FurnitureSection } from '@/components/sections/FurnitureSection';
import { ContactSection } from '@/components/sections/ContactSection';

// Admin
import { SectionManager } from '@/components/admin/SectionManager';
import { InlineSectionAdder } from '@/components/admin/InlineSectionAdder';
import { CustomSectionRenderer } from '@/components/admin/CustomSectionRenderer';

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showSectionPanel, setShowSectionPanel] = useState(true);
  const { isAdmin, logout } = useAdmin();
  const {
    isEditMode,
    setEditMode,
    saveAllChanges,
    hasUnsavedChanges,
    getSectionOrder,
    isSectionVisible,
    getCustomSections,
    pendingChanges,
  } = useContent();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await saveAllChanges();
    toast({
      title: result.success ? 'Saved!' : 'Error',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
    });
    setIsSaving(false);
  };

  const handleLogout = async () => {
    await logout();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
  };

  const sectionOrder = getSectionOrder();
  const customSections = getCustomSections();

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
        return <HeroSection key={sectionId} scrollToSection={scrollToSection} />;
      case 'services':
        return <ServicesOverview key={sectionId} />;
      case 'process':
        return <ProcessSection key={sectionId} />;
      case 'faq':
        return <FaqSection key={sectionId} openFaq={openFaq} toggleFaq={toggleFaq} />;
      case 'reviews':
        return <SocialProofSection key={sectionId} />;
      case 'tradeguard':
        return <TradeGuardSection key={sectionId} />;
      case 'furniture':
        return <FurnitureSection key={sectionId} />;
      case 'contact':
        return <ContactSection key={sectionId} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Admin Toolbar */}
      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2" data-testid="admin-toolbar">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 flex flex-col gap-2">
            <Button
              size="sm"
              variant={isEditMode ? 'default' : 'outline'}
              onClick={() => setEditMode(!isEditMode)}
              className="gap-2"
              data-testid="button-toggle-edit"
            >
              {isEditMode ? (
                <>
                  <X className="w-4 h-4" />
                  Exit Edit
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4" />
                  Edit Mode
                </>
              )}
            </Button>

            {isEditMode && hasUnsavedChanges && (
              <Button
                size="sm"
                variant="default"
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2 bg-green-600 hover:bg-green-700"
                data-testid="button-save-floating"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save ({Object.keys(pendingChanges).length})
                  </>
                )}
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setLocation('/admin')}
              className="gap-2"
              data-testid="button-admin-panel"
            >
              <Settings className="w-4 h-4" />
              Panel
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleLogout}
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              data-testid="button-logout-floating"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          {isEditMode && (
            <div className="bg-blue-600 text-white text-xs px-3 py-2 rounded-lg text-center max-w-[180px]">
              <div className="font-medium mb-1">Edit Mode Active</div>
              <div className="text-blue-200 text-[10px]">Click text to edit &bull; Hover for controls</div>
            </div>
          )}
        </div>
      )}

      {/* Section Manager (edit mode) */}
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

      {/* Main Content */}
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
