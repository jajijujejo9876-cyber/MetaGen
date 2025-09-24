
import React from 'react';

interface ProgressBarProps {
    progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
    return (
        <div className="w-full bg-white/10 rounded-full h-4 relative overflow-hidden border border-white/20">
             <div
                className="bg-gradient-to-r from-green-400 to-teal-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
            ></div>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                {Math.round(progress)}% Complete
            </span>
        </div>
    );
};
