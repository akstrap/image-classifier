import { useState } from "react";
import axios from "axios";

export default function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setResult(null);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!image) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", image);

    try {
      const res = await axios.post("http://localhost:8000/predict", formData);
      setResult(res.data);
    } catch (err) {
      console.error("Prediction error:", err);
      setResult({ label: "Error", confidence: 0 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-3xl font-bold text-green-700 mb-4">
        Image Classifier
      </h1>

      <input type="file" onChange={handleChange} accept="image/*" />
      {preview && (
        <img src={preview} alt="Preview" className="h-48 rounded shadow" />
      )}

      <button
        onClick={handleUpload}
        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
      >
        Classify
      </button>

      {loading && <p className="text-gray-600">Processing image...</p>}

      {result && (
        <div className="bg-white rounded shadow-lg p-4 mt-4 text-center">
          <h2 className="text-xl font-semibold text-gray-800">Result</h2>
          <p className="mt-2 text-lg">
            <strong>Label:</strong> {result.label}
          </p>
          <p className="text-gray-600">
            <strong>Confidence:</strong> {(result.confidence * 100).toFixed(2)}%
          </p>
        </div>
      )}
    </div>
  );
}
