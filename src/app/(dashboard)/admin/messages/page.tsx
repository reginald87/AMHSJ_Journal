import { Metadata } from 'next';
import { MessagesPageClient } from '@/components/dashboard/MessagesPageClient';

export const metadata: Metadata = {
  title: 'Messages | Admin Dashboard',
};

export default function AdminMessagesPage() {
  return <MessagesPageClient />;
}
