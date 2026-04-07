import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface TermsConsentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (agreement: {
        isTermsAgreed: boolean;
        isPrivacyAgreed: boolean;
        isMarketingAgreed: boolean;
    }) => void;
}

export default function TermsConsentModal({ isOpen, onClose, onConfirm }: TermsConsentModalProps) {
    const [agreements, setAgreements] = useState({
        isTermsAgreed: false,
        isPrivacyAgreed: false,
        isMarketingAgreed: false
    });

    if (!isOpen) return null;

    const handleAllAgreed = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setAgreements({
            isTermsAgreed: checked,
            isPrivacyAgreed: checked,
            isMarketingAgreed: checked
        });
    };

    const isAllEssentialAgreed = agreements.isTermsAgreed && agreements.isPrivacyAgreed;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="relative p-6 border-b border-slate-800">
                    <button 
                        onClick={onClose}
                        className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                    <h3 className="text-xl font-bold text-white text-center">약관 동의</h3>
                    <p className="text-slate-400 text-sm text-center mt-1">안전한 서비스 이용을 위해 약관에 동의해 주세요.</p>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* All Agree */}
                    <label className="flex items-center p-4 bg-slate-800/50 rounded-2xl cursor-pointer hover:bg-slate-800 transition-colors">
                        <div className="relative flex items-center">
                            <input 
                                type="checkbox" 
                                className="peer sr-only"
                                checked={agreements.isTermsAgreed && agreements.isPrivacyAgreed && agreements.isMarketingAgreed}
                                onChange={handleAllAgreed}
                            />
                            <div className="w-6 h-6 border-2 border-slate-600 rounded-lg flex items-center justify-center peer-checked:bg-rose-500 peer-checked:border-rose-500 transition-all">
                                <Check size={16} className="text-white" />
                            </div>
                        </div>
                        <span className="ml-3 font-bold text-white">전체 동의하기</span>
                    </label>

                    <div className="space-y-4 px-2">
                        {/* Terms */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    className="peer sr-only"
                                    checked={agreements.isTermsAgreed}
                                    onChange={(e) => setAgreements({...agreements, isTermsAgreed: e.target.checked})}
                                />
                                <div className="w-5 h-5 border-2 border-slate-600 rounded-md flex items-center justify-center peer-checked:bg-rose-500 peer-checked:border-rose-500 transition-all group-hover:border-slate-400">
                                    <Check size={14} className="text-white" />
                                </div>
                                <span className="ml-3 text-sm text-slate-300">[필수] 서비스 이용약관 동의</span>
                            </label>
                            <button className="text-xs text-slate-500 underline">보기</button>
                        </div>

                        {/* Privacy */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    className="peer sr-only"
                                    checked={agreements.isPrivacyAgreed}
                                    onChange={(e) => setAgreements({...agreements, isPrivacyAgreed: e.target.checked})}
                                />
                                <div className="w-5 h-5 border-2 border-slate-600 rounded-md flex items-center justify-center peer-checked:bg-rose-500 peer-checked:border-rose-500 transition-all group-hover:border-slate-400">
                                    <Check size={14} className="text-white" />
                                </div>
                                <span className="ml-3 text-sm text-slate-300">[필수] 개인정보 수집 및 이용 동의</span>
                            </label>
                            <button className="text-xs text-slate-500 underline">보기</button>
                        </div>

                        {/* Marketing */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    className="peer sr-only"
                                    checked={agreements.isMarketingAgreed}
                                    onChange={(e) => setAgreements({...agreements, isMarketingAgreed: e.target.checked})}
                                />
                                <div className="w-5 h-5 border-2 border-slate-600 rounded-md flex items-center justify-center peer-checked:bg-rose-500 peer-checked:border-rose-500 transition-all group-hover:border-slate-400">
                                    <Check size={14} className="text-white" />
                                </div>
                                <span className="ml-3 text-sm text-slate-300">[선택] 마케팅 정보 수신 동의</span>
                            </label>
                            <button className="text-xs text-slate-500 underline">보기</button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6">
                    <button
                        disabled={!isAllEssentialAgreed}
                        onClick={() => onConfirm(agreements)}
                        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all transform active:scale-[0.98]
                            ${isAllEssentialAgreed 
                                ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/30' 
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                    >
                        동의하고 계속하기
                    </button>
                </div>
            </div>
        </div>
    );
}
