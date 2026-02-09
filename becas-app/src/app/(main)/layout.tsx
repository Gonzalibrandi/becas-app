import DashboardLayout from "./_components/DashboardLayout";
import { FavoritesProvider } from "@/context/FavoritesContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FavoritesProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </FavoritesProvider>
  );
}
