import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Travel Up — AI Travel Itinerary",
  description: "AI-powered travel itinerary planner",
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
          <div className="mx-auto max-w-[390px] min-h-screen bg-white relative">
            <div className="pb-20">{children}</div>
            <BottomNav />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
