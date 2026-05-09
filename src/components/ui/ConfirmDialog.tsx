"use client";

import { useCallback, useState } from "react";

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type DialogState = {
  open: boolean;
  options: ConfirmOptions;
  resolve?: (value: boolean) => void;
};

export function useConfirm() {
  const [state, setState] = useState<DialogState>({
    open: false,
    options: {},
  });

  const confirm = useCallback((options: ConfirmOptions = {}) => {
    return new Promise<boolean>((resolve) => {
      setState({ open: true, options, resolve });
    });
  }, []);

  const close = useCallback(
    (result: boolean) => {
      state.resolve?.(result);
      setState({ open: false, options: {} });
    },
    [state],
  );

  const dialog = state.open ? (
    <ConfirmDialog options={state.options} onClose={close} />
  ) : null;

  return { confirm, dialog };
}

function ConfirmDialog({
  options,
  onClose,
}: {
  options: ConfirmOptions;
  onClose: (result: boolean) => void;
}) {
  const {
    title = "Are you sure?",
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    destructive = false,
  } = options;

  const confirmClasses = destructive
    ? "bg-red-600 hover:bg-red-700"
    : "bg-brand hover:bg-brand-hover";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => onClose(false)}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {description && (
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onClose(false)}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => onClose(true)}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white shadow-md transition-colors ${confirmClasses}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
