import React from 'react';
import { Outlet } from 'react-router-dom';
import { PageHeader } from './PageHeader'; // Your reusable header
import { Home, MountainIcon } from 'lucide-react'; // Example icon
import { SidebarProvider } from '../ui/sidebar';
import { AppSidebar } from './AppSideBar';

// export function MainLayout() {
//     // You can decide if the header should be dynamic later.
//     // For now, a generic header works.
//     return (
//         <div className="min-h-screen bg-background">
//             {/* The PageHeader is now part of the layout, always present */}
//             <PageHeader
//                 title="Rocha Negra"
//                 subtitle='Life Management Platform'
//                 icon={<MountainIcon className="h-5 w-5 text-primary-foreground" />}
//                 showBackButton={false} // The main layout header doesn't need a back button
//             />

//             <main>
//                 {/* Outlet is where React Router will render the specific page (Home, Finance, etc.) */}
//                 <Outlet />
//             </main>
//         </div>
//     );
// }

export function MainLayout() {
    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
                <AppSidebar />
                <main className="flex-1 overflow-auto">
                    <div className="container py-6 px-4 md:px-8 max-w-7xl">
                        <Outlet />
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}