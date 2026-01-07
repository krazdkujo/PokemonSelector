import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Pokemon Starter Selector',
  description: 'View your trainer profile and selected starter Pokemon',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
