import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { BottomNav } from "@/components/BottomNav";
import { PageWrapper } from "@/components/PageWrapper";

export const metadata: Metadata = {
  title: "Travel Up — AI Travel Itinerary",
  description: "AI-powered travel itinerary planner",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <AppProvider>
          <div className="mx-auto max-w-[430px] min-h-screen bg-white relative">
            <PageWrapper>{children}</PageWrapper>
            <BottomNav />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
