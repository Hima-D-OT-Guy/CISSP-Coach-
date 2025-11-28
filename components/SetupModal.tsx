import React, { useState } from 'react';
import { UserSettings, AccountTier } from '../types';
import { Key, User, Shield, Check, AlertCircle, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface SetupModalProps {
    onComplete: (settings: UserSettings) => void;
}

const SetupModal: React.FC<SetupModalProps> = ({ onComplete }) => {
    const [name, setName] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [tier, setTier] = useState<AccountTier>('free');
    const [error, setError] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState(false);

    const validateApiKey = async (key: string): Promise<boolean> => {
        setIsValidating(true);
        try {
            const testAI = new GoogleGenAI({ apiKey: key });

            // Use the chat API which we know works from geminiService.ts
            // Using 'gemini-1.5-flash' as a safe, standard model for validation
            const chat = testAI.chats.create({
                model: 'gemini-2.5-flash',
                history: []
            });

            await chat.sendMessage({ message: "Test" });
            return true;
        } catch (error: any) {
            console.error("API Key Validation Error:", error);

            // Show the actual error message to help debugging
            const msg = error.message || "Unknown error";

            if (msg.includes('API key') || error.status === 400 || error.status === 403) {
                setError("Invalid API key. Please check and try again.");
            } else {
                setError(`Validation failed: ${msg}. Check connection.`);
            }
            return false;
        } finally {
            setIsValidating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const trimmedKey = apiKey.trim();

        if (!name.trim()) {
            setError("Please enter your name.");
            return;
        }
        if (!trimmedKey) {
            setError("Please enter your Google Gemini API Key.");
            return;
        }
        if (trimmedKey.length < 30) {
            setError("That API key looks too short. Please check it again.");
            return;
        }

        // Validate the key against the API
        const isValid = await validateApiKey(trimmedKey);
        if (!isValid) return;

        onComplete({
            userName: name.trim(),
            apiKey: trimmedKey,
            tier: tier
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

                {/* Header */}
                <div className="bg-slate-900/50 p-6 border-b border-slate-700">
                    <h2 className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
                        <Shield className="w-6 h-6" />
                        CISSP Coach Setup
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Configure your secure learning environment.
                    </p>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">Your Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Agent Smith"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                disabled={isValidating}
                            />
                        </div>
                    </div>

                    {/* API Key Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">Gemini API Key</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="AIzaSy..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                                disabled={isValidating}
                            />
                        </div>
                        <p className="text-xs text-yellow-500 flex items-start gap-1 mt-2">
                            <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                            <span>
                                ⚠️ Your API key will be stored in your browser. Only use this app on devices you trust.
                            </span>
                        </p>
                    </div>

                    {/* Tier Selection */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-300">Select Account Tier</label>
                        <div className="grid grid-cols-2 gap-3">
                            {/* Free Tier Card */}
                            <button
                                type="button"
                                onClick={() => setTier('free')}
                                disabled={isValidating}
                                className={`relative p-3 rounded-xl border text-left transition-all ${tier === 'free'
                                    ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500'
                                    : 'bg-slate-900 border-slate-700 hover:border-slate-600'
                                    }`}
                            >
                                <div className="font-semibold text-slate-200 text-sm">Free Tier</div>
                                <div className="text-xs text-slate-400 mt-1">Standard Speed</div>
                                <div className="text-[10px] text-slate-500 mt-2">Uses Gemini 1.5 Flash</div>
                                {tier === 'free' && (
                                    <div className="absolute top-2 right-2 text-emerald-500">
                                        <Check className="w-4 h-4" />
                                    </div>
                                )}
                            </button>

                            {/* Paid Tier Card */}
                            <button
                                type="button"
                                onClick={() => setTier('paid')}
                                disabled={isValidating}
                                className={`relative p-3 rounded-xl border text-left transition-all ${tier === 'paid'
                                    ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500'
                                    : 'bg-slate-900 border-slate-700 hover:border-slate-600'
                                    }`}
                            >
                                <div className="font-semibold text-slate-200 text-sm">Paid Tier</div>
                                <div className="text-xs text-slate-400 mt-1">Deep Reasoning</div>
                                <div className="text-[10px] text-slate-500 mt-2">Unlocks Gemini 1.5 Pro</div>
                                {tier === 'paid' && (
                                    <div className="absolute top-2 right-2 text-emerald-500">
                                        <Check className="w-4 h-4" />
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isValidating}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isValidating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Validating Key...
                            </>
                        ) : (
                            "Start Coaching"
                        )}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default SetupModal;
