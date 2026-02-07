import { useContent, type CustomSection } from '@/lib/contentContext';
import { EditableSection, EditableButton } from '@/components/EditableComponents';
import { Quote, Image, ArrowRight } from 'lucide-react';

export function CustomSectionRenderer({ section }: { section: CustomSection }) {
  const { isEditMode, isSectionVisible, updateCustomSection } = useContent();
  const visible = isSectionVisible(section.id);

  const bgClasses = {
    white: 'bg-white',
    slate: 'bg-slate-50',
    dark: 'bg-slate-900 text-white',
  };

  const bgClass = bgClasses[section.content.backgroundColor || 'white'];

  const handleTitleChange = (newTitle: string) => {
    updateCustomSection(section.id, {
      content: { ...section.content, title: newTitle },
    });
  };

  const handleDescChange = (newDesc: string) => {
    updateCustomSection(section.id, {
      content: { ...section.content, description: newDesc },
    });
  };

  const handleSubtitleChange = (newSubtitle: string) => {
    updateCustomSection(section.id, {
      content: { ...section.content, subtitle: newSubtitle },
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
              {section.content.items?.map((item) => (
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
        <section
          className={`py-20 bg-gradient-to-r from-blue-900 to-slate-900 text-white ${!visible && isEditMode ? 'opacity-40' : ''}`}
        >
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
                <div
                  key={item.id}
                  className="aspect-video bg-slate-200 rounded-xl flex items-center justify-center text-slate-400"
                >
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
