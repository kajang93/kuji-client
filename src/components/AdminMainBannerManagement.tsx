interface AdminMainBannerManagementProps {
    onBack: () => void;
    banners: any[];
    setBanners: (banners: any[]) => void;
}

export default function AdminMainBannerManagement({ onBack, banners, setBanners }: AdminMainBannerManagementProps) {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-8">메인 배너 관리</h1>
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
                <p className="text-slate-500 mb-4">메인 배너 관리 화면입니다.</p>
                <button onClick={onBack} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg">뒤로가기</button>
            </div>
        </div>
    );
}
