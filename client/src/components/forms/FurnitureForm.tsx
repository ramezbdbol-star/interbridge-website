import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, Armchair } from 'lucide-react';

interface FurnitureConsultationFormData {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  budgetRange: string;
  description: string;
}

export function FurnitureForm() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FurnitureConsultationFormData>({
    name: '',
    email: '',
    phone: '',
    projectType: 'residential',
    budgetRange: '',
    description: '',
  });

  const submitMutation = useMutation({
    mutationFn: async (data: FurnitureConsultationFormData) => {
      const response = await apiRequest('POST', '/api/furniture-consultation', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Consultation Request Submitted',
        description: 'Our design team will contact you within 24-48 hours.',
      });
      setIsSubmitted(true);
    },
    onError: () => {
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your request. Please try again.',
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
        <h4 className="text-2xl font-bold text-white mb-2">Consultation Request Submitted</h4>
        <p className="text-slate-300">
          Thank you! Our design team will review your project details and contact you within 24-48 hours with a tailored
          proposal.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-furniture-consultation">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Your Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="John Smith"
            data-testid="input-furniture-name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Email *</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="you@company.com"
            data-testid="input-furniture-email"
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
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="+1 234 567 8900"
            data-testid="input-furniture-phone"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Project Type *</label>
          <select
            required
            value={formData.projectType}
            onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            data-testid="select-furniture-project-type"
          >
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="hotel">Hotel & Hospitality</option>
            <option value="office">Office</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Budget Range *</label>
        <select
          required
          value={formData.budgetRange}
          onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          data-testid="select-furniture-budget"
        >
          <option value="" disabled>
            Select your budget range
          </option>
          <option value="under-5k">Under $5,000</option>
          <option value="5k-20k">$5,000 - $20,000</option>
          <option value="20k-50k">$20,000 - $50,000</option>
          <option value="50k-100k">$50,000 - $100,000</option>
          <option value="100k-plus">$100,000+</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Describe Your Project *</label>
        <textarea
          required
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
          placeholder="Tell us about your project — style preferences, room types, specific furniture pieces, timeline..."
          data-testid="textarea-furniture-description"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={submitMutation.isPending}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
        data-testid="button-submit-furniture"
      >
        {submitMutation.isPending ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Armchair className="w-5 h-5 mr-2" />
            Request Free Consultation
          </>
        )}
      </Button>
    </form>
  );
}
