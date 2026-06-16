"use client";

import { useLayoutEffect } from "react";
import { useEditorStore } from "@/stores/editor-store";
import type { NodeStyle } from "@/types/diagram";

/**
 * Off-screen element shared by every measurement. A single detached node is
 * enough because all measuring happens synchronously inside layout effects on
 * the main thread — there is never more than one measurement in flight.
 */
let measureEl: HTMLDivElement | null = null;

function getMeasureEl(): HTMLDivElement | null {
  if (typeof document === "undefined") return null;
  if (!measureEl) {
    measureEl = document.createElement("div");
    Object.assign(measureEl.style, {
      position: "absolute",
      top: "-9999px",
      left: "-9999px",
      visibility: "hidden",
      pointerEvents: "none",
      boxSizing: "content-box",
      padding: "0",
      margin: "0",
      border: "0",
    } as CSSStyleDeclaration);
    document.body.appendChild(measureEl);
  }
  return measureEl;
}

export interface FontSpec {
  fontSize: number;
  fontWeight: number;
  italic?: boolean;
  /** Maps to the matching CSS custom property. */
  family?: "sans" | "mono";
  lineHeight?: number;
}

const FAMILY_VAR: Record<NonNullable<FontSpec["family"]>, string> = {
  sans: "var(--font-sans)",
  mono: "var(--font-mono)",
};

function applyFont(el: HTMLDivElement, font: FontSpec) {
  el.style.fontSize = `${font.fontSize}px`;
  el.style.fontWeight = String(font.fontWeight);
  el.style.fontStyle = font.italic ? "italic" : "normal";
  el.style.lineHeight = font.lineHeight ? String(font.lineHeight) : "1.3";
  el.style.fontFamily = FAMILY_VAR[font.family ?? "sans"];
}

/** Width (px) of a single string with no wrapping, honouring explicit newlines. */
export function measureTextWidth(text: string, font: FontSpec): number {
  const el = getMeasureEl();
  if (!el) return 0;
  applyFont(el, font);
  el.style.whiteSpace = "pre";
  el.style.wordBreak = "normal";
  el.style.width = "auto";
  el.textContent = text.length ? text : " ";
  return Math.ceil(el.getBoundingClientRect().width);
}

export interface AutoSizeOptions {
  id: string;
  text: string;
  style: NodeStyle;
  /** Current node dimensions from React Flow. */
  width: number | undefined;
  height: number | undefined;
  minWidth: number;
  minHeight: number;
  /** Horizontal / vertical padding (sum of both sides). */
  padX: number;
  padY: number;
  maxWidth?: number;
  lineHeight?: number;
  family?: FontSpec["family"];
}

/**
 * Grows a single-label node so its text is never clipped: widens to fit the
 * longest line up to `maxWidth`, then heightens to fit the wrapped result.
 * Only grows — manual resizing to a larger size is preserved, and shrinking
 * below the text snaps back so the label stays readable.
 */
export function useAutoSize({
  id,
  text,
  style,
  width,
  height,
  minWidth,
  minHeight,
  padX,
  padY,
  maxWidth = 600,
  lineHeight = 1.3,
  family = "sans",
}: AutoSizeOptions) {
  const grow = useEditorStore((s) => s.growNode);

  useLayoutEffect(() => {
    const el = getMeasureEl();
    if (!el) return;
    const font: FontSpec = {
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      italic: style.italic,
      lineHeight,
      family,
    };
    applyFont(el, font);
    el.textContent = text.length ? text : " ";

    // 1. Natural width with no wrapping (respects explicit line breaks).
    el.style.whiteSpace = "pre";
    el.style.wordBreak = "normal";
    el.style.width = "auto";
    const naturalW = Math.ceil(el.getBoundingClientRect().width) + padX + 2;
    const curW = width ?? minWidth;
    const targetW = Math.min(maxWidth, Math.max(curW, naturalW, minWidth));

    // 2. Wrapped height at that content width.
    el.style.whiteSpace = "pre-wrap";
    el.style.wordBreak = "break-word";
    el.style.width = `${Math.max(1, targetW - padX)}px`;
    const naturalH = Math.ceil(el.getBoundingClientRect().height) + padY + 2;
    const curH = height ?? minHeight;
    const targetH = Math.max(curH, naturalH, minHeight);

    if (targetW > curW + 0.5 || targetH > curH + 0.5) {
      grow(id, targetW, targetH);
    }
  }, [
    id,
    text,
    style.fontSize,
    style.fontWeight,
    style.italic,
    width,
    height,
    minWidth,
    minHeight,
    padX,
    padY,
    maxWidth,
    lineHeight,
    family,
    grow,
  ]);
}

/**
 * Grows a node's width (only) to fit the widest of several pre-measured lines.
 * Used by the compartment shapes (ER entity, UML class) whose height is driven
 * by flex content rather than a single label.
 */
export function useAutoWidth(
  id: string,
  width: number | undefined,
  contentWidth: number,
  minWidth: number,
  maxWidth = 640,
) {
  const grow = useEditorStore((s) => s.growNode);
  useLayoutEffect(() => {
    const curW = width ?? minWidth;
    const targetW = Math.min(maxWidth, Math.max(curW, contentWidth, minWidth));
    // Pass 0 for height: growNode clamps with Math.max so the height is left as-is.
    if (targetW > curW + 0.5) {
      grow(id, targetW, 0);
    }
  }, [id, width, contentWidth, minWidth, maxWidth, grow]);
}
