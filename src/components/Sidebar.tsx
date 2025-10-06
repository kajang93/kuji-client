import React, { useState } from "react";
import type { AnimationCategory } from "../types/kujiTypes.ts";

const kujiCategories = ["원피스", "나루토", "블리치"];

export default function Sidebar({
                                    onSelect,
                                }: {
    onSelect: (c: string) => void;
    onSelectCategory?: (
        cat: React.SetStateAction<AnimationCategory | null>
    ) => void;
}) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div
            style={{
                width: isOpen ? "200px" : "40px",
                transition: "width 0.3s",
                background: "#f2f2f2",
                height: "100vh",
                overflow: "hidden",
                borderLeft: "1px solid #ddd",
                flexShrink: 0, // 사이드바 닫을 때 메인 레이아웃이 찌그러지지 않게
            }}
        >
            <button
                style={{
                    width: "100%",
                    padding: "8px",
                    border: "none",
                    cursor: "pointer",
                    color: "black",
                    background: "transparent",
                    fontSize: "18px",
                }}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? "⏩" : "⏪"}
            </button>

            <ul
                style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    opacity: isOpen ? 1 : 0,
                    pointerEvents: isOpen ? "auto" : "none",
                    transition: "opacity 0.3s ease",
                }}
            >
                {kujiCategories.map((cat) => (
                    <li key={cat}>
                        <button
                            style={{
                                display: "flex",
                                width: "100%",
                                padding: "10px",
                                textAlign: "left",
                                background: "gray",
                                border: "none",
                                cursor: "pointer",
                                color: "black",
                            }}
                            onClick={() => onSelect(cat)}
                        >
                            {cat}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
