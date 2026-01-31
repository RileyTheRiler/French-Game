import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Eraser, Check, Undo } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

const WritingPad = ({
    mode = 'kanji', // 'kanji' (for complex chars) or 'latin' (for French)
    currentItem,
    onComplete
}) => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [strokes, setStrokes] = useState([]);
    const [currentStroke, setCurrentStroke] = useState([]);

    // Configuration
    const strokeColor = "#ffffff";
    const strokeWidth = 4;
    const showGuide = true;

    // Initialize Canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Handle HiDPI screens
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;

        contextRef.current = ctx;
    }, []);

    // Draw the guide character/word
    const drawGuide = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = contextRef.current;
        if (!canvas || !ctx || !currentItem) return;

        // Clear only if needed, but usually we draw guide under
        // For simple implementation, we assume canvas is cleared before calling this if strictly needed,
        // but typically guide is drawn once.

        ctx.save();
        ctx.font = "100px Arial";
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(currentItem.text || "?", canvas.width / 2 / (window.devicePixelRatio || 1), canvas.height / 2 / (window.devicePixelRatio || 1));
        ctx.restore();
    }, [currentItem]);

    // Redraw whenever item changes
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = contextRef.current;
        if (!canvas || !ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setStrokes([]);

        // Draw initial guide if enabled
        if (showGuide) {
            drawGuide();
        }
    }, [currentItem, showGuide, drawGuide]); // drawGuide included in dependency

    // Drawing handlers
    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
        setCurrentStroke([{ x: offsetX, y: offsetY }]);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
        setCurrentStroke(prev => [...prev, { x: offsetX, y: offsetY }]);
    };

    const stopDrawing = () => {
        contextRef.current.closePath();
        setIsDrawing(false);
        if (currentStroke.length > 0) {
            setStrokes(prev => [...prev, currentStroke]);
            setCurrentStroke([]);
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = contextRef.current;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setStrokes([]);
        if (showGuide) drawGuide();
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative border-2 border-slate-700 rounded-xl overflow-hidden bg-slate-900 touch-none">
                <canvas
                    ref={canvasRef}
                    className="w-full max-w-[300px] h-[300px] cursor-crosshair"
                    style={{ width: '300px', height: '300px' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={(e) => {
                        const touch = e.touches[0];
                        const rect = canvasRef.current.getBoundingClientRect();
                        startDrawing({ nativeEvent: { offsetX: touch.clientX - rect.left, offsetY: touch.clientY - rect.top } });
                    }}
                    onTouchMove={(e) => {
                        const touch = e.touches[0];
                        const rect = canvasRef.current.getBoundingClientRect();
                        draw({ nativeEvent: { offsetX: touch.clientX - rect.left, offsetY: touch.clientY - rect.top } });
                    }}
                    onTouchEnd={stopDrawing}
                />
            </div>

            <div className="flex gap-4">
                <button onClick={clearCanvas} className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-300 transition-colors">
                    <Eraser size={24} />
                </button>
                <button onClick={() => onComplete && onComplete(strokes)} className="p-3 bg-emerald-600 rounded-full hover:bg-emerald-500 text-white transition-colors shadow-lg">
                    <Check size={24} />
                </button>
            </div>
        </div>
    );
};

export default WritingPad;
