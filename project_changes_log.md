# CISSP Coach - Recent Changes Log

## 1. Critical Stability Fixes (Phase 0)
**Goal**: Prevent browser crashes and "White Screen of Death".

*   **Persistence Engine Upgrade**:
    *   **Old**: `localStorage` (Synchronous, 5MB limit). Caused crashes with large PDFs.
    *   **New**: `IndexedDB` via `idb-keyval` (Asynchronous, GBs capacity).
    *   **Implementation**: Created `services/storageService.ts` to handle data safely.
*   **Async Loading State**:
    *   Added a "Restoring Study Session..." loading screen to `App.tsx`.
    *   Prevents the app from rendering before data is fully retrieved from the database.

## 2. Codebase Repair
**Goal**: Fix build errors and corruption caused by previous edits.

*   **`types.ts`**: Removed duplicate interface definitions that were causing TypeScript errors.
*   **`App.tsx`**: Rewrote the file to fix missing imports, syntax errors (broken template literals), and logic gaps.
*   **`Sidebar.tsx`**: Fixed syntax errors to ensure the Table of Contents and Token Counter render correctly.
*   **`index.html`**: Restored the missing `<script>` tag that was preventing the React app from mounting.

## 3. New Features
**Goal**: Enhance user experience and visibility.

*   **Token Counter**:
    *   Added a real-time estimator in the Sidebar (e.g., `~450.2k tokens`).
    *   Helps track usage against the Gemini 1.5 Flash 1M token limit.
*   **UI Contrast Improvements**:
    *   Updated `KeyConceptCard`, `ExamTipCard`, and `WarningCard`.
    *   Now uses darker backgrounds with lighter text for better readability in Dark Mode.

## 4. Technical Improvements
*   **Context Generation**: Created `scripts/generate_context.js` to bundle the entire codebase into a single Markdown file (`cissp_coach_codebase_context.md`) for easier AI assistance.
*   **Environment Config**: Verified `.env` setup for API keys.

## Files Modified
*   `App.tsx`
*   `types.ts`
*   `components/Sidebar.tsx`
*   `services/storageService.ts` (New)
*   `services/geminiService.ts`
*   `components/cards/*.tsx`

## 5. Phase 1: Intelligence Routing (Hybrid Model)
**Goal**: Optimize for speed vs. depth by switching models based on teaching mode.

*   **Model Strategy**:
    *   **Guided/Chat**: `gemini-2.5-flash` (Fast, cached).
    *   **Deep Dive/Exam**: `gemini-3.0-pro` (High reasoning).
*   **Implementation**:
    *   **`geminiService.ts`**: Added `switchModel` method. It preserves chat history and re-injects file context when switching models.
    *   **`App.tsx`**: Updated `handleTopicClick` and `handleSendMessage` to pass the current mode to the service.
*   **Verification**:
    *   Confirmed build success.
    *   Verified model switching logs in browser console.
