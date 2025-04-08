import { useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

export default function App() {
  // state for the current image we're uploading
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // store the past predictions so we can show history
  const [history, setHistory] = useState([]);

  // handle drag & drop files
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setImage(file);
    setResult(null); // reset prev result

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // setting up the dropzone props
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  // when user clicks "classify" button
  const handleUpload = async () => {
    if (!image) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", image);

    try {
      const res = await axios.post("http://localhost:8000/predict", formData);
      setResult(res.data);

      // store the prediction in history
      setHistory((prev) => [
        {
          image: preview,
          label: res.data.label,
          confidence: res.data.confidence,
        },
        ...prev,
      ]);
    } catch (err) {
      console.error("prediction error -->", err);
      setResult({ label: "Error", confidence: 0 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold text-green-700 my-4">
        Image Classifier
      </h1>

      {/* drag + drop area */}
      <div
        {...getRootProps()}
        className={`w-full max-w-md h-40 border-2 border-dashed rounded-lg flex items-center justify-center mb-4 transition ${
          isDragActive
            ? "border-green-500 bg-green-50"
            : "border-gray-300 bg-white"
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-green-700 font-medium">Drop the image here ...</p>
        ) : (
          <p className="text-gray-600">
            Drag & drop an image here, or click to select
          </p>
        )}
      </div>

      {/* show preview image before uploading */}
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="h-48 rounded shadow-md mb-4"
        />
      )}

      {/* classify btn */}
      <button
        onClick={handleUpload}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        Classify
      </button>

      {/* loading msg while model runs */}
      {loading && <p className="text-gray-600 mt-2">Processing image...</p>}

      {/* prediction result box */}
      {result && (
        <div className="bg-white rounded shadow-lg p-4 mt-4 text-center w-full max-w-sm">
          <h2 className="text-xl font-semibold text-gray-800">Result</h2>
          <p className="mt-2 text-lg">
            <strong>Label:</strong> {result.label}
          </p>
          <p className="text-gray-600">
            <strong>Confidence:</strong> {(result.confidence * 100).toFixed(2)}%
          </p>
        </div>
      )}

      {/* past predictions - just in-memory rn */}
      {history.length > 0 && (
        <div className="mt-8 w-full max-w-lg">
          <h3 className="text-xl font-bold mb-2 text-gray-700">History</h3>
          <div className="grid grid-cols-2 gap-4">
            {history.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded shadow p-2 text-center"
              >
                <img
                  src={item.image}
                  alt="History"
                  className="h-24 object-cover mx-auto rounded"
                />
                <p className="text-sm mt-1 font-medium text-gray-800">
                  {item.label}
                </p>
                <p className="text-xs text-gray-500">
                  {(item.confidence * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
