export default function Footer() {
    return (
        <footer className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-700/40 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center space-y-6">
                    <div className="space-y-3">
                        <p className="text-lg font-medium text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2">
                            Built with
                            <span className="text-rose-500 animate-pulse text-xl">❤️</span>
                            for NDHU students
                        </p>
                        <p className="text-slate-600 dark:text-slate-300 text-base font-light">
                            讓選課變得更簡單 · 讓學習變得更有趣
                            <span className="inline-block ml-1 text-lg">🦐✨</span>
                        </p>
                    </div>

                    <div className="flex items-center justify-center">
                        <div className="h-px bg-slate-300/60 dark:bg-slate-600/60 w-32"></div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                            <span className="text-xs">©</span>
                            <span>2025 NDHU 東華查課拉</span>
                        </div>
                        <div className="hidden sm:block w-1 h-1 bg-slate-400/60 rounded-full"></div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs">⚡</span>
                            <span>Made with Next.js & TypeScript</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
} 