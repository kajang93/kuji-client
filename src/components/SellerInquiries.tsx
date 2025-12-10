interface SellerInquiriesProps {
    onBack: () => void;
    inquiries: any[];
    onAddComment: (id: string, content: string) => void;
    onEditComment: (id: string, commentId: string, content: string) => void;
    onDeleteComment: (id: string, commentId: string) => void;
    onUpdateStatus: (id: string, status: any) => void;
}

export default function SellerInquiries({ onBack, inquiries, onAddComment, onEditComment, onDeleteComment, onUpdateStatus }: SellerInquiriesProps) {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-8">문의 관리</h1>
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
                <p className="text-slate-500 mb-4">고객 문의 관리 화면입니다.</p>
                <button onClick={onBack} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg">뒤로가기</button>
            </div>
        </div>
    );
}
