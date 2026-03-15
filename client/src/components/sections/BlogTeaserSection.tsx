import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CalendarDays, MessageSquare } from 'lucide-react';
import type { BlogPostSummary } from '@shared/blog';
import { EditableSection, EditableText } from '@/components/EditableComponents';
import { useContent } from '@/lib/contentContext';

export function BlogTeaserSection() {
  const { isEditMode, isSectionVisible } = useContent();
  const visible = isSectionVisible('blog');

  const { data: posts = [] } = useQuery<BlogPostSummary[]>({
    queryKey: ['/api/blog/posts?limit=3'],
    queryFn: async () => {
      const response = await fetch('/api/blog/posts?limit=3');
      if (!response.ok) {
        throw new Error('Failed to load blog posts');
      }

      return response.json();
    },
  });

  if (!visible && !isEditMode) return null;

  return (
    <EditableSection id="blog" name="Blog">
      <section
        id="blog"
        className={`py-20 lg:py-24 bg-white ${!visible && isEditMode ? 'opacity-40' : ''}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between mb-12">
            <div className="max-w-2xl">
              <EditableText
                id="blog-badge"
                defaultText="Latest Insights"
                element="span"
                className="text-sky-700 font-bold uppercase tracking-[0.25em] text-xs sm:text-sm"
              />
              <EditableText
                id="blog-title"
                defaultText="SEO-focused sourcing insights your buyers will actually read"
                element="h2"
                className="mt-4 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight"
              />
              <EditableText
                id="blog-description"
                defaultText="Publish practical guidance, supplier risk tips, and China market updates directly from your admin center."
                element="p"
                className="mt-4 text-lg text-slate-600 leading-relaxed"
              />
            </div>

            <a
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-5 py-3 font-semibold hover:bg-slate-800 transition-colors"
            >
              Explore the blog
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {posts.map((post) => (
              <a
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group rounded-[28px] border border-slate-200 bg-slate-50 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                {post.featuredImageUrl ? (
                  <img
                    src={post.featuredImageUrl}
                    alt={post.featuredImageAlt || post.title}
                    className="h-52 w-full object-cover"
                  />
                ) : (
                  <div className="h-52 w-full bg-gradient-to-br from-sky-100 to-blue-50" />
                )}

                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.categories.map((category) => (
                      <span
                        key={category.id}
                        className="inline-flex items-center rounded-full bg-sky-100 text-sky-800 px-3 py-1 text-xs font-semibold"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-sky-800 transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-slate-600 leading-relaxed">{post.excerpt}</p>

                  <div className="mt-5 flex items-center gap-4 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      {new Date(post.publishedAt || post.updatedAt).toLocaleDateString()}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      {post.commentCount}
                    </span>
                  </div>
                </div>
              </a>
            ))}

            {posts.length === 0 && (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-8 text-slate-500 lg:col-span-3">
                Publish your first article from the admin center to populate this section.
              </div>
            )}
          </div>
        </div>
      </section>
    </EditableSection>
  );
}
