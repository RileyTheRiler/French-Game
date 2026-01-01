import React, { useEffect, useRef } from 'react';

const AudioVisualizer = ({ isListening, audioContext, mediaStream }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);

    useEffect(() => {
        if (!isListening || !audioContext || !mediaStream) {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            // Clear canvas
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        analyserRef.current = audioContext.createAnalyser();
        analyserRef.current.fftSize = 256;

        sourceRef.current = audioContext.createMediaStreamSource(mediaStream);
        sourceRef.current.connect(analyserRef.current);

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);
            analyserRef.current.getByteFrequencyData(dataArray);

            ctx.fillStyle = 'rgba(15, 23, 42, 0.2)'; // Fade out effect
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2;

                // Gradient color based on height
                const r = barHeight + 25 * (i / bufferLength);
                const g = 250 * (i / bufferLength);
                const b = 50;

                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }
        };

        draw();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (sourceRef.current) sourceRef.current.disconnect();
            // Note: Don't close AudioContext here as it's passed in
        };
    }, [isListening, audioContext, mediaStream]);

    return (
        <canvas
            ref={canvasRef}
            width={300}
            height={100}
            className="w-full h-24 rounded-lg bg-slate-950/50"
        />
    );
};

export default AudioVisualizer;
