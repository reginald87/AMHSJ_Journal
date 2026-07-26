'use client';

import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Input';
import { toast } from 'sonner';

const subjectOptions = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'submission', label: 'Submission Question' },
  { value: 'review', label: 'Review Process' },
  { value: 'editorial', label: 'Editorial Board' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'other', label: 'Other' },
];

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Failed to submit' }));
        throw new Error(error.error || 'Failed to submit form');
      }

      setLoading(false);
      setSubmitted(true);
    } catch (err) {
      setLoading(false);
      toast.error(err instanceof Error ? err.message : 'Failed to send message');
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-2">Message Sent!</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Thank you for reaching out. Our editorial team will respond within 2–3 business days.
        </p>
        <Button variant="outline" onClick={() => setSubmitted(false)}>
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <Input
          label="First Name"
          name="firstName"
          placeholder="Enter your first name"
          required
        />
        <Input
          label="Last Name"
          name="lastName"
          placeholder="Enter your last name"
          required
        />
      </div>

      <Input
        label="Email Address"
        name="email"
        type="email"
        placeholder="you@example.com"
        required
      />

      <Input
        label="Affiliation (Optional)"
        name="affiliation"
        placeholder="University or institution"
      />

      <Select
        label="Subject"
        name="subject"
        options={subjectOptions}
        placeholder="Select a topic"
        required
      />

      <Textarea
        label="Message"
        name="message"
        placeholder="How can we help you?"
        rows={5}
        required
      />

      <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
        {loading ? (
          'Sending...'
        ) : (
          <>
            Send Message
            <Send className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </form>
  );
}
