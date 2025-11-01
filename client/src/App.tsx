import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { Demo } from "@/pages/Demo";
import { Explore } from "@/pages/Explore";
import { Interpret } from "@/pages/Interpret";
import { Errors } from "@/pages/Errors";
import { Training } from "@/pages/Training";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/interpret" element={<Interpret />} />
            <Route path="/errors" element={<Errors />} />
            <Route path="/training" element={<Training />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
