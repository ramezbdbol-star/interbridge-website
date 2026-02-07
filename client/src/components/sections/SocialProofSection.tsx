import { useContent } from '@/lib/contentContext';
import { EditableSection, EditableText, EditableContainer } from '@/components/EditableComponents';
import { useQuery } from '@tanstack/react-query';
import { Star, Quote, MessageSquare } from 'lucide-react';

export function SocialProofSection() {
  const { isEditMode, isSectionVisible } = useContent();
  const visible = isSectionVisible('reviews');

  const { data: reviews = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/reviews/approved'],
  });

  // Hardcoded fallback stories (preserved EditableText IDs from original StoriesSection)
  const stories = [
    { id: 'story-1' },
    { id: 'story-2' },
    { id: 'story-3' },
  ];

  const defaultStories = [
    {
      quote:
        'InterBridge helped us find a reliable electronics manufacturer when our previous supplier fell through. Their bilingual negotiation saved us 15% on production costs.',
      author: 'Sarah K.',
      role: 'Tech Startup Founder',
    },
    {
      quote:
        'As a small business owner, I was intimidated by the idea of sourcing from China. InterBridge made the entire process smooth and transparent.',
      author: 'Michael R.',
      role: 'E-commerce Entrepreneur',
    },
    {
      quote:
        "The quality control inspections gave us peace of mind. We've never had a shipment issue since working with InterBridge.",
      author: 'Jennifer L.',
      role: 'Product Manager',
    },
  ];

  const serviceLabels: Record<string, string> = {
    sourcing: 'Product Sourcing',
    quality: 'Quality Assurance',
    interpretation: 'Translation',
    business: 'Business Services',
    guangdong: 'China Tours',
    multiple: 'Multiple Services',
  };

  if (!visible && !isEditMode) return null;
  if (isLoading) return null;

  const hasReviews = reviews.length > 0;

  return (
    <EditableSection id="reviews" name="Client Reviews">
      <section
        id="reviews"
        className={`py-20 lg:py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden ${!visible && isEditMode ? 'opacity-40' : ''}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-14">
            <EditableText
              id="stories-badge"
              defaultText="Client Reviews"
              className="text-blue-700 font-bold uppercase tracking-widest text-sm"
              element="span"
            />
            <EditableText
              id="stories-title"
              defaultText="What Our Clients Say"
              element="h2"
              className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4"
            />
          </div>

          {/* Dynamic reviews from API */}
          {hasReviews && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {reviews.slice(0, 6).map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100"
                  data-testid={`review-display-${review.id}`}
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= parseInt(review.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-4">"{review.reviewText}"</p>
                  <div className="pt-4 border-t border-slate-100">
                    <div className="font-bold text-slate-900">{review.customerName}</div>
                    {review.companyName && <div className="text-slate-500 text-sm">{review.companyName}</div>}
                    <div className="flex items-center gap-2 mt-2">
                      {review.country && <span className="text-xs text-slate-400">{review.country}</span>}
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        {serviceLabels[review.serviceUsed] || review.serviceUsed}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Fallback / additional stories (always shown if no dynamic reviews, or as additional content) */}
          {!hasReviews && (
            <>
              {reviews.length === 0 && !isEditMode ? null : (
                <div className="text-center py-8 text-slate-500 mb-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No approved reviews yet</p>
                </div>
              )}
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
            </>
          )}
        </div>
      </section>
    </EditableSection>
  );
}
