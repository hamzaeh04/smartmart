import { useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-subtle px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Compass className="size-7" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-1.5 text-sm text-slate-500">The page you're looking for doesn't exist or has moved.</p>
      </div>
      <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
    </div>
  );
}
