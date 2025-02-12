import { PropsWithChildren, useEffect, useRef } from "preact/compat";
import classnames from "../util/classnames";

export type DialogProps = PropsWithChildren<{
  title?: string;
  isOpen?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  className?: string;
}>;

function Dialog({
  children,
  title,
  isOpen = false,
  onConfirm,
  onCancel,
  className,
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
      <dialog ref={dialogRef} className={classnames(className, "nes-dialog")}>
        <form method="dialog">
          {title && <p class="title">{title}</p>}
          {children}
          <menu class="dialog-menu">
            <button onClick={onCancel} class="nes-btn">
              Cancel
            </button>
            <button onClick={onConfirm} class="nes-btn is-primary">
              Confirm
            </button>
          </menu>
        </form>
      </dialog>
    </section>
  );
}

export default Dialog;
