import { useEffect, useRef, useState } from "react";

export default function ChatPanel() {

    const [messages, setMessages] = useState([]);

    const [input, setInput] = useState("");

    const [loading, setLoading] = useState(false);

    const bottomRef = useRef(null);

    useEffect(() => {

        bottomRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [messages, loading]);

    async function sendMessage() {

        if (!input.trim() || loading) {
            return;
        }

        const prompt = input.trim();

        setMessages(prev => [
            ...prev,
            {
                role: "user",
                content: prompt
            }
        ]);

        setInput("");

        setLoading(true);

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        prompt
                    })
                }
            );

            const rawText = await response.text();

            let data = {};

            try {

                data = JSON.parse(rawText);

            }

            catch {

                data = {
                    response: rawText
                };
            }

            if (!response.ok) {

                throw new Error(
                    data?.detail ||
                    data?.response ||
                    "Backend request failed"
                );
            }

            let content = "";

            if (typeof data === "string") {

                content = data;
            }

            else if (typeof data?.response === "string") {

                content = data.response;
            }

            else {

                content = JSON.stringify(
                    data,
                    null,
                    2
                );
            }

            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    content
                }
            ]);

        }

        catch (error) {

            console.error(error);

            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        error?.message ||
                        "Unknown error occurred"
                }
            ]);
        }

        finally {

            setLoading(false);
        }
    }

    return (

        <div
            style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
                background: "#050505"
            }}
        >

            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "40px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "28px"
                }}
            >

                {
                    messages.length === 0 && (

                        <div
                            style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "18px"
                            }}
                        >

                            <div
                                style={{
                                    fontSize: "52px",
                                    fontWeight: 700,
                                    letterSpacing: "8px"
                                }}
                            >
                                HELIX
                            </div>

                            <div
                                className="muted"
                                style={{
                                    fontSize: "18px",
                                    textAlign: "center",
                                    maxWidth: "520px",
                                    lineHeight: 1.7
                                }}
                            >
                                Calm AI workspace built for awareness,
                                automation, and intelligent interaction.
                            </div>

                        </div>
                    )
                }

                {
                    messages.map((message, index) => (

                        <div
                            key={index}
                            style={{
                                display: "flex",

                                justifyContent:
                                    message.role === "user"
                                        ? "flex-end"
                                        : "flex-start"
                            }}
                        >

                            <div
                                className="card"
                                style={{

                                    maxWidth:
                                        message.role === "user"
                                            ? "540px"
                                            : "900px",

                                    width:
                                        message.role === "assistant"
                                            ? "100%"
                                            : "auto",

                                    padding: "20px",

                                    lineHeight: 1.8,

                                    whiteSpace: "pre-wrap",

                                    overflowWrap: "break-word",

                                    fontSize: "15px",

                                    background:
                                        message.role === "user"
                                            ? "#151515"
                                            : "#0f0f0f"
                                }}
                            >

                                <div
                                    style={{
                                        marginBottom: "10px",
                                        fontSize: "12px",
                                        letterSpacing: "1px",
                                        color: "#7b7b7b",
                                        textTransform: "uppercase"
                                    }}
                                >
                                    {
                                        message.role === "user"
                                            ? "You"
                                            : "HELIX"
                                    }
                                </div>

                                <div>
                                    {
                                        typeof message.content === "string"
                                            ? message.content
                                            : JSON.stringify(
                                                message.content,
                                                null,
                                                2
                                            )
                                    }
                                </div>

                            </div>

                        </div>
                    ))
                }

                {
                    loading && (

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-start"
                            }}
                        >

                            <div
                                className="card"
                                style={{
                                    padding: "18px 20px",
                                    fontSize: "15px",
                                    color: "#7b7b7b"
                                }}
                            >
                                HELIX is thinking...
                            </div>

                        </div>
                    )
                }

                <div ref={bottomRef} />

            </div>

            <div
                style={{
                    padding: "24px",
                    borderTop: "1px solid #1d1d1d",
                    background: "#080808"
                }}
            >

                <div
                    className="panel"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "14px"
                    }}
                >

                    <input
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                        }}

                        onKeyDown={(e) => {

                            if (
                                e.key === "Enter" &&
                                !e.shiftKey
                            ) {

                                e.preventDefault();

                                sendMessage();
                            }
                        }}

                        placeholder="Ask HELIX anything..."

                        style={{
                            flex: 1,
                            background: "transparent",
                            border: "none",
                            outline: "none",
                            color: "white",
                            fontSize: "16px"
                        }}
                    />

                    <button
                        onClick={sendMessage}
                        disabled={loading}

                        style={{
                            background: "#f5f5f5",
                            color: "black",
                            border: "none",
                            padding: "12px 22px",
                            borderRadius: "14px",
                            fontWeight: 600,
                            cursor: "pointer",
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {
                            loading
                                ? "Thinking..."
                                : "Send"
                        }
                    </button>

                </div>

            </div>

        </div>
    );
}