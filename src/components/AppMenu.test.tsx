// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AppMenu from './AppMenu';

afterEach(cleanup);

describe('AppMenu', () => {
  it('opens, reports its state, and navigates to Data', () => {
    const onNavigate = vi.fn();
    render(<AppMenu currentPage="dashboard" onNavigate={onNavigate} />);

    const trigger = screen.getByRole('button', { name: 'Open app menu' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(screen.getByRole('menuitem', { name: 'Data' }));

    expect(onNavigate).toHaveBeenCalledWith('settings');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('closes on Escape and outside pointer interaction', () => {
    render(<AppMenu currentPage="about" onNavigate={() => undefined} />);
    const trigger = screen.getByRole('button', { name: 'Open app menu' });

    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(trigger);

    fireEvent.click(trigger);
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('marks the current secondary page as active', () => {
    render(<AppMenu currentPage="about" onNavigate={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: 'Open app menu' }));

    expect(screen.getByRole('menuitem', { name: 'About' }).getAttribute('aria-current')).toBe(
      'page',
    );
  });
});
