import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import "./App.css";

export default function App() {
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const scrollRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const clearHistory = () => {
    setChat([]);
    localStorage.removeItem("chatHistory");
  };

  // load from localStorage on page load
  useEffect(() => {
    const saved = localStorage.getItem("chatHistory");
    if (saved) setChat(JSON.parse(saved));
  }, []);

  // save chat to localStorage
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(chat));
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      const preview = reader.result;

      // Add user message
      setChat((prev) => [
        ...prev,
        {
          type: "user",
          image: preview,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);

      // Start loading + send to backend
      handleUpload(file, preview);
    };

    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  const handleUpload = async (file, preview) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:8000/predict", formData);
      const { label, confidence } = res.data;

      // Add model response to chat
      setChat((prev) => [
        ...prev,
        {
          type: "bot",
          label,
          confidence,
          image: preview,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err) {
      console.error("upload err ->", err);
      setChat((prev) => [
        ...prev,
        {
          type: "bot",
          label: "Error",
          confidence: 0,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const checkCameraPermissions = async () => {
    try {
      const result = await navigator.permissions.query({ name: "camera" });
      if (result.state === "denied") {
        throw new Error(
          "Camera access has been denied. Please enable it in your browser settings."
        );
      }
      return true;
    } catch (err) {
      return false;
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const hasPermission = await checkCameraPermissions();
      if (!hasPermission) {
        throw new Error("Camera permission is required");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setShowCamera(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError(
        err.message || "Unable to access camera. Please check permissions."
      );
      setShowCamera(true); // Show error UI
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
        const preview = URL.createObjectURL(blob);

        setChat((prev) => [
          ...prev,
          {
            type: "user",
            image: preview,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);

        handleUpload(file, preview);
        stopCamera();
      },
      "image/jpeg",
      0.8
    );
  };

  // Add cleanup for camera
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-black space-bg">
      <div className="shooting-star"></div>
      <div className="shooting-star"></div>
      <div className="shooting-star"></div>

      {/* Header */}
      <header className="glass-effect p-6 shadow-lg relative z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            🌌 Deep Space Classifier
          </h1>
          <button
            onClick={clearHistory}
            className="px-4 py-2 rounded-lg bg-opacity-50 bg-gray-800 hover:bg-opacity-70 transition-all duration-300 text-blue-400 border border-blue-400/30"
          >
            Clear History
          </button>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
        {chat.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 glass-effect ${
                msg.type === "user"
                  ? "bg-blue-500/20 text-blue-100 rounded-br-none"
                  : "bg-purple-500/20 text-purple-100 rounded-bl-none"
              }`}
            >
              {msg.image && (
                <img
                  src={msg.image}
                  alt="Uploaded"
                  className="rounded-lg max-w-xs mb-2"
                />
              )}
              {msg.type === "bot" ? (
                <div>
                  <p className="font-medium">I think this is: {msg.label}</p>
                  <p className="text-sm opacity-75">
                    Confidence: {(msg.confidence * 100).toFixed(2)}%
                  </p>
                </div>
              ) : (
                <p>Here's what I'd like you to analyze</p>
              )}
              <div className="text-xs opacity-50 mt-1 text-right">
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="glass-effect rounded-2xl rounded-bl-none p-4">
              <div className="animate-pulse flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
                <span className="text-blue-400">
                  Analyzing in deep space...
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative bg-space-surface p-4 rounded-lg">
            {cameraError ? (
              <div className="camera-error">
                <p className="text-red-500 mb-4">{cameraError}</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => startCamera()}
                    className="camera-button retry"
                  >
                    Retry Camera
                  </button>
                  <button
                    onClick={() => {
                      setShowCamera(false);
                      setCameraError(null);
                    }}
                    className="camera-button cancel"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="camera-view"
                />
                <div className="camera-controls">
                  <button
                    onClick={capturePhoto}
                    className="camera-button capture"
                  >
                    Capture
                  </button>
                  <button onClick={stopCamera} className="camera-button cancel">
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="border-t border-gray-700/30 p-6 glass-effect relative z-10">
        <div className="flex justify-center gap-4">
          <div
            {...getRootProps()}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <input {...getInputProps()} />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4 4 4-4m4-4v8m0-8l4 4m-4-4l-4 4"
              />
            </svg>
          </div>
          <button
            onClick={startCamera}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
