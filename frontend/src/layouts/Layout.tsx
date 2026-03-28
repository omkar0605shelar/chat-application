import React from 'react';
import AIWidget from '../components/AIWidget';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div
            className="w-full h-screen overflow-hidden relative"
            style={{
                background: 'linear-gradient(135deg, #0f0f23 0%, #1a1040 50%, #0d1f3c 100%)',
            }}
        >
            {/* Ambient blobs */}
            <div
                className="animate-blob"
                style={{
                    position: 'absolute',
                    top: '-15%',
                    left: '-10%',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
                    pointerEvents: 'none',
                    zIndex: 0,
                }}
            />
            <div
                className="animate-blob2"
                style={{
                    position: 'absolute',
                    bottom: '-20%',
                    right: '-10%',
                    width: '700px',
                    height: '700px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
                    pointerEvents: 'none',
                    zIndex: 0,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: '30%',
                    right: '20%',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
                    pointerEvents: 'none',
                    zIndex: 0,
                }}
            />

            {/* App container */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 1,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                }}
            >
                {children}
            </div>
            <AIWidget />
        </div>
    );
};

export default Layout;
