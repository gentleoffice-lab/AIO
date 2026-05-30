// app/layout.tsx
import "./globals.css";
import { ThemeProvider } from "./(dashboard)/components/theme-provider";
import { AuthProvider } from "./(auth)/AuthContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider> {/* NEU: Hier umhüllen! */}
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}