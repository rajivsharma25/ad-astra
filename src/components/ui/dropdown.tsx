"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";

export type DropdownOption = { value: string; label: string; description?: string };

export function Dropdown({ options, value, onChange, ariaLabel, className = "", triggerClassName = "", align = "start", placement = "bottom", leadingIcon }: {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
  triggerClassName?: string;
  align?: "start" | "end";
  placement?: "top" | "bottom";
  leadingIcon?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(Math.max(0, options.findIndex((option) => option.value === value)));
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listId = useId();
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    const onEscape = (event: globalThis.KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); triggerRef.current?.focus(); } };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => { document.removeEventListener("pointerdown", onPointerDown); document.removeEventListener("keydown", onEscape); };
  }, [open]);

  useEffect(() => { if (open) optionRefs.current[activeIndex]?.focus(); }, [open, activeIndex]);

  const show = (index = Math.max(0, options.findIndex((option) => option.value === value))) => {
    setActiveIndex(index);
    setOpen(true);
  };
  const choose = (option: DropdownOption) => { onChange(option.value); setOpen(false); triggerRef.current?.focus(); };
  const handleListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((current) => (current + direction + options.length) % options.length);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault(); setActiveIndex(event.key === "Home" ? 0 : options.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault(); const option = options[activeIndex]; if (option) choose(option);
    } else if (event.key === "Tab") setOpen(false);
  };

  if (!selected) return null;
  return <div ref={rootRef} className={`relative inline-flex ${className}`}>
    <button ref={triggerRef} type="button" aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open} aria-controls={listId} onClick={() => open ? setOpen(false) : show()} onKeyDown={(event) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); show(Math.max(0, options.findIndex((option) => option.value === value))); }
    }} className={`inline-flex h-9 max-w-full items-center gap-2 rounded-lg border border-app-line bg-app-panel px-3 text-sm text-app-text transition-colors hover:border-app-line-strong hover:bg-app-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent ${triggerClassName}`}>
      {leadingIcon}<span className="min-w-0 truncate">{selected.label}</span><ChevronDown size={14} className={`shrink-0 text-app-faint transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
    {open && <div id={listId} role="listbox" aria-label={ariaLabel} onKeyDown={handleListKeyDown} className={`absolute z-50 min-w-full overflow-hidden rounded-xl border border-app-line bg-app-panel p-1.5 shadow-xl ${placement === "top" ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]"} ${align === "end" ? "right-0" : "left-0"}`}>
      {options.map((option, index) => <button key={option.value} ref={(element) => { optionRefs.current[index] = element; }} type="button" role="option" aria-selected={option.value === value} tabIndex={activeIndex === index ? 0 : -1} onFocus={() => setActiveIndex(index)} onMouseEnter={() => setActiveIndex(index)} onClick={() => choose(option)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors ${activeIndex === index ? "bg-app-accent-soft" : "hover:bg-app-bg"}`}><span className="min-w-0 flex-1"><b className="block whitespace-nowrap text-sm font-medium text-app-text">{option.label}</b>{option.description && <small className="block whitespace-nowrap text-xs text-app-muted">{option.description}</small>}</span>{option.value === value && <Check size={15} className="shrink-0 text-app-accent" />}</button>)}
    </div>}
  </div>;
}
