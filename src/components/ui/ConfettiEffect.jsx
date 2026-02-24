import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';

// Main confetti effect component
const ConfettiEffect = ({
    active = false,
    duration = 3000,
    particleCount = 50,
    colors = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'],
    onComplete
}) => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        if (!active) {
            setParticles([]);
            return;
        }

        // Generate particles
        const newParticles = Array.from({ length: particleCount }, (_, i) => ({
            id: i,
            color: colors[Math.floor(Math.random() * colors.length)],
            startX: Math.random() * window.innerWidth,
            startY: -20,
            endX: Math.random() * window.innerWidth,
            endY: window.innerHeight + 20,
            rotation: Math.random() * 360,
            scale: 0.5 + Math.random() * 1,
            delay: Math.random() * 500,
            duration: 2000 + Math.random() * 1000,
            shape: Math.random() > 0.5 ? '50%' : '2px' // Deterministic shape per particle
        }));

        setParticles(newParticles);

        // Clean up after animation
        const timer = setTimeout(() => {
            setParticles([]);
            onComplete?.();
        }, duration);

        return () => clearTimeout(timer);
    }, [active, particleCount, colors, duration, onComplete]);

    if (particles.length === 0) return null;

    return createPortal(
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="absolute animate-confetti-fall"
                    style={{
                        left: particle.startX,
                        top: particle.startY,
                        '--end-x': `${particle.endX - particle.startX}px`,
                        '--end-y': `${particle.endY}px`,
                        '--rotation': `${particle.rotation}deg`,
                        animationDelay: `${particle.delay}ms`,
                        animationDuration: `${particle.duration}ms`,
                    }}
                >
                    <div
                        className="w-3 h-3"
                        style={{
                            backgroundColor: particle.color,
                            borderRadius: particle.shape,
                            transform: `scale(${particle.scale})`,
                        }}
                    />
                </div>
            ))}
        </div>,
        document.body
    );
};

// Custom hook for triggering confetti
export const useConfetti = () => {
    const [isActive, setIsActive] = useState(false);
    const [config, setConfig] = useState({});

    const triggerConfetti = React.useCallback((options = {}) => {
        setConfig(options);
        setIsActive(true);
    }, []);

    const handleComplete = React.useCallback(() => {
        setIsActive(false);
        setConfig({});
    }, []);

    const ConfettiComponent = React.useCallback(() => (
        <ConfettiEffect
            active={isActive}
            onComplete={handleComplete}
            {...config}
        />
    ), [isActive, config, handleComplete]);

    return { triggerConfetti, ConfettiComponent, isActive };
};

// Preset confetti configurations
export const CONFETTI_PRESETS = {
    streak: {
        colors: ['#F97316', '#FB923C', '#FDBA74', '#FED7AA', '#FFEDD5'],
        particleCount: 60,
    },
    levelUp: {
        colors: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE'],
        particleCount: 80,
    },
    goal: {
        colors: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'],
        particleCount: 50,
    },
    achievement: {
        colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7'],
        particleCount: 70,
    },
};

export default ConfettiEffect;
