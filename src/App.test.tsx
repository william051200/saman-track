// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from './App';

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('App navigation', () => {
  it('keeps primary pages in the bottom navigation and secondary pages in the menu', () => {
    render(<App />);

    const primaryNavigation = screen.getByRole('navigation', {
      name: 'Primary navigation',
    });
    expect(
      within(primaryNavigation)
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual(['📊Stats', '➕Add', '📜History']);
    expect(screen.getByText('0 days')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Open app menu' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Data' }));
    expect(screen.getByRole('heading', { name: 'Parking-cost settings' })).toBeTruthy();
    expect(screen.queryByRole('menu')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Open app menu' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'About' }));
    expect(screen.getByRole('heading', { name: 'Why use it?' })).toBeTruthy();
    expect(within(primaryNavigation).queryAllByRole('button', { current: 'page' })).toEqual([]);
  });
});

describe('adding records', () => {
  it('updates an existing record for the same date instead of adding a duplicate', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Add/ }));
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-09-28' } });
    fireEvent.click(screen.getByLabelText('Were you fined for not paying?'));
    fireEvent.change(screen.getByLabelText('Fine time'), { target: { value: '08:30' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      const records = JSON.parse(
        localStorage.getItem('saman-track:records') ?? '[]',
      ) as Array<{ id: string; createdAt: string }>;
      expect(records).toHaveLength(1);
    });

    const [original] = JSON.parse(
      localStorage.getItem('saman-track:records') ?? '[]',
    ) as Array<{ id: string; createdAt: string }>;

    fireEvent.click(screen.getByRole('button', { name: /Add/ }));
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-09-28' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText('Updated existing record for 2026-09-28.')).toBeTruthy();
    expect(screen.getByText('1 days')).toBeTruthy();
    expect(screen.getAllByText('2026-09-28')).toHaveLength(1);
    expect(screen.getByText('No fine')).toBeTruthy();
    expect(screen.queryByText('Fined · 08:30')).toBeNull();

    await waitFor(() => {
      const records = JSON.parse(
        localStorage.getItem('saman-track:records') ?? '[]',
      ) as Array<{
        id: string;
        createdAt: string;
        fined: boolean;
        fineTime: string;
      }>;
      expect(records).toHaveLength(1);
      expect(records[0]).toMatchObject({
        id: original.id,
        createdAt: original.createdAt,
        fined: false,
        fineTime: '',
      });
    });

    fireEvent.click(screen.getByRole('button', { name: /Add/ }));
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-09-29' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText('2 days')).toBeTruthy();
    expect(screen.getByText('2026-09-28')).toBeTruthy();
    expect(screen.getByText('2026-09-29')).toBeTruthy();
  });
});
