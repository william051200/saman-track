import { useEffect, useRef, useState } from 'react';

export type MenuPage = 'settings' | 'about';

interface Props {
  currentPage: string;
  onNavigate: (page: MenuPage) => void;
}

const items: Array<{ page: MenuPage; label: string; icon: string }> = [
  { page: 'settings', label: 'Data', icon: '⚙️' },
  { page: 'about', label: 'About', icon: 'ℹ️' },
];

export default function AppMenu({ currentPage, onNavigate }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="app-menu" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        className="menu-trigger"
        aria-label="Open app menu"
        aria-expanded={open}
        aria-controls="app-menu-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true" className="menu-icon">
          <span />
          <span />
          <span />
        </span>
      </button>

      {open && (
        <div id="app-menu-panel" className="menu-panel" role="menu">
          {items.map((item) => {
            const active = currentPage === item.page;
            return (
              <button
                key={item.page}
                type="button"
                role="menuitem"
                className={active ? 'active' : ''}
                aria-current={active ? 'page' : undefined}
                onClick={() => {
                  setOpen(false);
                  onNavigate(item.page);
                }}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
