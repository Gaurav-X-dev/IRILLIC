"use client";

import { useEffect } from "react";

/**
 * Content protection for the public website.
 *
 * The clinical copy, specifications and imagery on these pages are the
 * company's own material, so selecting, copying, dragging and right-click
 * "Save image as" are withheld. Form fields are deliberately left alone: a
 * visitor must still be able to select, cut and paste what they are typing
 * into an enquiry, and blocking that would break the forms.
 *
 * This is a deterrent, not a secret: anything a browser renders can still be
 * read from the page source, so nothing confidential should be published here.
 */

const EDITABLE = "input, textarea, select, [contenteditable='true']";

function inEditable(target: EventTarget | null): boolean {
  return (
    target instanceof Element && Boolean(target.closest<Element>(EDITABLE))
  );
}

export function CopyGuard() {
  useEffect(() => {
    // The class carries the CSS half of this; adding it from here means a
    // visitor with JavaScript disabled keeps a selectable, working page
    // rather than one that is locked with no way to use the forms.
    document.documentElement.classList.add("is-copy-guarded");

    const block = (event: Event) => {
      if (inEditable(event.target)) return;
      event.preventDefault();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (inEditable(event.target)) return;
      // Copy, cut, select-all, save, print and view-source.
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey) {
        if (["c", "x", "a", "s", "p", "u"].includes(key))
          event.preventDefault();
      }
      // The developer-tools shortcuts, which exist to read the page wholesale.
      if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
        if (["i", "j", "c"].includes(key)) event.preventDefault();
      }
      if (key === "f12") event.preventDefault();
    };

    const events: (keyof DocumentEventMap)[] = [
      "contextmenu",
      "copy",
      "cut",
      "dragstart",
      "selectstart",
    ];
    events.forEach((name) => document.addEventListener(name, block));
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.documentElement.classList.remove("is-copy-guarded");
      events.forEach((name) => document.removeEventListener(name, block));
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
