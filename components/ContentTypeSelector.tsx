
import React from 'react';
import { ContentType } from '../types';
import { FilmIcon, ImageIcon } from './Icons';

interface ContentTypeSelectorProps {
    selectedType: ContentType;
    onSelectType: (type: ContentType) => void;
    disabled: boolean;
}

export const ContentTypeSelector: React.FC<ContentTypeSelectorProps> = ({ selectedType, onSelectType, disabled }) => {
    return (
        <div className="grid grid-cols-2 gap-4">
            <button
                onClick={() => onSelectType('image')}
                disabled={disabled}
                className={`flex items-center justify-center p-4 border-2 rounded-lg transition-all duration-200 ${
                    selectedType === 'image' ? 'bg-indigo-500 border-indigo-400' : 'bg-white/10 border-white/20 hover:bg-white/20'
                } disabled:opacity-50`}
            >
                <ImageIcon className="w-6 h-6 mr-2" />
                <span className="font-semibold">Image</span>
            </button>
            <button
                onClick={() => onSelectType('video')}
                disabled={disabled}
                 className={`flex items-center justify-center p-4 border-2 rounded-lg transition-all duration-200 ${
                    selectedType === 'video' ? 'bg-indigo-500 border-indigo-400' : 'bg-white/10 border-white/20 hover:bg-white/20'
                } disabled:opacity-50`}
            >
                <FilmIcon className="w-6 h-6 mr-2" />
                <span className="font-semibold">Video</span>
            </button>
        </div>
    );
};
