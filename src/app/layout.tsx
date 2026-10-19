import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Alumnect | AI-Driven Aviation Mentorship Platform",
  description: "Connect aviation students, first officers, and engineers with veteran captains, instructors, and specialists using SBERT semantic matching.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="main-layout">{children}</main>
      </body>
    </html>
  );
}
