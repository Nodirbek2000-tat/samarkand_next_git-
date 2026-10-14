import { Suspense } from "react";
import { LoginScreen } from "@/components/admin/login-screen";

export const instant = false;

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-svh bg-ink" />}>
      <LoginScreen />
    </Suspense>
  );
}
