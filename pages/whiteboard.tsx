"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { rtdb } from "@/lib/firebase";
import { ref, onValue, set } from "firebase/database";
import { useAuth } from "@/hooks/use-auth";
import {
  Plus,
  Pencil,
  Eraser,
  Trash2,
  Download,
  Square,
  Circle,
  Type,
  Undo,
  Share2,
  QrCode,
  Redo,
} from "lucide-react";

type Tool = "pencil" | "eraser" | "rectangle" | "circle" | "text";
type DrawingAction = {
  tool: Tool;
  points?: { x: number; y: number }[];
  color?: string;
  size?: number;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
};

export default function WhiteboardPage() {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool>("pencil");
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [sessionId, setSessionId] = useState<string>("");
  const [showQR, setShowQR] = useState(false);
  const [undoStack, setUndoStack] = useState<DrawingAction[]>([]);
  const [redoStack, setRedoStack] = useState<DrawingAction[]>([]);
  const [currentAction, setCurrentAction] = useState<DrawingAction | null>(null);

  // Get canvas context
  const getContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    return ctx;
  };

  // Memoize redrawCanvas function
  const redrawCanvas = useCallback(() => {
    const ctx = getContext();
    if (!ctx || !canvasRef.current) return;
    
    // Set background to white
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Redraw all actions 
    undoStack.forEach(action => {
      if (!action.points && !action.start) return;
      
      ctx.strokeStyle = action.color || "#000000";
      ctx.lineWidth = action.size || 5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (action.tool === "pencil" || action.tool === "eraser") {
        ctx.globalCompositeOperation = action.tool === "eraser" ? "destination-out" : "source-over";
        ctx.beginPath();
        action.points?.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      } else if ((action.tool === "rectangle" || action.tool === "circle") && action.start && action.end) {
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();
        if (action.tool === "rectangle") {
          const width = action.end.x - action.start.x;
          const height = action.end.y - action.start.y;
          ctx.rect(action.start.x, action.start.y, width, height);
        } else {
          const radius = Math.sqrt(
            Math.pow(action.end.x - action.start.x, 2) +
            Math.pow(action.end.y - action.start.y, 2)
          );
          ctx.arc(action.start.x, action.start.y, radius, 0, Math.PI * 2);
        }
        ctx.stroke();
      }
    });
  }, [undoStack]);

  // Initialize or join session
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sid = urlParams.get('sid') || crypto.randomUUID();
    setSessionId(sid);
  
    if (!urlParams.get('sid')) {
      const newUrl = `${window.location.pathname}?sid=${sid}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    }
  
    const sessionRef = ref(rtdb, `whiteboards/${sid}`);
    const unsubscribe = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.actions) {
        setUndoStack(data.actions);
      }
    });
  
    return () => unsubscribe();
  }, []);

  // Redraw when undoStack changes
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Sync changes to Firebase
  useEffect(() => {
    if (sessionId && undoStack.length > 0) {
      const sessionRef = ref(rtdb, `whiteboards/${sessionId}`);
      set(sessionRef, {
        actions: undoStack,
        lastUpdate: new Date().toISOString(),
      });
    }
  }, [undoStack, sessionId]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;
      
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => window.removeEventListener("resize", resizeCanvas);
  }, [redrawCanvas]);

  // Handle mouse/touch events
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = ("touches" in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ("touches" in e ? e.touches[0].clientY : e.clientY) - rect.top;

    const newAction: DrawingAction = {
      tool: currentTool,
      points: [{ x, y }],
      color,
      size: brushSize,
      start: { x, y },
    };

    setCurrentAction(newAction);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !currentAction || !currentAction.points) return;

    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ("touches" in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ("touches" in e ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.strokeStyle = currentAction.color || color;
    ctx.lineWidth = currentAction.size || brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (currentTool === "pencil") {
      ctx.globalCompositeOperation = "source-over";
      ctx.beginPath();
      const lastPoint = currentAction.points[currentAction.points.length - 1];
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      
      setCurrentAction({
        ...currentAction,
        points: [...currentAction.points, { x, y }],
      });
    } else if (currentTool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      const lastPoint = currentAction.points[currentAction.points.length - 1];
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      
      setCurrentAction({
        ...currentAction,
        points: [...currentAction.points, { x, y }],
      });
    } else if (currentTool === "rectangle" || currentTool === "circle") {
      redrawCanvas();
      
      if (!currentAction.start) return;
      
      ctx.beginPath();
      if (currentTool === "rectangle") {
        const width = x - currentAction.start.x;
        const height = y - currentAction.start.y;
        ctx.rect(currentAction.start.x, currentAction.start.y, width, height);
      } else {
        const radius = Math.sqrt(
          Math.pow(x - currentAction.start.x, 2) +
          Math.pow(y - currentAction.start.y, 2)
        );
        ctx.arc(currentAction.start.x, currentAction.start.y, radius, 0, Math.PI * 2);
      }
      ctx.stroke();
      
      setCurrentAction({
        ...currentAction,
        end: { x, y },
      });
    }
  };

  const stopDrawing = () => {
    if (!isDrawing || !currentAction) return;
    setIsDrawing(false);
    setUndoStack([...undoStack, currentAction]);
    setRedoStack([]);
    setCurrentAction(null);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const lastAction = undoStack[undoStack.length - 1];
    setUndoStack(undoStack.slice(0, -1));
    setRedoStack([...redoStack, lastAction]);
    redrawCanvas();
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextAction = redoStack[redoStack.length - 1];
    setRedoStack(redoStack.slice(0, -1));
    setUndoStack([...undoStack, nextAction]);
    redrawCanvas();
  };

  const handleClear = () => {
    const ctx = getContext();
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setUndoStack([]);
    setRedoStack([]);
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Whiteboard</h1>
          <p className="text-sm text-muted-foreground">
            Sketch, draw, and collaborate in real-time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowQR(true)}>
            <QrCode className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={handleClear}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[auto,300px] gap-6">
        {/* Main Canvas Area */}
        <Card className="relative aspect-[4/3] bg-white overflow-hidden">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </Card>

        {/* Tools Panel */}
        <div className="space-y-6">
          {/* Drawing Tools */}
          <Card className="p-4">
            <h2 className="text-sm font-medium mb-3">Tools</h2>
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant={currentTool === "pencil" ? "default" : "outline"}
                size="icon"
                className="h-10 w-10"
                onClick={() => setCurrentTool("pencil")}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant={currentTool === "eraser" ? "default" : "outline"}
                size="icon"
                className="h-10 w-10"
                onClick={() => setCurrentTool("eraser")}
              >
                <Eraser className="h-4 w-4" />
              </Button>
              <Button
                variant={currentTool === "rectangle" ? "default" : "outline"}
                size="icon"
                className="h-10 w-10"
                onClick={() => setCurrentTool("rectangle")}
              >
                <Square className="h-4 w-4" />
              </Button>
              <Button
                variant={currentTool === "circle" ? "default" : "outline"}
                size="icon"
                className="h-10 w-10"
                onClick={() => setCurrentTool("circle")}
              >
                <Circle className="h-4 w-4" />
              </Button>
              <Button
                variant={currentTool === "text" ? "default" : "outline"}
                size="icon"
                className="h-10 w-10"
                onClick={() => setCurrentTool("text")}
              >
                <Type className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={handleUndo}
                disabled={undoStack.length === 0}
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Color Picker */}
          <Card className="p-4">
            <h2 className="text-sm font-medium mb-3">Colors</h2>
            <div className="grid grid-cols-6 gap-2">
              {[
                "#000000",
                "#ffffff",
                "#ff0000",
                "#00ff00",
                "#0000ff",
                "#ffff00",
                "#ff00ff",
                "#00ffff",
                "#808080",
                "#800000",
                "#008000",
                "#000080",
              ].map((c) => (
                <button
                  key={c}
                  className={`w-8 h-8 rounded-full border-2 hover:opacity-80 transition-opacity ${
                    color === c ? "border-primary" : "border-border"
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </Card>

          {/* Brush Size */}
          <Card className="p-4">
            <h2 className="text-sm font-medium mb-3">Brush Size</h2>
            <Input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-center mt-2 text-sm text-muted-foreground">
              {brushSize}px
            </div>
          </Card>

          {/* Layers */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium">Layers</h2>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {["Background", "Layer 1", "Layer 2"].map((layer) => (
                  <div
                    key={layer}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                  >
                    <span className="text-sm">{layer}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>

      {/* QR Code Dialog */}
      {showQR && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="w-[300px] p-6">
            <div className="text-center space-y-4">
              <h2 className="text-lg font-semibold">Share Whiteboard</h2>
              <div className="flex justify-center">
                <QRCodeSVG
                  value={window.location.href}
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>
              <Input
                value={window.location.href}
                readOnly
                onClick={(e) => e.currentTarget.select()}
              />
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowQR(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}