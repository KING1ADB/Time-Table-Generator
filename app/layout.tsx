import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cameroon Secondary School Timetable System',
  description: 'Automated conflict-free timetable generation SaaS platform for Cameroonian secondary schools.',
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
