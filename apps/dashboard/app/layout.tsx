import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SyncCore RevOps Engine",
  description: "Event-driven RevOps dashboard for demo-first SaaS infrastructure."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
