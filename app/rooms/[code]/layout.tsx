import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

  return {
    title: `Room ${code.toUpperCase()} - Reveal`,
    openGraph: {
      title: `Join Room ${code.toUpperCase()} on Reveal`,
      description: 'Join a fun reveal event and participate in activities before the big moment!',
      url: `${baseUrl}/rooms/${code}`,
      siteName: 'Reveal',
      locale: 'en_US',
      type: 'website',
    },
  };
}

export default function RoomLayout({ children }: { children: React.ReactNode }) {
  return children;
}
