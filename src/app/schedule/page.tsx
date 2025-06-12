"use client";

import { SWRConfig } from "swr";
import ScheduleClient from "@/components/Schedule/ScheduleClient";

export default function SchedulePage() {
    return (
        <SWRConfig
            value={{
                revalidateOnFocus: false,
                errorRetryCount: 3
            }}
        >
            <ScheduleClient />
        </SWRConfig>
    );
}
