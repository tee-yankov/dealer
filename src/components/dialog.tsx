import "./dialog.css";
import { PropsWithChildren, useEffect, useRef } from "preact/compat";
import classnames from "../util/classnames";

export type DialogProps = PropsWithChildren<{
  title?: string;
  isOpen?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  className?: string;
  disabledCancel?: boolean;
  disabledConfirm?: boolean;
  confirmText?: string;
  cancelText?: string;
}>;

function Dialog({
  children,
  title,
  isOpen = false,
  onConfirm,
  onCancel,
  className,
  disabledCancel = false,
  disabledConfirm = false,
  cancelText = "Cancel",
  confirmText = "Confirm",
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openState = useRef(isOpen);

  useEffect(() => {
    if (openState.current !== isOpen) {
      if (isOpen) {
        dialogRef.current?.showModal();
      } else {
        dialogRef.current?.close();
      }

      openState.current = isOpen;
    }
  }, [isOpen]);

  return (
    <section>
      <dialog
        style={{ overflow: "hidden" }}
        ref={dialogRef}
        className={classnames(className, "nes-dialog is-dark")}
      >
        <form method="dialog">
          {title && <p class="title">{title}</p>}
          {children}
          <menu class="dialog-menu">
            {onCancel && (
              <button
                disabled={disabledCancel}
                onClick={onCancel}
                className={classnames(
                  "nes-btn",
                  disabledCancel && "is-disabled",
                )}
              >
                {cancelText}
              </button>
            )}
            {onConfirm && (
              <button
                disabled={disabledConfirm}
                onClick={onConfirm}
                className={classnames(
                  "nes-btn is-primary",
                  disabledConfirm && "is-disabled",
                )}
              >
                {confirmText}
              </button>
            )}
          </menu>
        </form>
      </dialog>
    </section>
  );
}

export default Dialog;
