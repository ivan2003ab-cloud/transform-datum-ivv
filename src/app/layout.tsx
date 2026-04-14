import "./globals.css";
import DashboardLayout from "@/components/DashboardLayout/index";

export const metadata = {
  title: "Dashboard",
  description: "My Dashboard App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </body>
    </html>
  );
}
