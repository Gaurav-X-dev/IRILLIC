"use client";

import { useRef, useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import type { Leader } from "@/types/site.types";

function LeaderCard({
  leader,
  onOpen,
}: {
  leader: Leader;
  onOpen: (leader: Leader, button: HTMLButtonElement) => void;
}) {
  return (
    <article className="leader reveal">
      <span className="leader__mono" aria-hidden="true">
        {leader.mono}
      </span>
      <p className="label">{leader.group}</p>
      <h3 className="leader__role">{leader.role}</h3>
      <p className="leader__fn">{leader.focusLine}</p>
      <button
        className="link leader__btn"
        type="button"
        onClick={(e) => onOpen(leader, e.currentTarget)}
      >
        View profile <ArrowRight className="i" aria-hidden="true" />
      </button>
    </article>
  );
}

/** Leadership & advisory board grid with an accessible profile dialog. */
export function LeadersGrid({ leaders }: { leaders: Leader[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lastButton = useRef<HTMLButtonElement | null>(null);
  const [active, setActive] = useState<Leader | null>(null);

  const open = (leader: Leader, button: HTMLButtonElement) => {
    lastButton.current = button;
    setActive(leader);
    dialogRef.current?.showModal();
  };

  const management = leaders.filter((l) => l.group === "Leadership");
  const board = leaders.filter((l) => l.group !== "Leadership");

  return (
    <>
      <p className="group-title reveal">Leadership team</p>
      <div className="leaders">
        {management.map((l) => (
          <LeaderCard key={l.role} leader={l} onOpen={open} />
        ))}
      </div>
      <p className="group-title reveal">Scientific Advisory Board</p>
      <div className="leaders leaders--3">
        {board.map((l) => (
          <LeaderCard key={l.role} leader={l} onOpen={open} />
        ))}
      </div>

      <dialog
        className="modal"
        ref={dialogRef}
        aria-labelledby="bio-modal-title"
        onClose={() => lastButton.current?.focus()}
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <button
          className="modal__close"
          type="button"
          aria-label="Close profile"
          onClick={() => dialogRef.current?.close()}
        >
          <X className="i" aria-hidden="true" />
        </button>
        {active && (
          <div className="modal__body">
            <p className="label">{active.group}</p>
            <p className="modal__title" id="bio-modal-title">
              {active.role}
            </p>
            <p>{active.bio}</p>
            <p className="modal__sub">Focus areas</p>
            <ul className="ticks">
              {active.focus.map((f) => (
                <li key={f}>
                  <Check className="i" aria-hidden="true" /> {f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </dialog>
    </>
  );
}
