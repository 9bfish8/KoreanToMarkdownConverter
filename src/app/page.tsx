// page.tsx
import dynamic from 'next/dynamic';

const KoreanToMarkdownConverter = dynamic(() => import('../app/components/KoreanToMarkdownConverter'), { ssr: false });

export default function Home() {
    return <KoreanToMarkdownConverter />;
}