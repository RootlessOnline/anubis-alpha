import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ROB - Self-Evolving AI Assistant',
  description: 'An AI assistant that learns, grows, and manages agents',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
