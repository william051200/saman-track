import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('peak-window comparison layout', () => {
  it('stacks all scenarios vertically at every viewport width', () => {
    const css = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');
    const scenarioGridRule = css.match(/\.scenario-grid\s*\{([^}]*)\}/)?.[1];

    expect(scenarioGridRule).toContain('grid-template-columns: 1fr');
    expect(css).not.toMatch(
      /@media[^{]*\{[\s\S]*?\.scenario-grid\s*\{[^}]*grid-template-columns/,
    );
  });
});
