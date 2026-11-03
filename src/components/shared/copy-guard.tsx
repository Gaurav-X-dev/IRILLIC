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
 * The selection lock itself is plain CSS on `.site` (see site.css) rather than
 * a class added from here: a lock that only works once JavaScript has run is a
 * lock that does not work on the first paint, or at all if the bundle is slow.
 * This component adds the part CSS cannot do — the events and shortcuts.
 *
 * Links and buttons are left alone as well. The right-click menu is not only
 * "Save image as": on a link it is also "Open in new tab" and "Open in new
 * window", which is how a visitor keeps the page they are on while following a
 * reference. Taking that away withheld navigation, not content -- and a link's
 * text is already in the page for anyone who wants it.
 *
 * This is a deterrent, not a secret: anything a browser renders can still be
 * read from the page source, so nothing confidential should be published here.
 */

const EDITABLE = "input, textarea, select, [contenteditable='true']";
/** What a visitor uses to get somewhere, rather than to take something. */
const NAVIGABLE = "a[href], button, [role='link'], [role='button'], summary";

function matches(target: EventTarget | null, selector: string): boolean {
  return (
    target instanceof Element && Boolean(target.closest<Element>(selector))
  );
}

function inEditable(target: EventTarget | null): boolean {
  return matches(target, EDITABLE);
}

export function CopyGuard() {
  useEffect(() => {
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

    // On a link or a button these two are the navigation menu and the
    // drag-a-link gesture, so they stay; everywhere else they are the way
    // images and text leave the page.
    const navigation = (event: Event) => {
      if (matches(event.target, NAVIGABLE)) return;
      block(event);
    };

    const events: (keyof DocumentEventMap)[] = ["copy", "cut", "selectstart"];
    events.forEach((name) => document.addEventListener(name, block));
    document.addEventListener("contextmenu", navigation);
    document.addEventListener("dragstart", navigation);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      events.forEach((name) => document.removeEventListener(name, block));
      document.removeEventListener("contextmenu", navigation);
      document.removeEventListener("dragstart", navigation);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
