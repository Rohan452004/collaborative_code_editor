import React, { useRef, useEffect, useState } from "react";

const Canvas = ({ socketRef, roomId }) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctxRef.current = ctx;

    const startDrawing = (event) => {
      setIsDrawing(true);
      ctx.beginPath();
      ctx.moveTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
    };

    const draw = (event) => {
      if (!isDrawing) return;
      ctx.lineTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
      ctx.stroke();

      if (socketRef.current) {
        socketRef.current.emit("drawing", {
          roomId,
          x: event.clientX - canvas.offsetLeft,
          y: event.clientY - canvas.offsetTop,
          color,
        });
      }
    };

    const stopDrawing = () => {
      setIsDrawing(false);
      ctx.beginPath();
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);

    if (socketRef.current) {
      socketRef.current.on("drawing", ({ x, y, color }) => {
        ctx.strokeStyle = color;
        ctx.lineTo(x, y);
        ctx.stroke();
      });
    }

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseleave", stopDrawing);
    };
  }, [socketRef, roomId, isDrawing, color]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full p-4">
      <div className="mb-2">
        <label className="text-white">Color: </label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="ml-2"
        />
        <button
          onClick={clearCanvas}
          className="ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
        >
          Clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={window.innerWidth - 32}
        height={window.innerHeight - 120}
        className="border-2 border-black bg-white"
      />
    </div>
  );
};

export default Canvas;