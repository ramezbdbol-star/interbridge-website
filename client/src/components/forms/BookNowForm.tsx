import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AlertCircle, CalendarCheck2, Loader2 } from "lucide-react";

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  purpose: string;
  notes: string;
  startAtLocal: string;
  endAtLocal: string;
  needsMeetLink: boolean;
  isUrgent: boolean;
  companyWebsite: string;
}

interface BookingValidationResponse {
  valid: boolean;
  errors: string[];
  warnings: string[];
  hasConflict: boolean;
  isOutsideWorkingWindow: boolean;
  requiresUrgent: boolean;
  googleConnected: boolean;
  googleReachable: boolean;
}

function toIso(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function getVisitorTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function BookNowForm() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validation, setValidation] = useState<BookingValidationResponse | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const [formData, setFormData] = useState<BookingFormData>({
    name: "",
    email: "",
    phone: "",
    purpose: "",
    notes: "",
    startAtLocal: "",
    endAtLocal: "",
    needsMeetLink: false,
    isUrgent: false,
    companyWebsite: "",
  });

  const payloadForValidation = useMemo(() => {
    const startAt = toIso(formData.startAtLocal);
    const endAt = toIso(formData.endAtLocal);

    return {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      purpose: formData.purpose,
      notes: formData.notes,
      startAt,
      endAt,
      visitorTimezone: getVisitorTimezone(),
      needsMeetLink: formData.needsMeetLink,
      isUrgent: formData.isUrgent,
    };
  }, [formData]);

  useEffect(() => {
    if (!payloadForValidation.startAt || !payloadForValidation.endAt) {
      setValidation(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsChecking(true);
      try {
        const response = await fetch("/api/bookings/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadForValidation),
        });

        if (!response.ok) {
          throw new Error("Failed to validate booking");
        }

        const data = (await response.json()) as BookingValidationResponse;
        setValidation(data);
      } catch (error) {
        console.error("Booking validation request failed:", error);
        setValidation({
          valid: false,
          errors: ["Unable to validate availability right now. Please try again."],
          warnings: [],
          hasConflict: false,
          isOutsideWorkingWindow: false,
          requiresUrgent: false,
          googleConnected: false,
          googleReachable: false,
        });
      } finally {
        setIsChecking(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [payloadForValidation]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const startAt = toIso(formData.startAtLocal);
      const endAt = toIso(formData.endAtLocal);

      if (!startAt || !endAt) {
        throw new Error("Start and end time are required.");
      }

      const validationResponse = await fetch("/api/bookings/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          purpose: formData.purpose,
          notes: formData.notes,
          startAt,
          endAt,
          visitorTimezone: getVisitorTimezone(),
          needsMeetLink: formData.needsMeetLink,
          isUrgent: formData.isUrgent,
        }),
      });

      if (!validationResponse.ok) {
        throw new Error("Could not validate booking right now.");
      }

      const latestValidation = (await validationResponse.json()) as BookingValidationResponse;
      setValidation(latestValidation);

      if (!latestValidation.valid) {
        throw new Error(latestValidation.errors.join(" "));
      }

      const response = await apiRequest("POST", "/api/bookings", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        purpose: formData.purpose,
        notes: formData.notes,
        startAt,
        endAt,
        visitorTimezone: getVisitorTimezone(),
        needsMeetLink: formData.needsMeetLink,
        isUrgent: formData.isUrgent,
        companyWebsite: formData.companyWebsite,
      });

      return response.json();
    },
    onSuccess: (data) => {
      setIsSubmitted(true);
      toast({
        title: "Booking Request Submitted",
        description: data?.message || "Your request is pending admin approval.",
      });
    },
    onError: (error: any) => {
      const raw = String(error?.message || "");
      const message = raw.includes("400:") || raw.includes("429:") ? raw : "Failed to submit booking request.";
      toast({
        title: "Submission Failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleChange = (
    field: keyof BookingFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (isSubmitted) {
      setIsSubmitted(false);
    }
  };

  const showValidationErrors = validation && validation.errors.length > 0;

  if (isSubmitted) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <CalendarCheck2 className="mx-auto mb-3 h-12 w-12 text-green-600" />
        <h4 className="mb-2 text-xl font-bold text-slate-900">Request Received</h4>
        <p className="text-slate-700">
          Your booking request is pending approval. Confirmation happens only after we accept it.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            setIsSubmitted(false);
            setFormData({
              name: "",
              email: "",
              phone: "",
              purpose: "",
              notes: "",
              startAtLocal: "",
              endAtLocal: "",
              needsMeetLink: false,
              isUrgent: false,
              companyWebsite: "",
            });
          }}
        >
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        submitMutation.mutate();
      }}
      data-testid="form-book-now"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Name (Optional)</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Your name"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            data-testid="input-book-name"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Purpose (Optional)</label>
          <input
            type="text"
            value={formData.purpose}
            onChange={(e) => handleChange("purpose", e.target.value)}
            placeholder="What is this booking for?"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            data-testid="input-book-purpose"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email (Optional)</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            data-testid="input-book-email"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Phone (Optional)</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="+1 234 567 8900"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            data-testid="input-book-phone"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Start Time *</label>
          <input
            type="datetime-local"
            step={3600}
            required
            value={formData.startAtLocal}
            onChange={(e) => handleChange("startAtLocal", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            data-testid="input-book-start"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">End Time *</label>
          <input
            type="datetime-local"
            step={3600}
            required
            value={formData.endAtLocal}
            onChange={(e) => handleChange("endAtLocal", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            data-testid="input-book-end"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Additional Notes (Optional)</label>
        <textarea
          rows={4}
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Add details that help us prepare..."
          className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          data-testid="textarea-book-notes"
        />
      </div>

      <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={formData.needsMeetLink}
            onChange={(e) => handleChange("needsMeetLink", e.target.checked)}
            className="h-4 w-4"
            data-testid="checkbox-book-meet"
          />
          Add Google Meet link to confirmed booking
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={formData.isUrgent}
            onChange={(e) => handleChange("isUrgent", e.target.checked)}
            className="h-4 w-4"
            data-testid="checkbox-book-urgent"
          />
          Booking After 9 PM or earlier than 7 AM?
        </label>

        <p className="text-xs text-amber-700">Urgent bookings: higher pricing applies.</p>
      </div>

      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={formData.companyWebsite}
        onChange={(e) => handleChange("companyWebsite", e.target.value)}
        className="hidden"
        aria-hidden="true"
      />

      {isChecking && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking availability...
        </div>
      )}

      {showValidationErrors && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" data-testid="book-errors">
          <div className="mb-1 flex items-center gap-2 font-semibold">
            <AlertCircle className="h-4 w-4" />
            Please fix the following:
          </div>
          <ul className="list-disc pl-5">
            {validation?.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {validation && validation.warnings.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800" data-testid="book-warnings">
          <div className="mb-1 font-semibold">Heads up:</div>
          <ul className="list-disc pl-5">
            {validation.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <Button
        type="submit"
        disabled={submitMutation.isPending || (validation ? !validation.valid : false)}
        className="w-full bg-blue-900 py-3 text-white hover:bg-blue-800"
        data-testid="button-submit-booking"
      >
        {submitMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Booking Request"
        )}
      </Button>
    </form>
  );
}
