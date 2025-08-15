import { describe, expect, it } from 'vitest';

import uiSlice, { setGlobalLoading, setTheme, toggleSidebar } from '@/store/uiSlice';

describe('uiSlice', () => {
  const initialState = {
    sidebarCollapsed: false,
    theme: 'light',
    globalLoading: false,
  };

  it('should have correct initial state', () => {
    const state = uiSlice(undefined, { type: '' });
    expect(state).toEqual(initialState);
  });

  it('should toggle sidebar state', () => {
    let state = uiSlice(initialState, toggleSidebar());
    expect(state.sidebarCollapsed).toBe(true);

    state = uiSlice(state, toggleSidebar());
    expect(state.sidebarCollapsed).toBe(false);
  });

  it('should set theme', () => {
    const state = uiSlice(initialState, setTheme('dark'));
    expect(state.theme).toBe('dark');
  });

  it('should set global loading', () => {
    const state = uiSlice(initialState, setGlobalLoading(true));
    expect(state.globalLoading).toBe(true);
  });
});
