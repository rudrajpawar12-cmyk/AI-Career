import { AppLayout } from "@/components/layouts";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <AppLayout>
      <div className="h-[80vh] flex flex-col items-center justify-center text-center">
        <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-8 max-w-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/dashboard">
          <button className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors">
            Return to Dashboard
          </button>
        </Link>
      </div>
    </AppLayout>
  );
}
