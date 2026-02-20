import React from 'react';
import { cn } from "@/lib/utils";

const MagicButton = ({
    children,
    className,
    onClick,
    ...props
}) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "relative inline-flex h-14 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-50 transition-transform duration-300 hover:scale-105 active:scale-95 group shadow-[0_0_25px_rgba(59,130,246,0.4)]",
                className
            )}
            {...props}
        >
            <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#3b82f6_25%,#06b6d4_50%,#3b82f6_75%,#000000_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-8 py-1 text-lg font-medium text-white backdrop-blur-3xl transition-all group-hover:bg-slate-900 group-hover:text-blue-50">
                {children}
                <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)] opacity-0 group-hover:opacity-20 group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />
            </span>
        </button>
    );
};

export const ShimmerButton = ({
    children,
    className,
    onClick,
    ...props
}) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "inline-flex h-14 animate-shimmer items-center justify-center rounded-full border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-8 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};

export default MagicButton;
