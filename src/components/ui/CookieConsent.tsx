'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';

const COOKIE_KEY = 'amhsj_cookie_consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(COOKIE_KEY)) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(COOKIE_KEY, 'accepted');
    } catch {}
    setVisible(false);
  };

  const reject = () => {
    try {
      localStorage.setItem(COOKIE_KEY, 'rejected');
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl shadow-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-navy-900 dark:text-white mb-2">
              Cookie Preferences
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              We use essential cookies to ensure the platform functions correctly. Optional analytics
              cookies help us improve your experience. You can accept or reject non-essential cookies.
              Read our{' '}
              <a href="/ethics" className="text-gold-600 hover:underline">
                Privacy Policy
              </a>{' '}
              for more information.
            </p>
          </div>
          <button onClick={reject} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-3 mt-4 justify-end">
          <Button variant="outline" size="sm" onClick={reject}>
            Reject Optional
          </Button>
          <Button variant="gold" size="sm" onClick={accept}>
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}
