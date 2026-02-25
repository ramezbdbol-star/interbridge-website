import { EditableSection, EditableText } from "@/components/EditableComponents";
import { useContent } from "@/lib/contentContext";
import { BookNowForm } from "@/components/forms/BookNowForm";

export function BookNowSection() {
  const { isEditMode, isSectionVisible } = useContent();
  const visible = isSectionVisible("book-now");

  return (
    <EditableSection id="book-now" name="Book Now">
      <section
        id="book-now"
        className={`bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-20 lg:py-24 ${
          !visible && isEditMode ? "opacity-40" : ""
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <EditableText
              id="book-now-badge"
              defaultText="BOOK NOW"
              className="inline-flex rounded-full border border-blue-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700"
              element="span"
            />
            <EditableText
              id="book-now-title"
              defaultText="Schedule Your Session"
              className="mt-4 block text-3xl font-extrabold text-slate-900 sm:text-4xl"
              element="h2"
            />
            <EditableText
              id="book-now-description"
              defaultText="Choose your preferred time and submit a request. We confirm only after manual approval, then your calendar invite is sent."
              className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg"
              element="p"
            />
          </div>

          <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <BookNowForm />
          </div>
        </div>
      </section>
    </EditableSection>
  );
}
