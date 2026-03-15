# AI-Powered Collection Analysis

The app uses **OpenAI** (GPT-4o with vision) to:

1. **Detect fragrances** from a shelf photo (names and brands).
2. **Generate analysis text** (scent profile, strengths, weaknesses, etc.) from the detected list.

All AI responses are **JSON** so the app can parse them reliably.

---

## Where to paste your API key

1. Open the file **`.env.local`** in the project root (same folder as `package.json`).
2. If you don’t have it, copy **`.env.example`** and rename the copy to **`.env.local`**.
3. Find the line:
   ```bash
   OPENAI_API_KEY=
   ```
4. Paste your key **after the equals sign**, with no spaces:
   ```bash
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx
   ```
5. Save the file and **restart the dev server** (`npm run dev`).

**Important:** Do **not** add `NEXT_PUBLIC_` to this variable. It must stay server-only so the key is never sent to the browser.

Get a key at: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

---

## Flow

- **Upload** → image is sent to the AI → returns `detections` (name, brand, confidence).
- If any detection has **confidence &lt; 70%**, the user sees a **confirmation step** to remove or keep items.
- After confirmation (or if confidence is high), the app calls the AI again to **generate analysis text** from the list.
- If the API key is missing or a call fails, the app **does not crash**: it falls back to mock/empty data.

---

## Improving later

- **Detection:** Edit prompts and JSON shape in `src/lib/ai/collectionAnalysis.ts` (`detectFragrancesFromImage`).
- **Analysis text:** Edit the analysis prompt in the same file (`generateAnalysisFromDetections`).
- **Confidence threshold:** Change `CONFIDENCE_THRESHOLD` in `src/lib/ai/collectionAnalysis.ts` (default 0.7).
- **Types:** Update `src/lib/ai/types.ts` if you change the JSON structures.
