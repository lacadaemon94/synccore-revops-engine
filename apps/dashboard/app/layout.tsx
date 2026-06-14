import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Iter SyncCore",
  description: "Premium RevOps command center for demo-first SaaS event infrastructure."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
