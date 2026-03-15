import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Dark hero — luxury minimal */}
      <section className="bg-charcoal text-cream px-4 pt-24 pb-32 md:pt-32 md:pb-40">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-cream/60 text-sm tracking-[0.2em] uppercase mb-4">
            Discover your signature
          </p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-6">
            Scent DNA
          </h1>
          <p className="text-cream/80 text-lg md:text-xl font-light max-w-md mx-auto mb-14">
            Upload your collection or take the quiz. Get your score, profile, and
            tailored recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/upload"
              className="px-8 py-3.5 bg-cream text-charcoal font-medium text-sm tracking-wide hover:bg-cream/90 transition-colors"
            >
              Upload collection
            </Link>
            <Link
              href="/quiz"
              className="px-8 py-3.5 border border-cream/40 text-cream text-sm tracking-wide hover:bg-cream/10 transition-colors"
            >
              Take the quiz
            </Link>
          </div>
        </div>
      </section>

      {/* Light section — three pillars */}
      <section className="px-4 py-20 md:py-28 border-t border-charcoal/10">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
          <div>
            <span className="text-charcoal/40 font-serif text-2xl">01</span>
            <h2 className="font-serif text-xl text-charcoal mt-3 mb-2">
              Collection score
            </h2>
            <p className="text-charcoal/60 text-sm leading-relaxed">
              See how your bottles stack up and where to grow.
            </p>
          </div>
          <div>
            <span className="text-charcoal/40 font-serif text-2xl">02</span>
            <h2 className="font-serif text-xl text-charcoal mt-3 mb-2">
              Scent profile
            </h2>
            <p className="text-charcoal/60 text-sm leading-relaxed">
              Your dominant notes, strengths, and missing categories.
            </p>
          </div>
          <div>
            <span className="text-charcoal/40 font-serif text-2xl">03</span>
            <h2 className="font-serif text-xl text-charcoal mt-3 mb-2">
              Recommendations
            </h2>
            <p className="text-charcoal/60 text-sm leading-relaxed">
              Curated picks, layering ideas, and when to wear them.
            </p>
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 text-center text-xs text-charcoal/40 border-t border-charcoal/10">
        Scent DNA
      </footer>
    </div>
  );
}
