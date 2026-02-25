import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'wouter';
import { useContent } from '@/lib/contentContext';
import { EditableSection, EditableText, EditableButton, EditableContainer } from '@/components/EditableComponents';
import { serviceCategories, getServicePath } from '@/data/serviceData';
import { getTheme } from '@/data/serviceThemes';

export function ServicesOverview() {
  const { isEditMode, isSectionVisible } = useContent();
  const visible = isSectionVisible('services');

  return (
    <EditableSection id="services" name="Services">
      <section
        id="services"
        className={`py-20 lg:py-24 bg-gradient-to-b from-white to-slate-50 ${!visible && isEditMode ? 'opacity-40' : ''}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              defaultText="Discover what we provide at a glance, then open each service page for full details, workflows, and next steps."
              element="p"
              className="text-slate-600 text-lg mt-4 max-w-3xl mx-auto"
            />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {serviceCategories.map((category) => {
              const theme = getTheme(category.color);
              const IconComponent = category.icon;
              const detailPath = getServicePath(category);

              return (
                <EditableContainer key={category.id} id={`service-preview-${category.id}`} label={category.title}>
                  <div className="relative h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                    <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl bg-gradient-to-r ${theme.gradient}`} />

                    <div className="mt-2 flex items-start gap-4">
                      <div className={`${theme.bgLight} ${theme.text} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <IconComponent size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{category.title}</h3>
                        <p className="text-slate-600 text-sm mt-1 leading-relaxed">{category.description}</p>
                      </div>
                    </div>

                    <ul className="mt-5 space-y-2">
                      {category.previewPoints.slice(0, 3).map((point) => (
                        <li key={point} className="flex items-start gap-2 text-sm text-slate-600">
                          <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${theme.text}`} />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={detailPath}
                      className={`mt-6 inline-flex items-center gap-2 text-sm font-semibold ${theme.text} hover:underline`}
                      data-testid={`service-preview-link-${category.id}`}
                    >
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </EditableContainer>
              );
            })}
          </div>

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
