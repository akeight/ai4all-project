import { Link, useLocation } from "react-router-dom";
import { Activity, FlaskConical, Database, Network, AlertCircle, TrendingUp, Menu } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

const navigation = [
  { name: "Dashboard", href: "/", icon: Activity },
  { name: "Live Demo", href: "/demo", icon: FlaskConical },
  { name: "Data Explorer", href: "/explore", icon: Database },
  // { name: "Interpretability", href: "/interpret", icon: Network },
  { name: "Error Analysis", href: "/errors", icon: AlertCircle },
  { name: "Training Runs", href: "/training", icon: TrendingUp },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-glow">
                <Activity className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-foreground">ALL-Classifier</span>
                <span className="text-xs text-muted-foreground">Blood Cell Analysis</span>
              </div>
            </Link>
            
            <Badge variant="outline" className="hidden md:flex gap-1 text-xs">
              <AlertCircle className="h-3 w-3" />
              Research Only – Not for Clinical Use
            </Badge>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link key={item.name} to={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "gap-2 transition-base",
                      isActive && "shadow-glow"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{item.name}</span>
                  </Button>
                </Link>
              );
            })}
            <ThemeToggle />
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
            <Menu className="h-5 w-5" />
          </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t bg-card">
            <div className="container py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start gap-2"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="container py-6 px-4 flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container py-6 px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 ALL-Classifier Research Project • For Educational & Research Purposes Only</p>
        </div>
      </footer>
    </div>
  );
};
