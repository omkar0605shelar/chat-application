import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-6xl h-[90vh] bg-white/30 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl overflow-hidden flex relative">
                {children}
            </div>
        </div>
    );
};

export default Layout;
