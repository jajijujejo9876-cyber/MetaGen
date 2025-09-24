
import React from 'react';
import { FileProcessingState } from '../types';
import { LoaderIcon, AlertTriangleIcon, CheckCircleIcon, FileIcon } from './Icons';

interface MetadataCardProps {
    state: FileProcessingState;
    index: number;
}

export const MetadataCard: React.FC<MetadataCardProps> = ({ state, index }) => {
    const { status, metadata, file, error } = state;

    const renderStatus = () => {
        switch (status) {
            case 'pending':
                return <div className="flex items-center text-sm text-gray-400"><FileIcon className="w-4 h-4 mr-2" />Waiting...</div>;
            case 'processing':
                return <div className="flex items-center text-sm text-blue-400"><LoaderIcon className="w-4 h-4 mr-2 animate-spin" />Generating...</div>;
            case 'success':
                return <div className="flex items-center text-sm text-green-400"><CheckCircleIcon className="w-4 h-4 mr-2" />Success</div>;
            case 'failed':
                return <div className="flex items-center text-sm text-red-400"><AlertTriangleIcon className="w-4 h-4 mr-2" />Failed</div>;
        }
    };
    
    const cardAnimation = {
        animation: `fade-in-slide-up 0.5s ${index * 0.05}s ease-out forwards`,
        opacity: 0,
    };

    return (
        <div style={cardAnimation} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-5 text-white transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl">
            <div className="flex justify-between items-start mb-3">
                <h3 title={file.name} className="font-semibold truncate pr-4">{file.name}</h3>
                {renderStatus()}
            </div>

            {status === 'success' && metadata && (
                <div className="space-y-4">
                    <div>
                        <h4 className="text-xs font-semibold uppercase text-indigo-300 tracking-wider">Title</h4>
                        <p className="text-sm">{metadata.title}</p>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold uppercase text-indigo-300 tracking-wider">Category</h4>
                        <p className="text-sm font-medium bg-white/10 inline-block px-2 py-1 rounded">{metadata.category}</p>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold uppercase text-indigo-300 tracking-wider">Keywords</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {metadata.keywords.map(kw => (
                                <span key={kw} className="bg-white/10 text-xs px-2 py-1 rounded-full">{kw}</span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {status === 'failed' && (
                <div className="bg-red-500/20 border border-red-500/50 p-3 rounded-lg">
                    <p className="text-sm text-red-200 font-semibold">Error:</p>
                    <p className="text-xs text-red-200 break-words">{error}</p>
                </div>
            )}
            
            {(status === 'pending' || status === 'processing') && (
                 <div className="space-y-4 animate-pulse">
                    <div>
                        <div className="h-4 bg-white/10 rounded w-1/4 mb-1"></div>
                        <div className="h-4 bg-white/10 rounded w-full"></div>
                    </div>
                     <div>
                        <div className="h-4 bg-white/10 rounded w-1/4 mb-1"></div>
                        <div className="h-6 bg-white/10 rounded w-1/3"></div>
                    </div>
                    <div>
                        <div className="h-4 bg-white/10 rounded w-1/4 mb-2"></div>
                        <div className="flex flex-wrap gap-2">
                           <div className="h-5 bg-white/10 rounded-full w-16"></div>
                           <div className="h-5 bg-white/10 rounded-full w-20"></div>
                           <div className="h-5 bg-white/10 rounded-full w-12"></div>
                           <div className="h-5 bg-white/10 rounded-full w-24"></div>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes fade-in-slide-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in-down {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};
