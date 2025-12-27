import { Link } from 'wouter'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-foreground selection:bg-primary/20 min-h-screen font-sans">
      <header className="border-border/40 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="group flex items-center gap-2">
            <div className="from-primary to-secondary group-hover:shadow-primary/20 flex size-8 items-center justify-center rounded-lg bg-gradient-to-br shadow-lg transition-all">
              <span className="font-display text-background text-lg font-bold">
                C
              </span>
            </div>
            <span className="font-display group-hover:text-primary text-xl font-bold tracking-tight transition-colors">
              Cassi-Fi
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            <a
              href="#"
              className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
            >
              How it works
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
            >
              Features
            </a>
            <button className="bg-foreground text-background hover:bg-primary hover:text-background rounded-md px-4 py-2 text-sm font-medium transition-all">
              Get Started
            </button>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-border/40 bg-muted/20 mt-20 border-t py-8">
        <div className="text-muted-foreground container mx-auto px-4 text-center text-sm">
          <p>© 2025 Cassi-Fi. All processing happens in your browser.</p>
          {import.meta.env.VITE_LAST_UPDATED_DATE && (
            <p className="mt-1">
              Last updated:{' '}
              {new Date(
                import.meta.env.VITE_LAST_UPDATED_DATE
              ).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
        </div>
      </footer>
    </div>
  )
}
