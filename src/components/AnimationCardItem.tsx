import type { AnimationCategory } from "../types/kujiTypes";

interface Props {
    category: AnimationCategory;
    onStart: () => void;
}

export default function AnimationCardItem({ category, onStart }: Props) {
    const remaining = category.totalKujiCount - category.usedKujiCount;

    return (
        <div
            className="card"
            style={{
                backgroundImage: `url(${category.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="card-info">
                <h2 className="title">{category.name}</h2>
                <p className="subtitle">{category.subtitle}</p>
                <div className="stock">
                    <div style={{ textAlign: "center" }}>
                        <div>잔여량 / 총수량</div>
                        <strong style={{ fontSize: "20px", display: "block" }}>
                            {remaining}/{category.totalKujiCount}
                        </strong>
                    </div>
                </div>
            </div>

            <button className="start-btn" onClick={onStart}>
                시작하기
            </button>

            <div className="card-footer">
                <div className="level">{category.level}</div>
                <div className="price">₩{category.price.toLocaleString()}</div>
            </div>
        </div>
    );
}
