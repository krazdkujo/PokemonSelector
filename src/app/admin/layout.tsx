import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Panel - Pokemon Starter Selector',
  description: 'View all registered trainers and their selected Pokemon',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
