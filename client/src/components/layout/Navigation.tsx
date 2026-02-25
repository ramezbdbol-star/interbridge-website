import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { ChevronDown, Menu, X } from 'lucide-react';
import { SiTiktok, SiWechat, SiWhatsapp } from 'react-icons/si';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { EditableText } from '@/components/EditableComponents';
import { getServicePath, serviceCategories, type ServiceCategory } from '@/data/serviceData';
import { getTheme } from '@/data/serviceThemes';

interface NavigationProps {
  scrollToSection?: (id: string) => void;
}

export function Navigation({ scrollToSection }: NavigationProps) {
  const [, setLocation] = useLocation();
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeMenus = () => {
    setMobileOpen(false);
    setServicesOpen(false);
  };

  const handleLogoClick = () => {
    closeMenus();

    if (window.location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.location.hash) {
        window.history.replaceState(null, '', '/');
      }
      return;
    }

    setLocation('/');
  };

  const scrollHomeSection = (target: string) => {
    if (scrollToSection) {
      scrollToSection(target);
      return;
    }

    const element = document.getElementById(target);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSectionClick = (target: string) => {
    closeMenus();

    if (window.location.pathname === '/') {
      scrollHomeSection(target);
      return;
    }

    setLocation(`/#${target}`);
  };

  const handleServiceClick = (service: ServiceCategory) => {
    closeMenus();

    const targetPath = getServicePath(service);
    if (window.location.pathname === targetPath) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLocation(targetPath);
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

  return (
    <nav
      className={`fixed w-full z-40 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg h-16' : 'bg-white shadow-md h-20'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          <div
            className="flex-shrink-0 flex items-center cursor-pointer"
            onClick={handleLogoClick}
            data-testid="link-logo"
          >
            <img
              src="/logo.png"
              alt="InterBridge Logo"
              className={`mr-2.5 object-contain transition-all duration-300 ${isScrolled ? 'w-8 h-8' : 'w-10 h-10'}`}
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

          <div className="hidden lg:flex items-center gap-1">
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

              {servicesOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 min-w-[680px]">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-slate-200 rotate-45" />

                  <div className="relative">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">All Services</div>

                    <div className="grid grid-cols-2 gap-2">
                      {serviceCategories.map((category) => {
                        const theme = getTheme(category.color);
                        const IconComponent = category.icon;

                        return (
                          <button
                            key={category.id}
                            onClick={() => handleServiceClick(category)}
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
                              <div className="text-slate-500 text-xs leading-snug line-clamp-1">{category.description}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-sm text-slate-500">Not sure which service you need?</span>
                      <button
                        onClick={() => handleSectionClick('contact')}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Talk to us &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => handleSectionClick('process')}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:bg-slate-100 text-slate-700 hover:text-slate-900"
              data-testid="nav-process"
            >
              How It Works
            </button>

            <button
              onClick={() => handleSectionClick('faq')}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:bg-slate-100 text-slate-700 hover:text-slate-900"
              data-testid="nav-faq"
            >
              FAQ
            </button>

            <button
              onClick={() => handleSectionClick('contact')}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:bg-slate-100 text-slate-700 hover:text-slate-900"
              data-testid="nav-contact"
            >
              Contact
            </button>

            <div className="flex items-center gap-1.5 ml-1">
              <a
                href="https://wa.me/8615325467680"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 hover:scale-110 transition-all shadow-sm"
                title="WhatsApp"
                data-testid="nav-whatsapp"
              >
                <SiWhatsapp size={16} />
              </a>
              <div className="group relative">
                <button
                  className="w-9 h-9 rounded-full bg-[#07C160] text-white flex items-center justify-center hover:bg-[#06a855] hover:scale-110 transition-all shadow-sm"
                  title="WeChat"
                  data-testid="nav-wechat"
                >
                  <SiWechat size={16} />
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-slate-900 text-white rounded-lg shadow-xl text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                  WeChat ID: <span className="font-bold">Voguishgirl</span>
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                </div>
              </div>
              <a
                href="https://www.tiktok.com/@guangzhouinterpreter"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 hover:scale-110 transition-all shadow-sm"
                title="TikTok"
                data-testid="nav-tiktok"
              >
                <SiTiktok size={14} />
              </a>
            </div>

            <button
              onClick={() => handleSectionClick('book-now')}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-bold hover:bg-blue-700 transition-colors shadow-md ml-2 text-sm"
              data-testid="nav-cta"
            >
              Book Now
            </button>
          </div>

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
                  <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <img src="/logo.png" alt="InterBridge" className="w-8 h-8 object-contain" />
                      <div>
                        <div className="font-bold text-slate-900">InterBridge</div>
                        <div className="text-[10px] font-semibold text-blue-600 tracking-widest uppercase">TRANS & TRADE</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 pt-2 pb-1">
                      Our Services
                    </div>

                    {serviceCategories.map((category) => {
                      const IconComponent = category.icon;
                      const theme = getTheme(category.color);

                      return (
                        <button
                          key={category.id}
                          onClick={() => handleServiceClick(category)}
                          className="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${theme.iconBg} ${theme.text}`}>
                            <IconComponent size={18} />
                          </div>
                          <div className="text-left">
                            <span className="text-slate-800 font-medium text-sm block">{category.title}</span>
                            <span className="text-slate-500 text-xs">{category.subServices.length} services</span>
                          </div>
                        </button>
                      );
                    })}

                    <div className="border-t border-slate-100 my-3" />

                    <button
                      onClick={() => handleSectionClick('process')}
                      className="flex items-center gap-3 w-full px-3 py-3 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      How It Works
                    </button>
                    <button
                      onClick={() => handleSectionClick('faq')}
                      className="flex items-center gap-3 w-full px-3 py-3 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      FAQ
                    </button>
                    <button
                      onClick={() => handleSectionClick('contact')}
                      className="flex items-center gap-3 w-full px-3 py-3 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Contact
                    </button>

                    <div className="border-t border-slate-100 my-3" />
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 pt-2 pb-2">
                      Connect With Us
                    </div>
                    <div className="flex items-center gap-3 px-3">
                      <a
                        href="https://wa.me/8615325467680"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-11 h-11 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors shadow-sm"
                      >
                        <SiWhatsapp size={20} />
                      </a>
                      <div className="group relative">
                        <button className="w-11 h-11 rounded-full bg-[#07C160] text-white flex items-center justify-center hover:bg-[#06a855] transition-colors shadow-sm">
                          <SiWechat size={20} />
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white rounded-lg shadow-xl text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                          WeChat ID: <span className="font-bold">Voguishgirl</span>
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                        </div>
                      </div>
                      <a
                        href="https://www.tiktok.com/@guangzhouinterpreter"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-colors shadow-sm"
                      >
                        <SiTiktok size={18} />
                      </a>
                    </div>
                  </div>

                  <div className="p-4 border-t border-slate-100">
                    <button
                      onClick={() => handleSectionClick('book-now')}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-center hover:bg-blue-700 transition-colors"
                    >
                      Book Now
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
