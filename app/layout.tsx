// app/layout.tsx
import "./globals.css";
import { ThemeProvider } from "./(dashboard)/components/theme-provider";

export const metadata = {
  title: "AIO App",
  description: "Zentrales Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className="bg-[var(--background)] text-[var(--foreground)]">
        <ThemeProvider 
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
>
  {children}
</ThemeProvider>
      </body>
    </html>
  );
}