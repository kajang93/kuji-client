import { useState } from "react";
import Sidebar from "./Sidebar";
import AnimationCardList from "./AnimationCardList";
import type { AnimationCategory } from "../types/kujiTypes";
import { animationData } from "../data/animationData";

export default function MainLayout() {
    const [selectedAnimation, setSelectedAnimation] = useState<AnimationCategory | null>(null);

    return (
        <div style={{ display: "flex", height: "100vh" , paddingTop: "220px"}}>
            <div style={{ flex: 1, padding: "20px" }}>
                {!selectedAnimation ? (
                    <AnimationCardList
                        categories={animationData}
                        onStartAnimation={setSelectedAnimation}
                    />
                ) : (
                    <div>
                        <button onClick={() => setSelectedAnimation(null)}>← 뒤로가기</button>
                        <h2>{selectedAnimation.name} 쿠지 리스트</h2>
                        {/* 여기서 KujiList.tsx 연결 예정 */}
                    </div>
                )}
            </div>
            <Sidebar
                onSelectCategory={setSelectedAnimation}
                onSelect={() => {}}
            />
        </div>
    );
}
