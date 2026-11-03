import Link from "next/link";

export default function PortfolioStaticPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="border-b border-stone-800 bg-stone-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-white hover:text-amber-400 transition-colors flex items-center gap-2"
          >
            <span>🏰</span>
            <span>Portfolio House</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider bg-amber-600 hover:bg-amber-500 text-stone-950 transition-colors shadow-sm"
          >
            <span>◀ Back to House Entrance</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area (Static View Placeholder) */}
      <main className="max-w-4xl mx-auto px-6 py-16 flex-1 w-full space-y-12">
        <section className="text-center space-y-4">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Static Scrolling View
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Developer Portfolio
          </h1>
          <p className="text-stone-400 max-w-xl mx-auto text-base sm:text-lg">
            A traditional, fast-scrolling overview of work, projects, and skills.
          </p>
        </section>

        {/* Placeholder Projects Grid */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-stone-200 border-b border-stone-800 pb-2">
            Featured Projects
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-stone-900/60 border border-stone-800 hover:border-stone-700 transition-colors space-y-3"
              >
                <div className="h-36 rounded-lg bg-stone-800/80 flex items-center justify-center text-stone-600 text-sm font-mono">
                  Project Preview {i}
                </div>
                <h3 className="font-semibold text-white text-lg">Project Title {i}</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Interactive real-time web application built with modern web technologies, optimized performance, and responsive UI.
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800 py-6 text-center text-xs text-stone-500">
        Static Portfolio View • Switch back anytime to the 3D House
      </footer>
    </div>
  );
}

