import classnames from "../util/classnames";
import "./layout.css";
import { PropsWithChildren } from "preact/compat";

export function LayoutSlot({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return <div className={classnames("layout-slot", className)}>{children}</div>;
}

export function Layout({
  children,
}: PropsWithChildren<{ className?: string }>) {
  return <div className="layout-container">{children}</div>;
}
