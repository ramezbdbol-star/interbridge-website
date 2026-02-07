import { useState } from 'react';
import { useContent } from '@/lib/contentContext';
import { EditableSection, EditableText, EditableButton, EditableContainer } from '@/components/EditableComponents';
import { serviceCategories } from '@/data/serviceData';
import { getTheme } from '@/data/serviceThemes';
import { ChevronDown, CheckCircle2, ArrowRight } from 'lucide-react';

export function ServicesOverview() {
  const { isEditMode, isSectionVisible } = useContent();
  const visible = isSectionVisible('services');
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

  // The 5 main service categories (expandable cards)
  const mainCategories = serviceCategories.slice(0, 5);
  // The 2 specialty services (Trade Guard + Furniture) shown as link cards
  const specialtyCategories = serviceCategories.slice(5, 7);

  return (
    <EditableSection id="services" name="Services">
      <section
        id="services"
        className={`py-20 lg:py-24 bg-gradient-to-b from-white to-slate-50 ${!visible && isEditMode ? 'opacity-40' : ''}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-14">
            <EditableText
              id="services-badge"
              defaultText="Our Services"
              className="text-blue-700 font-bold uppercase tracking-widest text-sm"
              element="span"
            />
            <EditableText
              id="services-title"
              defaultText="How We Help You Succeed in China"
              element="h2"
              className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4"
            />
            <EditableText
              id="services-subtitle"
              defaultText="From sourcing products to setting up your company, we're your complete partner for doing business in China."
              element="p"
              className="text-slate-600 text-lg mt-4 max-w-3xl mx-auto"
            />
          </div>

          {/* Main 5 Categories - Top 3 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {mainCategories.slice(0, 3).map((category, i) => {
              const theme = getTheme(category.color);
              const IconComponent = category.icon;
              const isExpanded = expandedCategory === i;

              return (
                <EditableContainer key={category.id} id={`cat-${category.id}`} label={category.title}>
                  <div
                    className={`relative rounded-2xl p-6 transition-all duration-300 cursor-pointer group h-full border-2 ${
                      isExpanded
                        ? `${theme.borderColor} shadow-xl`
                        : 'border-transparent hover:border-slate-200 hover:shadow-lg'
                    } bg-white`}
                    onClick={() => setExpandedCategory(isExpanded ? null : i)}
                    data-testid={`category-card-${i}`}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl bg-gradient-to-r ${theme.gradient}`} />

                    <div className="flex items-start gap-4 mt-2">
                      <div
                        className={`${theme.bgLight} w-14 h-14 rounded-xl flex items-center justify-center ${theme.text} flex-shrink-0 group-hover:scale-110 transition-transform`}
                      >
                        <IconComponent size={28} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <EditableText
                          id={`cat-${category.id}-title`}
                          defaultText={category.title}
                          element="h3"
                          className="text-xl font-bold text-slate-900 mb-1"
                        />
                        <EditableText
                          id={`cat-${category.id}-desc`}
                          defaultText={category.description}
                          element="p"
                          className="text-slate-600 text-sm leading-relaxed"
                        />
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <ul className="space-y-2">
                          {category.subServices.map((service, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                              <CheckCircle2 className={`w-4 h-4 ${theme.text} flex-shrink-0 mt-0.5`} />
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

          {/* Main 5 Categories - Bottom 2 */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {mainCategories.slice(3, 5).map((category, idx) => {
              const i = idx + 3;
              const theme = getTheme(category.color);
              const IconComponent = category.icon;
              const isExpanded = expandedCategory === i;

              return (
                <EditableContainer key={category.id} id={`cat-${category.id}`} label={category.title}>
                  <div
                    className={`relative rounded-2xl p-6 transition-all duration-300 cursor-pointer group h-full border-2 ${
                      isExpanded
                        ? `${theme.borderColor} shadow-xl`
                        : 'border-transparent hover:border-slate-200 hover:shadow-lg'
                    } bg-white`}
                    onClick={() => setExpandedCategory(isExpanded ? null : i)}
                    data-testid={`category-card-${i}`}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl bg-gradient-to-r ${theme.gradient}`} />

                    <div className="flex items-start gap-4 mt-2">
                      <div
                        className={`${theme.bgLight} w-14 h-14 rounded-xl flex items-center justify-center ${theme.text} flex-shrink-0 group-hover:scale-110 transition-transform`}
                      >
                        <IconComponent size={28} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <EditableText
                          id={`cat-${category.id}-title`}
                          defaultText={category.title}
                          element="h3"
                          className="text-xl font-bold text-slate-900 mb-1"
                        />
                        <EditableText
                          id={`cat-${category.id}-desc`}
                          defaultText={category.description}
                          element="p"
                          className="text-slate-600 text-sm leading-relaxed"
                        />
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <ul className="space-y-2">
                          {category.subServices.map((service, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                              <CheckCircle2 className={`w-4 h-4 ${theme.text} flex-shrink-0 mt-0.5`} />
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

          {/* Specialty Services - Trade Guard + Furniture */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {specialtyCategories.map((category) => {
              const theme = getTheme(category.color);
              const IconComponent = category.icon;
              const sectionTarget = category.id;

              return (
                <a
                  key={category.id}
                  href={`#${sectionTarget}`}
                  className={`relative rounded-2xl p-6 transition-all duration-300 group border-2 border-transparent hover:border-slate-200 hover:shadow-lg bg-white flex items-center gap-4`}
                  data-testid={`specialty-card-${category.id}`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl bg-gradient-to-r ${theme.gradient}`} />
                  <div
                    className={`${theme.bgLight} w-14 h-14 rounded-xl flex items-center justify-center ${theme.text} flex-shrink-0 group-hover:scale-110 transition-transform`}
                  >
                    <IconComponent size={28} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{category.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{category.description}</p>
                  </div>
                  <ArrowRight className={`w-5 h-5 ${theme.text} flex-shrink-0 group-hover:translate-x-1 transition-transform`} />
                </a>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center">
            <EditableButton
              id="services-cta"
              defaultText="Get a Free Quote"
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
