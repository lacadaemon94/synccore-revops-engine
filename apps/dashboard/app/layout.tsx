import type { Metadata } from "next";
import { Nunito, Roboto, Roboto_Mono } from "next/font/google";

import { MobileSidebarBackdrop } from "@/components/AppShell/MobileSidebarBackdrop";
import { Sidebar } from "@/components/AppShell/Sidebar";
import { Topbar } from "@/components/AppShell/Topbar";
import { OnboardingProvider } from "@/components/Onboarding/OnboardingProvider";

import "./globals.css";
import styles from "./layout.module.css";

const headingFont = Nunito({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "600", "700"]
});

const bodyFont = Roboto({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "700"]
});

const monoFont = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"]
});

export const metadata: Metadata = {
  title: "Iter SyncCore",
  description: "Premium RevOps command center for demo-first SaaS event infrastructure.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${headingFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var m=document.cookie.match(/(?:^|; )theme=(light|dark)/);var t=m?m[1]:'dark';document.documentElement.dataset.theme=t;var s=document.cookie.match(/(?:^|; )sidebar=(collapsed|expanded)/);document.documentElement.dataset.sidebar=s?s[1]:'expanded';}catch(e){}`
          }}
        />
      </head>
      <body>
        <OnboardingProvider>
          <div className={styles.shell}>
            <MobileSidebarBackdrop />
            <Sidebar />
            <div className={styles.main}>
              <Topbar />
              <main className={styles.content}>{children}</main>
            </div>
          </div>
        </OnboardingProvider>
      </body>
    </html>
  );
}
