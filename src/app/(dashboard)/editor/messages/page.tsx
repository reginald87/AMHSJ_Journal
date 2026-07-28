import { Metadata } from 'next';
import { MessagesPageClient } from '@/components/dashboard/MessagesPageClient';

export const metadata: Metadata = {
  title: 'Messages | Editor Dashboard',
};

export default function EditorMessagesPage() {
  return <MessagesPageClient />;
}
