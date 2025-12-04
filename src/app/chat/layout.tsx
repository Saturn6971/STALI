'use client';

import { ChatProvider } from '@/lib/chat';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ChatProvider>{children}</ChatProvider>;
}



