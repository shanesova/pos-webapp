export default function DecisionDialog({ isOpen, title, message, options, onSelect }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform animate-in zoom-in-95 duration-200 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>
                <div className="flex flex-col gap-3">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => onSelect(option.value)}
                            className={`w-full px-6 py-3 rounded-xl font-semibold transition-all duration-200 active:scale-95 ${option.variant === "primary"
                                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
                                    : option.variant === "secondary"
                                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        : option.variant === "danger"
                                            ? "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200"
                                            : "bg-white border-2 border-gray-200 text-gray-600 hover:border-gray-300"
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
