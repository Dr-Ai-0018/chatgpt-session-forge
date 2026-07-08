import { create } from "zustand";

export type ToastKind = "ok" | "error" | "info";

export interface Toast {
  id: number;
  kind: ToastKind;
  text: string;
}

interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  resolve: (ok: boolean) => void;
}

export type ModalKind = "detail" | "output" | "guide" | null;

interface UiState {
  toasts: Toast[];
  pushToast: (kind: ToastKind, text: string) => void;
  dismissToast: (id: number) => void;

  modal: ModalKind;
  openModal: (m: Exclude<ModalKind, null>) => void;
  closeModal: () => void;

  // mobile-only layout state
  mobileView: "input" | "output";
  setMobileView: (v: "input" | "output") => void;
  drawerOpen: boolean;
  setDrawer: (open: boolean) => void;

  confirmRequest: ConfirmRequest | null;
  confirm: (opts: {
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
  }) => Promise<boolean>;
  resolveConfirm: (ok: boolean) => void;
}

let toastId = 0;

export const useUi = create<UiState>((set, get) => ({
  toasts: [],

  pushToast: (kind, text) => {
    const id = ++toastId;
    set((s) => ({ toasts: [...s.toasts, { id, kind, text }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3500);
  },

  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  modal: null,
  openModal: (m) => set({ modal: m }),
  closeModal: () => set({ modal: null }),

  mobileView: "input",
  setMobileView: (v) => set({ mobileView: v }),
  drawerOpen: false,
  setDrawer: (open) => set({ drawerOpen: open }),

  confirmRequest: null,

  confirm: (opts) =>
    new Promise<boolean>((resolve) => {
      set({ confirmRequest: { ...opts, resolve } });
    }),

  resolveConfirm: (ok) => {
    const req = get().confirmRequest;
    if (req) {
      req.resolve(ok);
      set({ confirmRequest: null });
    }
  },
}));
