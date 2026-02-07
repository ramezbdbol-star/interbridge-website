import { useState } from 'react';
import { useContent } from '@/lib/contentContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Type, Grid3X3, Megaphone, MessageSquare, Image } from 'lucide-react';

export function InlineSectionAdder({ position }: { position: number }) {
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
    const name = sectionTypes.find((t) => t.type === type)?.name || 'New Section';
    insertSectionAt(position, type, name);
    setShowMenu(false);
    setIsHovered(false);
    toast({
      title: 'Section Added',
      description: `New ${name} section has been created here. Don't forget to save!`,
    });
  };

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowMenu(false);
      }}
    >
      <div className={`flex items-center justify-center py-2 transition-all duration-200 ${isHovered ? 'py-4' : ''}`}>
        <div
          className={`flex items-center w-full max-w-4xl mx-auto px-4 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        >
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
