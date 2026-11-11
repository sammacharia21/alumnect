import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Alumnect | Kenya Airways Alumni Mentorship Platform",
  description: "Connect aviation students, first officers, and engineers with veteran captains, instructors, and specialists through intelligent mentorship matching.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <main className="main-layout" style={{ flex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
