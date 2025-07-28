'use client';

import dynamic from "next/dynamic";

const Recorder = dynamic(() => import("./components/Recorder"), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="text-lg">Loading recorder...</div>
    </div>
  )
});

// Alternative direct recorder (bypasses your WebSocket server)
const DirectRecorder = dynamic(() => import("./components/Recorder"), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="text-lg">Loading direct recorder...</div>
    </div>
  )
});

// Enhanced debug recorder
const DebugRecorder = dynamic(() => import("./components/Recorder"), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="text-lg">Loading debug recorder...</div>
    </div>
  )
});

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎙️ Real-Time Speech Transcription
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Multilingual Support: English & Urdu
          </p>
          <p className="text-sm text-gray-500">
            Powered by Soniox AI - Speak naturally in any supported language
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
          {/* Use DebugRecorder for comprehensive debugging */}
          <DebugRecorder />
          
          {/* Other options - comment/uncomment as needed */}
          {/* <DirectRecorder /> */}
          {/* <Recorder /> */}
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>🌐 This application supports real-time transcription in multiple languages</p>
          <p>🔊 Make sure your microphone is enabled and working properly</p>
        </div>
      </div>
    </main>
  );
}