import { Inter } from "next/font/google";
import { getSEOTags } from "@/libs/seo";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import config from "@/config";
import "./globals.css";
import AppLayout from "@/components/Layout/AppLayout";

const font = Inter({ subsets: ["latin"] });

export const viewport = {
	// Will use the primary color of your theme to show a nice theme color in the URL bar of supported browsers
  themeColor: config.colors.main,
  width: "device-width",
  initialScale: 1,
};

// This adds default SEO tags to all pages in our app.
// You can override them in each page passing params to getSOTags() function.
export const metadata = getSEOTags();

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" data-theme={config.colors.theme} className={font.className}>
      <body className="min-h-screen flex flex-col">
        {/* ClientLayout contains all the client wrappers (Crisp chat support, toast messages, tooltips, etc.) */}
        <AppLayout session={session}>{children}</AppLayout>
      </body>
    </html>
  );
}
