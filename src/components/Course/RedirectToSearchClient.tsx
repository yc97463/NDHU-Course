"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectToSearchClient({ semester }: { semester: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/search/${semester}`);
  }, [router, semester]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center text-gray-600">
      正在前往 {semester} 學期課程搜尋...
    </div>
  );
}
