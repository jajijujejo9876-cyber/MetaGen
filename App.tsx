
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { ContentType, FileProcessingState, Metadata } from './types';
import { ADOBE_STOCK_CATEGORIES } from './constants';
import { fileToBase64, downloadCSV } from './utils/helpers';
import { ApiKeyInput } from './components/ApiKeyInput';
import { ContentTypeSelector } from './components/ContentTypeSelector';
import { FileUpload } from './components/FileUpload';
import { SettingsSlider } from './components/SettingsSlider';
import { MetadataCard } from './components/MetadataCard';
import { ProgressBar } from './components/ProgressBar';
import { LoaderIcon, SparklesIcon, DownloadIcon, AlertTriangleIcon, InfoIcon, XIcon, CheckCircleIcon } from './components/Icons';

// Main App Component
const App: React.FC = () => {
    const [apiKeys, setApiKeys] = useState<string>('');
    const [contentType, setContentType] = useState<ContentType>('image');
    const [files, setFiles] = useState<File[]>([]);
    const [titleLength, setTitleLength] = useState<number>(100);
    const [keywordCount, setKeywordCount] = useState<number>(30);
    
    const [processingStates, setProcessingStates] = useState<FileProcessingState[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [notification, setNotification] = useState<{type: 'success' | 'info'; message: string} | null>(null);

    // Derived State
    const parsedApiKeys = useMemo(() => apiKeys.split(/[\n,]+/).map(k => k.trim()).filter(Boolean), [apiKeys]);
    const filesToProcess = useMemo(() => processingStates.filter(p => p.status === 'pending' || p.status === 'failed'), [processingStates]);
    const successfulFiles = useMemo(() => processingStates.filter(p => p.status === 'success'), [processingStates]);
    const isGenerationComplete = useMemo(() => files.length > 0 && successfulFiles.length === files.length, [files, successfulFiles]);
    const progress = useMemo(() => files.length > 0 ? (successfulFiles.length / files.length) * 100 : 0, [files, successfulFiles]);

    useEffect(() => {
        setProcessingStates(files.map((file, index) => ({
            id: `${file.name}-${index}`,
            file,
            status: 'pending',
            metadata: null,
        })));
    }, [files]);

    const handleGenerateMetadata = useCallback(async () => {
        if (filesToProcess.length === 0) {
            setNotification({type: 'info', message: 'All files have been processed.'});
            return;
        }
        if (parsedApiKeys.length === 0) {
            setError('Please provide at least one Google AI Studio API Key.');
            return;
        }

        setError('');
        setIsLoading(true);

        const availableKeys = [...parsedApiKeys];
        const keyInstances = new Map<string, GoogleGenAI>();

        const processFile = async (state: FileProcessingState): Promise<void> => {
            let currentKey = availableKeys.shift();
            if (!currentKey) {
                // No keys left to try
                 setProcessingStates(prev => prev.map(p => p.id === state.id ? { ...p, status: 'failed', error: 'No available API keys.' } : p));
                return;
            }
             availableKeys.push(currentKey); // Round-robin key usage

            try {
                setProcessingStates(prev => prev.map(p => p.id === state.id ? { ...p, status: 'processing' } : p));

                if (!keyInstances.has(currentKey)) {
                   keyInstances.set(currentKey, new GoogleGenAI({apiKey: currentKey}));
                }
                const ai = keyInstances.get(currentKey)!;

                const base64Data = await fileToBase64(state.file);
                const mimeType = state.file.type;

                const prompt = `Generate metadata for the provided ${contentType}. Rules:
1. Title: Create a concise, relevant title around ${titleLength} characters long.
2. Keywords: Generate between ${keywordCount - 5} and ${keywordCount} keywords, ordered by relevance.
3. Category: Assign ONE category from this list: ${ADOBE_STOCK_CATEGORIES.join(', ')}.
4. Respond ONLY with a single JSON object. Do not add explanations or markdown.`;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: {
                        parts: [
                            { inlineData: { mimeType, data: base64Data } },
                            { text: prompt }
                        ]
                    },
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                                category: { type: Type.STRING }
                            },
                            required: ["title", "keywords", "category"],
                        }
                    }
                });

                const metadataJson = JSON.parse(response.text);
                const metadata: Metadata = {
                    fileName: state.file.name,
                    ...metadataJson
                };

                setProcessingStates(prev => prev.map(p => p.id === state.id ? { ...p, status: 'success', metadata } : p));
            } catch (e) {
                 const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
                 setProcessingStates(prev => prev.map(p => p.id === state.id ? { ...p, status: 'failed', error: errorMessage.substring(0, 100) } : p));
            }
        };

        const processingPromises = filesToProcess.map(state => processFile(state));
        await Promise.allSettled(processingPromises);

        setIsLoading(false);
        const finalSuccessful = processingStates.filter(p => p.status === 'success').length;
        if (finalSuccessful === files.length) {
          setNotification({type: 'success', message: 'All metadata generated successfully!'});
        }
    }, [filesToProcess, parsedApiKeys, contentType, titleLength, keywordCount, processingStates, files.length]);
    
    const handleDownload = () => {
        const successfulMetadata = successfulFiles.map(s => s.metadata).filter((m): m is Metadata => m !== null);
        if (successfulMetadata.length > 0) {
            downloadCSV(successfulMetadata);
        }
    };
    
    return (
        <div className="min-h-screen w-full text-white p-4 sm:p-6 lg:p-8 overflow-hidden">
            <main className="max-w-screen-2xl mx-auto">
                <Header />

                {error && <Alert type="error" message={error} onClose={() => setError('')} />}
                {notification && <Alert type={notification.type} message={notification.message} onClose={() => setNotification(null)} />}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                    {/* Controls Column */}
                    <div className="lg:col-span-1 space-y-6">
                        <ControlCard title="1. Configure API Keys">
                            <ApiKeyInput value={apiKeys} onChange={setApiKeys} disabled={isLoading} />
                        </ControlCard>
                        <ControlCard title="2. Select Content Type & Upload">
                            <ContentTypeSelector selectedType={contentType} onSelectType={setContentType} disabled={isLoading} />
                            <FileUpload onFileChange={setFiles} disabled={isLoading} count={files.length}/>
                        </ControlCard>
                        <ControlCard title="3. Adjust Settings">
                             <SettingsSlider
                                label="Title Length"
                                value={titleLength}
                                onChange={setTitleLength}
                                min={5}
                                max={200}
                                step={1}
                                unit="chars"
                                disabled={isLoading}
                            />
                             <SettingsSlider
                                label="Keyword Count"
                                value={keywordCount}
                                onChange={setKeywordCount}
                                min={5}
                                max={50}
                                step={1}
                                unit="words"
                                disabled={isLoading}
                            />
                        </ControlCard>
                        <ActionButtons 
                            isLoading={isLoading} 
                            isGenerationComplete={isGenerationComplete}
                            canGenerate={files.length > 0 && parsedApiKeys.length > 0}
                            filesToProcessCount={filesToProcess.length}
                            onGenerate={handleGenerateMetadata}
                            onDownload={handleDownload}
                        />
                         { (isLoading || files.length > 0) && <ProgressBar progress={progress} />}
                    </div>

                    {/* Results Column */}
                    <div className="lg:col-span-2 min-h-[60vh]">
                         <ResultsPanel states={processingStates} />
                    </div>
                </div>
            </main>
        </div>
    );
};


// Sub-components for better organization
const Header: React.FC = () => (
    <header className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-shadow">
            Adobe Stock <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">AI Metadata</span> Generator
        </h1>
        <p className="mt-2 text-lg text-indigo-200">Generate premium metadata in parallel with high-reliability key management.</p>
    </header>
);

const ControlCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-black/20 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-indigo-100">{title}</h2>
        {children}
    </div>
);

interface AlertProps {
    type: 'error' | 'success' | 'info';
    message: string;
    onClose: () => void;
}
const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
    const baseClasses = "flex items-center justify-between p-4 rounded-lg my-4 animate-fade-in-down";
    const typeClasses = {
        error: "bg-red-500/80 backdrop-blur-sm border border-red-400 text-white",
        success: "bg-green-500/80 backdrop-blur-sm border border-green-400 text-white",
        info: "bg-blue-500/80 backdrop-blur-sm border border-blue-400 text-white"
    };
    const Icon = {
        error: <AlertTriangleIcon className="w-6 h-6 mr-3" />,
        success: <CheckCircleIcon className="w-6 h-6 mr-3" />,
        info: <InfoIcon className="w-6 h-6 mr-3" />,
    }[type];

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`}>
            <div className="flex items-center">
                {Icon}
                <p>{message}</p>
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
                <XIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

interface ActionButtonsProps {
    isLoading: boolean;
    isGenerationComplete: boolean;
    canGenerate: boolean;
    filesToProcessCount: number;
    onGenerate: () => void;
    onDownload: () => void;
}
const ActionButtons: React.FC<ActionButtonsProps> = ({ isLoading, isGenerationComplete, canGenerate, filesToProcessCount, onGenerate, onDownload }) => (
    <div className="space-y-4">
        <button
            onClick={onGenerate}
            disabled={isLoading || !canGenerate}
            className="w-full flex items-center justify-center text-lg font-bold bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
            {isLoading ? (
                <>
                    <LoaderIcon className="animate-spin mr-3" />
                    Generating...
                </>
            ) : (
                <>
                    <SparklesIcon className="mr-3" />
                    {filesToProcessCount > 0 && filesToProcessCount !== canGenerate ? `Generate for ${filesToProcessCount} Remaining` : 'Generate Metadata'}
                </>
            )}
        </button>
        <button
            onClick={onDownload}
            disabled={isLoading || !isGenerationComplete}
            className="w-full flex items-center justify-center text-lg font-bold bg-gradient-to-r from-green-500 to-teal-600 text-white py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
            <DownloadIcon className="mr-3" />
            Download as CSV
        </button>
    </div>
);


const ResultsPanel: React.FC<{ states: FileProcessingState[] }> = ({ states }) => {
    if (states.length === 0) {
        return (
            <div className="flex items-center justify-center h-full bg-black/20 backdrop-blur-md border border-dashed border-white/20 rounded-2xl">
                <div className="text-center text-indigo-200">
                    <SparklesIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-2xl font-semibold">Ready to Generate</h3>
                    <p className="mt-2">Your generated metadata cards will appear here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full max-h-[85vh] overflow-y-auto bg-black/10 rounded-2xl p-2 md:p-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {states.map((state, index) => (
                    <MetadataCard key={state.id} state={state} index={index} />
                ))}
            </div>
        </div>
    );
};

export default App;
