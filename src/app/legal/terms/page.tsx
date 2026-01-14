import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Disclaimer | Stali",
  description: "Terms of service and liability disclaimer for the Stali educational project.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-6 sm:space-y-8">
        <div className="space-y-2">
          <p className="text-xs sm:text-sm uppercase tracking-wide text-gray-400">Legal</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Terms of Service & Liability Disclaimer</h1>
          <p className="text-gray-300 text-sm sm:text-base">
            Stali is an educational, non-commercial school project. By using this site you acknowledge that all
            features are demonstrations only and no real-world services are provided.
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6 bg-[var(--card-bg)]/80 border border-[var(--card-border)] rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <section className="space-y-2">
            <h2 className="text-lg sm:text-xl font-semibold text-white">1. Educational Prototype</h2>
            <p className="text-gray-300">
              The site exists solely for coursework and testing ideas. It is not a business, marketplace, or platform
              for actual buying, selling, or brokering of goods.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg sm:text-xl font-semibold text-white">2. No Real Transactions</h2>
            <p className="text-gray-300">
              Listings, prices, messages, and profiles are hypothetical. No payments, shipping, or fulfillment are
              supported. Do not arrange real sales or purchases here. We are not liable for any agreements users make
              outside this demo.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg sm:text-xl font-semibold text-white">3. No Warranty; Use At Your Own Risk</h2>
            <p className="text-gray-300">
              The site and all content are provided "as is" without warranties of any kind. We disclaim all liability
              for errors, omissions, downtime, data loss, or any damages arising from use or inability to use the site.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg sm:text-xl font-semibold text-white">4. Content Accuracy and Moderation</h2>
            <p className="text-gray-300">
              Information may be incomplete or outdated. User-generated content is not verified and may be removed
              without notice. We are not responsible for the accuracy, legality, or safety of any listings or messages.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg sm:text-xl font-semibold text-white">5. User Conduct</h2>
            <p className="text-gray-300">
              Harassment, abusive behavior, or unlawful content are prohibited. Users remain solely responsible for
              their interactions. The project team is not liable for any misconduct between users, including harassment
              or disputes.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg sm:text-xl font-semibold text-white">6. No Liability for Sales or Damages</h2>
            <p className="text-gray-300">
              We assume no liability for any sales attempts, promises, losses, or damages of any kind, including
              indirect or consequential damages, whether related to goods quality, pricing, delivery, fraud, harassment,
              or misuse of the platform.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg sm:text-xl font-semibold text-white">7. Personal Data</h2>
            <p className="text-gray-300">
              Do not submit sensitive or real payment information. Any data entered is treated as demonstration data and
              may be deleted at any time. We do not provide production-grade security or compliance guarantees.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg sm:text-xl font-semibold text-white">8. Changes</h2>
            <p className="text-gray-300">
              These terms may be updated as the course project evolves. Continued use of the site after changes means
              you accept the updated terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg sm:text-xl font-semibold text-white">9. Contact</h2>
            <p className="text-gray-300">
              For questions about the project, please use the contact form on the home page or email the team at
              <span className="font-semibold"> ali.dadak@student.htldornbirn.at</span>.
            </p>
            <Link
              href="/#contact"
              className="inline-flex text-[var(--brand)] hover:text-[var(--brand-light)] font-medium"
            >
              Go to contact form
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}

