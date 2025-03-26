'use client';

import { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import GIF from 'gif.js-upgrade';

// Helper function to generate desert element orbit parameters
const createDesertOrbit = (index: number, total: number) => ({
  speed: 0.2 + (index * 0.1), // Each element slightly faster than the last
  radius: 140, // Fixed radius for clean circle
  offset: (index * 2 * Math.PI) / total, // Evenly spaced
  size: 40, // Fixed size for elements
  emoji: ['🌵', '🦎', '🦂', '🌞'][index % 4], // Desert themed emojis
  direction: index % 2 === 0 ? 1 : -1 // Alternate direction
});

// Helper function to create tumbleweed parameters
const createTumbleweedOrbit = (index: number, total: number) => ({
  speed: -0.5 - (index * 0.1), // Faster opposite movement
  radius: 70, // Closer to center
  offset: (index * 2 * Math.PI) / total,
  size: 25,
  emoji: '🌾' // Tumbleweed emoji
});

// Create orbits for both layers
const desertOrbits = Array.from({ length: 8 }, (_, i) => createDesertOrbit(i, 8));
const tumbleweedOrbits = Array.from({ length: 4 }, (_, i) => createTumbleweedOrbit(i, 4));

export default function FingerScene() {
  const [position, setPosition] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [encodeProgress, setEncodeProgress] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Faster spinning animation
  useEffect(() => {
    const animate = () => {
      setPosition(prev => (prev + 1) % 360); // Faster rotation
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const addLog = (message: string) => {
    console.log(message);
    setLog(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} - ${message}`]);
  };

  const startRecording = async () => {
    if (!containerRef.current) return;
    setIsRecording(true);
    setEncodeProgress(0);
    setLog([]);
    
    addLog('Starting recording...');
    
    const size = 400;
    const scale = 1;
    
    addLog(`Container size: ${containerRef.current.offsetWidth}x${containerRef.current.offsetHeight}`);
    addLog(`Target GIF size: ${size}x${size}`);
    
    const gif = new GIF({
      workers: 4,
      quality: 1,
      width: size,
      height: size,
      workerScript: '/gif.worker.js',
      background: '#1a1a1a',
      dither: false
    });

    addLog('GIF encoder initialized');

    gif.on('progress', (p: number) => {
      const percent = Math.round(p * 100);
      setEncodeProgress(percent);
      addLog(`Encoding progress: ${percent}%`);
    });

    gif.on('finished', (blob: Blob) => {
      addLog(`GIF generated: ${(blob.size / 1024).toFixed(2)}KB`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'finger-animation.gif';
      a.click();
      URL.revokeObjectURL(url);
      setIsRecording(false);
      setEncodeProgress(0);
      addLog('Export complete');
    });

    // Capture exactly one full cycle
    const frames = 72; // 24fps for 3 seconds (one complete cycle)
    const frameDelay = 1000 / 24; // 24fps for smoother animation
    addLog(`Starting frame capture (${frames} frames at ${frameDelay}ms delay)`);
    
    // Start at 0 degrees
    setPosition(0);
    await new Promise(resolve => setTimeout(resolve, 50)); // Wait for state to update
    
    for (let i = 0; i <= frames; i++) { // Note: <= to include the last frame which matches first frame
      if (i % 12 === 0) {
        addLog(`Capturing frame ${i}/${frames}`);
      }
      
      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: '#1a1a1a',
        scale,
        width: size,
        height: size,
        logging: false,
        imageTimeout: 0,
        useCORS: true
      });

      addLog(`Frame ${i} size: ${canvas.width}x${canvas.height}`);
      gif.addFrame(canvas, { 
        delay: frameDelay,
        copy: true
      });
      
      // Move exactly 360/frames degrees per frame
      setPosition((i * 360) / frames);
      await new Promise(resolve => setTimeout(resolve, frameDelay));
    }

    addLog('Frame capture complete, starting render...');
    gif.render();
  };

  // Calculate main cactus animation
  const radians = (position * Math.PI) / 180;
  const mainScale = 0.9 + Math.sin(radians) * 0.1;
  const mainRotation = position * 2; // Spin twice as fast as the orbit cycle

  return (
    <div className="relative h-screen w-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
      <div 
        ref={containerRef} 
        className="w-[400px] h-[400px] flex items-center justify-center bg-[#1a1a1a] rounded-lg"
        style={{ 
          boxSizing: 'border-box',
          position: 'relative'
        }}
      >
        {/* Main center spinning cactus */}
        <div 
          className="text-[200px] will-change-transform absolute select-none"
          style={{ 
            opacity: 1,
            filter: `blur(${(1 - mainScale) * 0.3}px)`,
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) scale(${mainScale}) rotate(${mainRotation}deg)`
          }}
        >
          🌵
        </div>

        {/* Tumbleweeds inner circle */}
        {tumbleweedOrbits.map((orbit, index) => {
          const orbitRadians = (position * orbit.speed) + orbit.offset;
          const x = Math.cos(orbitRadians) * orbit.radius;
          const y = Math.sin(orbitRadians) * orbit.radius;
          const scale = 0.8 + Math.sin(radians + orbit.offset) * 0.2;
          const rotation = position * 3; // Spin the tumbleweeds faster
          
          return (
            <div
              key={`tumbleweed-${index}`}
              className="absolute select-none"
              style={{
                fontSize: orbit.size,
                opacity: 0.7,
                filter: `blur(${(1 - scale) * 0.3}px)`,
                transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotation}deg)`,
                transition: 'none'
              }}
            >
              {orbit.emoji}
            </div>
          );
        })}

        {/* Desert elements outer circle */}
        {desertOrbits.map((orbit, index) => {
          const orbitRadians = (position * orbit.speed * orbit.direction) + orbit.offset;
          const x = Math.cos(orbitRadians) * orbit.radius;
          const y = Math.sin(orbitRadians) * orbit.radius;
          const scale = 0.8 + Math.sin(radians + orbit.offset) * 0.2;
          
          return (
            <div
              key={`desert-${index}`}
              className="absolute select-none"
              style={{
                fontSize: orbit.size,
                opacity: 0.9,
                filter: `blur(${(1 - scale) * 0.5}px)`,
                transform: `translate(${x}px, ${y}px) scale(${scale})`,
                transition: 'none'
              }}
            >
              {orbit.emoji}
            </div>
          );
        })}
      </div>
      <div className="absolute top-4 right-4 flex flex-col gap-4 items-end">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
          onClick={startRecording}
          disabled={isRecording}
        >
          {isRecording 
            ? `Recording... ${encodeProgress > 0 ? encodeProgress + '%' : ''}` 
            : 'Record GIF (3s)'}
        </button>
        {log.length > 0 && (
          <div className="bg-black/80 text-white p-4 rounded-lg text-sm font-mono w-[300px] max-h-[300px] overflow-y-auto">
            {log.map((entry, i) => (
              <div key={i} className="whitespace-pre-wrap mb-1">
                {entry}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 