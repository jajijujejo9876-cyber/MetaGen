
import React from 'react';

interface ApiKeyInputProps {
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ value, onChange, disabled }) => {
    return (
        <div>
            <label htmlFor="api-keys" className="block text-sm font-medium text-indigo-200 mb-2">
                Google AI Studio Keys (comma or line separated)
            </label>
            <textarea
                id="api-keys"
                rows={4}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                placeholder="Enter one or more API keys..."
                className="w-full bg-white/10 border border-white/20 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200 disabled:opacity-50"
            />
        </div>
    );
};
