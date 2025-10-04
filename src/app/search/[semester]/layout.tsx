import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '課程搜尋 - 東華課程',
    description: '搜尋東華大學課程資訊',
};

export default function SearchLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <main className="flex-1">
                {children}
            </main>
        </>
    );
}
