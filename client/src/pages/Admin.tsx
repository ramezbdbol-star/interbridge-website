import { useState } from 'react';
import { useAdmin } from '@/lib/adminContext';
import { useContent } from '@/lib/contentContext';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import {
  AlertCircle,
  CalendarDays,
  Check,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  Home,
  Link2,
  Link2Off,
  Loader2,
  Lock,
  LogOut,
  MessageSquare,
  Save,
  Star,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import type { BookingRequest, CustomerReview } from '@shared/schema';

interface GoogleCalendarStatus {
  connected: boolean;
  hasOauthConfig: boolean;
  googleEmail: string | null;
  calendarId: string;
  tokenExpiry: string | null;
}

function formatDateTime(value: Date | string): string {
  return new Date(value).toLocaleString();
}

export default function Admin() {
  const { isAdmin, isLoading, login, logout, getToken } = useAdmin();
  const { isEditMode, setEditMode, saveAllChanges, hasUnsavedChanges, pendingChanges } = useContent();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending'>('pending');
  const [bookingEmailDrafts, setBookingEmailDrafts] = useState<Record<string, string>>({});

  const {
    data: reviews = [],
    isLoading: reviewsLoading,
    refetch: refetchReviews,
  } = useQuery<CustomerReview[]>({
    queryKey: ['/api/admin/reviews', reviewFilter],
    queryFn: async () => {
      const token = getToken();
      const endpoint = reviewFilter === 'pending' ? '/api/admin/reviews/pending' : '/api/admin/reviews';
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch reviews');
      return response.json();
    },
    enabled: isAdmin,
  });

  const {
    data: pendingBookings = [],
    isLoading: bookingsLoading,
    refetch: refetchBookings,
  } = useQuery<BookingRequest[]>({
    queryKey: ['/api/admin/bookings', 'pending'],
    queryFn: async () => {
      const token = getToken();
      const response = await fetch('/api/admin/bookings?status=pending', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch pending bookings');
      return response.json();
    },
    enabled: isAdmin,
  });

  const {
    data: googleStatus,
    isLoading: googleStatusLoading,
    refetch: refetchGoogleStatus,
  } = useQuery<GoogleCalendarStatus>({
    queryKey: ['/api/admin/google-calendar/status'],
    queryFn: async () => {
      const token = getToken();
      const response = await fetch('/api/admin/google-calendar/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch Google Calendar status');
      return response.json();
    },
    enabled: isAdmin,
  });

  const updateReviewMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const token = getToken();
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update review');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reviews'] });
      refetchReviews();
    },
  });

  const bookingDecisionMutation = useMutation({
    mutationFn: async ({ id, action, email }: { id: string; action: 'approve' | 'reject'; email?: string }) => {
      const token = getToken();
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, email }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update booking');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bookings'] });
      refetchBookings();
    },
  });

  const connectGoogleMutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      const response = await fetch('/api/admin/google-calendar/connect-url', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to connect Google Calendar');
      }

      return response.json() as Promise<{ url: string }>;
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error: any) => {
      toast({
        title: 'Google Connect Failed',
        description: error?.message || 'Unable to start Google OAuth flow.',
        variant: 'destructive',
      });
    },
  });

  const disconnectGoogleMutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      const response = await fetch('/api/admin/google-calendar/disconnect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to disconnect Google Calendar');
      }

      return response.json();
    },
    onSuccess: () => {
      refetchGoogleStatus();
      toast({
        title: 'Google Calendar Disconnected',
        description: 'The booking integration has been disconnected.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Disconnect Failed',
        description: error?.message || 'Unable to disconnect Google Calendar.',
        variant: 'destructive',
      });
    },
  });

  const handleApproveReview = (id: string) => {
    updateReviewMutation.mutate(
      { id, status: 'approved' },
      {
        onSuccess: () => {
          toast({ title: 'Review Approved', description: 'The review is now visible on your website.' });
        },
      },
    );
  };

  const handleRejectReview = (id: string) => {
    updateReviewMutation.mutate(
      { id, status: 'rejected' },
      {
        onSuccess: () => {
          toast({ title: 'Review Rejected', description: 'The review has been rejected and will not be shown.' });
        },
      },
    );
  };

  const handleBookingDecision = (booking: BookingRequest, action: 'approve' | 'reject') => {
    const draftEmail = (bookingEmailDrafts[booking.id] || booking.email || '').trim();

    if (action === 'approve' && !draftEmail) {
      toast({
        title: 'Email Required',
        description: 'Please add an email before approving this booking.',
        variant: 'destructive',
      });
      return;
    }

    bookingDecisionMutation.mutate(
      {
        id: booking.id,
        action,
        email: draftEmail || undefined,
      },
      {
        onSuccess: () => {
          toast({
            title: action === 'approve' ? 'Booking Approved' : 'Booking Rejected',
            description:
              action === 'approve'
                ? 'Calendar event has been confirmed and invite sent.'
                : 'Booking request has been rejected.',
          });
        },
        onError: (error: any) => {
          toast({
            title: 'Booking Update Failed',
            description: error?.message || 'Could not process booking action.',
            variant: 'destructive',
          });
        },
      },
    );
  };

  const copyReviewLink = () => {
    const link = `${window.location.origin}/submit-review`;
    navigator.clipboard.writeText(link);
    toast({ title: 'Link Copied!', description: 'Share this link with your customers to collect reviews.' });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    const result = await login(username, password);

    if (!result.success) {
      setLoginError(result.message || 'Login failed');
    } else {
      toast({
        title: 'Welcome, Admin!',
        description: 'You can now edit your website content.',
      });
    }

    setIsLoggingIn(false);
  };

  const handleLogout = async () => {
    await logout();
    setEditMode(false);
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await saveAllChanges();

    toast({
      title: result.success ? 'Saved!' : 'Error',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
    });

    setIsSaving(false);
  };

  const goToWebsite = () => {
    setLocation('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2"
                  data-testid="text-login-error"
                >
                  <AlertCircle className="w-4 h-4" />
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  data-testid="input-admin-username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  data-testid="input-admin-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoggingIn} data-testid="button-admin-login">
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={goToWebsite}
                data-testid="button-back-to-website"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Website
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900">Admin Panel</h1>
                <p className="text-xs text-slate-500">InterBridge Website Editor</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {hasUnsavedChanges && (
                <span className="text-amber-600 text-sm font-medium flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {Object.keys(pendingChanges).length} unsaved changes
                </span>
              )}

              <Button variant="outline" onClick={handleLogout} data-testid="button-admin-logout">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                Edit Mode
              </CardTitle>
              <CardDescription>Toggle edit mode to modify your website content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">Edit Mode Status</p>
                  <p className="text-sm text-slate-500">
                    {isEditMode ? 'Currently editing - click text on website to edit' : 'View only mode'}
                  </p>
                </div>
                <Button
                  variant={isEditMode ? 'default' : 'outline'}
                  onClick={() => setEditMode(!isEditMode)}
                  data-testid="button-toggle-edit-mode"
                >
                  {isEditMode ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Editing On
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Enable Editing
                    </>
                  )}
                </Button>
              </div>

              <Button className="w-full" onClick={goToWebsite} data-testid="button-go-to-website">
                <Eye className="w-4 h-4 mr-2" />
                Go to Website {isEditMode && '(Edit Mode)'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="w-5 h-5 text-green-600" />
                Save Changes
              </CardTitle>
              <CardDescription>Save all your edits to the database</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-slate-900">Pending Changes</p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      hasUnsavedChanges ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {Object.keys(pendingChanges).length} changes
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  {hasUnsavedChanges
                    ? 'You have unsaved changes that will be lost if you leave'
                    : 'All changes have been saved'}
                </p>
              </div>

              <Button
                className="w-full"
                onClick={handleSave}
                disabled={!hasUnsavedChanges || isSaving}
                data-testid="button-save-changes"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save All Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-blue-600" />
                Google Calendar Integration
              </CardTitle>
              <CardDescription>Connect your primary Google Calendar for Book Now sync and approval workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {googleStatusLoading ? (
                <div className="flex items-center gap-2 text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading Google Calendar status...
                </div>
              ) : (
                <>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900">Connection Status</span>
                      <Badge variant={googleStatus?.connected ? 'default' : 'secondary'}>
                        {googleStatus?.connected ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </div>
                    <div className="mt-3 text-sm text-slate-600 space-y-1">
                      <p>OAuth Config: {googleStatus?.hasOauthConfig ? 'Configured' : 'Missing env vars'}</p>
                      <p>Google Account: {googleStatus?.googleEmail || '(none connected)'}</p>
                      <p>Calendar ID: {googleStatus?.calendarId || 'primary'}</p>
                      <p>
                        Token Expiry:{' '}
                        {googleStatus?.tokenExpiry ? formatDateTime(googleStatus.tokenExpiry) : '(not available)'}
                      </p>
                    </div>
                  </div>

                  {!googleStatus?.hasOauthConfig && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                      Configure these env vars first: GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET,
                      GOOGLE_OAUTH_REDIRECT_URI, GOOGLE_TOKEN_ENCRYPTION_KEY.
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => connectGoogleMutation.mutate()}
                      disabled={connectGoogleMutation.isPending || !googleStatus?.hasOauthConfig}
                      data-testid="button-connect-google-calendar"
                    >
                      {connectGoogleMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Redirecting...
                        </>
                      ) : (
                        'Connect Google Calendar'
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => disconnectGoogleMutation.mutate()}
                      disabled={disconnectGoogleMutation.isPending || !googleStatus?.connected}
                      data-testid="button-disconnect-google-calendar"
                    >
                      {disconnectGoogleMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Disconnecting...
                        </>
                      ) : (
                        <>
                          <Link2Off className="w-4 h-4 mr-2" />
                          Disconnect
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-indigo-600" />
                Book Now Pending Queue
              </CardTitle>
              <CardDescription>Approve or reject pending booking requests. Email is required before approval.</CardDescription>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="flex items-center gap-2 text-slate-500 py-6">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading pending bookings...
                </div>
              ) : pendingBookings.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  No pending bookings right now.
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingBookings.map((booking) => {
                    const emailValue = bookingEmailDrafts[booking.id] ?? booking.email ?? '';

                    return (
                      <div key={booking.id} className="rounded-lg border border-slate-200 bg-white p-4" data-testid={`booking-${booking.id}`}>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="font-semibold text-slate-900">{booking.name || 'Unnamed Request'}</div>
                          <Badge variant="secondary">{booking.status}</Badge>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                          <div>Start: {formatDateTime(booking.startAtUtc)}</div>
                          <div>End: {formatDateTime(booking.endAtUtc)}</div>
                          <div>Timezone: {booking.visitorTimezone}</div>
                          <div>Urgent: {booking.isUrgent ? 'Yes' : 'No'}</div>
                          <div>Phone: {booking.phone || '(not provided)'}</div>
                          <div>Hold: {booking.holdStatus}</div>
                        </div>

                        <div className="mt-3">
                          <label className="mb-1 block text-sm font-medium text-slate-700">Client Email (required to approve)</label>
                          <Input
                            type="email"
                            value={emailValue}
                            onChange={(e) =>
                              setBookingEmailDrafts((prev) => ({
                                ...prev,
                                [booking.id]: e.target.value,
                              }))
                            }
                            placeholder="client@example.com"
                            data-testid={`booking-email-${booking.id}`}
                          />
                        </div>

                        {booking.notes && (
                          <p className="mt-3 rounded bg-slate-50 p-2 text-sm text-slate-600">Notes: {booking.notes}</p>
                        )}

                        <div className="mt-3 flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleBookingDecision(booking, 'approve')}
                            disabled={bookingDecisionMutation.isPending}
                            data-testid={`button-approve-booking-${booking.id}`}
                          >
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleBookingDecision(booking, 'reject')}
                            disabled={bookingDecisionMutation.isPending}
                            data-testid={`button-reject-booking-${booking.id}`}
                          >
                            <ThumbsDown className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  Customer Reviews
                </CardTitle>
                <CardDescription>Manage customer reviews - approve or reject submissions</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={copyReviewLink} data-testid="button-copy-review-link">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Review Link
                </Button>
                <a href="/submit-review" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" data-testid="link-view-review-form">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Form
                  </Button>
                </a>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant={reviewFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setReviewFilter('pending')}
                data-testid="button-filter-pending"
              >
                Pending
              </Button>
              <Button
                variant={reviewFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setReviewFilter('all')}
                data-testid="button-filter-all"
              >
                All Reviews
              </Button>
            </div>

            {reviewsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="font-medium">No {reviewFilter === 'pending' ? 'pending ' : ''}reviews yet</p>
                <p className="text-sm mt-1">Share your review link with customers to collect feedback</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 border rounded-lg bg-white"
                    data-testid={`card-review-${review.id}`}
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="font-semibold text-slate-900">{review.customerName}</span>
                          {review.companyName && <span className="text-slate-500 text-sm">• {review.companyName}</span>}
                          {review.country && <span className="text-slate-400 text-sm">({review.country})</span>}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= parseInt(review.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {review.serviceUsed}
                          </Badge>
                          <Badge
                            variant={
                              review.status === 'approved'
                                ? 'default'
                                : review.status === 'rejected'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                            className="text-xs"
                          >
                            {review.status}
                          </Badge>
                        </div>
                        <p className="text-slate-600 text-sm">{review.reviewText}</p>
                        <p className="text-xs text-slate-400 mt-2">
                          Submitted: {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {review.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleApproveReview(review.id)}
                            disabled={updateReviewMutation.isPending}
                            data-testid={`button-approve-${review.id}`}
                          >
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRejectReview(review.id)}
                            disabled={updateReviewMutation.isPending}
                            data-testid={`button-reject-${review.id}`}
                          >
                            <ThumbsDown className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How to Edit Your Website</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-3 text-slate-600">
              <li className="p-3 bg-slate-50 rounded-lg">
                <strong>Enable Edit Mode</strong> - Click the "Enable Editing" button above
              </li>
              <li className="p-3 bg-slate-50 rounded-lg">
                <strong>Go to Website</strong> - Click "Go to Website" to see your site with editable fields
              </li>
              <li className="p-3 bg-slate-50 rounded-lg">
                <strong>Edit Text</strong> - Click on any text with a{' '}
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">blue highlight</span> to edit it
              </li>
              <li className="p-3 bg-slate-50 rounded-lg">
                <strong>Save Changes</strong> - Return here or use the floating save button to save your edits
              </li>
            </ol>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
