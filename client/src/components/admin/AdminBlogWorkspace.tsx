import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Copy,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Pencil,
  Plus,
  Quote,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import type {
  AuthorProfile,
  BlogComment,
  BlogContentBlock,
  BlogPostStatus,
  BlogPostSummary,
  FaqEntry,
  MediaAsset,
  SeoSettings,
} from '@shared/blog';
import { slugifyText } from '@shared/blog';
import { serviceCatalog } from '@shared/serviceCatalog';
import { useAdmin } from '@/lib/adminContext';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

type AdminSettingsResponse = {
  settings: SeoSettings;
  author: AuthorProfile;
  mediaConfigured: boolean;
};

type AdminMediaResponse = {
  configured: boolean;
  media: MediaAsset[];
};

type PostDraft = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  status: BlogPostStatus;
  featured: boolean;
  featuredOrder: number;
  featuredImageUrl: string;
  featuredImageAlt: string;
  categoryIds: string[];
  tags: string;
  contentBlocks: BlogContentBlock[];
  relatedServiceIds: string[];
  faqIds: string[];
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  socialImageUrl: string;
  socialImageAlt: string;
  scheduledFor: string;
};

type CategoryDraft = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  visible: boolean;
  order: number;
};

type FaqDraft = {
  id?: string;
  scope: 'global' | 'post';
  postId: string;
  category: string;
  question: string;
  answer: string;
  visible: boolean;
  order: number;
};

type SeoDraft = {
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  blogTitle: string;
  blogDescription: string;
  faqTitle: string;
  faqDescription: string;
  defaultOgImageUrl: string;
};

type AuthorDraft = {
  name: string;
  title: string;
  bio: string;
  avatarUrl: string;
  email: string;
};

function emptyRichTextBlock(): BlogContentBlock {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: 'rich_text',
    title: '',
    body: '',
  };
}

function newBlock(type: BlogContentBlock['type']): BlogContentBlock {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  if (type === 'image') {
    return { id, type: 'image', src: '', alt: '', caption: '', assetId: null };
  }

  if (type === 'quote') {
    return { id, type: 'quote', quote: '', attribution: '' };
  }

  if (type === 'cta') {
    return { id, type: 'cta', heading: '', body: '', buttonText: '', buttonLink: '' };
  }

  return { id, type: 'rich_text', title: '', body: '' };
}

function emptyPostDraft(): PostDraft {
  return {
    title: '',
    slug: '',
    excerpt: '',
    status: 'draft',
    featured: false,
    featuredOrder: 0,
    featuredImageUrl: '',
    featuredImageAlt: '',
    categoryIds: [],
    tags: '',
    contentBlocks: [emptyRichTextBlock()],
    relatedServiceIds: [],
    faqIds: [],
    seoTitle: '',
    seoDescription: '',
    canonicalUrl: '',
    socialImageUrl: '',
    socialImageAlt: '',
    scheduledFor: '',
  };
}

function emptyCategoryDraft(): CategoryDraft {
  return {
    name: '',
    slug: '',
    description: '',
    visible: true,
    order: 0,
  };
}

function emptyFaqDraft(): FaqDraft {
  return {
    scope: 'global',
    postId: '',
    category: 'General',
    question: '',
    answer: '',
    visible: true,
    order: 0,
  };
}

function toLocalDateTime(value: unknown): string {
  if (!value) return '';
  const date = new Date(value as string);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function fromPost(post: BlogPostSummary): PostDraft {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    status: post.status,
    featured: post.featured,
    featuredOrder: post.featuredOrder,
    featuredImageUrl: post.featuredImageUrl || '',
    featuredImageAlt: post.featuredImageAlt || '',
    categoryIds: post.categoryIds,
    tags: post.tags.join(', '),
    contentBlocks: post.contentBlocks.length > 0 ? post.contentBlocks : [emptyRichTextBlock()],
    relatedServiceIds: post.relatedServiceIds,
    faqIds: post.faqIds,
    seoTitle: post.seoTitle || '',
    seoDescription: post.seoDescription || '',
    canonicalUrl: post.canonicalUrl || '',
    socialImageUrl: post.socialImageUrl || '',
    socialImageAlt: post.socialImageAlt || '',
    scheduledFor: toLocalDateTime(post.scheduledFor),
  };
}

function toCategoryDraft(faq: FaqEntry): FaqDraft {
  return {
    id: faq.id,
    scope: faq.scope,
    postId: faq.postId || '',
    category: faq.category,
    question: faq.question,
    answer: faq.answer,
    visible: faq.visible,
    order: faq.order,
  };
}

function toSeoDraft(settings: SeoSettings): SeoDraft {
  return {
    siteTitle: settings.siteTitle,
    siteDescription: settings.siteDescription,
    siteKeywords: settings.siteKeywords.join(', '),
    blogTitle: settings.blogTitle,
    blogDescription: settings.blogDescription,
    faqTitle: settings.faqTitle,
    faqDescription: settings.faqDescription,
    defaultOgImageUrl: settings.defaultOgImageUrl || '',
  };
}

function toAuthorDraft(author: AuthorProfile): AuthorDraft {
  return {
    name: author.name,
    title: author.title || '',
    bio: author.bio || '',
    avatarUrl: author.avatarUrl || '',
    email: author.email || '',
  };
}

function formatDate(value: unknown): string {
  if (!value) return 'N/A';
  const date = new Date(value as string);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString();
}

export function AdminBlogWorkspace() {
  const { getToken } = useAdmin();
  const { toast } = useToast();

  const [selectedPostId, setSelectedPostId] = useState<string>('new');
  const [postDraft, setPostDraft] = useState<PostDraft>(emptyPostDraft());
  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft>(emptyCategoryDraft());
  const [faqDraft, setFaqDraft] = useState<FaqDraft>(emptyFaqDraft());
  const [seoDraft, setSeoDraft] = useState<SeoDraft | null>(null);
  const [authorDraft, setAuthorDraft] = useState<AuthorDraft | null>(null);
  const [commentReplies, setCommentReplies] = useState<Record<string, string>>({});
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [savePostLoading, setSavePostLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);

  const adminFetch = async <T,>(url: string, init?: RequestInit): Promise<T> => {
    const token = getToken();
    const response = await fetch(url, {
      ...init,
      headers: {
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...(init?.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Request failed');
    }

    return response.json();
  };

  const { data: posts = [], isLoading: postsLoading } = useQuery<BlogPostSummary[]>({
    queryKey: ['/api/admin/blog/posts'],
    queryFn: () => adminFetch('/api/admin/blog/posts'),
  });

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/blog/categories'],
    queryFn: () => adminFetch('/api/admin/blog/categories'),
  });

  const { data: faqs = [] } = useQuery<FaqEntry[]>({
    queryKey: ['/api/admin/blog/faqs'],
    queryFn: () => adminFetch('/api/admin/blog/faqs'),
  });

  const { data: comments = [] } = useQuery<BlogComment[]>({
    queryKey: ['/api/admin/blog/comments'],
    queryFn: () => adminFetch('/api/admin/blog/comments'),
  });

  const { data: mediaResponse } = useQuery<AdminMediaResponse>({
    queryKey: ['/api/admin/blog/media'],
    queryFn: () => adminFetch('/api/admin/blog/media'),
  });

  const { data: settingsResponse } = useQuery<AdminSettingsResponse>({
    queryKey: ['/api/admin/blog/settings'],
    queryFn: () => adminFetch('/api/admin/blog/settings'),
  });

  const media = mediaResponse?.media || [];

  useEffect(() => {
    if (!posts.length) {
      setSelectedPostId('new');
      setPostDraft((current) => (current.id ? emptyPostDraft() : current));
      return;
    }

    if (selectedPostId === 'new') {
      return;
    }

    const match = posts.find((post) => post.id === selectedPostId);
    if (match) {
      setPostDraft(fromPost(match));
      return;
    }

    setSelectedPostId(posts[0].id);
    setPostDraft(fromPost(posts[0]));
  }, [posts, selectedPostId]);

  useEffect(() => {
    if (settingsResponse) {
      setSeoDraft(toSeoDraft(settingsResponse.settings));
      setAuthorDraft(toAuthorDraft(settingsResponse.author));
    }
  }, [settingsResponse]);

  const selectPost = (postId: string) => {
    if (postId === 'new') {
      setSelectedPostId('new');
      setPostDraft(emptyPostDraft());
      return;
    }

    const post = posts.find((item) => item.id === postId);
    if (!post) return;
    setSelectedPostId(postId);
    setPostDraft(fromPost(post));
  };

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/posts'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/categories'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/faqs'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/comments'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/media'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/settings'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/blog/posts?limit=3'] }),
    ]);
  };

  const savePost = async () => {
    setSavePostLoading(true);

    try {
      const payload = {
        title: postDraft.title,
        slug: postDraft.slug,
        excerpt: postDraft.excerpt,
        status: postDraft.status,
        featured: postDraft.featured,
        featuredOrder: postDraft.featured ? Number(postDraft.featuredOrder) : 0,
        featuredImageUrl: postDraft.featuredImageUrl || null,
        featuredImageAlt: postDraft.featuredImageAlt,
        categoryIds: postDraft.categoryIds,
        tags: postDraft.tags,
        contentBlocks: postDraft.contentBlocks,
        relatedServiceIds: postDraft.relatedServiceIds,
        faqIds: postDraft.faqIds,
        seoTitle: postDraft.seoTitle,
        seoDescription: postDraft.seoDescription,
        canonicalUrl: postDraft.canonicalUrl || null,
        socialImageUrl: postDraft.socialImageUrl || null,
        socialImageAlt: postDraft.socialImageAlt,
        scheduledFor: postDraft.scheduledFor ? new Date(postDraft.scheduledFor).toISOString() : null,
      };

      const endpoint =
        selectedPostId === 'new' ? '/api/admin/blog/posts' : `/api/admin/blog/posts/${selectedPostId}`;
      const method = selectedPostId === 'new' ? 'POST' : 'PUT';
      const response = await adminFetch<{ post: BlogPostSummary }>(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      await invalidateAll();
      setSelectedPostId(response.post.id);
      setPostDraft(fromPost(response.post));
      toast({
        title: 'Post saved',
        description: 'The blog post has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Save failed',
        description: error?.message || 'Could not save the post.',
        variant: 'destructive',
      });
    } finally {
      setSavePostLoading(false);
    }
  };

  const duplicatePost = async () => {
    if (selectedPostId === 'new') return;

    try {
      const response = await adminFetch<{ post: BlogPostSummary }>(`/api/admin/blog/posts/${selectedPostId}/duplicate`, {
        method: 'POST',
      });
      await invalidateAll();
      setSelectedPostId(response.post.id);
      setPostDraft(fromPost(response.post));
      toast({
        title: 'Post duplicated',
        description: 'A draft copy has been created.',
      });
    } catch (error: any) {
      toast({
        title: 'Duplicate failed',
        description: error?.message || 'Could not duplicate this post.',
        variant: 'destructive',
      });
    }
  };

  const deletePost = async () => {
    if (selectedPostId === 'new') {
      setPostDraft(emptyPostDraft());
      return;
    }

    try {
      await adminFetch(`/api/admin/blog/posts/${selectedPostId}`, { method: 'DELETE' });
      await invalidateAll();
      setSelectedPostId('new');
      setPostDraft(emptyPostDraft());
      toast({
        title: 'Post deleted',
        description: 'The blog post has been removed.',
      });
    } catch (error: any) {
      toast({
        title: 'Delete failed',
        description: error?.message || 'Could not delete the post.',
        variant: 'destructive',
      });
    }
  };

  const saveCategory = async () => {
    try {
      const response = await adminFetch<{ category: any }>(
        categoryDraft.id ? `/api/admin/blog/categories/${categoryDraft.id}` : '/api/admin/blog/categories',
        {
          method: categoryDraft.id ? 'PUT' : 'POST',
          body: JSON.stringify(categoryDraft),
        },
      );
      await invalidateAll();
      setCategoryDraft(emptyCategoryDraft());
      toast({
        title: 'Category saved',
        description: `${response.category.name} is ready to use.`,
      });
    } catch (error: any) {
      toast({
        title: 'Category error',
        description: error?.message || 'Could not save the category.',
        variant: 'destructive',
      });
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await adminFetch(`/api/admin/blog/categories/${id}`, { method: 'DELETE' });
      await invalidateAll();
      toast({
        title: 'Category deleted',
        description: 'The category has been removed.',
      });
    } catch (error: any) {
      toast({
        title: 'Category delete failed',
        description: error?.message || 'Could not delete the category.',
        variant: 'destructive',
      });
    }
  };

  const saveFaq = async () => {
    try {
      const payload = {
        ...faqDraft,
        postId: faqDraft.scope === 'post' ? faqDraft.postId || null : null,
      };
      const response = await adminFetch<{ faq: FaqEntry }>(
        faqDraft.id ? `/api/admin/blog/faqs/${faqDraft.id}` : '/api/admin/blog/faqs',
        {
          method: faqDraft.id ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        },
      );

      await invalidateAll();
      setFaqDraft(emptyFaqDraft());
      toast({
        title: 'FAQ saved',
        description: response.faq.question,
      });
    } catch (error: any) {
      toast({
        title: 'FAQ error',
        description: error?.message || 'Could not save the FAQ.',
        variant: 'destructive',
      });
    }
  };

  const deleteFaq = async (id: string) => {
    try {
      await adminFetch(`/api/admin/blog/faqs/${id}`, { method: 'DELETE' });
      await invalidateAll();
      toast({
        title: 'FAQ deleted',
        description: 'The FAQ entry has been removed.',
      });
    } catch (error: any) {
      toast({
        title: 'FAQ delete failed',
        description: error?.message || 'Could not delete the FAQ.',
        variant: 'destructive',
      });
    }
  };

  const updateCommentStatus = async (id: string, status: 'visible' | 'hidden' | 'spam') => {
    try {
      await adminFetch(`/api/admin/blog/comments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/comments'] });
      toast({
        title: 'Comment updated',
        description: `Comment marked as ${status}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Comment update failed',
        description: error?.message || 'Could not update the comment.',
        variant: 'destructive',
      });
    }
  };

  const replyToComment = async (id: string) => {
    const body = (commentReplies[id] || '').trim();
    if (!body) return;

    try {
      await adminFetch(`/api/admin/blog/comments/${id}/replies`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      });
      setCommentReplies((prev) => ({ ...prev, [id]: '' }));
      await queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/comments'] });
      toast({
        title: 'Reply posted',
        description: 'Your admin reply is now visible on the article page.',
      });
    } catch (error: any) {
      toast({
        title: 'Reply failed',
        description: error?.message || 'Could not post the reply.',
        variant: 'destructive',
      });
    }
  };

  const uploadMedia = async () => {
    if (!uploadFile) return;

    setUploadLoading(true);

    try {
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = typeof reader.result === 'string' ? reader.result : '';
          const [, encoded = ''] = result.split(',');
          resolve(encoded);
        };
        reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
        reader.readAsDataURL(uploadFile);
      });

      await adminFetch('/api/admin/blog/media/upload', {
        method: 'POST',
        body: JSON.stringify({
          fileName: uploadFile.name,
          mimeType: uploadFile.type,
          base64Data,
          alt: uploadAlt,
        }),
      });

      setUploadAlt('');
      setUploadFile(null);
      await invalidateAll();
      toast({
        title: 'Image uploaded',
        description: 'The media asset is available for blog posts now.',
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error?.message || 'Could not upload this image.',
        variant: 'destructive',
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const updateMediaAlt = async (asset: MediaAsset, alt: string) => {
    try {
      await adminFetch(`/api/admin/blog/media/${asset.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ alt }),
      });
      await queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/media'] });
      toast({
        title: 'Alt text updated',
        description: 'The media asset metadata has been saved.',
      });
    } catch (error: any) {
      toast({
        title: 'Alt update failed',
        description: error?.message || 'Could not update this media asset.',
        variant: 'destructive',
      });
    }
  };

  const removeMedia = async (id: string) => {
    try {
      await adminFetch(`/api/admin/blog/media/${id}`, { method: 'DELETE' });
      await invalidateAll();
      toast({
        title: 'Image deleted',
        description: 'The media asset has been removed.',
      });
    } catch (error: any) {
      toast({
        title: 'Delete failed',
        description: error?.message || 'Could not delete this media asset.',
        variant: 'destructive',
      });
    }
  };

  const saveSettings = async () => {
    if (!seoDraft || !authorDraft) return;
    setSettingsLoading(true);

    try {
      await Promise.all([
        adminFetch('/api/admin/blog/settings/seo', {
          method: 'PUT',
          body: JSON.stringify({
            ...seoDraft,
            defaultOgImageUrl: seoDraft.defaultOgImageUrl || null,
          }),
        }),
        adminFetch('/api/admin/blog/settings/author', {
          method: 'PUT',
          body: JSON.stringify({
            ...authorDraft,
            avatarUrl: authorDraft.avatarUrl || null,
            email: authorDraft.email || null,
          }),
        }),
      ]);

      await queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/settings'] });
      toast({
        title: 'SEO settings saved',
        description: 'Blog metadata and author profile have been updated.',
      });
    } catch (error: any) {
      toast({
        title: 'Settings save failed',
        description: error?.message || 'Could not update the blog settings.',
        variant: 'destructive',
      });
    } finally {
      setSettingsLoading(false);
    }
  };

  const toggleArrayValue = (values: string[], value: string) => {
    return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
  };

  const filteredComments = [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <Tabs defaultValue="posts" className="space-y-6">
      <TabsList className="flex h-auto flex-wrap justify-start gap-2 rounded-2xl bg-slate-200/60 p-2">
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="faqs">FAQs</TabsTrigger>
        <TabsTrigger value="comments">Comments</TabsTrigger>
        <TabsTrigger value="media">Media</TabsTrigger>
        <TabsTrigger value="seo">SEO</TabsTrigger>
      </TabsList>

      <TabsContent value="posts" className="space-y-6">
        <div className="grid xl:grid-cols-[320px,minmax(0,1fr)] gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-sky-700" />
                Blog Posts
              </CardTitle>
              <CardDescription>Create, publish, schedule, duplicate, and reorder featured content.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant={selectedPostId === 'new' ? 'default' : 'outline'} onClick={() => selectPost('new')}>
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
              {postsLoading ? (
                <div className="py-8 text-slate-500 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading posts...
                </div>
              ) : (
                <div className="space-y-3">
                  {posts.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => selectPost(post.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                        selectedPostId === post.id ? 'border-sky-300 bg-sky-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-semibold text-slate-900">{post.title}</div>
                        <Badge variant={post.status === 'published' ? 'default' : post.status === 'scheduled' ? 'secondary' : 'outline'}>
                          {post.status}
                        </Badge>
                      </div>
                      <div className="mt-2 text-xs text-slate-500">{post.slug}</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {post.featured && <Badge variant="outline">Featured #{post.featuredOrder}</Badge>}
                        {post.categories.map((category) => (
                          <Badge key={category.id} variant="secondary">
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <CardTitle>{selectedPostId === 'new' ? 'New Blog Post' : 'Edit Blog Post'}</CardTitle>
                    <CardDescription>Manage article content blocks, metadata, FAQs, and related service CTAs.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedPostId !== 'new' && (
                      <Button variant="outline" onClick={duplicatePost}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </Button>
                    )}
                    <Button variant="outline" onClick={deletePost} disabled={selectedPostId === 'new'}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                    <Button onClick={savePost} disabled={savePostLoading}>
                      {savePostLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Save Post
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Title</label>
                    <Input
                      value={postDraft.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setPostDraft((prev) => ({
                          ...prev,
                          title,
                          slug: prev.slug ? prev.slug : slugifyText(title),
                        }));
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Slug</label>
                    <Input
                      value={postDraft.slug}
                      onChange={(e) => setPostDraft((prev) => ({ ...prev, slug: slugifyText(e.target.value) }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Excerpt</label>
                  <Textarea value={postDraft.excerpt} onChange={(e) => setPostDraft((prev) => ({ ...prev, excerpt: e.target.value }))} />
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Status</label>
                    <select
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                      value={postDraft.status}
                      onChange={(e) => setPostDraft((prev) => ({ ...prev, status: e.target.value as BlogPostStatus }))}
                    >
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="published">Published</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">Publish At</label>
                    <Input
                      type="datetime-local"
                      value={postDraft.scheduledFor}
                      onChange={(e) => setPostDraft((prev) => ({ ...prev, scheduledFor: e.target.value }))}
                    />
                  </div>

                  <div className="rounded-lg border border-slate-200 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={postDraft.featured}
                        onCheckedChange={(checked) => setPostDraft((prev) => ({ ...prev, featured: checked === true }))}
                        id="post-featured"
                      />
                      <label htmlFor="post-featured" className="text-sm font-medium text-slate-700">
                        Featured post
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">Featured Order</label>
                    <Input
                      type="number"
                      value={postDraft.featuredOrder}
                      onChange={(e) => setPostDraft((prev) => ({ ...prev, featuredOrder: Number(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Featured Image URL</label>
                    <Input
                      value={postDraft.featuredImageUrl}
                      onChange={(e) => setPostDraft((prev) => ({ ...prev, featuredImageUrl: e.target.value }))}
                      placeholder="Paste a media URL or select one below"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Featured Image Alt</label>
                    <Input
                      value={postDraft.featuredImageAlt}
                      onChange={(e) => setPostDraft((prev) => ({ ...prev, featuredImageAlt: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                  <div className="text-sm font-semibold text-slate-900 mb-3">Choose from uploaded media</div>
                  <div className="grid gap-3 md:grid-cols-3">
                    {media.slice(0, 6).map((asset) => (
                      <button
                        key={asset.id}
                        onClick={() => setPostDraft((prev) => ({ ...prev, featuredImageUrl: asset.url, featuredImageAlt: asset.alt || prev.featuredImageAlt }))}
                        className="rounded-2xl border border-slate-200 bg-white p-3 text-left hover:border-sky-300"
                      >
                        <img src={asset.url} alt={asset.alt || asset.fileName} className="h-28 w-full rounded-xl object-cover bg-slate-100" />
                        <div className="mt-2 text-xs text-slate-500 break-all">{asset.fileName}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="text-sm font-semibold text-slate-900 mb-3">Categories</div>
                    <div className="space-y-3">
                      {categories.map((category) => (
                        <label key={category.id} className="flex items-center gap-3 text-sm text-slate-700">
                          <Checkbox
                            checked={postDraft.categoryIds.includes(category.id)}
                            onCheckedChange={() =>
                              setPostDraft((prev) => ({
                                ...prev,
                                categoryIds: toggleArrayValue(prev.categoryIds, category.id),
                              }))
                            }
                          />
                          {category.name}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="text-sm font-semibold text-slate-900 mb-3">Related Services</div>
                    <div className="space-y-3">
                      {serviceCatalog.map((service) => (
                        <label key={service.id} className="flex items-start gap-3 text-sm text-slate-700">
                          <Checkbox
                            checked={postDraft.relatedServiceIds.includes(service.id)}
                            onCheckedChange={() =>
                              setPostDraft((prev) => ({
                                ...prev,
                                relatedServiceIds: toggleArrayValue(prev.relatedServiceIds, service.id),
                              }))
                            }
                          />
                          <span>
                            <span className="font-medium text-slate-900 block">{service.title}</span>
                            <span className="text-slate-500">{service.description}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Tags</label>
                    <Input
                      value={postDraft.tags}
                      onChange={(e) => setPostDraft((prev) => ({ ...prev, tags: e.target.value }))}
                      placeholder="china sourcing, quality control, import advice"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Attach FAQs</label>
                    <div className="mt-2 max-h-40 overflow-y-auto rounded-2xl border border-slate-200 p-4 space-y-3">
                      {faqs
                        .filter((faq) => faq.scope === 'global' || faq.postId === postDraft.id)
                        .map((faq) => (
                          <label key={faq.id} className="flex items-start gap-3 text-sm text-slate-700">
                            <Checkbox
                              checked={postDraft.faqIds.includes(faq.id)}
                              onCheckedChange={() =>
                                setPostDraft((prev) => ({
                                  ...prev,
                                  faqIds: toggleArrayValue(prev.faqIds, faq.id),
                                }))
                              }
                            />
                            <span>{faq.question}</span>
                          </label>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Content Blocks</h3>
                      <p className="text-sm text-slate-500">Compose the article from flexible sections and reorder them.</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {(['rich_text', 'image', 'quote', 'cta'] as const).map((type) => (
                        <Button key={type} variant="outline" size="sm" onClick={() => setPostDraft((prev) => ({ ...prev, contentBlocks: [...prev.contentBlocks, newBlock(type)] }))}>
                          <Plus className="w-4 h-4 mr-2" />
                          {type.replace('_', ' ')}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {postDraft.contentBlocks.map((block, index) => (
                      <div key={block.id} className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <Badge variant="secondary">{block.type}</Badge>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                setPostDraft((prev) => {
                                  if (index === 0) return prev;
                                  const contentBlocks = [...prev.contentBlocks];
                                  [contentBlocks[index - 1], contentBlocks[index]] = [contentBlocks[index], contentBlocks[index - 1]];
                                  return { ...prev, contentBlocks };
                                })
                              }
                            >
                              <ArrowUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                setPostDraft((prev) => {
                                  if (index === prev.contentBlocks.length - 1) return prev;
                                  const contentBlocks = [...prev.contentBlocks];
                                  [contentBlocks[index + 1], contentBlocks[index]] = [contentBlocks[index], contentBlocks[index + 1]];
                                  return { ...prev, contentBlocks };
                                })
                              }
                            >
                              <ArrowDown className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                setPostDraft((prev) => ({
                                  ...prev,
                                  contentBlocks: prev.contentBlocks.filter((item) => item.id !== block.id),
                                }))
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {block.type === 'rich_text' && (
                          <div className="space-y-3">
                            <Input
                              value={block.title || ''}
                              onChange={(e) =>
                                setPostDraft((prev) => ({
                                  ...prev,
                                  contentBlocks: prev.contentBlocks.map((item, itemIndex) =>
                                    itemIndex === index && item.type === 'rich_text'
                                      ? { ...item, title: e.target.value }
                                      : item,
                                  ),
                                }))
                              }
                              placeholder="Optional section heading"
                            />
                            <Textarea
                              value={block.body}
                              onChange={(e) =>
                                setPostDraft((prev) => ({
                                  ...prev,
                                  contentBlocks: prev.contentBlocks.map((item, itemIndex) =>
                                    itemIndex === index && item.type === 'rich_text'
                                      ? { ...item, body: e.target.value }
                                      : item,
                                  ),
                                }))
                              }
                              placeholder="Write the main article section..."
                            />
                          </div>
                        )}

                        {block.type === 'image' && (
                          <div className="space-y-3">
                            <Input
                              value={block.src}
                              onChange={(e) =>
                                setPostDraft((prev) => ({
                                  ...prev,
                                  contentBlocks: prev.contentBlocks.map((item, itemIndex) =>
                                    itemIndex === index && item.type === 'image'
                                      ? { ...item, src: e.target.value }
                                      : item,
                                  ),
                                }))
                              }
                              placeholder="Image URL"
                            />
                            <Input
                              value={block.alt}
                              onChange={(e) =>
                                setPostDraft((prev) => ({
                                  ...prev,
                                  contentBlocks: prev.contentBlocks.map((item, itemIndex) =>
                                    itemIndex === index && item.type === 'image'
                                      ? { ...item, alt: e.target.value }
                                      : item,
                                  ),
                                }))
                              }
                              placeholder="Alt text"
                            />
                            <Input
                              value={block.caption || ''}
                              onChange={(e) =>
                                setPostDraft((prev) => ({
                                  ...prev,
                                  contentBlocks: prev.contentBlocks.map((item, itemIndex) =>
                                    itemIndex === index && item.type === 'image'
                                      ? { ...item, caption: e.target.value }
                                      : item,
                                  ),
                                }))
                              }
                              placeholder="Optional caption"
                            />
                          </div>
                        )}

                        {block.type === 'quote' && (
                          <div className="space-y-3">
                            <Textarea
                              value={block.quote}
                              onChange={(e) =>
                                setPostDraft((prev) => ({
                                  ...prev,
                                  contentBlocks: prev.contentBlocks.map((item, itemIndex) =>
                                    itemIndex === index && item.type === 'quote'
                                      ? { ...item, quote: e.target.value }
                                      : item,
                                  ),
                                }))
                              }
                              placeholder="Quote"
                            />
                            <Input
                              value={block.attribution || ''}
                              onChange={(e) =>
                                setPostDraft((prev) => ({
                                  ...prev,
                                  contentBlocks: prev.contentBlocks.map((item, itemIndex) =>
                                    itemIndex === index && item.type === 'quote'
                                      ? { ...item, attribution: e.target.value }
                                      : item,
                                  ),
                                }))
                              }
                              placeholder="Attribution"
                            />
                          </div>
                        )}

                        {block.type === 'cta' && (
                          <div className="grid md:grid-cols-2 gap-3">
                            <Input
                              value={block.heading}
                              onChange={(e) =>
                                setPostDraft((prev) => ({
                                  ...prev,
                                  contentBlocks: prev.contentBlocks.map((item, itemIndex) =>
                                    itemIndex === index && item.type === 'cta'
                                      ? { ...item, heading: e.target.value }
                                      : item,
                                  ),
                                }))
                              }
                              placeholder="CTA heading"
                            />
                            <Input
                              value={block.buttonText}
                              onChange={(e) =>
                                setPostDraft((prev) => ({
                                  ...prev,
                                  contentBlocks: prev.contentBlocks.map((item, itemIndex) =>
                                    itemIndex === index && item.type === 'cta'
                                      ? { ...item, buttonText: e.target.value }
                                      : item,
                                  ),
                                }))
                              }
                              placeholder="Button text"
                            />
                            <Textarea
                              value={block.body}
                              onChange={(e) =>
                                setPostDraft((prev) => ({
                                  ...prev,
                                  contentBlocks: prev.contentBlocks.map((item, itemIndex) =>
                                    itemIndex === index && item.type === 'cta'
                                      ? { ...item, body: e.target.value }
                                      : item,
                                  ),
                                }))
                              }
                              placeholder="CTA body"
                            />
                            <Input
                              value={block.buttonLink}
                              onChange={(e) =>
                                setPostDraft((prev) => ({
                                  ...prev,
                                  contentBlocks: prev.contentBlocks.map((item, itemIndex) =>
                                    itemIndex === index && item.type === 'cta'
                                      ? { ...item, buttonLink: e.target.value }
                                      : item,
                                  ),
                                }))
                              }
                              placeholder="Button link"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50 space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">SEO Metadata</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input value={postDraft.seoTitle} onChange={(e) => setPostDraft((prev) => ({ ...prev, seoTitle: e.target.value }))} placeholder="SEO title" />
                    <Input value={postDraft.canonicalUrl} onChange={(e) => setPostDraft((prev) => ({ ...prev, canonicalUrl: e.target.value }))} placeholder="Canonical URL" />
                    <Textarea value={postDraft.seoDescription} onChange={(e) => setPostDraft((prev) => ({ ...prev, seoDescription: e.target.value }))} placeholder="SEO description" />
                    <div className="space-y-4">
                      <Input value={postDraft.socialImageUrl} onChange={(e) => setPostDraft((prev) => ({ ...prev, socialImageUrl: e.target.value }))} placeholder="Social image URL" />
                      <Input value={postDraft.socialImageAlt} onChange={(e) => setPostDraft((prev) => ({ ...prev, socialImageAlt: e.target.value }))} placeholder="Social image alt text" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Manage category filters and search taxonomy for the blog hub.</CardDescription>
              </CardHeader>
              <CardContent className="grid lg:grid-cols-[minmax(0,1fr),300px] gap-6">
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold text-slate-900">{category.name}</div>
                        <div className="text-sm text-slate-500">{category.slug}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setCategoryDraft(category)}>
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteCategory(category.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-slate-50">
                  <Input value={categoryDraft.name} onChange={(e) => setCategoryDraft((prev) => ({ ...prev, name: e.target.value, slug: prev.slug || slugifyText(e.target.value) }))} placeholder="Category name" />
                  <Input value={categoryDraft.slug} onChange={(e) => setCategoryDraft((prev) => ({ ...prev, slug: slugifyText(e.target.value) }))} placeholder="Category slug" />
                  <Textarea value={categoryDraft.description} onChange={(e) => setCategoryDraft((prev) => ({ ...prev, description: e.target.value }))} placeholder="Description" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input type="number" value={categoryDraft.order} onChange={(e) => setCategoryDraft((prev) => ({ ...prev, order: Number(e.target.value) || 0 }))} placeholder="Order" />
                    <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                      <Checkbox checked={categoryDraft.visible} onCheckedChange={(checked) => setCategoryDraft((prev) => ({ ...prev, visible: checked === true }))} />
                      Visible
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveCategory}>Save Category</Button>
                    <Button variant="outline" onClick={() => setCategoryDraft(emptyCategoryDraft())}>Reset</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="faqs">
        <Card>
          <CardHeader>
            <CardTitle>FAQ Manager</CardTitle>
            <CardDescription>Create global FAQ entries or attach article-specific FAQs for FAQPage SEO.</CardDescription>
          </CardHeader>
          <CardContent className="grid xl:grid-cols-[minmax(0,1fr),360px] gap-6">
            <div className="space-y-3">
              {faqs.map((faq) => (
                <div key={faq.id} className="rounded-2xl border border-slate-200 p-4 bg-white">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">{faq.question}</div>
                      <div className="text-sm text-slate-500">
                        {faq.scope === 'global' ? 'Global FAQ' : `Post FAQ · ${posts.find((post) => post.id === faq.postId)?.title || 'Linked post missing'}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={faq.visible ? 'default' : 'outline'}>{faq.visible ? 'visible' : 'hidden'}</Badge>
                      <Button variant="outline" size="sm" onClick={() => setFaqDraft(toCategoryDraft(faq))}>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteFaq(faq.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{faq.answer}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50 space-y-4">
              <div className="grid gap-3">
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  value={faqDraft.scope}
                  onChange={(e) => setFaqDraft((prev) => ({ ...prev, scope: e.target.value as 'global' | 'post' }))}
                >
                  <option value="global">Global FAQ</option>
                  <option value="post">Post-specific FAQ</option>
                </select>
                {faqDraft.scope === 'post' && (
                  <select
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    value={faqDraft.postId}
                    onChange={(e) => setFaqDraft((prev) => ({ ...prev, postId: e.target.value }))}
                  >
                    <option value="">Select post</option>
                    {posts.map((post) => (
                      <option key={post.id} value={post.id}>
                        {post.title}
                      </option>
                    ))}
                  </select>
                )}
                <Input value={faqDraft.category} onChange={(e) => setFaqDraft((prev) => ({ ...prev, category: e.target.value }))} placeholder="FAQ category" />
                <Input value={faqDraft.question} onChange={(e) => setFaqDraft((prev) => ({ ...prev, question: e.target.value }))} placeholder="Question" />
                <Textarea value={faqDraft.answer} onChange={(e) => setFaqDraft((prev) => ({ ...prev, answer: e.target.value }))} placeholder="Answer" />
                <div className="grid grid-cols-2 gap-3">
                  <Input type="number" value={faqDraft.order} onChange={(e) => setFaqDraft((prev) => ({ ...prev, order: Number(e.target.value) || 0 }))} placeholder="Order" />
                  <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                    <Checkbox checked={faqDraft.visible} onCheckedChange={(checked) => setFaqDraft((prev) => ({ ...prev, visible: checked === true }))} />
                    Visible
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveFaq}>Save FAQ</Button>
                <Button variant="outline" onClick={() => setFaqDraft(emptyFaqDraft())}>Reset</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="comments">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-violet-700" />
              Public Questions & Comments
            </CardTitle>
            <CardDescription>Comments are live immediately; use this panel to reply or hide spam and abuse.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredComments.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-500">
                No comments yet.
              </div>
            ) : (
              filteredComments.map((comment) => (
                <div key={comment.id} className="rounded-2xl border border-slate-200 p-4 bg-white">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="font-semibold text-slate-900">{comment.displayName}</div>
                      <div className="text-sm text-slate-500">
                        {posts.find((post) => post.id === comment.postId)?.title || 'Unknown post'} · {formatDate(comment.createdAt)}
                      </div>
                      {comment.email && <div className="text-sm text-slate-500">{comment.email}</div>}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={comment.status === 'visible' ? 'default' : comment.status === 'spam' ? 'destructive' : 'outline'}>
                        {comment.status}
                      </Badge>
                      {comment.isAdminReply && <Badge variant="secondary">Admin reply</Badge>}
                    </div>
                  </div>
                  <p className="mt-3 text-slate-700">{comment.body}</p>

                  {!comment.parentId && (
                    <div className="mt-4 space-y-3">
                      <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm" onClick={() => updateCommentStatus(comment.id, 'visible')}>
                          Show
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => updateCommentStatus(comment.id, 'hidden')}>
                          Hide
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => updateCommentStatus(comment.id, 'spam')}>
                          Mark Spam
                        </Button>
                      </div>
                      <Textarea
                        value={commentReplies[comment.id] || ''}
                        onChange={(e) => setCommentReplies((prev) => ({ ...prev, [comment.id]: e.target.value }))}
                        placeholder="Write a public admin reply..."
                      />
                      <Button onClick={() => replyToComment(comment.id)}>Post Reply</Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="media">
        <div className="grid xl:grid-cols-[360px,minmax(0,1fr)] gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-700" />
                Media Uploads
              </CardTitle>
              <CardDescription>Upload blog images to cloud storage and reuse them in posts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!mediaResponse?.configured && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 flex gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  Set `GCS_BUCKET_NAME` to enable image uploads.
                </div>
              )}

              <Input type="file" accept="image/*" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
              <Input value={uploadAlt} onChange={(e) => setUploadAlt(e.target.value)} placeholder="Alt text for the uploaded image" />
              <Button onClick={uploadMedia} disabled={!uploadFile || uploadLoading || !mediaResponse?.configured}>
                {uploadLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                Upload Image
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media Library</CardTitle>
              <CardDescription>Select these URLs in blog posts for featured and inline images.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {media.map((asset) => (
                <div key={asset.id} className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                  <img src={asset.url} alt={asset.alt || asset.fileName} className="h-44 w-full object-cover bg-slate-100" />
                  <div className="p-4 space-y-3">
                    <div className="font-semibold text-slate-900 break-all">{asset.fileName}</div>
                    <Textarea
                      value={asset.alt || ''}
                      onChange={(e) =>
                        queryClient.setQueryData<AdminMediaResponse | undefined>(['/api/admin/blog/media'], (current) =>
                          current
                            ? {
                                ...current,
                                media: current.media.map((item) => (item.id === asset.id ? { ...item, alt: e.target.value } : item)),
                              }
                            : current,
                        )
                      }
                      placeholder="Alt text"
                    />
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(asset.url)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy URL
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => updateMediaAlt(asset, asset.alt || '')}>
                        Save Alt
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => removeMedia(asset.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {media.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-slate-500 md:col-span-2 xl:col-span-3">
                  Upload an image to start building the media library.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="seo">
        <div className="grid xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Site & Blog SEO</CardTitle>
              <CardDescription>Default metadata, blog hub titles, FAQ titles, and share image fallback.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!seoDraft ? (
                <div className="py-8 text-slate-500 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading SEO settings...
                </div>
              ) : (
                <>
                  <Input value={seoDraft.siteTitle} onChange={(e) => setSeoDraft((prev) => (prev ? { ...prev, siteTitle: e.target.value } : prev))} placeholder="Site title" />
                  <Textarea value={seoDraft.siteDescription} onChange={(e) => setSeoDraft((prev) => (prev ? { ...prev, siteDescription: e.target.value } : prev))} placeholder="Site description" />
                  <Input value={seoDraft.siteKeywords} onChange={(e) => setSeoDraft((prev) => (prev ? { ...prev, siteKeywords: e.target.value } : prev))} placeholder="Keywords" />
                  <Input value={seoDraft.blogTitle} onChange={(e) => setSeoDraft((prev) => (prev ? { ...prev, blogTitle: e.target.value } : prev))} placeholder="Blog title" />
                  <Textarea value={seoDraft.blogDescription} onChange={(e) => setSeoDraft((prev) => (prev ? { ...prev, blogDescription: e.target.value } : prev))} placeholder="Blog description" />
                  <Input value={seoDraft.faqTitle} onChange={(e) => setSeoDraft((prev) => (prev ? { ...prev, faqTitle: e.target.value } : prev))} placeholder="FAQ title" />
                  <Textarea value={seoDraft.faqDescription} onChange={(e) => setSeoDraft((prev) => (prev ? { ...prev, faqDescription: e.target.value } : prev))} placeholder="FAQ description" />
                  <Input value={seoDraft.defaultOgImageUrl} onChange={(e) => setSeoDraft((prev) => (prev ? { ...prev, defaultOgImageUrl: e.target.value } : prev))} placeholder="Default OG image URL" />
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Author Profile</CardTitle>
              <CardDescription>Structured data and article author details for the blog.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!authorDraft ? (
                <div className="py-8 text-slate-500 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading author profile...
                </div>
              ) : (
                <>
                  <Input value={authorDraft.name} onChange={(e) => setAuthorDraft((prev) => (prev ? { ...prev, name: e.target.value } : prev))} placeholder="Author name" />
                  <Input value={authorDraft.title} onChange={(e) => setAuthorDraft((prev) => (prev ? { ...prev, title: e.target.value } : prev))} placeholder="Author title" />
                  <Textarea value={authorDraft.bio} onChange={(e) => setAuthorDraft((prev) => (prev ? { ...prev, bio: e.target.value } : prev))} placeholder="Author bio" />
                  <Input value={authorDraft.avatarUrl} onChange={(e) => setAuthorDraft((prev) => (prev ? { ...prev, avatarUrl: e.target.value } : prev))} placeholder="Avatar URL" />
                  <Input value={authorDraft.email} onChange={(e) => setAuthorDraft((prev) => (prev ? { ...prev, email: e.target.value } : prev))} placeholder="Author email" />
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Button onClick={saveSettings} disabled={settingsLoading || !seoDraft || !authorDraft}>
            {settingsLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
            Save SEO & Author Settings
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}
