"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  // Der "Trick": Wir verwenden einen zusätzlichen div-Wrapper oder stellen sicher, 
  // dass der Provider keine direkt injizierten Skripte an Stellen platziert, 
  // die React als "Component-Render-Tree" interpretiert.
  
  return (
    <NextThemesProvider 
      {...props} 
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}