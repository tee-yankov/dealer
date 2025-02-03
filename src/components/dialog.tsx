import { PropsWithChildren, useEffect, useRef } from "preact/compat";

export type DialogProps = PropsWithChildren<{
  title?: string;
  isOpen?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}>;

function Dialog({ children, title, isOpen = false, onConfirm, onCancel }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openState = useRef(isOpen);

  useEffect(() => {
    if (openState.current !== isOpen) {
      if (isOpen) {
        dialogRef.current?.showModal();
      } else {
        dialogRef.current?.close();
      }
    }
  }, [isOpen])

  return (
    <section>
      <dialog ref={dialogRef} class="nes-dialog">
        <form method="dialog">
          {title && <p class="title">{title}</p>}
          {children}
          <menu class="dialog-menu">
            <button onClick={onCancel} class="nes-btn">Cancel</button>
            <button onClick={onConfirm} class="nes-btn is-primary">Confirm</button>
          </menu>
        </form>
      </dialog>
    </section>
  )
}

export default Dialog
