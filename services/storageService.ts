import { get, set, del } from 'idb-keyval';
import { AppState, UserSettings } from '../types';

const DB_KEY = 'cissp_coach_data';
const DB_KEY_USER = 'cissp_coach_user';

export const storageService = {
    // Save the heavy state (Book content + History)
    async saveState(state: AppState) {
        // Create a lean object to save (exclude transient UI states like isProcessing)
        const stateToSave = {
            hasFile: state.hasFile,
            fileName: state.fileName,
            fileContent: state.fileContent, // HUGE STRING - IDB handles this fine
            mode: state.mode,
            chatHistory: state.chatHistory,
            stats: state.stats,
            toc: state.toc,
            tokenCount: state.tokenCount
        };
        console.log(`[Storage] Saving App State. History Items: ${state.chatHistory.length}`);
        await set(DB_KEY, stateToSave);
    },

    // Load the state
    async loadState(): Promise<Partial<AppState> | undefined> {
        console.log("[Storage] Loading App State...");
        return await get(DB_KEY);
    },

    // Clear state (New Book)
    async clearState() {
        console.log("[Storage] Clearing App State.");
        await del(DB_KEY);
    },

    // --- User Settings (BYOK) ---
    async saveUserSettings(settings: UserSettings) {
        console.log("[Storage] Saving User Settings.");
        await set(DB_KEY_USER, settings);
    },

    async loadUserSettings(): Promise<UserSettings | undefined> {
        console.log("[Storage] Loading User Settings...");
        return await get(DB_KEY_USER);
    },

    async clearUserSettings() {
        console.log("[Storage] Clearing User Settings.");
        await del(DB_KEY_USER);
    }
};
