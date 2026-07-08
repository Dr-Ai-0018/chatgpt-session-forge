import { create } from "zustand";
import {
  convertAccounts,
  DEMO_INPUT,
  parseSources,
  type NormalizedAccount,
  type SkippedItem,
  type Source,
  type TargetId,
} from "./core";

export type AccentId = "amber" | "green" | "ice";

export const ACCENT_HEX: Record<AccentId, string> = {
  amber: "#f5a623",
  green: "#35d07f",
  ice: "#57b6ff",
};

export interface LoadedFile {
  name: string;
  size: string;
  content: string;
}

interface ForgeState {
  rawInput: string;
  files: LoadedFile[];
  format: TargetId;
  accent: AccentId;

  accounts: NormalizedAccount[];
  skipped: SkippedItem[];
  outputText: string;
  selectedIdx: number;
  forging: boolean;
  hasRun: boolean;

  setInput: (value: string) => void;
  addFiles: (list: FileList | File[]) => void;
  removeFile: (index: number) => void;
  setFormat: (format: TargetId) => void;
  setAccent: (accent: AccentId) => void;
  selectAccount: (index: number) => void;
  forge: () => void;
  clearAll: () => void;
  loadSample: () => void;
}

function humanSize(n: number): string {
  return n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KB`;
}

function buildSources(state: Pick<ForgeState, "rawInput" | "files">): Source[] {
  const sources: Source[] = [];
  if (state.rawInput.trim()) {
    sources.push({ name: "paste", text: state.rawInput });
  }
  state.files.forEach((f) => sources.push({ name: f.name, text: f.content }));
  return sources;
}

let forgeTimer: ReturnType<typeof setTimeout> | undefined;

export const useForge = create<ForgeState>((set, get) => ({
  rawInput: "",
  files: [],
  format: "sub2api",
  accent: "amber",

  accounts: [],
  skipped: [],
  outputText: "",
  selectedIdx: 0,
  forging: false,
  hasRun: false,

  setInput: (value) => set({ rawInput: value }),

  addFiles: (list) => {
    Array.from(list).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () =>
        set((s) => ({
          files: [
            ...s.files,
            { name: file.name || "unnamed.json", size: humanSize(file.size), content: String(reader.result || "") },
          ],
        }));
      reader.readAsText(file, "utf-8");
    });
  },

  removeFile: (index) => set((s) => ({ files: s.files.filter((_, i) => i !== index) })),

  setFormat: (format) =>
    set((s) => {
      if (!s.accounts.length) return { format };
      return { format, outputText: JSON.stringify(convertAccounts(s.accounts, format), null, 2) };
    }),

  setAccent: (accent) => set({ accent }),

  selectAccount: (index) => set({ selectedIdx: index }),

  forge: () => {
    const state = get();
    const sources = buildSources(state);
    const { accounts, skipped } = sources.length
      ? parseSources(sources)
      : { accounts: [], skipped: [] };
    const outputText = accounts.length
      ? JSON.stringify(convertAccounts(accounts, state.format), null, 2)
      : "";

    set({ accounts, skipped, outputText, selectedIdx: 0, hasRun: true, forging: true });
    clearTimeout(forgeTimer);
    forgeTimer = setTimeout(() => set({ forging: false }), 300);
  },

  clearAll: () =>
    set({
      rawInput: "",
      files: [],
      accounts: [],
      skipped: [],
      outputText: "",
      selectedIdx: 0,
      hasRun: false,
    }),

  loadSample: () =>
    set({
      rawInput: JSON.stringify(DEMO_INPUT, null, 2),
      files: [],
      accounts: [],
      skipped: [],
      outputText: "",
      selectedIdx: 0,
      hasRun: false,
    }),
}));
