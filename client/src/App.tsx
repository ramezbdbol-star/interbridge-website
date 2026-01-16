import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminProvider } from "./lib/adminContext";
import { ContentProvider } from "./lib/contentContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Admin from "@/pages/Admin";
import SubmitReview from "@/pages/SubmitReview";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/admin" component={Admin}/>
      <Route path="/submit-review" component={SubmitReview}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AdminProvider>
          <ContentProvider>
            <Toaster />
            <Router />
          </ContentProvider>
        </AdminProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
