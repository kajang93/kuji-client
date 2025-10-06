import type { AnimationCategory } from "../types/kujiTypes";
import AnimationCardItem from "./AnimationCardItem";

interface Props {
    categories: AnimationCategory[];
    onStartAnimation: (category: AnimationCategory) => void;
}

export default function AnimationCardList({ categories, onStartAnimation }: Props) {
    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px"}}>
            {categories.map((cat) => (
                <AnimationCardItem
                    key={cat.id}
                    category={cat}
                    onStart={() => onStartAnimation(cat)}
                />
            ))}
        </div>
    );
}
