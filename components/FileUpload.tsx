
import React, { useCallback } from 'react';
import { UploadCloudIcon } from './Icons';

interface FileUploadProps {
    onFileChange: (files: File[]) => void;
    disabled: boolean;
    count: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, disabled, count }) => {
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            onFileChange(Array.from(e.target.files));
        }
    };
    
    const onDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (disabled) return;
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            onFileChange(Array.from(event.dataTransfer.files));
        }
    }, [disabled, onFileChange]);

    const onDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    return (
        <div className="mt-4">
            <label 
                htmlFor="file-upload"
                onDrop={onDrop}
                onDragOver={onDragOver}
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'border-white/30 hover:bg-white/10'}`}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloudIcon className="w-10 h-10 mb-3 text-indigo-300" />
                    <p className="mb-2 text-sm text-indigo-200">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-indigo-300">Images or Videos</p>
                </div>
                <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileChange} disabled={disabled} />
            </label>
            {count > 0 && <p className="text-center mt-2 text-sm text-indigo-200">{count} file(s) selected.</p>}
        </div>
    );
};
