import { X } from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'

interface PrivacyPolicyModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Privacy Policy</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-sm transition-colors"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6 text-slate-700 dark:text-slate-300">
          {/* Section 1: Introduction */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              1. Introduction
            </h3>
            <p className="text-sm leading-relaxed">
              Maneho AI ("we", "our", "us") is committed to protecting your privacy. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your information when you
              use our service in compliance with Republic Act No. 10173 (Data Privacy Act of 2012).
            </p>
          </section>

          {/* Section 2: Information We Collect */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              2. Information We Collect
            </h3>
            <ul className="list-disc list-inside text-sm leading-relaxed space-y-1">
              <li>Account Information: Email address, name, profile photo (OAuth providers)</li>
              <li>Usage Data: Conversation history, queries submitted, citations viewed</li>
              <li>Technical Data: IP address, browser type, device information</li>
              <li>Authentication Data: OAuth provider tokens (encrypted)</li>
            </ul>
          </section>

          {/* Section 3: How We Use Your Information */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              3. How We Use Your Information
            </h3>
            <ul className="list-disc list-inside text-sm leading-relaxed space-y-1">
              <li>Provide and maintain the service</li>
              <li>Manage your daily quota and account</li>
              <li>Improve AI responses and service quality</li>
              <li>Comply with legal obligations</li>
              <li>Send service-related notifications (quota limits, updates)</li>
            </ul>
          </section>

          {/* Section 4: Data Storage and Security */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              4. Data Storage and Security
            </h3>
            <p className="text-sm leading-relaxed">
              Your data is stored on Firebase (Google Cloud Platform) with encryption at rest and in
              transit (TLS 1.3). Access is restricted to authorized personnel. We conduct regular
              security audits and monitoring.
            </p>
          </section>

          {/* Section 5: Data Retention */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              5. Data Retention
            </h3>
            <ul className="list-disc list-inside text-sm leading-relaxed space-y-1">
              <li>Active accounts: Retained while account is active</li>
              <li>Deleted accounts: 90-day grace period, then permanent deletion</li>
              <li>Conversation history: Deletable anytime via profile settings</li>
              <li>Quota data: Daily reset, historical data for analytics</li>
            </ul>
          </section>

          {/* Section 6: Third-Party Services */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              6. Third-Party Services
            </h3>
            <ul className="list-disc list-inside text-sm leading-relaxed space-y-1">
              <li>Firebase Authentication (Google, GitHub OAuth)</li>
              <li>Firebase Firestore (encrypted data storage)</li>
              <li>Anthropic Claude API (AI processing - no data retention per Anthropic policy)</li>
            </ul>
          </section>

          {/* Section 7: Your Rights (Philippine Data Privacy Act) */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              7. Your Rights Under Philippine Law
            </h3>
            <p className="text-sm leading-relaxed mb-2">
              Under the Data Privacy Act of 2012, you have the right to:
            </p>
            <ul className="list-disc list-inside text-sm leading-relaxed space-y-1">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Data portability</li>
              <li>Object to processing</li>
            </ul>
            <p className="text-sm leading-relaxed mt-2">
              Contact <strong>privacy@maneho.ai</strong> to exercise these rights.
            </p>
          </section>

          {/* Section 8: Contact Information */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              8. Contact Information
            </h3>
            <p className="text-sm leading-relaxed">
              For privacy concerns or to exercise your rights, contact us at{' '}
              <strong>privacy@maneho.ai</strong>. Complaints may be filed with the National Privacy
              Commission (NPC) of the Philippines.
            </p>
          </section>

          {/* Section 9: Changes to This Policy */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              9. Changes to This Policy
            </h3>
            <p className="text-sm leading-relaxed">
              We may update this Privacy Policy. Material changes will be communicated via email.
              Continued use of the service after changes constitutes acceptance.
            </p>
          </section>

          {/* Section 10: Governing Law */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              10. Governing Law
            </h3>
            <p className="text-sm leading-relaxed">
              This Privacy Policy is governed by the laws of the Republic of the Philippines,
              specifically Republic Act No. 10173 (Data Privacy Act of 2012).
            </p>
          </section>

          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            Last Updated:{' '}
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-6">
          <Button onClick={onClose} className="w-full">
            I Understand
          </Button>
        </div>
      </div>
    </div>
  )
}
