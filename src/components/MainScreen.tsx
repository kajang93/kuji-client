
export default function MainScreen({ onStart }: { onStart: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-white">
            <h1 className="text-5xl font-bold mb-8">🎟️ KUJI 뽑기</h1>
            <p className="text-lg mb-10 opacity-80">애니메이션별 랜덤 뽑기를 즐겨보세요!</p>
            <button
                onClick={onStart}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-3 rounded-2xl transition-all shadow-lg"
            >
                시작하기
            </button>
        </div>
    );
}
