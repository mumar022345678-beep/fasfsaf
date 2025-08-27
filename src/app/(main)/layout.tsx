import LandingPage from "@/components/landingPage/LandingPage";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getUser } from "@/lib/auth";
import { UserProvider } from "@/context/UserContext";
import Sidebar from "@/components/sidebar/Sidebar";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    return (
      <html lang="en">
        <body className="h-screen w-screen flex items-center justify-center">
          <LandingPage />
        </body>
      </html>
    );
  }

  return (
    <SidebarProvider className="h-screen w-screen">
      <UserProvider initialUser={user}>
        <Sidebar />
        {children}
      </UserProvider>
    </SidebarProvider>
  );
}
