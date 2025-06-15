"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { motion, AnimatePresence } from "motion/react";
import { FileText, AlertTriangle, FileWarning, Code, Search, ExternalLink, ArrowLeftToLine, ChevronLeft, ChevronRight, ArrowRightToLine, Cat, Rocket } from "lucide-react";
import Link from "next/link";

interface PDFViewerProps {
    url: string;
    teaching_plan_link: string;
}

export default function PDFViewer({ url, teaching_plan_link }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number>();
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [workerInitialized, setWorkerInitialized] = useState(false);
    const [scale, setScale] = useState(1);

    // New state variables for handling non-PDF responses
    const [nonPdfContent, setNonPdfContent] = useState<string | null>(null);
    const [contentType, setContentType] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Initialize PDF.js worker
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.min.mjs',
            import.meta.url,
        ).toString();
        setWorkerInitialized(true);

        // Fetch the content to determine if it's a PDF or not
        const fetchContent = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(url);
                const contentType = response.headers.get('Content-Type') || '';
                setContentType(contentType);

                // If not PDF, display the content as text/html
                if (!contentType.includes('application/pdf') || !contentType.includes('application/.pdf')) {
                    const text = await response.text();
                    setNonPdfContent(text);
                    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
                        setError(`不支援的檔案類型: ${contentType}`);
                    }
                }
            } catch (err) {
                console.error("Error fetching content:", err);
                setError("無法載入內容");
            } finally {
                setIsLoading(false);
            }
        };

        fetchContent();
    }, [url]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setIsLoading(false);
    }

    function onDocumentLoadError(error: Error) {
        console.error("PDF loading error:", error);
        setError("無法載入 PDF 文件");
        setIsLoading(false);
    }

    const goToNextPage = () => {
        if (numPages && currentPage < numPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));

    if (!workerInitialized || isLoading) {
        return (
            <motion.div
                className="flex flex-col items-center justify-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="relative mb-6">
                    {/* 貓咪圖標 */}
                    <motion.div
                        animate={{
                            y: [-2, 2, -2],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <Cat className="h-8 w-8 text-blue-500" />
                    </motion.div>
                </div>

                {/* 文字動畫 */}
                <motion.div
                    className="flex items-center space-x-1"
                    animate="visible"
                    initial="hidden"
                    variants={{
                        visible: {
                            transition: {
                                staggerChildren: 0.1
                            }
                        }
                    }}
                >
                    <motion.p
                        className="text-blue-500 font-medium"
                        animate={{
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        確認教學計劃表狀態中
                    </motion.p>
                </motion.div>

                {/* 底部提示文字 */}
                <motion.p
                    className="text-sm text-gray-400 mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    可能需要一點時間
                </motion.p>
            </motion.div>
        );
    }

    // Render HTML/Text content if detected
    if (nonPdfContent && contentType) {
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="rounded-lg overflow-hidden border border-amber-200 mb-4">
                        <div className="bg-amber-50 p-4 flex items-center gap-3">
                            <FileWarning className="text-amber-500 h-5 w-5" />
                            <div>
                                <h3 className="text-amber-800 font-medium">伺服器傳回非 PDF 內容</h3>
                                <p className="text-amber-700 text-sm">內容類型: {contentType}</p>
                            </div>
                        </div>

                        {contentType.includes('text/html') ? (
                            <motion.div
                                className="bg-white p-4 border-t border-amber-100"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="mb-3 flex items-center">
                                    <Code className="text-blue-500 h-4 w-4 mr-2" />
                                    <span className="text-sm font-medium text-gray-700">HTML 內容預覽</span>
                                </div>
                                <div className="border border-gray-200 rounded-md p-4 bg-gray-50 overflow-auto max-h-[500px]">
                                    <iframe
                                        srcDoc={nonPdfContent}
                                        className="w-full h-[400px] border-0"
                                        title="Response Content"
                                    />
                                </div>
                                <div className="mt-4">
                                    <details className="bg-gray-50 rounded-md">
                                        <summary className="p-2 cursor-pointer text-sm text-gray-700 font-medium">
                                            查看原始 HTML
                                        </summary>
                                        <pre className="text-xs p-3 overflow-auto max-h-[300px] bg-gray-100 border-t border-gray-200 rounded-b-md">
                                            {nonPdfContent}
                                        </pre>
                                    </details>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                className="bg-white p-4 border-t border-amber-100"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="mb-3 flex items-center">
                                    <FileText className="text-blue-500 h-4 w-4 mr-2" />
                                    <span className="text-sm font-medium text-gray-700">文字內容</span>
                                </div>
                                <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-sm text-gray-700 max-h-[500px] border border-gray-200">
                                    {nonPdfContent}
                                </pre>
                            </motion.div>
                        )}
                    </div>

                    <motion.div
                        className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-700 mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <p className="text-sm">可能的原因：</p>
                        <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
                            <li>該課程沒有上傳，或不需要上傳課程計畫表</li>
                            <li>教學計畫表不存在或已移除</li>
                            <li>無法解析教學計畫表的檔案格式，有可能教師上傳了錯誤自編的檔案，或是非 PDF 格式</li>
                            <li>校務系統暫時的故障</li>
                        </ul>
                        <div className="mt-3 text-sm flex items-center space-x-1">
                            <p>如欲確認詳細狀況，建議使用以下連結確認：</p>
                            <Link
                                href="https://sys.ndhu.edu.tw/aa/class/course/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline flex items-center space-x-1"
                            >
                                <Search className="h-4 w-4 inline-block" />
                                東華查課拉
                            </Link>、
                            <Link
                                href={teaching_plan_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline flex items-center space-x-1"
                            >
                                <ExternalLink className="h-4 w-4 inline-block" />
                                教學計畫表連結
                            </Link>

                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        );
    }

    return (
        <>
            <AnimatePresence mode="wait">
                {error ? (
                    <motion.div
                        className="text-center py-8 px-4 bg-red-50 rounded-lg border border-red-100 text-red-600 shadow-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-red-500" />
                        <p className="text-lg font-medium mb-2">載入 PDF 時發生錯誤</p>
                        <p>請確認連結是否有效，或稍後再試。</p>
                    </motion.div>
                ) : (
                    <>
                        {/* Floating controls */}
                        <motion.div
                            className="sticky top-20 z-30 mx-auto w-fit mb-4"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-md border border-gray-200 flex items-center space-x-3">
                                <motion.button
                                    onClick={() => setCurrentPage(1)}
                                    className="p-2 rounded-full hover:bg-gray-100 text-gray-700 cursor-pointer"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    disabled={currentPage === 1}
                                >
                                    <ArrowLeftToLine className="h-4 w-4" />
                                </motion.button>

                                <motion.button
                                    onClick={goToPrevPage}
                                    className="p-2 rounded-full hover:bg-gray-100 text-gray-700 cursor-pointer"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </motion.button>

                                <div className="text-sm font-medium text-gray-700 min-w-16 text-center">
                                    {currentPage} / {numPages || '--'}
                                </div>

                                <motion.button
                                    onClick={goToNextPage}
                                    className="p-2 rounded-full hover:bg-gray-100 text-gray-700 cursor-pointer"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    disabled={!numPages || currentPage === numPages}
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </motion.button>

                                <motion.button
                                    onClick={() => numPages && setCurrentPage(numPages)}
                                    className="p-2 rounded-full hover:bg-gray-100 text-gray-700 cursor-pointer"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    disabled={!numPages || currentPage === numPages}
                                >
                                    <ArrowRightToLine className="h-4 w-4" />
                                </motion.button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="flex flex-col items-center"
                        >
                            <Document
                                file={url}
                                onLoadSuccess={onDocumentLoadSuccess}
                                onLoadError={onDocumentLoadError}
                                className="flex flex-col items-center"
                                loading={
                                    <motion.div
                                        className="flex flex-col items-center justify-center py-20"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <div className="relative mb-6">
                                            {/* 火箭圖標 */}
                                            <motion.div
                                                animate={{
                                                    y: [-3, 3, -3],
                                                    scale: [1, 1.1, 1],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                            >
                                                <Rocket className="h-8 w-8 text-blue-500 relative z-10" />
                                            </motion.div>
                                        </div>

                                        {/* 載入文字動畫 */}
                                        <div className="flex flex-col items-center space-y-2">
                                            <motion.p
                                                className="text-blue-500 font-medium flex items-center"
                                                animate={{
                                                    opacity: [0, 1, 0]
                                                }}
                                                transition={{
                                                    duration: 1.5,
                                                    repeat: Infinity,
                                                    ease: "easeInOut",
                                                    times: [0, 0.5, 1]
                                                }}
                                            >
                                                載入 PDF 中
                                            </motion.p>

                                            {/* 進度提示 */}
                                            <motion.p
                                                className="text-sm text-gray-400"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.5 }}
                                            >
                                                正在準備文件內容
                                            </motion.p>
                                        </div>
                                    </motion.div>
                                }
                                error={
                                    <motion.div
                                        className="text-center py-10 text-red-500"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                                        無法載入 PDF，請檢查連結是否有效
                                    </motion.div>
                                }
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentPage}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Page
                                            pageNumber={currentPage}
                                            className="mb-4 shadow-lg rounded overflow-hidden"
                                            width={window.innerWidth > 768 ? 800 * scale : (window.innerWidth - 40) * scale}
                                            renderTextLayer={true}
                                            renderAnnotationLayer={true}
                                            scale={scale}
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            </Document>
                        </motion.div>

                        {numPages && numPages > 0 && (
                            <motion.div
                                className="text-center text-sm text-gray-500 mt-2 mb-8"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <div className="flex items-center justify-center space-x-4">
                                    <div className="flex items-center space-x-1">
                                        <FileText className="h-4 w-4 text-blue-500" />
                                        <span>共 {numPages} 頁</span>
                                    </div>

                                    <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
                                        <motion.button
                                            onClick={zoomOut}
                                            className="p-1.5 hover:bg-gray-200 rounded-md text-gray-700 cursor-pointer"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            title="縮小"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                            </svg>
                                        </motion.button>

                                        <span className="text-gray-600 font-medium min-w-[3.5rem]">
                                            {Math.round(scale * 100)}%
                                        </span>

                                        <motion.button
                                            onClick={zoomIn}
                                            className="p-1.5 hover:bg-gray-200 rounded-md text-gray-700 cursor-pointer"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            title="放大"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                            </svg>
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </>
                )}
            </AnimatePresence >
        </>
    );
}
