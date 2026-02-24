import { X } from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'

interface TermsAndServicesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TermsAndServicesModal({ isOpen, onClose }: TermsAndServicesModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Terms & Services</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              1. Acceptance of Terms
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              By creating an account and using Maneho AI, you agree to be bound by these Terms &
              Services. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              2. Service Description
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Maneho AI provides AI-powered legal assistance and information related to Philippine
              traffic, vehicle regulations, and licensing. Our service is designed to provide
              educational information and is not a substitute for professional legal advice from a
              licensed attorney.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              3. Disclaimer of Legal Advice
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Maneho AI is not a law firm and does not provide legal services. Information provided
              through our platform is for informational purposes only and should not be considered
              as legal advice. For legal matters, please consult with a licensed attorney.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              4. User Responsibilities
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              You agree to use Maneho AI only for lawful purposes and in a way that does not
              infringe upon the rights of others or restrict their use and enjoyment. Prohibited
              behavior includes harassing or causing distress or inconvenience to any person.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              5. Daily Credit Limit
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Each user is allocated a daily limit of AI credits. Credits reset at midnight and are
              non-transferable. Any unused credits do not carry over to the next day. We reserve the
              right to modify credit allocations based on usage patterns or service updates.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              6. Intellectual Property
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              All content, features, and functionality of Maneho AI are owned by Maneho AI, its
              licensors, or other providers of such material and are protected by copyright,
              trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              7. Limitation of Liability
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Maneho AI shall not be liable for any indirect, incidental, special, consequential, or
              punitive damages resulting from your use or inability to use the service, even if
              Maneho AI has been advised of the possibility of such damages.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              8. Privacy Policy
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Your use of Maneho AI is also governed by our Privacy Policy. Please review our
              Privacy Policy to understand our practices regarding the collection and use of your
              personal information.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              9. Modification of Terms
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Maneho AI reserves the right to modify these terms at any time. Changes will be
              effective immediately upon posting to the website. Your continued use of the service
              following any modifications constitutes your acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              10. Governing Law
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              These Terms & Services are governed by the laws of the Republic of the Philippines,
              without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              11. Contact Information
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              If you have any questions about these Terms & Services, please contact us at
              support@maneho.ai
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-6">
          <Button onClick={onClose} className="w-full">
            I Understand and Agree
          </Button>
        </div>
      </div>
    </div>
  )
}
