import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

const Confetti = forwardRef((props, ref) => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const animationId = useRef(null);

    const createParticles = (count, spread, origin, colors) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const { width, height } = canvas.getBoundingClientRect();
        // Adjust for DPR
        const dpr = window.devicePixelRatio || 1;

        const x = origin.x * width * dpr;
        const y = origin.y * height * dpr;

        for (let i = 0; i < count; i++) {
            const angle = (Math.random() - 0.5) * (spread * Math.PI / 180) - Math.PI / 2; // Upwards with spread
            const velocity = 5 + Math.random() * 5;

            particlesRef.current.push({
                x,
                y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                decay: 0.01 + Math.random() * 0.01,
                size: 5 + Math.random() * 5
            });
        }
    };

    const animate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particlesRef.current.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2; // Gravity
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                particlesRef.current.splice(i, 1);
            } else {
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * dpr, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        if (particlesRef.current.length > 0) {
            animationId.current = requestAnimationFrame(animate);
        } else {
            animationId.current = null;
        }
    };

    useImperativeHandle(ref, () => ({
        fire: (opts = {}) => {
            const {
                particleCount = 50,
                spread = 60,
                origin = { x: 0.5, y: 0.5 },
                colors = ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
            } = opts;

            createParticles(particleCount, spread, origin, colors);
            if (!animationId.current) {
                animate();
            }
        }
    }));

    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                const dpr = window.devicePixelRatio || 1;
                const rect = canvas.getBoundingClientRect();
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
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
            className="fixed inset-0 pointer-events-none z-[100]"
            style={{ width: '100%', height: '100%' }}
        />
    );
});

export default Confetti;
