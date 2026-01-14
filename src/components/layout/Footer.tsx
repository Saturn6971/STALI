import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--card-border)] bg-[var(--card-bg)]/70 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-xs sm:text-sm text-gray-300">
        <div className="space-y-1">
          <div className="text-white font-semibold">Stali</div>
          <p className="text-gray-400">
            Educational project prototype. No real sales, transactions, or customer service are offered.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
          <Link href="/legal/impressum" className="hover:text-white">Impressum</Link>
          <span className="h-4 w-px bg-[var(--card-border)]" aria-hidden="true" />
          <Link href="/legal/terms" className="hover:text-white">Terms & Disclaimer</Link>
          <span className="h-4 w-px bg-[var(--card-border)]" aria-hidden="true" />
          <Link href="/#contact" className="hover:text-white">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
