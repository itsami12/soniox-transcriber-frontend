"use client";

import { useState, useRef } from "react";
import { RecordTranscribe } from "@soniox/speech-to-text-web";

export default function DebugRecorder() {
  const [log, setLog] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [partialText, setPartialText] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const recorderRef = useRef<RecordTranscribe | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Function to extract text from various response formats
  const extractText = (result: any): string => {
    console.log("🔍 Raw result object:", JSON.stringify(result, null, 2));
    
    let text = "";
    
    // Method 1: Direct text property
    if (result.text && typeof result.text === 'string') {
      text = result.text;
      console.log("✅ Found text via result.text:", text);
      return text;
    }
    
    // Method 2: Tokens array (most likely based on your console)
    if (result.tokens && Array.isArray(result.tokens)) {
      text = result.tokens
        .map(token => {
          if (typeof token === 'string') return token;
          if (token && token.text) return token.text;
          if (token && token.word) return token.word;
          return '';
        })
        .filter(t => t)
        .join(' ');
      console.log("✅ Found text via tokens:", text);
      return text;
    }
    
    // Method 3: Result array
    if (result.result && Array.isArray(result.result)) {
      text = result.result
        .map(item => {
          if (typeof item === 'string') return item;
          if (item && item.text) return item.text;
          return '';
        })
        .filter(t => t)
        .join(' ');
      console.log("✅ Found text via result array:", text);
      return text;
    }
    
    // Method 4: Check if result itself is an array
    if (Array.isArray(result)) {
      text = result
        .map(item => {
          if (typeof item === 'string') return item;
          if (item && item.text) return item.text;
          return '';
        })
        .filter(t => t)
        .join(' ');
      console.log("✅ Found text via direct array:", text);
      return text;
    }
    
    console.log("❌ No text found in result");
    return "";
  };

  const start = async () => {
    try {
      setStatus("Starting...");
      setLog("");
      setPartialText("");
      setDebugInfo("");
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;

      const rec = new RecordTranscribe({
        apiKey: "78f3955acbc6cddce3a06f9686e1f9bbd40ebd6c3862c8d06fcecdd307ffe318",
      });

      console.log("🚀 Starting recording with enhanced debugging...");

      rec.start({
      audio_format: "auto", // server detects the format
      model: "stt-rt-preview",
      language_hints: ["en", "ur"],
        
        
        onResult: (result) => {
          console.log("🎯 FINAL RESULT RECEIVED:");
          console.log("Raw result:", result);
          
          const text = extractText(result);
          setDebugInfo(prev => `${prev}\n[FINAL] ${JSON.stringify(result)}`);
          
          if (text && text.trim()) {
            const timestamp = new Date().toLocaleTimeString();
            const finalText = text.trim();
            
            console.log("📝 ADDING TO LOG:", finalText);
            
            setLog((prev) => {
              const newLine = prev ? '\n' : '';
              const newLog = `${prev}${newLine}[${timestamp}] ${finalText}`;
              console.log("📋 Updated log:", newLog);
              return newLog;
            });
            
            setPartialText(""); // Clear partial when we get final
          } else {
            console.log("⚠️ No text extracted from final result");
          }
        },
        
        onPartialResult: (result) => {
          console.log("⚡ PARTIAL RESULT RECEIVED:");
          console.log("Raw partial:", result);
          
          const text = extractText(result);
          setDebugInfo(prev => `${prev}\n[PARTIAL] ${JSON.stringify(result)}`);
          
          if (text && text.trim()) {
            const partialText = text.trim();
            console.log("🔄 UPDATING PARTIAL:", partialText);
            setPartialText(partialText);
          } else {
            console.log("⚠️ No text extracted from partial result");
          }
        },
        
        onError: (error) => {
          console.error("❌ Transcription error:", error);
          setStatus(`Error: ${error.message}`);
          setIsRecording(false);
          setPartialText("");
        },
        
        onClose: () => {
          console.log("🔌 Transcription session closed");
          setStatus("Stopped");
          setIsRecording(false);
          setPartialText("");
        }
      });

      recorderRef.current = rec;
      setIsRecording(true);
      setStatus("🎙️ Recording... (Enhanced Debug Mode)");
      console.log("✅ Recording started with enhanced debugging!");
      
    } catch (error) {
      console.error("Failed to start recording:", error);
      setStatus(`Failed to start: ${error.message}`);
      setIsRecording(false);
    }
  };

  const stop = () => {
    try {
      console.log("⏹️ Stopping recording...");
      
      if (recorderRef.current) {
        recorderRef.current.stop();
        recorderRef.current = null;
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        streamRef.current = null;
      }
      
      setIsRecording(false);
      setStatus("Stopped");
      setPartialText("");
      
    } catch (error) {
      console.error("Error stopping recording:", error);
      setStatus(`Error stopping: ${error.message}`);
    }
  };

  const clear = () => {
    setLog("");
    setPartialText("");
    setDebugInfo("");
    setStatus("Ready");
  };

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: '0 auto' }}>
      {/* Enhanced Debug Info */}
      <div style={{ 
        backgroundColor: '#f0f8ff', 
        padding: 15, 
        borderRadius: 8, 
        marginBottom: 20,
        fontSize: '13px',
        fontFamily: 'monospace',
        border: '2px solid #4CAF50'
      }}>
        <strong>🔧 Enhanced Debug Info:</strong><br/>
        Recording: {isRecording ? '✅ Active' : '❌ Stopped'}<br/>
        Status: {status}<br/>
        Partial Text: "{partialText}" (Length: {partialText.length})<br/>
        Final Log: "{log}" (Length: {log.length})<br/>
        API: Direct Soniox Connection<br/>
        <strong>Console Check:</strong> Open browser console for detailed logs
      </div>

      {/* Controls */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ 
          display: 'flex', 
          gap: 15, 
          alignItems: 'center',
          marginBottom: 15 
        }}>
          <button 
            onClick={start} 
            disabled={isRecording}
            style={{
              backgroundColor: isRecording ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '10px',
              cursor: isRecording ? 'not-allowed' : 'pointer',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            🎙️ Start Recording
          </button>
          
          <button 
            onClick={stop} 
            disabled={!isRecording}
            style={{
              backgroundColor: !isRecording ? '#ccc' : '#f44336',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '10px',
              cursor: !isRecording ? 'not-allowed' : 'pointer',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            ⏹️ Stop Recording
          </button>
          
          <button 
            onClick={clear}
            style={{
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            🗑️ Clear All
          </button>
        </div>
        
        <div style={{ 
          fontSize: '18px', 
          color: isRecording ? '#4CAF50' : '#666',
          fontWeight: 'bold',
          padding: '12px 20px',
          backgroundColor: isRecording ? '#e8f5e8' : '#f5f5f5',
          borderRadius: '8px',
          border: `3px solid ${isRecording ? '#4CAF50' : '#ddd'}`,
          textAlign: 'center'
        }}>
          Status: {status}
        </div>
      </div>

      {/* Transcription Results */}
      <div style={{
        border: '3px solid #ddd',
        borderRadius: '10px',
        padding: '25px',
        minHeight: '350px',
        backgroundColor: '#fafafa',
        maxHeight: '600px',
        overflowY: 'auto'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '24px' }}>
          📝 Transcription Results:
        </h2>
        
        {/* Final Results */}
        {log && (
          <div style={{
            marginBottom: '15px',
            padding: '15px',
            backgroundColor: '#d4edda',
            borderRadius: '8px',
            border: '2px solid #c3e6cb'
          }}>
            <div style={{ fontSize: '14px', color: '#155724', marginBottom: '8px', fontWeight: 'bold' }}>
              ✅ FINAL TRANSCRIPTION:
            </div>
            <pre style={{ 
              whiteSpace: "pre-wrap", 
              margin: 0,
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#155724',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              {log}
            </pre>
          </div>
        )}
        
        {/* Partial/Live Results */}
        {partialText && (
          <div style={{
            padding: '15px',
            backgroundColor: '#fff3cd',
            borderRadius: '8px',
            border: '2px solid #ffeaa7',
            animation: 'pulse 2s infinite'
          }}>
            <div style={{ fontSize: '14px', color: '#856404', marginBottom: '8px', fontWeight: 'bold' }}>
              ⏳ LIVE (Partial):
            </div>
            <pre style={{ 
              whiteSpace: "pre-wrap", 
              margin: 0,
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#856404',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontStyle: 'italic'
            }}>
              {partialText}
            </pre>
          </div>
        )}
        
        {/* Empty State */}
        {!log && !partialText && (
          <div style={{
            textAlign: 'center',
            color: '#999',
            fontSize: '20px',
            marginTop: '80px'
          }}>
            🎤 Click "Start Recording" and speak...<br/>
            <small style={{ fontSize: '16px', marginTop: '15px', display: 'block' }}>
              Supports English & اردو (Urdu) - Check console for debug info
            </small>
          </div>
        )}
      </div>

      {/* Raw Debug Data */}
      {debugInfo && (
        <div style={{
          marginTop: 20,
          border: '2px solid #orange',
          borderRadius: '8px',
          padding: '15px',
          backgroundColor: '#fff5f5',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#d32f2f' }}>🐛 Raw Debug Data:</h3>
          <pre style={{ 
            fontSize: '11px',
            color: '#d32f2f',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace'
          }}>
            {debugInfo}
          </pre>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.8; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}