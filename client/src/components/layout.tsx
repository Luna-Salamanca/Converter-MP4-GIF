import { Link } from "wouter";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <header className="border-b border-border/40 backdrop-blur-md sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="size-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-primary/20 transition-all">
              <span className="font-display font-bold text-background text-lg">G</span>
            </div>
            <span className="font-display font-bold text-xl tracking-tight group-hover:text-primary transition-colors">GIFcraft</span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">How it works</a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</a>
            <button className="bg-foreground text-background px-4 py-2 rounded-md font-medium text-sm hover:bg-primary hover:text-background transition-all">
              Get Started
            </button>
          </nav>
        </div>
      </header>
      <main>
        {children}
      </main>
      <footer className="border-t border-border/40 py-8 mt-20 bg-muted/20">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2025 GIFcraft. All processing happens in your browser.</p>
        </div>
      </footer>
    </div>
  );
}