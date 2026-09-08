import "./globals.css";

export const metadata = {
  title: "Tzaddy Practice Manager",
  description: "Tzaddy Consulting Practice Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}