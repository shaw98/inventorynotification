import "./globals.css";
import { AuthProvider } from "../lib/contexts/AuthContext";

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
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
