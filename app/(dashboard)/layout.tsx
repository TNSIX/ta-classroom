import NavbarWrapper from "@/components/layout/navbar-wrapper";
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "@/components/layout/sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="flex sticky top-0 h-screen overflow-hidden">
                <Sidebar />
            </div>
            <div className="flex-1 flex flex-col min-w-0">
                <div className="sticky top-0 z-50">
                    <NavbarWrapper />
                </div>
                <main className="flex flex-row overflow-y-auto scroll-smooth">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    );
}