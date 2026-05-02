import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('merges tailwind classes correctly', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('handles conditional classes', () => {
    const isTrue = true;
    const isFalse = false;
    expect(cn('px-2', isTrue && 'py-2', isFalse && 'm-2')).toBe('px-2 py-2');
  });

  it('returns clean string with multiple inputs', () => {
    const result = cn('text-sm', 'font-black', 'uppercase');
    expect(result).toContain('text-sm');
    expect(result).toContain('font-black');
    expect(result).toContain('uppercase');
  });
});
