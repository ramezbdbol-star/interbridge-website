import { useState, useEffect } from 'react';
import { useContent } from '@/lib/contentContext';
import { EditableText, EditableButton } from '@/components/EditableComponents';
import { Menu, X } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { navServiceCategories, serviceCategories } from '@/data/serviceData';
import { getTheme } from '@/data/serviceThemes';
import { Shield, Armchair } from 'lucide-react';

interface NavigationProps {
  scrollToSection: (id: string) => void;
}

export function Navigation({ scrollToSection }: NavigationProps) {
  const { isEditMode } = useContent();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Services', target: 'services' },
    { label: 'How It Works', target: 'process' },
    { label: 'Trade Guard', target: 'tradeguard', className: 'text-red-600' },
    { label: 'Furniture', target: 'furniture', className: 'text-amber-600' },
    { label: 'FAQ', target: 'faq' },
  ];

  const handleNavClick = (target: string) => {
    scrollToSection(target);
    setMobileOpen(false);
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
            {navItems.map((item) => (
              <button
                key={item.target}
                onClick={() => handleNavClick(item.target)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:bg-slate-100 ${
                  item.className || 'text-slate-700 hover:text-slate-900'
                }`}
                data-testid={`nav-${item.target}`}
              >
                {item.label}
              </button>
            ))}

            <button
              onClick={() => handleNavClick('contact')}
              className="px-4 py-2 rounded-lg font-medium text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              data-testid="nav-contact"
            >
              Contact
            </button>

            {/* CTA Button */}
            <EditableButton
              id="nav-cta"
              defaultText="Get a Free Quote"
              defaultLink="#contact"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-bold hover:bg-blue-700 transition-colors shadow-md ml-2 text-sm"
            />
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

                  {/* Navigation Links */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {/* Service Categories */}
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 pt-2 pb-1">
                      Services
                    </div>
                    {serviceCategories.slice(0, 5).map((category) => {
                      const IconComponent = category.icon;
                      const theme = getTheme(category.color);
                      return (
                        <button
                          key={category.id}
                          onClick={() => handleNavClick('services')}
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

                    {/* Special Services */}
                    <button
                      onClick={() => handleNavClick('tradeguard')}
                      className="flex items-center gap-3 w-full px-3 py-3 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-red-100 text-red-600">
                        <Shield size={18} />
                      </div>
                      Trade Dispute Resolution
                    </button>

                    <button
                      onClick={() => handleNavClick('furniture')}
                      className="flex items-center gap-3 w-full px-3 py-3 text-amber-600 font-semibold rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-100 text-amber-600">
                        <Armchair size={18} />
                      </div>
                      Furniture & Design
                    </button>

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
