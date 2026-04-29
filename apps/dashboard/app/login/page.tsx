import type { Metadata } from "next";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to AI Logger Dashboard",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">AI Logger</h1>
          <p className="text-muted-foreground">Sign in to view your logs</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
