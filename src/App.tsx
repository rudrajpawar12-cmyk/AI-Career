import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Route,
  Switch,
  Router as WouterRouter,
  Redirect,
} from "wouter";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

import LandingPage from "@/pages/landing";
import { Login, Signup, ForgotPassword } from "@/pages/auth";
import Onboarding from "@/pages/onboarding";
import Dashboard from "@/pages/dashboard";
import Resume from "@/pages/resume";
import GithubAnalyzer from "@/pages/github";
import Applications from "@/pages/applications";
import MentorChat from "@/pages/mentor";
import SkillGap from "@/pages/skills";
import Roadmap from "@/pages/roadmap";
import InterviewPractice from "@/pages/interview";
import Projects from "@/pages/projects";
import Certificates from "@/pages/certificates";
import Goals from "@/pages/goals";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

/* ------------------------------ */
/* Shared spinner */
/* ------------------------------ */

function FullScreenSpinner() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

/* ------------------------------ */
/* Protected Route */
/* ------------------------------ */
/*
 * Used for every authenticated page EXCEPT /onboarding.
 * Redirect rules:
 *   - no session            -> /login
 *   - onboarding incomplete -> /onboarding
 *   - otherwise             -> render the page
 *
 * onboarding_completed is read from the `profiles` table (via
 * ProfileContext), which is the single source of truth — this is what
 * makes the redirect correct on first login, after finishing onboarding,
 * and after a full page refresh.
 */
function ProtectedRoute({
  component: Component,
}: {
  component: React.ComponentType;
}) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  if (authLoading) {
    return <FullScreenSpinner />;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (profileLoading) {
    return <FullScreenSpinner />;
  }

  const onboardingCompleted = profile?.onboarding_completed === true;

  if (!onboardingCompleted) {
    return <Redirect to="/onboarding" />;
  }

  return <Component />;
}

/* ------------------------------ */
/* Onboarding Route */
/* ------------------------------ */
/*
 * Used only for /onboarding.
 *   - no session          -> /login
 *   - already onboarded   -> /dashboard (so a returning user can't get
 *                            routed back into the wizard)
 *   - otherwise           -> render the onboarding wizard
 */
function OnboardingRoute({
  component: Component,
}: {
  component: React.ComponentType;
}) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  if (authLoading) {
    return <FullScreenSpinner />;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (profileLoading) {
    return <FullScreenSpinner />;
  }

  const onboardingCompleted = profile?.onboarding_completed === true;

  if (onboardingCompleted) {
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
}

/* ------------------------------ */
/* Public Route */
/* ------------------------------ */
/*
 * Used for /login, /signup, /forgot-password.
 * A signed-in user is sent straight to the right place (dashboard or
 * onboarding) instead of always landing on /dashboard and bouncing again.
 */
function PublicRoute({
  component: Component,
}: {
  component: React.ComponentType;
}) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  if (authLoading) {
    return <FullScreenSpinner />;
  }

  if (user) {
    if (profileLoading) {
      return <FullScreenSpinner />;
    }

    const onboardingCompleted = profile?.onboarding_completed === true;

    return <Redirect to={onboardingCompleted ? "/dashboard" : "/onboarding"} />;
  }

  return <Component />;
}

/* ------------------------------ */
/* Router */
/* ------------------------------ */

function Router() {
  return (
    <Switch>
      {/* Public */}

      <Route path="/" component={LandingPage} />

      <Route
        path="/login"
        component={() => <PublicRoute component={Login} />}
      />

      <Route
        path="/signup"
        component={() => <PublicRoute component={Signup} />}
      />

      <Route
        path="/forgot-password"
        component={() => (
          <PublicRoute component={ForgotPassword} />
        )}
      />

      {/* Protected */}

      <Route
        path="/onboarding"
        component={() => (
          <OnboardingRoute component={Onboarding} />
        )}
      />

      <Route
        path="/dashboard"
        component={() => (
          <ProtectedRoute component={Dashboard} />
        )}
      />

      <Route
        path="/resume"
        component={() => (
          <ProtectedRoute component={Resume} />
        )}
      />

      <Route
        path="/github"
        component={() => (
          <ProtectedRoute component={GithubAnalyzer} />
        )}
      />

      <Route
        path="/applications"
        component={() => (
          <ProtectedRoute component={Applications} />
        )}
      />

      <Route
        path="/mentor"
        component={() => (
          <ProtectedRoute component={MentorChat} />
        )}
      />

      <Route
        path="/skills"
        component={() => (
          <ProtectedRoute component={SkillGap} />
        )}
      />

      <Route
        path="/roadmap"
        component={() => (
          <ProtectedRoute component={Roadmap} />
        )}
      />

      <Route
        path="/interview"
        component={() => (
          <ProtectedRoute component={InterviewPractice} />
        )}
      />

      <Route
        path="/projects"
        component={() => (
          <ProtectedRoute component={Projects} />
        )}
      />

      <Route
        path="/certificates"
        component={() => (
          <ProtectedRoute component={Certificates} />
        )}
      />

      <Route
        path="/goals"
        component={() => (
          <ProtectedRoute component={Goals} />
        )}
      />

      <Route
        path="/profile"
        component={() => (
          <ProtectedRoute component={Profile} />
        )}
      />

      <Route
        path="/settings"
        component={() => (
          <ProtectedRoute component={Settings} />
        )}
      />

      <Route component={NotFound} />
    </Switch>
  );
}

/* ------------------------------ */
/* App */
/* ------------------------------ */

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter
          base={import.meta.env.BASE_URL.replace(/\/$/, "")}
        >
          <Router />
        </WouterRouter>

        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}