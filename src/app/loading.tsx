import { FaSpinner } from "react-icons/fa";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#09090b] text-white">
            <FaSpinner className="text-4xl animate-spin text-purple-500 mb-4" />
            <p className="text-stone-400 font-bold tracking-widest uppercase text-sm">Loading VoltSMS...</p>
        </div>
    );
}
