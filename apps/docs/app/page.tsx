"use client";

import React from "react";
import Sidebar from "@/components/sidebar";
import TableOfContents from "@/components/table-of-contents";
import CodeBlock from "@/components/code-block";
import {
  H2,
  H3,
  Paragraph,
  Callout,
  ServiceCard,
  CredentialCard,
} from "@/components/mdx-components";
import Logo from "@/components/logo";
import { SECTIONS, SERVICES } from "@/data/sections";
import { useActiveSection } from "@/hooks/use-active-section";

export default function DocsPage() {
  const activeSection = useActiveSection(SECTIONS.map((s) => s.id));

  return (
    <div className="min-h-screen flex">
      <Sidebar items={SECTIONS} activeSection={activeSection} />

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg/90 backdrop-blur-md">
        <div className="flex items-center gap-2.5 px-4 py-3">
          <div className="w-6 h-6 rounded bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Logo size={12} />
          </div>
          <span className="font-semibold text-sm text-text">AI Logger</span>
          <span className="text-text-dim text-xs ml-1 font-mono">Docs</span>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 pt-14 lg:pt-0">
        <article className="max-w-2xl mx-auto px-6 py-10 lg:py-16 lg:px-10">
          {/* Hero */}
          <header className="mb-12 pb-10 border-b border-border">
            <p className="text-[11px] font-mono font-medium uppercase tracking-widest text-accent mb-4">
              Getting Started
            </p>
            <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-text mb-4">
              AI Logger Setup Guide
            </h1>
            <p className="text-text-secondary text-base leading-relaxed max-w-lg">
              A self-hosted, open-source error logging tool with AI-powered
              explanations. Complete guide to running the full stack locally.
            </p>
          </header>

          {/* Introduction */}
          <section id="intro">
            <H2 id="intro">Introduction</H2>
            <Paragraph>
              AI Logger is a monorepo containing four packages: a Fastify REST
              API, a Next.js dashboard, a PostgreSQL database with migrations,
              and a browser SDK. This guide walks you through running everything
              locally.
            </Paragraph>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
              {SERVICES.map((s) => (
                <ServiceCard key={s.name} {...s} />
              ))}
            </div>
          </section>

          {/* Prerequisites */}
          <section id="prerequisites">
            <H2 id="prerequisites">Prerequisites</H2>

            <H3>Required Software</H3>
            <ul className="list-disc list-inside space-y-1.5 mb-6">
              <li>
                <strong className="text-text">Node.js</strong>{" "}
                <code>{">="} 22.0.0</code>
              </li>
              <li>
                <strong className="text-text">pnpm</strong>{" "}
                <code>10.x</code> (package manager)
              </li>
              <li>
                <strong className="text-text">PostgreSQL</strong>{" "}
                <code>17</code> (running locally)
              </li>
            </ul>

            <H3>Create the Database</H3>
            <Paragraph>
              Before running migrations, create a PostgreSQL database. The
              examples below use <code>logs_ai</code> as the database name.
            </Paragraph>
            <CodeBlock language="sql">
              {`# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE logs_ai;
\\q`}
            </CodeBlock>
          </section>

          {/* Installation */}
          <section id="installation">
            <H2 id="installation">Installation</H2>

            <H3>Clone and Install</H3>
            <Paragraph>
              Install dependencies across all workspaces. This project uses
              pnpm workspaces + Turborepo.
            </Paragraph>
            <CodeBlock language="bash">
              {`# Install all dependencies
pnpm install

# Build all packages
pnpm build`}
            </CodeBlock>
          </section>

          {/* Database Setup */}
          <section id="database">
            <H2 id="database">Database Setup</H2>

            <H3>Create .env for Database</H3>
            <Paragraph>
              The database package needs its own <code>.env</code> file. Create{" "}
              <code>packages/database/.env</code>:
            </Paragraph>
            <CodeBlock filename="packages/database/.env">
              {`DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/logs_ai?schema=public

# Admin Seed (used by db:seed)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me-immediately`}
            </CodeBlock>

            <H3>Run Migrations</H3>
            <Paragraph>
              This creates all tables. Migrations live in{" "}
              <code>packages/database/migrations/</code>.
            </Paragraph>
            <CodeBlock language="bash">
              {`pnpm --filter @ai-logger/database db:migrate`}
            </CodeBlock>

            <H3>Seed the Admin User</H3>
            <Paragraph>
              Creates the default admin user for dashboard login. Customize
              credentials via the <code>.env</code> file above.
            </Paragraph>
            <CodeBlock language="bash">
              {`pnpm --filter @ai-logger/database db:seed`}
            </CodeBlock>
          </section>

          {/* Environment */}
          <section id="env">
            <H2 id="env">Environment Configuration</H2>

            <H3>API Environment</H3>
            <Paragraph>
              Create <code>apps/api/.env</code> with the same database URL plus
              API settings:
            </Paragraph>
            <CodeBlock filename="apps/api/.env">
              {`DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/logs_ai?schema=public
API_PORT=3001
JWT_SECRET=dev-secret-change-me-in-production
CORS_ORIGIN=http://localhost:3000

# AI Provider (Google Gemini default)
AI_PROVIDER=google
AI_MODEL=gemini-2.0-flash
GOOGLE_GENERATIVE_AI_API_KEY=your-google-api-key-here

# Admin Seed
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me-immediately`}
            </CodeBlock>

            <H3>Dashboard Environment</H3>
            <Paragraph>
              Create <code>apps/dashboard/.env</code>:
            </Paragraph>
            <CodeBlock filename="apps/dashboard/.env">
              {`NEXT_PUBLIC_API_URL=http://localhost:3001`}
            </CodeBlock>

            <Callout variant="info">
              <strong className="text-text">Note:</strong> The API{" "}
              <code>.env</code> must load automatically. If you get database
              connection errors on login, ensure <code>dotenv</code> is
              configured in the API server entry point.
            </Callout>
          </section>

          {/* Running */}
          <section id="running">
            <H2 id="running">Running the Stack</H2>

            <H3>Start All Services</H3>
            <Paragraph>
              From the repo root, run the dev command. Turborepo starts all
              packages in parallel.
            </Paragraph>
            <CodeBlock language="bash">{`turbo dev`}</CodeBlock>

            <Callout variant="warning">
              <strong className="text-text">Tip:</strong> If you see "No locally
              installed <code>turbo</code> found", run{" "}
              <code>pnpm install</code> first to ensure the local version is
              available.
            </Callout>

            <H3>Verify Services</H3>
            <Paragraph>Once running, verify each service is healthy:</Paragraph>

            <table className="my-4">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>URL</th>
                  <th>Expected</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-medium text-text">Dashboard</td>
                  <td>
                    <code>http://localhost:3000</code>
                  </td>
                  <td>Login page loads</td>
                </tr>
                <tr>
                  <td className="font-medium text-text">API</td>
                  <td>
                    <code>http://localhost:3001/health</code>
                  </td>
                  <td>
                    <code>{`{"status":"ok"}`}</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* SDK */}
          <section id="sdk">
            <H2 id="sdk">SDK Integration</H2>

            <H3>Browser Integration</H3>
            <Paragraph>
              The SDK captures JavaScript errors and sends them to your API.
              Include it in your HTML or import it as a module.
            </Paragraph>
            <CodeBlock filename="test.html" language="html">
              {`<!DOCTYPE html>
<html>
<head>
  <title>SDK Test</title>
  <script src="http://localhost:3001/sdk.js"></script>
  <script>
    AiLogger.init({ endpoint: 'http://localhost:3001/logs' });
  </script>
</head>
<body>
  <button onclick="throw new Error('Test error')">
    Trigger Error
  </button>
</body>
</html>`}
            </CodeBlock>
            <Paragraph>
              Open this file in a browser, click the button, and watch the error
              appear in your dashboard.
            </Paragraph>
          </section>

          {/* Dashboard Access */}
          <section id="login">
            <H2 id="login">Dashboard Access</H2>

            <H3>Sign In</H3>
            <Paragraph>
              Navigate to <code>http://localhost:3000</code> and log in with the
              credentials from your seed step.
            </Paragraph>

            <div className="grid grid-cols-2 gap-3 my-5 max-w-sm">
              <CredentialCard
                label="Email"
                value="admin@example.com"
              />
              <CredentialCard
                label="Password"
                value="change-me-immediately"
              />
            </div>

            <Callout variant="danger">
              If login fails with a database error, verify the API server can
              connect to PostgreSQL and that the <code>DATABASE_URL</code> in{" "}
              <code>apps/api/.env</code> is correct.
            </Callout>
          </section>

          {/* Footer */}
          <footer className="mt-20 pt-8 border-t border-border">
            <p className="text-xs text-text-dim font-mono">
              AI Logger Documentation — Next.js 16 + Tailwind CSS
            </p>
          </footer>
        </article>
      </main>

      <TableOfContents items={SECTIONS} activeSection={activeSection} />
    </div>
  );
}
