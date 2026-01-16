import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Star, CheckCircle, Building2, User, MapPin, MessageSquare } from "lucide-react";
import { Link } from "wouter";

const reviewFormSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  companyName: z.string().optional(),
  country: z.string().optional(),
  serviceUsed: z.string().min(1, "Please select a service"),
  rating: z.string().min(1, "Please select a rating"),
  reviewText: z.string().min(20, "Review must be at least 20 characters"),
});

type ReviewFormData = z.infer<typeof reviewFormSchema>;

const services = [
  { value: "sourcing", label: "Product Sourcing & Trading" },
  { value: "quality", label: "Quality Control & Inspection" },
  { value: "interpretation", label: "Interpretation & Support" },
  { value: "business", label: "Business & Legal Services" },
  { value: "guangdong", label: "Guangdong Experiences" },
  { value: "multiple", label: "Multiple Services" },
];

export default function SubmitReview() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      customerName: "",
      companyName: "",
      country: "",
      serviceUsed: "",
      rating: "",
      reviewText: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      const response = await apiRequest("POST", "/api/reviews", data);
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Review Submitted",
        description: "Thank you! Your review will be published after approval.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    submitMutation.mutate(data);
  };

  const selectedRating = parseInt(form.watch("rating") || "0");

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h2>
            <p className="text-slate-600 mb-6">
              Your review has been submitted successfully. It will be published on our website after approval.
            </p>
            <Link href="/">
              <Button data-testid="button-back-home">Back to Homepage</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <Link href="/">
            <img src="/logo.png" alt="InterBridge Logo" className="h-16 mx-auto mb-4 cursor-pointer" />
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Share Your Experience</h1>
          <p className="text-slate-600">
            We value your feedback! Please share your experience working with InterBridge Trans & Trade.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Write a Review
            </CardTitle>
            <CardDescription>
              Your review helps other businesses make informed decisions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <User className="w-4 h-4" />
                          Your Name *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="John Smith" 
                            {...field} 
                            data-testid="input-customer-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <Building2 className="w-4 h-4" />
                          Company Name
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your Company Ltd." 
                            {...field} 
                            data-testid="input-company-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          Country
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="United States" 
                            {...field} 
                            data-testid="input-country"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serviceUsed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Used *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-service">
                              <SelectValue placeholder="Select a service" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {services.map((service) => (
                              <SelectItem key={service.value} value={service.value}>
                                {service.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Rating *</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              className="p-1 transition-transform hover:scale-110"
                              onMouseEnter={() => setHoveredRating(star)}
                              onMouseLeave={() => setHoveredRating(0)}
                              onClick={() => field.onChange(star.toString())}
                              data-testid={`button-rating-${star}`}
                            >
                              <Star
                                className={`w-8 h-8 transition-colors ${
                                  star <= (hoveredRating || selectedRating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-slate-300"
                                }`}
                              />
                            </button>
                          ))}
                          {selectedRating > 0 && (
                            <span className="ml-2 text-sm text-slate-600">
                              {selectedRating === 5 && "Excellent!"}
                              {selectedRating === 4 && "Very Good"}
                              {selectedRating === 3 && "Good"}
                              {selectedRating === 2 && "Fair"}
                              {selectedRating === 1 && "Poor"}
                            </span>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reviewText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Review *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your experience working with InterBridge. What services did you use? How was the quality? Would you recommend us to others?"
                          className="min-h-[150px] resize-none"
                          {...field}
                          data-testid="textarea-review"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={submitMutation.isPending}
                  data-testid="button-submit-review"
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-6">
          Your review will be reviewed before being published on our website.
        </p>
      </div>
    </div>
  );
}
