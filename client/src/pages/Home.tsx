import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAdmin } from '@/lib/adminContext';
import { useContent, type CustomSection } from '@/lib/contentContext';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  EditableText, 
  EditableSection, 
  EditableButton, 
  EditableContainer 
} from '@/components/EditableComponents';
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
  Loader2,
  CheckCircle,
  CheckCircle2,
  Send,
  Eye,
  EyeOff,
  Layers,
  Plus,
  Trash2,
  Copy,
  Type,
  Grid3X3,
  MessageSquare,
  Image,
  Megaphone,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiWhatsapp, SiWechat, SiTiktok } from 'react-icons/si';

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  interestedIn: string;
  message: string;
}

function ContactForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    interestedIn: 'sourcing',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await apiRequest('POST', '/api/contact', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Inquiry Submitted!",
        description: data.message || "We'll get back to you soon.",
      });
      setIsSubmitted(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        interestedIn: 'sourcing',
        message: ''
      });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your first and last name.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.message.trim()) {
      toast({
        title: "Message Required",
        description: "Please tell us about your needs.",
        variant: "destructive"
      });
      return;
    }
    
    submitMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (isSubmitted) setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h3>
        <p className="text-slate-600 mb-6">Your inquiry has been submitted successfully. We'll get back to you within 24 hours.</p>
        <Button
          variant="outline"
          onClick={() => setIsSubmitted(false)}
          data-testid="button-send-another"
        >
          Send Another Inquiry
        </Button>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
          <input 
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
            placeholder="John"
            data-testid="input-first-name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
          <input 
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
            placeholder="Doe"
            data-testid="input-last-name"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
        <input 
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
          placeholder="john@company.com"
          data-testid="input-email"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Interested In</label>
        <select 
          name="interestedIn"
          value={formData.interestedIn}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          data-testid="select-interested-in"
        >
          <option value="sourcing">Sourcing & Screening</option>
          <option value="oem">OEM/ODM Project</option>
          <option value="interpretation">Interpretation/Visit</option>
          <option value="qc">Quality Control Only</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Message *</label>
        <textarea 
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4} 
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
          placeholder="Tell us about your product, MOQ, or specific needs..."
          data-testid="textarea-message"
        ></textarea>
      </div>
      <Button
        type="submit"
        disabled={submitMutation.isPending}
        className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 rounded-lg font-bold transition-colors shadow-lg hover:shadow-xl"
        data-testid="button-submit-inquiry"
      >
        {submitMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Submit Inquiry
          </>
        )}
      </Button>
    </form>
  );
}

function SectionManager({ onClose }: { onClose: () => void }) {
  const { 
    getSectionOrder, 
    isSectionVisible, 
    toggleSectionVisibility, 
    moveSectionUp, 
    moveSectionDown,
    getCustomSections,
    addCustomSection,
    deleteCustomSection,
    duplicateSection
  } = useContent();
  const { toast } = useToast();
  const order = getSectionOrder();
  const customSections = getCustomSections();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);
  
  const sectionNames: Record<string, string> = {
    hero: 'Hero Banner',
    services: 'Services',
    buyers: 'For Buyers',
    process: 'Our Process',
    faq: 'FAQ & Pricing',
    stories: 'Success Stories',
    contact: 'Contact'
  };

  const getSectionName = (sectionId: string) => {
    if (sectionNames[sectionId]) return sectionNames[sectionId];
    const custom = customSections.find(s => s.id === sectionId);
    return custom?.name || sectionId;
  };

  const isCustomSection = (sectionId: string) => {
    return sectionId.startsWith('custom-');
  };

  const sectionTypes = [
    { type: 'text' as const, name: 'Text Block', icon: <Type className="w-4 h-4" /> },
    { type: 'features' as const, name: 'Features Grid', icon: <Grid3X3 className="w-4 h-4" /> },
    { type: 'cta' as const, name: 'Call to Action', icon: <Megaphone className="w-4 h-4" /> },
    { type: 'testimonial' as const, name: 'Testimonial', icon: <MessageSquare className="w-4 h-4" /> },
    { type: 'gallery' as const, name: 'Image Gallery', icon: <Image className="w-4 h-4" /> },
  ];

  const handleAddSection = (type: CustomSection['type']) => {
    const name = sectionTypes.find(t => t.type === type)?.name || 'New Section';
    addCustomSection(type, name);
    setShowAddMenu(false);
    toast({
      title: "Section Added",
      description: `New ${name} section has been created. Don't forget to save!`,
    });
  };

  const handleDeleteSection = (sectionId: string) => {
    deleteCustomSection(sectionId);
    toast({
      title: "Section Deleted",
      description: "Section has been removed. Don't forget to save!",
    });
  };

  const handleDuplicateSection = (sectionId: string) => {
    duplicateSection(sectionId);
    toast({
      title: "Section Duplicated",
      description: "Section has been copied. Don't forget to save!",
    });
  };

  return (
    <div 
      ref={panelRef}
      className="fixed left-6 top-1/2 -translate-y-1/2 z-50 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 max-w-[220px] max-h-[80vh] overflow-y-auto"
    >
      <div className="flex items-center gap-2 pb-2 border-b border-slate-200 mb-2">
        <Layers className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-bold text-slate-700">Sections</span>
        <button 
          onClick={onClose}
          className="ml-auto p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
          title="Close panel"
          data-testid="button-close-sections"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      
      <div className="space-y-1 mb-3">
        {order.map((sectionId, index) => {
          const visible = isSectionVisible(sectionId);
          const isCustom = isCustomSection(sectionId);
          return (
            <div 
              key={sectionId}
              className={`flex items-center gap-1 p-1.5 rounded-lg ${visible ? 'bg-slate-50' : 'bg-red-50'} ${isCustom ? 'border-l-2 border-green-500' : ''}`}
            >
              <button
                onClick={() => toggleSectionVisibility(sectionId)}
                className={`p-1 rounded ${visible ? 'text-slate-600 hover:bg-slate-200' : 'text-red-500 hover:bg-red-100'}`}
                title={visible ? 'Hide section' : 'Show section'}
                data-testid={`manager-visibility-${sectionId}`}
              >
                {visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
              <span className={`flex-1 text-xs font-medium truncate ${visible ? 'text-slate-700' : 'text-red-500 line-through'}`}>
                {getSectionName(sectionId)}
              </span>
              <div className="flex items-center gap-1">
                <div className="flex items-center bg-slate-200 rounded overflow-hidden">
                  <button
                    onClick={() => moveSectionUp(sectionId)}
                    disabled={index === 0}
                    className="p-1 text-slate-600 hover:bg-blue-500 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-200 disabled:hover:text-slate-600 transition-colors"
                    title="Move section up"
                    data-testid={`manager-up-${sectionId}`}
                  >
                    <ChevronDown className="w-4 h-4 rotate-180" />
                  </button>
                  <button
                    onClick={() => moveSectionDown(sectionId)}
                    disabled={index === order.length - 1}
                    className="p-1 text-slate-600 hover:bg-blue-500 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-200 disabled:hover:text-slate-600 transition-colors"
                    title="Move section down"
                    data-testid={`manager-down-${sectionId}`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                {isCustom && (
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => handleDuplicateSection(sectionId)}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Duplicate section"
                      data-testid={`manager-duplicate-${sectionId}`}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSection(sectionId)}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete section"
                      data-testid={`manager-delete-${sectionId}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-slate-200 pt-2">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full flex items-center justify-center gap-2 p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium text-sm transition-colors"
          data-testid="button-add-section"
        >
          <Plus className="w-4 h-4" />
          Add Section
        </button>
        
        {showAddMenu && (
          <div className="mt-2 space-y-1 bg-slate-50 rounded-lg p-2">
            <div className="text-xs text-slate-500 font-medium mb-1">Choose type:</div>
            {sectionTypes.map((st) => (
              <button
                key={st.type}
                onClick={() => handleAddSection(st.type)}
                className="w-full flex items-center gap-2 p-2 hover:bg-white rounded text-left text-sm text-slate-700"
                data-testid={`add-section-${st.type}`}
              >
                {st.icon}
                {st.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InlineSectionAdder({ position }: { position: number }) {
  const { insertSectionAt } = useContent();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const sectionTypes = [
    { type: 'text' as const, name: 'Text Block', icon: <Type className="w-4 h-4" /> },
    { type: 'features' as const, name: 'Features Grid', icon: <Grid3X3 className="w-4 h-4" /> },
    { type: 'cta' as const, name: 'Call to Action', icon: <Megaphone className="w-4 h-4" /> },
    { type: 'testimonial' as const, name: 'Testimonial', icon: <MessageSquare className="w-4 h-4" /> },
    { type: 'gallery' as const, name: 'Image Gallery', icon: <Image className="w-4 h-4" /> },
  ];

  const handleAddSection = (type: 'text' | 'features' | 'cta' | 'testimonial' | 'gallery') => {
    const name = sectionTypes.find(t => t.type === type)?.name || 'New Section';
    insertSectionAt(position, type, name);
    setShowMenu(false);
    setIsHovered(false);
    toast({
      title: "Section Added",
      description: `New ${name} section has been created here. Don't forget to save!`,
    });
  };

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowMenu(false); }}
    >
      <div className={`flex items-center justify-center py-2 transition-all duration-200 ${isHovered ? 'py-4' : ''}`}>
        <div className={`flex items-center w-full max-w-4xl mx-auto px-4 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
          
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="mx-4 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all text-sm font-medium"
            data-testid={`inline-add-section-${position}`}
          >
            <Plus className="w-4 h-4" />
            Add Section Here
          </button>
          
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
        </div>
      </div>

      {showMenu && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full z-50 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 min-w-[200px]">
          <div className="text-xs text-slate-500 font-medium mb-2 px-2">Choose section type:</div>
          {sectionTypes.map((st) => (
            <button
              key={st.type}
              onClick={() => handleAddSection(st.type)}
              className="w-full flex items-center gap-3 p-2.5 hover:bg-blue-50 rounded-lg text-left text-sm text-slate-700 transition-colors"
              data-testid={`inline-add-${st.type}-${position}`}
            >
              <span className="text-blue-600">{st.icon}</span>
              {st.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomSectionRenderer({ section }: { section: CustomSection }) {
  const { isEditMode, isSectionVisible, getContent, updateContent, updateCustomSection } = useContent();
  const visible = isSectionVisible(section.id);

  const bgClasses = {
    white: 'bg-white',
    slate: 'bg-slate-50',
    dark: 'bg-slate-900 text-white'
  };

  const bgClass = bgClasses[section.content.backgroundColor || 'white'];

  const handleTitleChange = (newTitle: string) => {
    updateCustomSection(section.id, {
      content: { ...section.content, title: newTitle }
    });
  };

  const handleDescChange = (newDesc: string) => {
    updateCustomSection(section.id, {
      content: { ...section.content, description: newDesc }
    });
  };

  const handleSubtitleChange = (newSubtitle: string) => {
    updateCustomSection(section.id, {
      content: { ...section.content, subtitle: newSubtitle }
    });
  };

  if (section.type === 'text') {
    return (
      <EditableSection id={section.id} name={section.name}>
        <section className={`py-16 ${bgClass} ${!visible && isEditMode ? 'opacity-40' : ''}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 
              contentEditable={isEditMode}
              suppressContentEditableWarning
              onBlur={(e) => handleTitleChange(e.currentTarget.innerText)}
              className={`text-3xl font-bold mb-6 ${isEditMode ? 'ring-2 ring-blue-400 ring-offset-2 bg-blue-50/50 rounded cursor-text' : ''} ${section.content.backgroundColor === 'dark' ? 'text-white' : 'text-slate-900'}`}
              data-testid={`custom-title-${section.id}`}
            >
              {section.content.title}
            </h2>
            <p
              contentEditable={isEditMode}
              suppressContentEditableWarning
              onBlur={(e) => handleDescChange(e.currentTarget.innerText)}
              className={`text-lg leading-relaxed ${isEditMode ? 'ring-2 ring-blue-400 ring-offset-2 bg-blue-50/50 rounded cursor-text' : ''} ${section.content.backgroundColor === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}
              data-testid={`custom-desc-${section.id}`}
            >
              {section.content.description}
            </p>
          </div>
        </section>
      </EditableSection>
    );
  }

  if (section.type === 'features') {
    return (
      <EditableSection id={section.id} name={section.name}>
        <section className={`py-20 ${bgClass} ${!visible && isEditMode ? 'opacity-40' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span
                contentEditable={isEditMode}
                suppressContentEditableWarning
                onBlur={(e) => handleSubtitleChange(e.currentTarget.innerText)}
                className={`text-blue-600 font-bold uppercase tracking-widest text-sm ${isEditMode ? 'ring-2 ring-blue-400 rounded cursor-text' : ''}`}
              >
                {section.content.subtitle}
              </span>
              <h2
                contentEditable={isEditMode}
                suppressContentEditableWarning
                onBlur={(e) => handleTitleChange(e.currentTarget.innerText)}
                className={`text-4xl font-extrabold mt-4 ${isEditMode ? 'ring-2 ring-blue-400 ring-offset-2 bg-blue-50/50 rounded cursor-text' : ''} ${section.content.backgroundColor === 'dark' ? 'text-white' : 'text-slate-900'}`}
              >
                {section.content.title}
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {section.content.items?.map((item, index) => (
                <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </EditableSection>
    );
  }

  if (section.type === 'cta') {
    return (
      <EditableSection id={section.id} name={section.name}>
        <section className={`py-20 bg-gradient-to-r from-blue-900 to-slate-900 text-white ${!visible && isEditMode ? 'opacity-40' : ''}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2
              contentEditable={isEditMode}
              suppressContentEditableWarning
              onBlur={(e) => handleTitleChange(e.currentTarget.innerText)}
              className={`text-4xl font-extrabold mb-6 ${isEditMode ? 'ring-2 ring-blue-400 ring-offset-2 rounded cursor-text' : ''}`}
            >
              {section.content.title}
            </h2>
            <p
              contentEditable={isEditMode}
              suppressContentEditableWarning
              onBlur={(e) => handleDescChange(e.currentTarget.innerText)}
              className={`text-xl text-blue-100 mb-8 ${isEditMode ? 'ring-2 ring-blue-400 rounded cursor-text' : ''}`}
            >
              {section.content.description}
            </p>
            <EditableButton
              id={`custom-cta-${section.id}`}
              defaultText={section.content.buttonText || 'Get Started'}
              defaultLink={section.content.buttonLink || '#contact'}
              className="bg-white text-blue-900 px-8 py-4 rounded-lg font-bold hover:bg-blue-50 transition-colors inline-flex items-center"
              icon={<ArrowRight className="ml-2" size={20} />}
            />
          </div>
        </section>
      </EditableSection>
    );
  }

  if (section.type === 'testimonial') {
    return (
      <EditableSection id={section.id} name={section.name}>
        <section className={`py-20 ${bgClass} ${!visible && isEditMode ? 'opacity-40' : ''}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              contentEditable={isEditMode}
              suppressContentEditableWarning
              onBlur={(e) => handleTitleChange(e.currentTarget.innerText)}
              className={`text-3xl font-bold text-center mb-12 ${isEditMode ? 'ring-2 ring-blue-400 ring-offset-2 rounded cursor-text' : ''} ${section.content.backgroundColor === 'dark' ? 'text-white' : 'text-slate-900'}`}
            >
              {section.content.title}
            </h2>
            <div className="space-y-8">
              {section.content.items?.map((item) => (
                <div key={item.id} className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
                  <Quote className="w-10 h-10 text-blue-200 mb-4" />
                  <p className="text-slate-600 text-lg italic mb-4">{item.description}</p>
                  <div className="font-bold text-slate-900">{item.title}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </EditableSection>
    );
  }

  if (section.type === 'gallery') {
    return (
      <EditableSection id={section.id} name={section.name}>
        <section className={`py-20 ${bgClass} ${!visible && isEditMode ? 'opacity-40' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span
                contentEditable={isEditMode}
                suppressContentEditableWarning
                onBlur={(e) => handleSubtitleChange(e.currentTarget.innerText)}
                className={`text-blue-600 font-bold uppercase tracking-widest text-sm ${isEditMode ? 'ring-2 ring-blue-400 rounded cursor-text' : ''}`}
              >
                {section.content.subtitle}
              </span>
              <h2
                contentEditable={isEditMode}
                suppressContentEditableWarning
                onBlur={(e) => handleTitleChange(e.currentTarget.innerText)}
                className={`text-4xl font-extrabold mt-4 ${isEditMode ? 'ring-2 ring-blue-400 ring-offset-2 rounded cursor-text' : ''}`}
              >
                {section.content.title}
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {(section.content.items?.length || 0) === 0 && (
                <div className="col-span-3 text-center py-12 bg-slate-100 rounded-xl text-slate-500">
                  Gallery section - Add images in edit mode
                </div>
              )}
              {section.content.items?.map((item) => (
                <div key={item.id} className="aspect-video bg-slate-200 rounded-xl flex items-center justify-center text-slate-400">
                  <Image className="w-12 h-12" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </EditableSection>
    );
  }

  return null;
}

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showSectionPanel, setShowSectionPanel] = useState(true);
  const { isAdmin, logout } = useAdmin();
  const { isEditMode, setEditMode, saveAllChanges, hasUnsavedChanges, getSectionOrder, isSectionVisible, getCustomSections, pendingChanges } = useContent();
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

  const sectionOrder = getSectionOrder();
  const customSections = getCustomSections();

  const renderSection = (sectionId: string) => {
    if (!isSectionVisible(sectionId) && !isEditMode) return null;
    
    if (sectionId.startsWith('custom-')) {
      const customSection = customSections.find(s => s.id === sectionId);
      if (customSection) {
        return <CustomSectionRenderer key={sectionId} section={customSection} />;
      }
      return null;
    }
    
    switch (sectionId) {
      case 'hero':
        return <HeroSection key={sectionId} scrollToSection={scrollToSection} />;
      case 'services':
        return <ServicesSection key={sectionId} />;
      case 'buyers':
        return <BuyersSection key={sectionId} scrollToSection={scrollToSection} />;
      case 'process':
        return <ProcessSection key={sectionId} />;
      case 'faq':
        return <FaqSection key={sectionId} openFaq={openFaq} toggleFaq={toggleFaq} />;
      case 'stories':
        return <StoriesSection key={sectionId} />;
      case 'contact':
        return <ContactSection key={sectionId} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
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
              <div className="text-blue-200 text-[10px]">
                Click text to edit • Hover for controls
              </div>
            </div>
          )}
        </div>
      )}

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

      <Navigation 
        scrollToSection={scrollToSection} 
        isMenuOpen={isMenuOpen} 
        toggleMenu={toggleMenu}
      />

      {sectionOrder.map((sectionId, index) => (
        <div key={sectionId}>
          {isEditMode && <InlineSectionAdder position={index} />}
          {renderSection(sectionId)}
        </div>
      ))}
      {isEditMode && <InlineSectionAdder position={sectionOrder.length} />}

      <Footer />
    </div>
  );
}

const serviceCategories = [
  { 
    id: 'sourcing',
    icon: Search,
    color: 'blue',
    title: 'Sourcing & Trade',
    subServices: [
      'Product Sourcing',
      'Factory Matching',
      'Sample Procurement',
      'Supplier Verification',
      'Price Negotiation',
      'OEM/ODM Solutions',
      'Bulk Order Management'
    ]
  },
  { 
    id: 'quality',
    icon: ShieldCheck,
    color: 'emerald',
    title: 'Quality & Inspection',
    subServices: [
      'Factory Audits',
      'Pre-Production Inspection',
      'During Production (DUPRO)',
      'Pre-Shipment Inspection (PSI)',
      'Product Testing & Certification',
      'Defect Analysis & Reporting'
    ]
  },
  { 
    id: 'interpretation',
    icon: Languages,
    color: 'violet',
    title: 'Interpretation & Support',
    subServices: [
      'Factory Visit Interpretation',
      'Trade Fair Accompaniment',
      'Business Meeting Translation',
      'Document Translation',
      'Video Call Interpretation',
      'Cultural Business Consulting'
    ]
  },
  { 
    id: 'company',
    icon: Building2,
    color: 'amber',
    title: 'Company Registration',
    subServices: [
      'WFOE Registration',
      'Business License Application',
      'Corporate Bank Account',
      'Work Visa & Residence Permit',
      'Registered Address Service',
      'Annual Compliance & Accounting'
    ]
  },
  { 
    id: 'experiences',
    icon: MapPin,
    color: 'rose',
    title: 'Guangdong Experiences',
    subServices: [
      'Guangzhou City Tours',
      'Shenzhen Tech Tours',
      'Premium Shopping',
      'Underground Market Adventures',
      'Cantonese Food & Culture',
      'Factory Town Visits',
      'Canton Fair VIP Assistance',
      'Custom Itinerary Planning'
    ]
  },
];

function Navigation({ scrollToSection, isMenuOpen, toggleMenu }: { 
  scrollToSection: (id: string) => void; 
  isMenuOpen: boolean; 
  toggleMenu: () => void;
}) {
  const { isEditMode } = useContent();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  
  return (
    <nav className="fixed w-full bg-white/95 backdrop-blur-md shadow-sm z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div 
            className="flex-shrink-0 flex items-center cursor-pointer" 
            onClick={() => window.scrollTo(0,0)}
            data-testid="link-logo"
          >
            <img 
              src="/logo.png" 
              alt="InterBridge Solutions Logo" 
              className="w-14 h-14 mr-3 object-contain"
            />
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
          
          <div className="hidden lg:flex items-center gap-0">
            {/* Service Category Dropdowns */}
            {serviceCategories.map((category) => {
              const IconComponent = category.icon;
              const isOpen = activeDropdown === category.id;
              const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
                blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
                emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
                violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200' },
                amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
                rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
              };
              const colors = colorClasses[category.color];
              
              return (
                <div
                  key={category.id}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(category.id)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    onClick={() => scrollToSection('services')}
                    className={`font-semibold transition-colors px-2.5 py-2 flex items-center gap-1.5 text-[15px] ${isOpen ? 'text-blue-700' : 'text-slate-800 hover:text-blue-700'}`}
                    data-testid={`nav-${category.id}`}
                  >
                    <IconComponent size={18} className={colors.text} />
                    {category.title.split(' ')[0]}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isOpen && (
                    <div className="absolute top-full left-0 pt-2 w-[320px] z-50">
                      <div className={`bg-white rounded-xl shadow-2xl border-2 ${colors.border} overflow-hidden`}>
                        <div className={`${colors.bg} px-5 py-4 border-b-2 ${colors.border}`}>
                          <div className="flex items-center gap-3">
                            <IconComponent size={24} className={colors.text} />
                            <h4 className={`font-bold text-lg ${colors.text}`}>{category.title}</h4>
                          </div>
                        </div>
                        <div className="p-3">
                          {category.subServices.map((service, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                scrollToSection('services');
                                setActiveDropdown(null);
                              }}
                              className="w-full text-left px-4 py-3 rounded-lg text-slate-800 hover:bg-slate-50 hover:text-blue-700 text-base font-medium flex items-center gap-3 transition-colors"
                            >
                              <CheckCircle2 size={18} className={colors.text} />
                              {service}
                            </button>
                          ))}
                        </div>
                        <div className={`${colors.bg} px-5 py-3 border-t-2 ${colors.border}`}>
                          <button 
                            onClick={() => {
                              scrollToSection('services');
                              setActiveDropdown(null);
                            }}
                            className={`${colors.text} font-bold text-base hover:underline flex items-center gap-2`}
                          >
                            View All Services <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* More Menu - combines For You, Process, FAQ */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('more')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button 
                className={`font-semibold transition-colors px-2.5 py-2 flex items-center gap-1.5 text-[15px] ${activeDropdown === 'more' ? 'text-blue-700' : 'text-slate-600 hover:text-blue-700'}`}
                data-testid="nav-more-dropdown"
              >
                More
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'more' ? 'rotate-180' : ''}`} />
              </button>
              
              {activeDropdown === 'more' && (
                <div className="absolute top-full right-0 pt-2 w-[240px] z-50">
                  <div className="bg-white rounded-xl shadow-2xl border-2 border-slate-200 p-3">
                    <button 
                      onClick={() => { scrollToSection('buyers'); setActiveDropdown(null); }}
                      className="w-full text-left px-4 py-3 rounded-lg text-slate-800 hover:bg-slate-50 hover:text-blue-700 font-bold text-base flex items-center gap-3"
                    >
                      <Users size={20} className="text-slate-500" />
                      For You
                    </button>
                    <button 
                      onClick={() => { scrollToSection('process'); setActiveDropdown(null); }}
                      className="w-full text-left px-4 py-3 rounded-lg text-slate-800 hover:bg-slate-50 hover:text-blue-700 font-bold text-base flex items-center gap-3"
                    >
                      <LayoutList size={20} className="text-slate-500" />
                      Our Process
                    </button>
                    <button 
                      onClick={() => { scrollToSection('faq'); setActiveDropdown(null); }}
                      className="w-full text-left px-4 py-3 rounded-lg text-slate-800 hover:bg-slate-50 hover:text-blue-700 font-bold text-base flex items-center gap-3"
                    >
                      <HelpCircle size={20} className="text-slate-500" />
                      FAQ & Pricing
                    </button>
                  </div>
                </div>
              )}
            </div>

            <EditableButton
              id="nav-cta"
              defaultText="Get a Quote"
              defaultLink="#contact"
              className="bg-blue-900 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-800 transition-all shadow-lg hover:shadow-blue-900/20 ml-2 text-sm"
            />
          </div>

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

      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 absolute w-full max-h-[80vh] overflow-y-auto">
          <div className="px-4 pt-2 pb-6 space-y-1 shadow-xl">
            {/* Mobile Services with Expandable Categories */}
            <div className="border-b border-slate-100 pb-2">
              <button 
                onClick={() => setExpandedMobileCategory(expandedMobileCategory === 'services' ? null : 'services')} 
                className="flex w-full items-center justify-between px-3 py-3 text-slate-800 font-semibold"
              >
                Services
                <ChevronDown className={`w-5 h-5 transition-transform ${expandedMobileCategory === 'services' ? 'rotate-180' : ''}`} />
              </button>
              
              {expandedMobileCategory === 'services' && (
                <div className="pl-3 space-y-1 pb-2">
                  {serviceCategories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          scrollToSection('services');
                          toggleMenu();
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2 text-left rounded-lg hover:bg-slate-50"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${category.color}-100 text-${category.color}-600`}>
                          <IconComponent size={16} />
                        </div>
                        <span className="text-slate-700 text-sm font-medium">{category.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button 
              onClick={() => { scrollToSection('buyers'); toggleMenu(); }} 
              className="block w-full text-left px-3 py-3 text-slate-600 font-medium border-b border-slate-50"
            >
              For You
            </button>
            <button 
              onClick={() => { scrollToSection('process'); toggleMenu(); }} 
              className="block w-full text-left px-3 py-3 text-slate-600 font-medium border-b border-slate-50"
            >
              Our Process
            </button>
            <button 
              onClick={() => { scrollToSection('faq'); toggleMenu(); }} 
              className="block w-full text-left px-3 py-3 text-slate-600 font-medium border-b border-slate-50"
            >
              FAQ & Pricing
            </button>
            <button 
              onClick={() => { scrollToSection('contact'); toggleMenu(); }} 
              className="block w-full text-left px-3 py-3 text-blue-700 font-bold"
            >
              Contact Us
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

function HeroSection({ scrollToSection }: { scrollToSection: (id: string) => void }) {
  const { isEditMode, isSectionVisible } = useContent();
  const visible = isSectionVisible('hero');

  return (
    <EditableSection id="hero" name="Hero">
      <section className={`relative pt-32 pb-20 lg:pt-48 lg:pb-32 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden ${!visible && isEditMode ? 'opacity-40' : ''}`}>
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <EditableContainer id="hero-badge-container" label="Badge">
                <div className="inline-flex items-center bg-blue-800/50 rounded-full px-4 py-1.5 border border-blue-700">
                  <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                  <EditableText
                    id="hero-badge"
                    defaultText="Bridging the Gap to Global Markets"
                    className="text-sm font-medium tracking-wide text-blue-100"
                    element="span"
                  />
                </div>
              </EditableContainer>
              
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
                <EditableButton
                  id="hero-cta-primary"
                  defaultText="Start Sourcing"
                  defaultLink="#contact"
                  className="bg-white text-blue-900 px-8 py-4 rounded-lg font-bold hover:bg-blue-50 transition-colors flex items-center justify-center"
                  icon={<ArrowRight className="ml-2" size={20} />}
                />
                <EditableButton
                  id="hero-cta-secondary"
                  defaultText="View Services"
                  defaultLink="#services"
                  className="border border-blue-400/30 bg-blue-900/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-900/40 transition-colors"
                />
              </div>
            </div>
            
            <div className="hidden lg:block relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-2xl blur opacity-30"></div>
              <div className="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700 p-8 rounded-2xl shadow-2xl">
                <div className="space-y-6">
                  <EditableContainer id="hero-card-1" label="Feature 1">
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
                  </EditableContainer>
                  
                  <div className="w-full h-px bg-slate-700"></div>
                  
                  <EditableContainer id="hero-card-2" label="Feature 2">
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
                          defaultText="Native-level Mandarin and English for confident deal-making."
                          element="p"
                          className="text-slate-300 text-sm mt-1"
                        />
                      </div>
                    </div>
                  </EditableContainer>
                  
                  <div className="w-full h-px bg-slate-700"></div>
                  
                  <EditableContainer id="hero-card-3" label="Feature 3">
                    <div className="flex items-start space-x-4">
                      <div className="bg-green-500/20 p-3 rounded-lg text-green-300">
                        <ShieldCheck size={32} />
                      </div>
                      <div>
                        <EditableText
                          id="hero-card-3-title"
                          defaultText="Quality Assurance"
                          element="h3"
                          className="text-xl font-bold text-white"
                        />
                        <EditableText
                          id="hero-card-3-desc"
                          defaultText="On-site inspections before shipment to protect your investment."
                          element="p"
                          className="text-slate-300 text-sm mt-1"
                        />
                      </div>
                    </div>
                  </EditableContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </EditableSection>
  );
}

function ServicesSection() {
  const { isEditMode, isSectionVisible } = useContent();
  const visible = isSectionVisible('services');
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

  const serviceCategories = [
    { 
      id: 'cat-sourcing', 
      icon: <Search size={32} />, 
      gradient: 'from-blue-500 to-blue-700',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      title: 'Sourcing & Trade',
      desc: 'Find reliable factories and get the best deals, from samples to bulk orders.',
      subServices: [
        'Product Sourcing - Finding factories & suppliers',
        'Factory Matching - Verified manufacturers',
        'Sample Procurement - Order & ship samples',
        'Supplier Verification - Background checks',
        'Price Negotiation - Best factory-direct prices',
        'OEM/ODM Solutions - Custom manufacturing',
        'Bulk Order Management - Large-scale purchases'
      ]
    },
    { 
      id: 'cat-quality', 
      icon: <ShieldCheck size={32} />, 
      gradient: 'from-emerald-500 to-emerald-700',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
      title: 'Quality & Inspection',
      desc: 'Protect your investment with thorough quality checks at every stage.',
      subServices: [
        'Factory Audits - On-site assessments',
        'Pre-Production Inspection - Material checks',
        'During Production (DUPRO) - Mid-production QC',
        'Pre-Shipment Inspection (PSI) - Final verification',
        'Product Testing & Certification - Lab testing',
        'Defect Analysis & Reporting - Documentation'
      ]
    },
    { 
      id: 'cat-interpretation', 
      icon: <Languages size={32} />, 
      gradient: 'from-violet-500 to-violet-700',
      bgLight: 'bg-violet-50',
      textColor: 'text-violet-600',
      borderColor: 'border-violet-200',
      title: 'Interpretation & Support',
      desc: 'Bridge the language gap with professional bilingual assistance.',
      subServices: [
        'Factory Visit Interpretation - On-site translators',
        'Trade Fair Accompaniment - Canton Fair, Yiwu Fair',
        'Business Meeting Translation - Live interpretation',
        'Document Translation - Contracts, specs, invoices',
        'Video Call Interpretation - Remote translation',
        'Cultural Business Consulting - Chinese etiquette'
      ]
    },
    { 
      id: 'cat-company', 
      icon: <Building2 size={32} />, 
      gradient: 'from-amber-500 to-amber-700',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-200',
      title: 'Company Registration',
      desc: 'Set up your business in China with expert guidance and full support.',
      subServices: [
        'WFOE Registration - Foreign-Owned Enterprise',
        'Business License Application - Permits & licenses',
        'Corporate Bank Account - Chinese & offshore',
        'Work Visa & Residence Permit - Z-visa processing',
        'Registered Address Service - Guangzhou/Shenzhen',
        'Annual Compliance & Accounting - Tax filing'
      ]
    },
    { 
      id: 'cat-experiences', 
      icon: <MapPin size={32} />, 
      gradient: 'from-rose-500 to-rose-700',
      bgLight: 'bg-rose-50',
      textColor: 'text-rose-600',
      borderColor: 'border-rose-200',
      title: 'Guangdong Experiences',
      desc: 'Discover the region with curated tours, markets, and local insights.',
      subServices: [
        'Guangzhou City Tours - Historic sites & food',
        'Shenzhen Tech Tours - Electronics & innovation',
        'Premium Shopping - High-end malls & wholesale',
        'Underground Market Adventures - Exclusive access',
        'Cantonese Food & Culture - Dim sum trails',
        'Factory Town Visits - Dongguan, Foshan',
        'Canton Fair VIP Assistance - Full support',
        'Custom Itinerary Planning - Business + leisure'
      ]
    },
  ];

  return (
    <EditableSection id="services" name="Services">
      <section id="services" className={`py-24 bg-gradient-to-b from-white to-slate-50 ${!visible && isEditMode ? 'opacity-40' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <EditableText
              id="services-badge"
              defaultText="Our Services"
              className="text-blue-700 font-bold uppercase tracking-widest text-sm"
              element="span"
            />
            <EditableText
              id="services-title"
              defaultText="Everything You Need to Succeed in China"
              element="h2"
              className="text-4xl font-extrabold text-slate-900 mt-4"
            />
            <EditableText
              id="services-subtitle"
              defaultText="From sourcing products to setting up your company, we're your complete partner for doing business in China."
              element="p"
              className="text-slate-600 text-lg mt-4 max-w-3xl mx-auto"
            />
          </div>

          {/* Main 5 Category Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {serviceCategories.slice(0, 3).map((category, i) => (
              <EditableContainer key={category.id} id={category.id} label={category.title}>
                <div 
                  className={`relative rounded-2xl p-6 transition-all duration-300 cursor-pointer group h-full border-2 ${
                    expandedCategory === i 
                      ? `${category.borderColor} shadow-xl` 
                      : 'border-transparent hover:border-slate-200 hover:shadow-lg'
                  } bg-white`}
                  onClick={() => setExpandedCategory(expandedCategory === i ? null : i)}
                  data-testid={`category-card-${i}`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-2 rounded-t-2xl bg-gradient-to-r ${category.gradient}`} />
                  
                  <div className="flex items-start gap-4 mt-2">
                    <div className={`${category.bgLight} w-14 h-14 rounded-xl flex items-center justify-center ${category.textColor} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      {category.icon}
                    </div>
                    <div className="flex-1">
                      <EditableText
                        id={`${category.id}-title`}
                        defaultText={category.title}
                        element="h3"
                        className="text-xl font-bold text-slate-900 mb-1"
                      />
                      <EditableText
                        id={`${category.id}-desc`}
                        defaultText={category.desc}
                        element="p"
                        className="text-slate-600 text-sm leading-relaxed"
                      />
                    </div>
                    <ChevronDown 
                      className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${expandedCategory === i ? 'rotate-180' : ''}`} 
                    />
                  </div>

                  {expandedCategory === i && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <ul className="space-y-2">
                        {category.subServices.map((service, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                            <CheckCircle2 className={`w-4 h-4 ${category.textColor} flex-shrink-0 mt-0.5`} />
                            <span>{service}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </EditableContainer>
            ))}
          </div>

          {/* Bottom 2 Category Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {serviceCategories.slice(3, 5).map((category, idx) => {
              const i = idx + 3;
              return (
                <EditableContainer key={category.id} id={category.id} label={category.title}>
                  <div 
                    className={`relative rounded-2xl p-6 transition-all duration-300 cursor-pointer group h-full border-2 ${
                      expandedCategory === i 
                        ? `${category.borderColor} shadow-xl` 
                        : 'border-transparent hover:border-slate-200 hover:shadow-lg'
                    } bg-white`}
                    onClick={() => setExpandedCategory(expandedCategory === i ? null : i)}
                    data-testid={`category-card-${i}`}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-2 rounded-t-2xl bg-gradient-to-r ${category.gradient}`} />
                    
                    <div className="flex items-start gap-4 mt-2">
                      <div className={`${category.bgLight} w-14 h-14 rounded-xl flex items-center justify-center ${category.textColor} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        {category.icon}
                      </div>
                      <div className="flex-1">
                        <EditableText
                          id={`${category.id}-title`}
                          defaultText={category.title}
                          element="h3"
                          className="text-xl font-bold text-slate-900 mb-1"
                        />
                        <EditableText
                          id={`${category.id}-desc`}
                          defaultText={category.desc}
                          element="p"
                          className="text-slate-600 text-sm leading-relaxed"
                        />
                      </div>
                      <ChevronDown 
                        className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${expandedCategory === i ? 'rotate-180' : ''}`} 
                      />
                    </div>

                    {expandedCategory === i && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <ul className="space-y-2">
                          {category.subServices.map((service, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                              <CheckCircle2 className={`w-4 h-4 ${category.textColor} flex-shrink-0 mt-0.5`} />
                              <span>{service}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </EditableContainer>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <EditableButton
              id="services-cta"
              defaultText="Let's Discuss Your Needs"
              defaultLink="#contact"
              className="bg-blue-900 text-white px-8 py-4 rounded-lg font-bold hover:bg-blue-800 transition-colors inline-flex items-center shadow-lg hover:shadow-xl"
              icon={<ArrowRight className="ml-2" size={20} />}
            />
          </div>
        </div>
      </section>
    </EditableSection>
  );
}

function BuyersSection({ scrollToSection }: { scrollToSection: (id: string) => void }) {
  const { isEditMode, isSectionVisible } = useContent();
  const visible = isSectionVisible('buyers');

  const buyerTypes = [
    { id: 'buyer-1', icon: <Package size={32} />, color: 'emerald' },
    { id: 'buyer-2', icon: <TrendingUp size={32} />, color: 'blue' },
    { id: 'buyer-3', icon: <Star size={32} />, color: 'amber' },
  ];

  const defaultBuyers = [
    { title: 'Small Businesses', subtitle: '50-500 MOQ', desc: 'Need a reliable partner for smaller orders? We work with factories that accommodate lower minimums without compromising quality.' },
    { title: 'Growing Brands', subtitle: '500-5000 MOQ', desc: 'Scaling up? We help you find the right balance of price, quality, and capacity as your order volumes grow.' },
    { title: 'Established Enterprises', subtitle: '5000+ MOQ', desc: 'For large-scale production, we negotiate enterprise-level pricing and ensure consistent quality across bulk orders.' },
  ];

  return (
    <EditableSection id="buyers" name="For Buyers">
      <section id="buyers" className={`py-24 bg-slate-50 ${!visible && isEditMode ? 'opacity-40' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <EditableText
              id="buyers-badge"
              defaultText="Who We Serve"
              className="text-blue-700 font-bold uppercase tracking-widest text-sm"
              element="span"
            />
            <EditableText
              id="buyers-title"
              defaultText="Built for Businesses Like Yours"
              element="h2"
              className="text-4xl font-extrabold text-slate-900 mt-4"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {buyerTypes.map((buyer, i) => (
              <EditableContainer key={buyer.id} id={buyer.id} label={`Buyer ${i + 1}`}>
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 hover:border-blue-200 transition-all group h-full">
                  <div className={`bg-${buyer.color}-100 w-16 h-16 rounded-xl flex items-center justify-center text-${buyer.color}-600 mb-6`}>
                    {buyer.icon}
                  </div>
                  <EditableText
                    id={`${buyer.id}-title`}
                    defaultText={defaultBuyers[i].title}
                    element="h3"
                    className="text-2xl font-bold text-slate-900 mb-2"
                  />
                  <EditableText
                    id={`${buyer.id}-subtitle`}
                    defaultText={defaultBuyers[i].subtitle}
                    element="span"
                    className="text-blue-600 font-semibold text-sm"
                  />
                  <EditableText
                    id={`${buyer.id}-desc`}
                    defaultText={defaultBuyers[i].desc}
                    element="p"
                    className="text-slate-600 mt-4 leading-relaxed"
                  />
                </div>
              </EditableContainer>
            ))}
          </div>

          <div className="text-center mt-12">
            <EditableButton
              id="buyers-cta"
              defaultText="Discuss Your Needs"
              defaultLink="#contact"
              className="bg-blue-900 text-white px-8 py-4 rounded-lg font-bold hover:bg-blue-800 transition-colors inline-flex items-center"
              icon={<ArrowRight className="ml-2" size={20} />}
            />
          </div>
        </div>
      </section>
    </EditableSection>
  );
}

function ProcessSection() {
  const { isEditMode, isSectionVisible } = useContent();
  const visible = isSectionVisible('process');

  const steps = [
    { id: 'step-1', icon: <FileText size={24} />, num: '01' },
    { id: 'step-2', icon: <Search size={24} />, num: '02' },
    { id: 'step-3', icon: <Users size={24} />, num: '03' },
    { id: 'step-4', icon: <ShieldCheck size={24} />, num: '04' },
    { id: 'step-5', icon: <Ship size={24} />, num: '05' },
  ];

  const defaultSteps = [
    { title: 'Share Your Requirements', desc: 'Tell us about your product, target price, and quantity.' },
    { title: 'Factory Matching', desc: 'We screen and shortlist factories that fit your criteria.' },
    { title: 'Negotiation & Samples', desc: 'We negotiate terms and arrange sample production.' },
    { title: 'Quality Inspection', desc: 'Pre-shipment checks ensure your order meets standards.' },
    { title: 'Logistics & Delivery', desc: 'We coordinate shipping to get your goods delivered.' },
  ];

  return (
    <EditableSection id="process" name="Process">
      <section id="process" className={`py-24 bg-white ${!visible && isEditMode ? 'opacity-40' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <EditableText
              id="process-badge"
              defaultText="How It Works"
              className="text-blue-700 font-bold uppercase tracking-widest text-sm"
              element="span"
            />
            <EditableText
              id="process-title"
              defaultText="Simple, Transparent Process"
              element="h2"
              className="text-4xl font-extrabold text-slate-900 mt-4"
            />
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 -translate-y-1/2"></div>
            
            <div className="grid lg:grid-cols-5 gap-8">
              {steps.map((step, i) => (
                <EditableContainer key={step.id} id={step.id} label={`Step ${i + 1}`}>
                  <div className="relative bg-white rounded-xl p-6 text-center lg:pt-16">
                    <div className="lg:absolute lg:top-0 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 bg-blue-900 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg mx-auto mb-4 lg:mb-0">
                      {step.num}
                    </div>
                    <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 mx-auto mb-4">
                      {step.icon}
                    </div>
                    <EditableText
                      id={`${step.id}-title`}
                      defaultText={defaultSteps[i].title}
                      element="h3"
                      className="font-bold text-slate-900 mb-2"
                    />
                    <EditableText
                      id={`${step.id}-desc`}
                      defaultText={defaultSteps[i].desc}
                      element="p"
                      className="text-slate-600 text-sm"
                    />
                  </div>
                </EditableContainer>
              ))}
            </div>
          </div>
        </div>
      </section>
    </EditableSection>
  );
}

function FaqSection({ openFaq, toggleFaq }: { openFaq: number | null; toggleFaq: (i: number) => void }) {
  const { isEditMode, isSectionVisible } = useContent();
  const visible = isSectionVisible('faq');

  const faqs = [
    { id: 'faq-1' },
    { id: 'faq-2' },
    { id: 'faq-3' },
    { id: 'faq-4' },
    { id: 'faq-5' },
  ];

  const defaultFaqs = [
    { q: 'What are your service fees?', a: 'Our fees vary based on the scope of work. Sourcing typically starts at 5-8% of order value, with fixed fees for interpretation and QC services. Contact us for a custom quote.' },
    { q: 'Do you handle shipping and customs?', a: 'We coordinate with trusted freight forwarders and can manage the logistics process. We also provide guidance on customs documentation.' },
    { q: 'What if I need a very small order?', a: 'We work with factories that accept lower MOQs. While pricing per unit may be higher, we can still find quality suppliers for orders as low as 50 units.' },
    { q: 'How do I know the factory is reliable?', a: 'We conduct thorough background checks, including business licenses, production capacity, and past export history. We also arrange factory visits when possible.' },
    { q: 'Can you help with product development?', a: 'Yes! We support OEM/ODM projects from concept to production, including design refinement, sampling, and manufacturing.' },
  ];

  return (
    <EditableSection id="faq" name="FAQ">
      <section id="faq" className={`py-24 bg-slate-50 ${!visible && isEditMode ? 'opacity-40' : ''}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <EditableText
              id="faq-badge"
              defaultText="Questions & Answers"
              className="text-blue-700 font-bold uppercase tracking-widest text-sm"
              element="span"
            />
            <EditableText
              id="faq-title"
              defaultText="Frequently Asked Questions"
              element="h2"
              className="text-4xl font-extrabold text-slate-900 mt-4"
            />
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <EditableContainer key={faq.id} id={faq.id} label={`FAQ ${i + 1}`}>
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between"
                    data-testid={`faq-toggle-${i}`}
                  >
                    <EditableText
                      id={`${faq.id}-q`}
                      defaultText={defaultFaqs[i].q}
                      element="span"
                      className="font-bold text-slate-900"
                    />
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5">
                      <EditableText
                        id={`${faq.id}-a`}
                        defaultText={defaultFaqs[i].a}
                        element="p"
                        className="text-slate-600 leading-relaxed"
                      />
                    </div>
                  )}
                </div>
              </EditableContainer>
            ))}
          </div>
        </div>
      </section>
    </EditableSection>
  );
}

function StoriesSection() {
  const { isEditMode, isSectionVisible } = useContent();
  const visible = isSectionVisible('stories');

  const stories = [
    { id: 'story-1' },
    { id: 'story-2' },
    { id: 'story-3' },
  ];

  const defaultStories = [
    { quote: 'InterBridge helped us find a reliable electronics manufacturer when our previous supplier fell through. Their bilingual negotiation saved us 15% on production costs.', author: 'Sarah K.', role: 'Tech Startup Founder' },
    { quote: 'As a small business owner, I was intimidated by the idea of sourcing from China. InterBridge made the entire process smooth and transparent.', author: 'Michael R.', role: 'E-commerce Entrepreneur' },
    { quote: 'The quality control inspections gave us peace of mind. We\'ve never had a shipment issue since working with InterBridge.', author: 'Jennifer L.', role: 'Product Manager' },
  ];

  return (
    <EditableSection id="stories" name="Stories">
      <section id="stories" className={`py-24 bg-white relative overflow-hidden ${!visible && isEditMode ? 'opacity-40' : ''}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <EditableText
              id="stories-badge"
              defaultText="Client Success"
              className="text-blue-700 font-bold uppercase tracking-widest text-sm"
              element="span"
            />
            <EditableText
              id="stories-title"
              defaultText="What Our Clients Say"
              element="h2"
              className="text-4xl font-extrabold text-slate-900 mt-4"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {stories.map((story, i) => (
              <EditableContainer key={story.id} id={story.id} label={`Story ${i + 1}`}>
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 h-full flex flex-col">
                  <Quote className="w-10 h-10 text-blue-200 mb-4" />
                  <EditableText
                    id={`${story.id}-quote`}
                    defaultText={defaultStories[i].quote}
                    element="p"
                    className="text-slate-600 leading-relaxed flex-grow"
                  />
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <EditableText
                      id={`${story.id}-author`}
                      defaultText={defaultStories[i].author}
                      element="span"
                      className="font-bold text-slate-900"
                    />
                    <EditableText
                      id={`${story.id}-role`}
                      defaultText={defaultStories[i].role}
                      element="p"
                      className="text-slate-500 text-sm"
                    />
                  </div>
                </div>
              </EditableContainer>
            ))}
          </div>
        </div>
      </section>
    </EditableSection>
  );
}

function ContactSection() {
  const { isEditMode, isSectionVisible } = useContent();
  const visible = isSectionVisible('contact');

  return (
    <EditableSection id="contact" name="Contact">
      <section id="contact" className={`py-24 bg-slate-900 text-white ${!visible && isEditMode ? 'opacity-40' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <EditableText
                id="contact-badge"
                defaultText="Get In Touch"
                className="text-blue-400 font-bold uppercase tracking-widest text-sm"
                element="span"
              />
              <EditableText
                id="contact-title"
                defaultText="Ready to Start Sourcing?"
                element="h2"
                className="text-4xl font-extrabold mt-4 mb-6"
              />
              <EditableText
                id="contact-description"
                defaultText="Tell us about your product needs and we'll get back to you within 24 hours with a personalized plan."
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
                      <EditableText
                        id="contact-email"
                        defaultText="Moda232320315@gmail.com"
                        className="text-lg font-semibold"
                      />
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
                      <EditableText
                        id="contact-phone"
                        defaultText="+86 15325467680"
                        className="text-lg font-semibold"
                      />
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
                      <EditableText
                        id="contact-location"
                        defaultText="Guangzhou, China"
                        className="text-lg font-semibold"
                      />
                    </div>
                  </div>
                </EditableContainer>

                {/* Social Contact Options */}
                <div className="pt-6 mt-6 border-t border-slate-700">
                  <div className="text-sm text-slate-400 mb-4">Connect With Us</div>
                  <div className="flex flex-wrap gap-3">
                    {/* WhatsApp */}
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
                    
                    {/* WeChat */}
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
                    
                    {/* TikTok */}
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

            <div className="bg-white rounded-2xl p-8 text-slate-800">
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

function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <img 
              src="/logo.png" 
              alt="InterBridge Solutions Logo" 
              className="w-10 h-10 mr-2 object-contain"
            />
            <span className="font-bold text-white">InterBridge Trans & Trade</span>
          </div>
          <EditableText
            id="footer-copyright"
            defaultText="© 2024 InterBridge Trans & Trade. All rights reserved."
            element="p"
            className="text-sm"
          />
        </div>
      </div>
    </footer>
  );
}
