import "./globals.css";
import { AuthProvider } from "../lib/contexts/AuthContext";
import Navigation from "@/components/Navigation";

export const metadata = {
  title: "Inventory Notification App",
  description: "Track inventory movement between locations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <AuthProvider>
          <Navigation />
          <div className="pt-4">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
