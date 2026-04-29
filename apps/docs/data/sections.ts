export interface NavSection {
  id: string;
  title: string;
}

export const SECTIONS: NavSection[] = [
  { id: "intro", title: "Introduction" },
  { id: "prerequisites", title: "Prerequisites" },
  { id: "installation", title: "Installation" },
  { id: "database", title: "Database Setup" },
  { id: "env", title: "Environment" },
  { id: "running", title: "Running the Stack" },
  { id: "sdk", title: "SDK Integration" },
  { id: "login", title: "Dashboard Access" },
];

export interface Service {
  name: string;
  desc: string;
  port: string | null;
}

export const SERVICES: Service[] = [
  { name: "API", desc: "Fastify 5.8 REST server", port: "3001" },
  { name: "Dashboard", desc: "Next.js 16.2 App Router", port: "3000" },
  { name: "Database", desc: "PostgreSQL 17 + migrations", port: "5432" },
  { name: "SDK", desc: "Browser TypeScript library", port: null },
];
