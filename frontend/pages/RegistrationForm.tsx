// src/components/ProductRegistrationForm.tsx
"use client";
import { useState, FormEvent, ChangeEvent } from "react";
import { registerProduct, QRCode } from "@/utils/api";

export default function ProductRegistrationForm() {
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [metadataText, setMetadataText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Parse metadata if provided
      let metadata = {};
      if (metadataText) {
        try {
          metadata = JSON.parse(metadataText);
        } catch (err) {
          setError("Invalid JSON in metadata field");
          console.log(err);
          setLoading(false);
          return;
        }
      }

      const formData = new FormData();
      formData.append("productName", productName);
      formData.append("quantity", quantity.toString());
      formData.append("metadata", JSON.stringify(metadata));
      if (image) formData.append("image", image);

      const response = await registerProduct(formData);
      setQrCodes(response.qrCodes);
      setLoading(false);

      // Clear form
      setProductName("");
      setQuantity(1);
      setMetadataText("");
      setImage(null);
    } catch (err) {
      console.error("Error registering product:", err);
      setError("Failed to register product. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Register New Product</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            min="1"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Metadata (JSON)
          </label>
          <textarea
            value={metadataText}
            onChange={(e) => setMetadataText(e.target.value)}
            placeholder='{"brand": "YourBrand", "model": "XYZ-1000"}'
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-24"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Image
          </label>
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Registering..." : "Register Product"}
        </button>
      </form>

      {qrCodes.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Generated QR Codes</h3>
          <p className="mb-4 text-gray-600">
            These QR codes can be printed and attached to your products.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {qrCodes.map((qrCode) => (
              <div key={qrCode.id} className="border rounded-md p-3">
                <img
                  src={qrCode.qrCodeDataUrl}
                  alt="QR Code"
                  className="w-full"
                />
                <div className="mt-2 text-sm text-gray-500 break-all">
                  ID: {qrCode.id}
                </div>
                <button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = qrCode.qrCodeDataUrl;
                    link.download = `qr-${qrCode.id}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="mt-2 px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 w-full"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
