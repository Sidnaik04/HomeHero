import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-dark-bg flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header onMenuClick={toggleSidebar} />

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-dark-card border-t border-dark-border py-4 px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-sm text-dark-muted">
              © 2025 HomeHero. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm">
              <a
                href="#"
                className="text-dark-muted hover:text-primary-500 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-dark-muted hover:text-primary-500 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-dark-muted hover:text-primary-500 transition-colors"
              >
                Support
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
