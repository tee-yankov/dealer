import classnames from "../util/classnames";
import "./layout.css";
import { PropsWithChildren } from "preact/compat";

export function LayoutSlot({
  children,
  className,
  overflow = false,
}: PropsWithChildren<{ className?: string; overflow?: boolean }>) {
  return (
    <div
      className={classnames(
        className,
        "layout-slot",
        overflow && "layout-slot-overflow",
      )}
    >
      {children}
    </div>
  );
}

export function Layout({
  children,
}: PropsWithChildren<{ className?: string }>) {
  return <div className="layout-container">{children}</div>;
}
