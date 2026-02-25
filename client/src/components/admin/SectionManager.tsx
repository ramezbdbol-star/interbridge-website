import { useState, useRef, useEffect } from 'react';
import { useContent, type CustomSection } from '@/lib/contentContext';
import { useToast } from '@/hooks/use-toast';
import {
  Eye,
  EyeOff,
  Layers,
  X,
  ChevronDown,
  Plus,
  Trash2,
  Copy,
  Type,
  Grid3X3,
  MessageSquare,
  Image,
  Megaphone,
} from 'lucide-react';

export function SectionManager({ onClose }: { onClose: () => void }) {
  const {
    getSectionOrder,
    isSectionVisible,
    toggleSectionVisibility,
    moveSectionUp,
    moveSectionDown,
    getCustomSections,
    addCustomSection,
    deleteCustomSection,
    duplicateSection,
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
    process: 'Our Process',
    faq: 'FAQ & Pricing',
    reviews: 'Client Reviews',
    'book-now': 'Book Now',
    contact: 'Contact',
  };

  const getSectionName = (sectionId: string) => {
    if (sectionNames[sectionId]) return sectionNames[sectionId];
    const custom = customSections.find((s) => s.id === sectionId);
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
    const name = sectionTypes.find((t) => t.type === type)?.name || 'New Section';
    addCustomSection(type, name);
    setShowAddMenu(false);
    toast({
      title: 'Section Added',
      description: `New ${name} section has been created. Don't forget to save!`,
    });
  };

  const handleDeleteSection = (sectionId: string) => {
    deleteCustomSection(sectionId);
    toast({
      title: 'Section Deleted',
      description: "Section has been removed. Don't forget to save!",
    });
  };

  const handleDuplicateSection = (sectionId: string) => {
    duplicateSection(sectionId);
    toast({
      title: 'Section Duplicated',
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
              <span
                className={`flex-1 text-xs font-medium truncate ${visible ? 'text-slate-700' : 'text-red-500 line-through'}`}
              >
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
