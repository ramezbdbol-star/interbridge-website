import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, Shield } from 'lucide-react';

interface DisputeCaseFormData {
  name: string;
  email: string;
  phone: string;
  disputeType: string;
  amountAtRisk: string;
  supplierInfo: string;
  description: string;
}

export function DisputeCaseForm() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<DisputeCaseFormData>({
    name: '',
    email: '',
    phone: '',
    disputeType: 'quality',
    amountAtRisk: '',
    supplierInfo: '',
    description: '',
  });

  const submitMutation = useMutation({
    mutationFn: async (data: DisputeCaseFormData) => {
      const response = await apiRequest('POST', '/api/dispute-cases', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Case Submitted',
        description: "We've received your case. Our team will contact you within 24-48 hours.",
      });
      setIsSubmitted(true);
    },
    onError: () => {
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your case. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  if (isSubmitted) {
    return (
      <div className="bg-green-900/30 rounded-xl p-8 text-center border border-green-700">
        <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h4 className="text-2xl font-bold text-white mb-2">Case Submitted</h4>
        <p className="text-slate-300">
          Thank you for reaching out. Our team will review your case and contact you within 24-48 hours with an
          assessment.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-dispute-case">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Your Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="John Smith"
            data-testid="input-dispute-name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Email *</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="you@company.com"
            data-testid="input-dispute-email"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Phone (Optional)</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="+1 234 567 8900"
            data-testid="input-dispute-phone"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Nature of Dispute *</label>
          <select
            required
            value={formData.disputeType}
            onChange={(e) => setFormData({ ...formData, disputeType: e.target.value })}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            data-testid="select-dispute-type"
          >
            <option value="quality">Quality Issue</option>
            <option value="non-delivery">Non-Delivery</option>
            <option value="fraud">Payment Fraud</option>
            <option value="contract">Contract Breach</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Amount at Risk (USD) *</label>
          <input
            type="text"
            required
            value={formData.amountAtRisk}
            onChange={(e) => setFormData({ ...formData, amountAtRisk: e.target.value })}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="e.g. $15,000"
            data-testid="input-dispute-amount"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Supplier Name/Website</label>
          <input
            type="text"
            value={formData.supplierInfo}
            onChange={(e) => setFormData({ ...formData, supplierInfo: e.target.value })}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Factory name or website URL"
            data-testid="input-dispute-supplier"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Describe Your Situation *</label>
        <textarea
          required
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
          placeholder="Tell us what happened — timeline, communications, and current status..."
          data-testid="textarea-dispute-description"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={submitMutation.isPending}
        className="w-full bg-red-600 text-white"
        data-testid="button-submit-dispute"
      >
        {submitMutation.isPending ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Shield className="w-5 h-5 mr-2" />
            Get Free Case Assessment
          </>
        )}
      </Button>
    </form>
  );
}
