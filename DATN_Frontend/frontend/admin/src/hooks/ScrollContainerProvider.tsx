import React, { createContext, useContext, type RefObject } from 'react';

// Trỏ tới div cuộn thật sự của layout (Content trong DefaultLayout, có overflow-auto),
// vì body/html không cuộn trong layout app-shell này. FilterTable dùng ref này để cấu hình
// Table.sticky (getContainer) của AntD cho đúng container, thay vì mặc định là window.
const ScrollContainerContext = createContext<RefObject<HTMLElement | null> | null>(null);

export const ScrollContainerProvider: React.FC<{
  containerRef: RefObject<HTMLElement | null>;
  children: React.ReactNode;
}> = ({ containerRef, children }) => (
  <ScrollContainerContext.Provider value={containerRef}>{children}</ScrollContainerContext.Provider>
);

export const useScrollContainer = (): RefObject<HTMLElement | null> | null => useContext(ScrollContainerContext);
