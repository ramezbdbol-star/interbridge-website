import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAdmin } from '@/lib/adminContext';
import { useContent } from '@/lib/contentContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Globe, 
  Factory, 
  Search, 
  Languages, 
  ArrowRight, 
  Mail, 
  Phone, 
  MapPin,
  Menu,
  X,
  ShieldCheck,
  TrendingUp,
  Package,
  Star,
  Quote,
  Ship,
  FileText,
  Users,
  HelpCircle,
  LayoutList,
  ChevronDown,
  ZoomIn,
  Save,
  Settings,
  LogOut,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditableTextProps {
  id: string;
  defaultText: string;
  className?: string;
  element?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  multiline?: boolean;
}

function EditableText({ id, defaultText, className = '', element = 'span', multiline = false }: EditableTextProps) {
  const { isEditMode, getContent, updateContent } = useContent();
  const text = getContent(id, defaultText);
  
  const Element = element;

  if (!isEditMode) {
    if (element === 'h1') {
      return <h1 className={className} dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br/>') }} />;
    }
    if (element === 'h2') {
      return <h2 className={className} dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br/>') }} />;
    }
    if (element === 'h3') {
      return <h3 className={className} dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br/>') }} />;
    }
    if (element === 'h4') {
      return <h4 className={className} dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br/>') }} />;
    }
    if (element === 'p') {
      return <p className={className} dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br/>') }} />;
    }
    return <span className={className} dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br/>') }} />;
  }

  return (
    <Element
      contentEditable
      suppressContentEditableWarning
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        const newText = e.currentTarget.innerText || '';
        if (newText !== text) {
          updateContent(id, newText);
        }
      }}
      className={`${className} outline-none ring-2 ring-blue-400 ring-offset-2 bg-blue-50/50 rounded cursor-text`}
      data-testid={`editable-${id}`}
    >
      {text}
    </Element>
  );
}

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { isAdmin, logout } = useAdmin();
  const { isEditMode, setEditMode, saveAllChanges, hasUnsavedChanges } = useContent();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await saveAllChanges();
    toast({
      title: result.success ? "Saved!" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive"
    });
    setIsSaving(false);
  };

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Admin Floating Toolbar */}
      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2" data-testid="admin-toolbar">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 flex flex-col gap-2">
            <Button
              size="sm"
              variant={isEditMode ? "default" : "outline"}
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
                    Save
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
            <div className="bg-blue-600 text-white text-xs px-3 py-2 rounded-lg text-center">
              Click any highlighted text to edit
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed w-full bg-white/95 backdrop-blur-md shadow-sm z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div 
              className="flex-shrink-0 flex items-center cursor-pointer" 
              onClick={() => window.scrollTo(0,0)}
              data-testid="link-logo"
            >
              <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center text-white mr-3">
                <Globe size={24} />
              </div>
              <div className="flex flex-col">
                <EditableText
                  id="brand-name"
                  defaultText="InterBridge"
                  className="font-bold text-xl tracking-tight text-slate-900 leading-none"
                  element="span"
                />
                <EditableText
                  id="brand-tagline"
                  defaultText="Trans & Trade"
                  className="text-xs font-semibold text-blue-700 tracking-wider uppercase"
                  element="span"
                />
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden lg:flex space-x-6 items-center gap-2">
              <button 
                onClick={() => scrollToSection('services')} 
                className="text-slate-600 hover:text-blue-700 font-medium transition-colors"
                data-testid="link-services"
              >
                Services
              </button>
              <button 
                onClick={() => scrollToSection('buyers')} 
                className="text-slate-600 hover:text-blue-700 font-medium transition-colors"
                data-testid="link-buyers"
              >
                For You
              </button>
              <button 
                onClick={() => scrollToSection('process')} 
                className="text-slate-600 hover:text-blue-700 font-medium transition-colors"
                data-testid="link-process"
              >
                Process
              </button>
              <button 
                onClick={() => scrollToSection('faq')} 
                className="text-slate-600 hover:text-blue-700 font-medium transition-colors"
                data-testid="link-faq"
              >
                FAQ & Pricing
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="bg-blue-900 text-white px-6 py-2.5 rounded-full font-medium hover:bg-blue-800 transition-all shadow-lg hover:shadow-blue-900/20"
                data-testid="button-get-quote"
              >
                Get a Quote
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center">
              <button 
                onClick={toggleMenu} 
                className="text-slate-600 hover:text-blue-900 p-2"
                data-testid="button-mobile-menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 absolute w-full">
            <div className="px-4 pt-2 pb-6 space-y-2 shadow-xl">
              <button 
                onClick={() => scrollToSection('services')} 
                className="block w-full text-left px-3 py-3 text-slate-600 font-medium border-b border-slate-50"
              >
                Main Services
              </button>
              <button 
                onClick={() => scrollToSection('buyers')} 
                className="block w-full text-left px-3 py-3 text-slate-600 font-medium border-b border-slate-50"
              >
                Buyer Types
              </button>
              <button 
                onClick={() => scrollToSection('process')} 
                className="block w-full text-left px-3 py-3 text-slate-600 font-medium border-b border-slate-50"
              >
                Our Process
              </button>
              <button 
                onClick={() => scrollToSection('faq')} 
                className="block w-full text-left px-3 py-3 text-slate-600 font-medium border-b border-slate-50"
              >
                FAQ & Pricing
              </button>
              <button 
                onClick={() => scrollToSection('contact')} 
                className="block w-full text-left px-3 py-3 text-blue-700 font-bold"
              >
                Contact Us
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center bg-blue-800/50 rounded-full px-4 py-1.5 border border-blue-700">
                <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                <EditableText
                  id="hero-badge"
                  defaultText="Bridging the Gap to Global Markets"
                  className="text-sm font-medium tracking-wide text-blue-100"
                  element="span"
                />
              </div>
              <EditableText
                id="hero-headline"
                defaultText="Direct Factory Access. Zero Middlemen."
                element="h1"
                className="text-5xl lg:text-6xl font-extrabold leading-tight"
              />
              <EditableText
                id="hero-description"
                defaultText="Your bilingual partner for sourcing, negotiation, and logistics. From small-batch orders to OEM projects, InterBridge connects you directly to the production line."
                element="p"
                className="text-lg text-blue-100 max-w-xl leading-relaxed"
              />
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => scrollToSection('contact')} 
                  className="bg-white text-blue-900 px-8 py-4 rounded-lg font-bold hover:bg-blue-50 transition-colors flex items-center justify-center"
                  data-testid="button-start-sourcing"
                >
                  <EditableText id="hero-cta-primary" defaultText="Start Sourcing" />
                  <ArrowRight className="ml-2" size={20} />
                </button>
                <button 
                  onClick={() => scrollToSection('services')} 
                  className="border border-blue-400/30 bg-blue-900/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-900/40 transition-colors"
                  data-testid="button-view-services"
                >
                  <EditableText id="hero-cta-secondary" defaultText="View Services" />
                </button>
              </div>
            </div>
            
            {/* Hero Card Visualization */}
            <div className="hidden lg:block relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-2xl blur opacity-30"></div>
              <div className="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700 p-8 rounded-2xl shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-500/20 p-3 rounded-lg text-blue-300">
                      <Factory size={32} />
                    </div>
                    <div>
                      <EditableText
                        id="hero-card-1-title"
                        defaultText="Factory Screening"
                        element="h3"
                        className="text-xl font-bold text-white"
                      />
                      <EditableText
                        id="hero-card-1-desc"
                        defaultText="Background checks, capacity verification, and direct price comparison."
                        element="p"
                        className="text-slate-300 text-sm mt-1"
                      />
                    </div>
                  </div>
                  <div className="w-full h-px bg-slate-700"></div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-amber-500/20 p-3 rounded-lg text-amber-300">
                      <Languages size={32} />
                    </div>
                    <div>
                      <EditableText
                        id="hero-card-2-title"
                        defaultText="Bilingual Negotiation"
                        element="h3"
                        className="text-xl font-bold text-white"
                      />
                      <EditableText
                        id="hero-card-2-desc"
                        defaultText="Contract review and communication support in English & Chinese."
                        element="p"
                        className="text-slate-300 text-sm mt-1"
                      />
                    </div>
                  </div>
                  <div className="w-full h-px bg-slate-700"></div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-emerald-500/20 p-3 rounded-lg text-emerald-300">
                      <ShieldCheck size={32} />
                    </div>
                    <div>
                      <EditableText
                        id="hero-card-3-title"
                        defaultText="Risk Reduction"
                        element="h3"
                        className="text-xl font-bold text-white"
                      />
                      <EditableText
                        id="hero-card-3-desc"
                        defaultText="IQC/FQC inspections and secure payment method advice."
                        element="p"
                        className="text-slate-300 text-sm mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Services Grid */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <EditableText
              id="services-label"
              defaultText="What I Can Do"
              className="text-blue-600 font-semibold tracking-wider uppercase text-sm"
              element="span"
            />
            <EditableText
              id="services-title"
              defaultText="Comprehensive Trade Services"
              element="h2"
              className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4"
            />
            <EditableText
              id="services-subtitle"
              defaultText="A full suite of services designed to make your import business safe, transparent, and scalable."
              element="p"
              className="text-slate-600 max-w-2xl mx-auto"
            />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="bg-slate-50 p-8 rounded-xl border border-slate-100 hover:border-blue-200 transition-all hover:shadow-lg group">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center text-blue-700 mb-6 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                <Search size={24} />
              </div>
              <EditableText
                id="service-1-title"
                defaultText="Factory & Supplier Screening"
                element="h3"
                className="text-xl font-bold text-slate-900 mb-3"
              />
              <EditableText
                id="service-1-desc"
                defaultText="Background checks, capacity/equipment verification, and price comparisons to ensure you deal with legitimate manufacturers."
                element="p"
                className="text-slate-600 text-sm leading-relaxed"
              />
            </div>

            {/* Service 2 */}
            <div className="bg-slate-50 p-8 rounded-xl border border-slate-100 hover:border-blue-200 transition-all hover:shadow-lg group">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center text-blue-700 mb-6 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                <LayoutList size={24} />
              </div>
              <EditableText
                id="service-2-title"
                defaultText="Sample Management"
                element="h3"
                className="text-xl font-bold text-slate-900 mb-3"
              />
              <EditableText
                id="service-2-desc"
                defaultText="Sample placement, optimization feedback, and confirmation of the sampling process to ensure the product meets your vision."
                element="p"
                className="text-slate-600 text-sm leading-relaxed"
              />
            </div>

            {/* Service 3 */}
            <div className="bg-slate-50 p-8 rounded-xl border border-slate-100 hover:border-blue-200 transition-all hover:shadow-lg group">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center text-blue-700 mb-6 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                <ShieldCheck size={24} />
              </div>
              <EditableText
                id="service-3-title"
                defaultText="Quality Control"
                element="h3"
                className="text-xl font-bold text-slate-900 mb-3"
              />
              <EditableText
                id="service-3-desc"
                defaultText="Incoming inspection (IQC), Final QC (FQC), Container Loading Checks, and coordination of third-party testing."
                element="p"
                className="text-slate-600 text-sm leading-relaxed"
              />
            </div>

             {/* Service 4 */}
             <div className="bg-slate-50 p-8 rounded-xl border border-slate-100 hover:border-blue-200 transition-all hover:shadow-lg group">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center text-blue-700 mb-6 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                <TrendingUp size={24} />
              </div>
              <EditableText
                id="service-4-title"
                defaultText="Production Tracking"
                element="h3"
                className="text-xl font-bold text-slate-900 mb-3"
              />
              <EditableText
                id="service-4-desc"
                defaultText="Order placement, regular production progress reports, and photo/video acceptance at key stages."
                element="p"
                className="text-slate-600 text-sm leading-relaxed"
              />
            </div>

            {/* Service 5 */}
            <div className="bg-slate-50 p-8 rounded-xl border border-slate-100 hover:border-blue-200 transition-all hover:shadow-lg group">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center text-blue-700 mb-6 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                <Ship size={24} />
              </div>
              <EditableText
                id="service-5-title"
                defaultText="Logistics & Customs"
                element="h3"
                className="text-xl font-bold text-slate-900 mb-3"
              />
              <EditableText
                id="service-5-desc"
                defaultText="Comparison of FOB/CIF/DDP options and assistance with LCL/FCL customs clearance advice."
                element="p"
                className="text-slate-600 text-sm leading-relaxed"
              />
            </div>

            {/* Service 6 */}
            <div className="bg-slate-50 p-8 rounded-xl border border-slate-100 hover:border-blue-200 transition-all hover:shadow-lg group">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center text-blue-700 mb-6 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                <FileText size={24} />
              </div>
              <EditableText
                id="service-6-title"
                defaultText="Negotiation & Contracts"
                element="h3"
                className="text-xl font-bold text-slate-900 mb-3"
              />
              <EditableText
                id="service-6-desc"
                defaultText="Advising on phased payments, third-party escrow/letters of credit, and contract review to reduce risk."
                element="p"
                className="text-slate-600 text-sm leading-relaxed"
              />
            </div>

            {/* Service 7 (Full width) */}
            <div className="md:col-span-2 lg:col-span-3 bg-blue-900 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-white shadow-xl">
              <div className="mb-6 md:mb-0 md:mr-8">
                <h3 className="text-2xl font-bold mb-2 flex items-center">
                  <Package className="mr-3 text-amber-400" /> 
                  <EditableText
                    id="service-7-title"
                    defaultText="Small-Batch / OEM / ODM Support"
                  />
                </h3>
                <EditableText
                  id="service-7-desc"
                  defaultText="We accept orders for small-volume purchases and support custom branding projects, helping you validate the market before scaling up."
                  element="p"
                  className="text-blue-100"
                />
              </div>
              <button 
                onClick={() => scrollToSection('contact')} 
                className="bg-white text-blue-900 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors whitespace-nowrap"
              >
                <EditableText id="service-7-cta" defaultText="Start Your Project" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Me / Value Props */}
      <section id="buyers" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <EditableText
                id="why-label"
                defaultText="Why Choose InterBridge?"
                className="text-blue-600 font-semibold tracking-wider uppercase text-sm"
                element="span"
              />
              <EditableText
                id="why-title"
                defaultText="Built on Trust & Transparency"
                element="h2"
                className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-6"
              />
              
              <div className="space-y-8">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-900 text-white">
                      <Languages size={24} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <EditableText
                      id="why-1-title"
                      defaultText="Bilingual Communication"
                      element="h3"
                      className="text-lg font-medium text-slate-900"
                    />
                    <EditableText
                      id="why-1-desc"
                      defaultText="Seamless communication in English and Chinese to prevent misunderstandings."
                      element="p"
                      className="mt-2 text-slate-600"
                    />
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-900 text-white">
                      <MapPin size={24} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <EditableText
                      id="why-2-title"
                      defaultText="Major Area Coverage"
                      element="h3"
                      className="text-lg font-medium text-slate-900"
                    />
                    <EditableText
                      id="why-2-desc"
                      defaultText="Familiar with SMEs and supply chain logic across China's major manufacturing hubs."
                      element="p"
                      className="mt-2 text-slate-600"
                    />
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-900 text-white">
                      <ZoomIn size={24} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <EditableText
                      id="why-3-title"
                      defaultText="Traceability & Transparency"
                      element="h3"
                      className="text-lg font-medium text-slate-900"
                    />
                    <EditableText
                      id="why-3-desc"
                      defaultText="Production evidence (photos/videos/test reports) delivered in stages so you always know the status."
                      element="p"
                      className="mt-2 text-slate-600"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
               <EditableText
                 id="perfect-for-title"
                 defaultText="We Are Perfect For"
                 element="h3"
                 className="text-2xl font-bold text-slate-900 mb-6 text-center"
               />
               <div className="space-y-4">
                 <div className="flex items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="bg-green-100 p-2 rounded-full mr-4 text-green-700"><Users size={20}/></div>
                    <div>
                      <EditableText
                        id="buyer-1-title"
                        defaultText="E-Commerce Sellers"
                        element="h4"
                        className="font-bold text-slate-800"
                      />
                      <EditableText
                        id="buyer-1-desc"
                        defaultText="New to overseas sourcing or wanting small-batch, diverse product validation."
                        element="p"
                        className="text-xs text-slate-500"
                      />
                    </div>
                 </div>
                 <div className="flex items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="bg-purple-100 p-2 rounded-full mr-4 text-purple-700"><Star size={20}/></div>
                    <div>
                      <EditableText
                        id="buyer-2-title"
                        defaultText="Brand Owners"
                        element="h4"
                        className="font-bold text-slate-800"
                      />
                      <EditableText
                        id="buyer-2-desc"
                        defaultText="With existing designs/brands but needing to find suitable manufacturers."
                        element="p"
                        className="text-xs text-slate-500"
                      />
                    </div>
                 </div>
                 <div className="flex items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="bg-amber-100 p-2 rounded-full mr-4 text-amber-700"><TrendingUp size={20}/></div>
                    <div>
                      <EditableText
                        id="buyer-3-title"
                        defaultText="Smart Importers"
                        element="h4"
                        className="font-bold text-slate-800"
                      />
                      <EditableText
                        id="buyer-3-desc"
                        defaultText="Looking to replace unreliable suppliers, optimize costs, or improve quality."
                        element="p"
                        className="text-xs text-slate-500"
                      />
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Step Process Section */}
      <section id="process" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <EditableText
              id="process-title"
              defaultText="Typical 5-Step Process"
              element="h2"
              className="text-3xl md:text-4xl font-bold text-slate-900"
            />
            <EditableText
              id="process-subtitle"
              defaultText="A clear path from requirement to delivery."
              element="p"
              className="text-slate-600 mt-4"
            />
          </div>
          
          <div className="grid md:grid-cols-5 gap-6">
            {[
              { step: "01", titleId: "step-1-title", defaultTitle: "Requirements", descId: "step-1-desc", defaultDesc: "You provide product details, target price, MOQ, delivery date, and quality specs." },
              { step: "02", titleId: "step-2-title", defaultTitle: "Screening", descId: "step-2-desc", defaultDesc: "I screen factories at the production site and provide 2–4 Supplier Options & Comparison Report." },
              { step: "03", titleId: "step-3-title", defaultTitle: "Sampling", descId: "step-3-desc", defaultDesc: "After supplier confirmation, arrange sampling and provide feedback until approval." },
              { step: "04", titleId: "step-4-title", defaultTitle: "Production", descId: "step-4-desc", defaultDesc: "Follow up on mass production and arrange phased testing/photo/video reports." },
              { step: "05", titleId: "step-5-title", defaultTitle: "Delivery", descId: "step-5-desc", defaultDesc: "Inspection, shipment arrangement, customs clearance, and complete documentation." },
            ].map((item, index) => (
              <div 
                key={index} 
                className="bg-slate-50 p-6 rounded-xl border border-slate-200 hover:border-blue-400 transition-colors relative group"
              >
                <div className="text-4xl font-extrabold text-blue-100 mb-4 group-hover:text-blue-200 transition-colors">{item.step}</div>
                <EditableText
                  id={item.titleId}
                  defaultText={item.defaultTitle}
                  element="h3"
                  className="text-lg font-bold text-slate-900 mb-3"
                />
                <EditableText
                  id={item.descId}
                  defaultText={item.defaultDesc}
                  element="p"
                  className="text-slate-600 text-xs leading-relaxed"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing & FAQ Section */}
      <section id="faq" className="py-24 bg-slate-50">
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <EditableText
                id="faq-title"
                defaultText="Pricing & FAQs"
                element="h2"
                className="text-3xl md:text-4xl font-bold text-slate-900"
              />
              <EditableText
                id="faq-subtitle"
                defaultText="Transparent fees and answers to common questions."
                element="p"
                className="text-slate-600 mt-4"
              />
            </div>

            {/* Pricing Card */}
            <div className="bg-blue-900 text-white rounded-2xl p-8 mb-12 shadow-xl">
               <div className="flex items-start flex-wrap gap-6">
                  <div className="bg-blue-800 p-3 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                      <rect width="20" height="14" x="2" y="5" rx="2"/>
                      <line x1="2" x2="22" y1="10" y2="10"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <EditableText
                      id="pricing-title"
                      defaultText="Flexible Payment Methods"
                      element="h3"
                      className="text-xl font-bold mb-2"
                    />
                    <EditableText
                      id="pricing-desc"
                      defaultText="We support a fixed service fee per project, a commission based on transaction amount, or a mixed fee structure. Sample production costs are charged separately."
                      element="p"
                      className="text-blue-100 mb-4 text-sm leading-relaxed"
                    />
                    <div className="inline-block bg-blue-800 px-4 py-2 rounded-lg text-xs font-semibold text-amber-300 border border-blue-700">
                      <EditableText
                        id="pricing-note"
                        defaultText="Specific pricing is based on complexity & workload and transparently written into the contract."
                      />
                    </div>
                  </div>
               </div>
            </div>

            {/* FAQ Accordion */}
            <div className="space-y-4">
               {[
                 { qId: "faq-1-q", defaultQ: "What is the Minimum Order Quantity (MOQ)?", aId: "faq-1-a", defaultA: "It depends on the product. However, many products support small batches (e.g., tens to hundreds of pieces). We specialize in helping clients with small-volume needs." },
                 { qId: "faq-2-q", defaultQ: "Is payment secure?", aId: "faq-2-a", defaultA: "Yes. We recommend phased payments and prioritize using third-party escrow or letters of credit to reduce risk for all parties." },
                 { qId: "faq-3-q", defaultQ: "How long does it take to produce samples?", aId: "faq-3-a", defaultA: "Generally 7–21 days, depending on product complexity and the factory's current schedule." }
               ].map((item, index) => (
                 <div key={index} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <button 
                      onClick={() => toggleFaq(index)}
                      className="w-full flex justify-between items-center p-5 text-left font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                    >
                      <span className="flex items-center">
                        <HelpCircle size={18} className="mr-3 text-blue-600"/>
                        <EditableText id={item.qId} defaultText={item.defaultQ} />
                      </span>
                      <ChevronDown size={20} className={`transform transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                    </button>
                    {openFaq === index && (
                      <div className="p-5 pt-0 text-slate-600 text-sm bg-slate-50 border-t border-slate-100">
                        <EditableText id={item.aId} defaultText={item.defaultA} element="p" />
                      </div>
                    )}
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Success Stories Section */}
      <section id="stories" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-5 pointer-events-none">
           <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-900 mix-blend-multiply filter blur-3xl"></div>
           <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-blue-600 mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <EditableText
              id="stories-label"
              defaultText="Proven Results"
              className="text-blue-600 font-semibold tracking-wider uppercase text-sm"
              element="span"
            />
            <EditableText
              id="stories-title"
              defaultText="Success Stories"
              element="h2"
              className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all relative group">
              <div className="absolute top-6 right-8 text-blue-100 group-hover:text-blue-200 transition-colors">
                <Quote size={64} />
              </div>
              <div className="relative z-10">
                <div className="flex text-amber-400 mb-4">
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                </div>
                <EditableText
                  id="testimonial-1-quote"
                  defaultText="InterBridge didn't just find a factory; they found one willing to do a low MOQ of 500 units for our launch. We couldn't have started without them."
                  element="p"
                  className="text-slate-700 italic mb-6 leading-relaxed"
                />
                <div className="flex items-center justify-between mt-8 border-t border-slate-200 pt-6">
                   <div>
                      <EditableText
                        id="testimonial-1-name"
                        defaultText="Sarah Jenkins"
                        element="h4"
                        className="font-bold text-slate-900"
                      />
                      <EditableText
                        id="testimonial-1-role"
                        defaultText="Founder, EcoHome Co."
                        element="p"
                        className="text-sm text-slate-500"
                      />
                   </div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-blue-900 p-8 rounded-2xl border border-blue-800 shadow-lg hover:shadow-xl transition-all relative group text-white">
              <div className="absolute top-6 right-8 text-blue-800 group-hover:text-blue-700 transition-colors">
                <Quote size={64} />
              </div>
              <div className="relative z-10">
                <div className="flex text-amber-400 mb-4">
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                </div>
                <EditableText
                  id="testimonial-2-quote"
                  defaultText="The Production Tracking reports were a game changer. I saw photos and videos at every stage, so I knew exactly what I was getting before shipment."
                  element="p"
                  className="text-blue-50 italic mb-6 leading-relaxed"
                />
                <div className="flex items-center justify-between mt-8 border-t border-blue-800 pt-6">
                   <div>
                      <EditableText
                        id="testimonial-2-name"
                        defaultText="David Chen"
                        element="h4"
                        className="font-bold"
                      />
                      <EditableText
                        id="testimonial-2-role"
                        defaultText="Procurement Lead"
                        element="p"
                        className="text-sm text-blue-300"
                      />
                   </div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all relative group">
              <div className="absolute top-6 right-8 text-blue-100 group-hover:text-blue-200 transition-colors">
                <Quote size={64} />
              </div>
              <div className="relative z-10">
                <div className="flex text-amber-400 mb-4">
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                </div>
                <EditableText
                  id="testimonial-3-quote"
                  defaultText="I needed to replace an unreliable supplier. InterBridge's screening process gave me 3 solid options in a week. The Logistics advice on DDP saved me a ton of headache."
                  element="p"
                  className="text-slate-700 italic mb-6 leading-relaxed"
                />
                <div className="flex items-center justify-between mt-8 border-t border-slate-200 pt-6">
                   <div>
                      <EditableText
                        id="testimonial-3-name"
                        defaultText="Marcus Thorne"
                        element="h4"
                        className="font-bold text-slate-900"
                      />
                      <EditableText
                        id="testimonial-3-role"
                        defaultText="CEO, TechGear"
                        element="p"
                        className="text-sm text-slate-500"
                      />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <EditableText
                id="contact-title"
                defaultText="Ready to scale your business?"
                element="h2"
                className="text-3xl md:text-4xl font-bold mb-6"
              />
              <EditableText
                id="contact-subtitle"
                defaultText="Whether you are a startup looking for your first batch or an enterprise seeking a new OEM partner, InterBridge is ready to assist."
                element="p"
                className="text-slate-300 text-lg mb-10"
              />
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-800 p-3 rounded-lg">
                    <Mail className="text-blue-300" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Email Us</div>
                    <EditableText
                      id="contact-email"
                      defaultText="inquiry@interbridge.com"
                      className="text-lg font-semibold"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-800 p-3 rounded-lg">
                    <Phone className="text-blue-300" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Call / WhatsApp</div>
                    <EditableText
                      id="contact-phone"
                      defaultText="+86 123 4567 8900"
                      className="text-lg font-semibold"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-800 p-3 rounded-lg">
                    <MapPin className="text-blue-300" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Office Location</div>
                    <EditableText
                      id="contact-location"
                      defaultText="Guangzhou, China"
                      className="text-lg font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 text-slate-800">
              <EditableText
                id="contact-form-title"
                defaultText="Send us a Request"
                element="h3"
                className="text-2xl font-bold mb-6"
              />
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                    placeholder="john@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Interested In</label>
                  <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                    <option value="sourcing">Sourcing & Screening</option>
                    <option value="oem">OEM/ODM Project</option>
                    <option value="interpretation">Interpretation/Visit</option>
                    <option value="qc">Quality Control Only</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                  <textarea 
                    rows={4} 
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                    placeholder="Tell us about your product, MOQ, or specific needs..."
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition-colors shadow-lg hover:shadow-xl"
                >
                  <EditableText id="contact-submit-btn" defaultText="Submit Inquiry" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center justify-center md:justify-start mb-2">
              <Globe size={20} className="mr-2 text-blue-600" />
              <EditableText
                id="footer-brand"
                defaultText="InterBridge Trans & Trade"
                className="font-bold text-white"
                element="span"
              />
            </div>
            <EditableText
              id="footer-tagline"
              defaultText="Your reliable partner for manufacturing & translation."
              element="p"
              className="text-sm"
            />
          </div>
          <div className="flex space-x-8 text-sm flex-wrap justify-center gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
