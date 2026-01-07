import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Select Starter - Pokemon Starter Selector',
  description: 'Browse and select your starter Pokemon from all 151 original Pokemon',
};

export default function SelectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
