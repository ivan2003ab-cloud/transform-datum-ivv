import "./globals.css";
import DashboardLayout from "@/components/DashboardLayout/index";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "Transformasi Datum App",
  description: "Aplikasi Transformasi Datum berbasis web",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <DashboardLayout>
            {children}
          </DashboardLayout>
        </AuthProvider>
      </body>
    </html>
  );
}