import { useContent } from '@/lib/contentContext';
import { EditableSection, EditableText, EditableContainer } from '@/components/EditableComponents';
import { ContactForm } from '@/components/forms/ContactForm';
import { Mail, Phone, MapPin } from 'lucide-react';
import { SiWhatsapp, SiWechat, SiTiktok } from 'react-icons/si';

export function ContactSection() {
  const { isEditMode, isSectionVisible } = useContent();
  const visible = isSectionVisible('contact');

  return (
    <EditableSection id="contact" name="Contact">
      <section id="contact" className={`py-20 lg:py-24 bg-slate-900 text-white ${!visible && isEditMode ? 'opacity-40' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <EditableText
                id="contact-badge"
                defaultText="Get In Touch"
                className="text-blue-400 font-bold uppercase tracking-widest text-sm"
                element="span"
              />
              <EditableText
                id="contact-title"
                defaultText="Ready to Get Started?"
                element="h2"
                className="text-3xl sm:text-4xl font-extrabold mt-4 mb-6"
              />
              <EditableText
                id="contact-description"
                defaultText="Tell us about your needs and we'll get back to you within 24 hours with a personalized plan."
                element="p"
                className="text-slate-300 text-lg mb-10"
              />

              <div className="space-y-6">
                <EditableContainer id="contact-email-block" label="Email">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-800 p-3 rounded-lg">
                      <Mail className="text-blue-300" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Email Us</div>
                      <EditableText id="contact-email" defaultText="Moda232320315@gmail.com" className="text-lg font-semibold" />
                    </div>
                  </div>
                </EditableContainer>

                <EditableContainer id="contact-phone-block" label="Phone">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-800 p-3 rounded-lg">
                      <Phone className="text-blue-300" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Call / WhatsApp</div>
                      <EditableText id="contact-phone" defaultText="+86 15325467680" className="text-lg font-semibold" />
                    </div>
                  </div>
                </EditableContainer>

                <EditableContainer id="contact-location-block" label="Location">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-800 p-3 rounded-lg">
                      <MapPin className="text-blue-300" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Located In</div>
                      <EditableText id="contact-location" defaultText="Guangzhou, China" className="text-lg font-semibold" />
                    </div>
                  </div>
                </EditableContainer>

                {/* Social Contact Options */}
                <div className="pt-6 mt-6 border-t border-slate-700">
                  <div className="text-sm text-slate-400 mb-4">Connect With Us</div>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="https://wa.me/8615325467680"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                      data-testid="link-whatsapp"
                    >
                      <SiWhatsapp size={20} />
                      WhatsApp
                    </a>

                    <div className="group relative">
                      <button
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                        data-testid="button-wechat"
                      >
                        <SiWechat size={20} />
                        WeChat
                      </button>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-white text-slate-800 rounded-lg shadow-xl text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        WeChat ID: <span className="font-bold">Voguishgirl</span>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-white"></div>
                      </div>
                    </div>

                    <a
                      href="https://www.tiktok.com/@guangzhouinterpreter"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors border border-slate-600"
                      data-testid="link-tiktok"
                    >
                      <SiTiktok size={20} />
                      TikTok
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 text-slate-800">
              <EditableText
                id="contact-form-title"
                defaultText="Send us a Request"
                element="h3"
                className="text-2xl font-bold mb-6"
              />
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </EditableSection>
  );
}
