import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum | Stali",
  description: "Legal imprint for the Stali educational project.",
};

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-gray-400">Legal</p>
          <h1 className="text-3xl font-bold text-white">Impressum</h1>
          <p className="text-gray-300">
            This site is a non-commercial school project created for educational purposes only.
            No real marketplace services, transactions, or commercial activities are provided.
          </p>
        </div>

        <div className="space-y-6 bg-[var(--card-bg)]/80 border border-[var(--card-border)] rounded-2xl p-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white">Project Owner</h2>
            <p className="text-gray-300">Stali Student Project (Educational Prototype)</p>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white">Contact</h2>
            <p className="text-gray-300">
              Please reach us through the contact form on the home page or email the project team at
              <span className="font-semibold"> ali.dadak@student.htldornbirn.at</span> for school-work questions.
            </p>
            <p className="text-gray-400 text-sm">
              This address is for educational inquiries only. No commercial support or customer service is offered.
            </p>
            <Link
              href="/#contact"
              className="inline-flex text-[var(--brand)] hover:text-[var(--brand-light)] font-medium"
            >
              Go to contact form
            </Link>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white">Educational Purpose Only</h2>
            <p className="text-gray-300">
              All content, listings, and features are fictional demonstrations. They must not be interpreted as
              offers to buy, sell, or broker goods or services.
            </p>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white">Content Responsibility</h2>
            <p className="text-gray-300">
              The project team curated the content for instructional use. While we aim for accuracy, no guarantee is
              made that information is correct, complete, or current. User-submitted material is not verified and may
              be removed without notice if inappropriate.
            </p>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white">Liability Notice</h2>
            <p className="text-gray-300">
              No liability is assumed for any damages, losses, harassment, misuse, or disputes arising from the use of
              this site or any simulated listings or conversations. Do not rely on this site for real purchasing
              decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
