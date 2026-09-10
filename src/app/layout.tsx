import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alumnect",
  description: "Connecting alumni and students for mentorship.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
