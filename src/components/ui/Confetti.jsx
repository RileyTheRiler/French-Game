import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

export const Confetti = forwardRef((props, ref) => {
    const canvasRef = useRef(null);
    const particles = useRef([]);
    const animationId = useRef(null);



    const createParticles = (count, spread, origin, colors) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const { width, height } = canvas;
        for (let i = 0; i < count; i++) {
            const angle = (Math.random() - 0.5) * (spread * Math.PI / 180) - Math.PI / 2; // Upwards with spread
            const velocity = 5 + Math.random() * 5;

            particles.current.push({
                x: origin.x * width,
                y: origin.y * height,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1,
                decay: 0.01 + Math.random() * 0.01,
                gravity: 0.1,
                size: 5 + Math.random() * 5
            });
        }
    };

    const animate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.current.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.life -= p.decay;

            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        });

        particles.current = particles.current.filter(p => p.life > 0);

        if (particles.current.length > 0) {
            animationId.current = requestAnimationFrame(animate);
        } else {
            animationId.current = null;
        }
    };

    useImperativeHandle(ref, () => ({
        fire: (opts = {}) => {
            const {
                particleCount = 100,
                spread = 70,
                origin = { x: 0.5, y: 0.5 },
                colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444']
            } = opts;

            createParticles(particleCount, spread, origin, colors);
            if (!animationId.current) {
                animate();
            }
        }
    }));

    const createParticles = (count, spread, origin, colors) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        for (let i = 0; i < count; i++) {
            const x = origin.x * canvas.width;
            const y = origin.y * canvas.height;
            const angle = (Math.random() - 0.5) * (spread * Math.PI / 180) - Math.PI / 2; // Upwards with spread
            const velocity = 5 + Math.random() * 5;

            particles.current.push({
                x, y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                decay: 0.01 + Math.random() * 0.01,
                gravity: 0.2, // Gravity
                size: 5 + Math.random() * 5
            });
        }
    };

    const animate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.current.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity; // Apply gravity
            p.alpha -= p.decay;

            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            if (p.alpha <= 0) {
                particles.current.splice(i, 1);
            }
        });

        if (particles.current.length > 0) {
            animationId.current = requestAnimationFrame(animate);
        } else {
            animationId.current = null;
        }
    };

    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationId.current) cancelAnimationFrame(animationId.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[100]" // High Z-index to be on top
        />
    );
});

Confetti.displayName = 'Confetti';
