import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppRoutes from "./routes/Routes";
import AITray from "./components/ai/AITray";
import AppProviders from "./contexts/AppProviders";

const App = () => (
  <AppProviders>
    <AITray />
    <AppRoutes />
    <Toaster />
    <Sonner />
  </AppProviders>
);

export default App;
