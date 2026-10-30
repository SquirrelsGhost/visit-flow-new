import type { ReactNode } from "react";
import { MONO } from "../securityStyles";

interface MonoProps {
  children: ReactNode;
}

/** IP-Adresse oder Kennung in Festbreitenschrift. */
export default function Mono({ children }: MonoProps) {
  return <span className={MONO}>{children}</span>;
}
