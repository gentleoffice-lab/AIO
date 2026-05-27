"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider 
      {...props} 
      attribute="class"      // Damit die Klasse "dark" auf dem <html> Tag gesetzt wird
      defaultTheme="dark"    // HIER: Das ist die Einstellung für den Standardwert
      enableSystem={false} // Wichtig: Damit wird das OS ignoriert
      
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}