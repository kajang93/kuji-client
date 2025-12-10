import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    type?: "success" | "error" | "warning" | "info";
}

export default function AlertModal({
    isOpen,
    onClose,
    title,
    message,
    type = "info",
}: AlertModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-slate-400" />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div
                        className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center mb-4",
                            type === "success" && "bg-green-100 text-green-600",
                            type === "error" && "bg-red-100 text-red-600",
                            type === "warning" && "bg-amber-100 text-amber-600",
                            type === "info" && "bg-blue-100 text-blue-600"
                        )}
                    >
                        {type === "success" && <CheckCircle className="w-6 h-6" />}
                        {type === "error" && <AlertCircle className="w-6 h-6" />}
                        {type === "warning" && <AlertTriangle className="w-6 h-6" />}
                        {type === "info" && <Info className="w-6 h-6" />}
                    </div>

                    {title && <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>}
                    <p className="text-slate-600 mb-6">{message}</p>

                    <button
                        onClick={onClose}
                        className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}
