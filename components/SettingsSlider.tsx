
import React from 'react';

interface SettingsSliderProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    unit: string;
    disabled: boolean;
}

export const SettingsSlider: React.FC<SettingsSliderProps> = ({ label, value, onChange, min, max, step, unit, disabled }) => {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-indigo-200">{label}</label>
                <span className="px-2 py-1 text-sm font-semibold text-indigo-500 bg-indigo-100 rounded-md">
                    {value} {unit}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                disabled={disabled}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
        </div>
    );
};
