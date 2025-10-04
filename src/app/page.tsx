"use client";

import { SWRConfig } from "swr";
import ClientHome from "@/components/Home/ClientHome";

export default function Home() {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        errorRetryCount: 3
      }}
    >
      <ClientHome />
    </SWRConfig>
  );
}
