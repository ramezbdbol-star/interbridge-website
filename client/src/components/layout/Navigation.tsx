import { useState, useEffect, useRef } from 'react';
import { useContent } from '@/lib/contentContext';
import { EditableText } from '@/components/EditableComponents';
import { Menu, X, ChevronDown } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { serviceCategories } from '@/data/serviceData';
import { getTheme } from '@/data/serviceThemes';

interface NavigationProps {
  scrollToSection: (id: string) => void;
}

export function Navigation({ scrollToSection }: NavigationProps) {
  const { isEditMode } = useContent();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (target: string) => {
    scrollToSection(target);
    setMobileOpen(false);
    setServicesOpen(false);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setServicesOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setServicesOpen(false);
    }, 200);
  };

  // Map service IDs to their scroll targets
  const getScrollTarget = (serviceId: string) => {
    if (serviceId === 'tradeguard') return 'tradeguard';
    if (serviceId === 'furniture') return 'furniture';
    return 'services';
  };

  return (
    <nav
      className={`fixed w-full z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg h-16'
          : 'bg-white shadow-md h-20'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <div
            className="flex-shrink-0 flex items-center cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            data-testid="link-logo"
          >
            <img
              src="/logo.png"
              alt="InterBridge Logo"
              className={`mr-2.5 object-contain transition-all duration-300 ${
                isScrolled ? 'w-8 h-8' : 'w-10 h-10'
              }`}
            />
            <div className="flex flex-col">
              <EditableText
                id="brand-name"
                defaultText="InterBridge"
                className={`font-bold tracking-tight text-slate-900 leading-tight transition-all duration-300 ${
                  isScrolled ? 'text-base' : 'text-lg'
                }`}
                element="span"
              />
              <EditableText
                id="brand-tagline"
                defaultText="TRANS & TRADE"
                className="text-[9px] font-semibold text-blue-600 tracking-widest uppercase"
                element="span"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Services Mega-Menu Dropdown - ALL 7 services */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => setServicesOpen(!servicesOpen)}
                className="px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:bg-slate-100 text-slate-700 hover:text-slate-900 flex items-center gap-1"
                data-testid="nav-services-dropdown"
              >
                Services
                <ChevronDown className={`w-4 h-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mega-menu dropdown */}
              {servicesOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 min-w-[680px]">
                  {/* Arrow */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-slate-200 rotate-45" />

                  <div className="relative">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                      All Services
                    </div>

                    {/* Services grid - 2 columns for all 7 */}
                    <div className="grid grid-cols-2 gap-2">
                      {serviceCategories.map((category) => {
                        const theme = getTheme(category.color);
                        const IconComponent = category.icon;
                        const target = getScrollTarget(category.id);

                        return (
                          <button
                            key={category.id}
                            onClick={() => handleNavClick(target)}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group text-left"
                            data-testid={`nav-service-${category.id}`}
                          >
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${theme.iconBg} ${theme.text} flex-shrink-0 group-hover:scale-110 transition-transform`}
                            >
                              <IconComponent size={20} />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 text-sm">{category.title}</div>
                              <div className="text-slate-500 text-xs leading-snug line-clamp-1">
                                {category.description}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Bottom CTA */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-sm text-slate-500">Not sure which service you need?</span>
                      <button
                        onClick={() => handleNavClick('contact')}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Talk to us &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Direct links */}
            <button
              onClick={() => handleNavClick('process')}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:bg-slate-100 text-slate-700 hover:text-slate-900"
              data-testid="nav-process"
            >
              How It Works
            </button>

            <button
              onClick={() => handleNavClick('faq')}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:bg-slate-100 text-slate-700 hover:text-slate-900"
              data-testid="nav-faq"
            >
              FAQ
            </button>

            <button
              onClick={() => handleNavClick('contact')}
              className="px-4 py-2 rounded-lg font-medium text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              data-testid="nav-contact"
            >
              Contact
            </button>

            {/* CTA Button */}
            <button
              onClick={() => handleNavClick('contact')}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-bold hover:bg-blue-700 transition-colors shadow-md ml-2 text-sm"
              data-testid="nav-cta"
            >
              Get a Free Quote
            </button>
          </div>

          {/* Mobile: WhatsApp + Menu */}
          <div className="lg:hidden flex items-center gap-2">
            <a
              href="https://wa.me/8615325467680"
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-lg bg-green-500 text-white flex items-center justify-center"
              data-testid="mobile-whatsapp"
            >
              <SiWhatsapp size={20} />
            </a>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  className="w-11 h-11 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
                  data-testid="button-mobile-menu"
                >
                  {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <img src="/logo.png" alt="InterBridge" className="w-8 h-8 object-contain" />
                      <div>
                        <div className="font-bold text-slate-900">InterBridge</div>
                        <div className="text-[10px] font-semibold text-blue-600 tracking-widest uppercase">
                          TRANS & TRADE
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links - ALL 7 services */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 pt-2 pb-1">
                      Our Services
                    </div>

                    {serviceCategories.map((category) => {
                      const IconComponent = category.icon;
                      const theme = getTheme(category.color);
                      const target = getScrollTarget(category.id);

                      return (
                        <button
                          key={category.id}
                          onClick={() => handleNavClick(target)}
                          className="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center ${theme.iconBg} ${theme.text}`}
                          >
                            <IconComponent size={18} />
                          </div>
                          <div className="text-left">
                            <span className="text-slate-800 font-medium text-sm block">{category.title}</span>
                            <span className="text-slate-500 text-xs">{category.subServices.length} services</span>
                          </div>
                        </button>
                      );
                    })}

                    {/* Divider */}
                    <div className="border-t border-slate-100 my-3" />

                    {/* Other Pages */}
                    <button
                      onClick={() => handleNavClick('process')}
                      className="flex items-center gap-3 w-full px-3 py-3 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      How It Works
                    </button>
                    <button
                      onClick={() => handleNavClick('faq')}
                      className="flex items-center gap-3 w-full px-3 py-3 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      FAQ
                    </button>
                    <button
                      onClick={() => handleNavClick('contact')}
                      className="flex items-center gap-3 w-full px-3 py-3 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Contact Us
                    </button>
                  </div>

                  {/* Footer CTA */}
                  <div className="p-4 border-t border-slate-100">
                    <button
                      onClick={() => handleNavClick('contact')}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-center hover:bg-blue-700 transition-colors"
                    >
                      Get a Free Quote
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
