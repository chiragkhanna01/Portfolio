"use client";

import { useEffect, useState } from "react";
import Vapi from "@vapi-ai/web";

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);
console.log(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);
console.log(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID);

export default function VapiAssistant() {
    const [isTalking, setIsTalking] = useState(false);

    useEffect(() => {
        vapi.on("call-start", () => {
            setIsTalking(true);
        });

        vapi.on("call-end", () => {
            setIsTalking(false);
        });

        return () => {
            vapi.removeAllListeners();
        };
    }, []);

    const toggleCall = async () => {
        if (isTalking) {
            await vapi.stop();
        } else {
            await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!);
        }
    };

    return (
        <button
            onClick={toggleCall}
            style={{
                position: "fixed",
                bottom: "30px",
                right: "30px",
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                border: "none",
                background: "#111827",
                color: "white",
                fontSize: "28px",
                cursor: "pointer",
                zIndex: 9999,
            }}
        >
            {isTalking ? "🔴" : "🎙️"}
        </button>
    );
}