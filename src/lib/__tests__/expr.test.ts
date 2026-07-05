import { describe, it, expect } from 'vitest';
import { evalExpr } from '../expr';

describe('evalExpr', () => {
  it('returns plain integer', () => {
    expect(evalExpr('42')).toEqual({ ok: true, value: 42 });
  });
  it('returns plain decimal', () => {
    expect(evalExpr('3.14')).toEqual({ ok: true, value: 3.14 });
  });
  it('evaluates addition', () => {
    expect(evalExpr('12+5')).toEqual({ ok: true, value: 17 });
  });
  it('evaluates multiplication with decimal', () => {
    expect(evalExpr('1.5*2')).toEqual({ ok: true, value: 3 });
  });
  it('evaluates parenthesised expression', () => {
    expect(evalExpr('(2+3)*4')).toEqual({ ok: true, value: 20 });
  });
  it('evaluates division', () => {
    expect(evalExpr('10/4')).toEqual({ ok: true, value: 2.5 });
  });
  it('returns ok:false for empty string', () => {
    expect(evalExpr('')).toEqual({ ok: false });
  });
  it('returns ok:false for bare minus', () => {
    expect(evalExpr('-')).toEqual({ ok: false });
  });
  it('returns ok:false for letters', () => {
    expect(evalExpr('abc')).toEqual({ ok: false });
  });
  it('returns ok:false for malformed expression', () => {
    expect(evalExpr('1+')).toEqual({ ok: false });
  });
  it('trims whitespace', () => {
    expect(evalExpr('  8 + 2  ')).toEqual({ ok: true, value: 10 });
  });
});
