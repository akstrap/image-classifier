import { useState } from "react";
import axios from "axios";

export default function App() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", image);

    const res = await axios.post("http://localhost:8000/predict", formData);
    setResult(res.data);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-6 p-4">
      <input type="file" onChange={(e) => setImage(e.target.files[0])} />
      <button
        onClick={handleUpload}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Classify
      </button>
      {result && (
        <div className="bg-white p-4 rounded shadow-md text-center">
          <p>
            <strong>Label:</strong> {result.label}
          </p>
          <p>
            <strong>Confidence:</strong> {result.confidence}
          </p>
        </div>
      )}
    </div>
  );
}
