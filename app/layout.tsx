// app/layout.tsx
import "./globals.css";
import { ThemeProvider } from "./(dashboard)/components/theme-provider";

export const metadata = {
  title: "AIO App",
  description: "Zentrales Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning ist hier essenziell!
    <html lang="de" suppressHydrationWarning>
      <head /> 
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}