import React, { useState, ChangeEvent, FormEvent } from "react";
import axios, { AxiosResponse } from "axios";
import Image from "next/image"; // Import Next.js Image component

interface Metadata {
  [key: string]: string;
}

interface QRCode {
  id: string;
  qrCodeDataUrl: string;
}

interface ProductRegistrationFormProps {}

const ProductRegistrationForm: React.FC<ProductRegistrationFormProps> = () => {
  const [productName, setProductName] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [metadata, setMetadata] = useState<Metadata>({});
  const [image, setImage] = useState<File | null>(null);
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleMetadataChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    try {
      setMetadata(JSON.parse(e.target.value));
    } catch (error) {
      console.error("Invalid JSON", error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("productName", productName);
    formData.append("quantity", quantity.toString());
    formData.append("metadata", JSON.stringify(metadata));
    if (image) formData.append("image", image);

    try {
      const response: AxiosResponse<{ qrCodes: QRCode[] }> = await axios.post(
        "http://localhost:5000/api/products",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setQrCodes(response.data.qrCodes);
      setLoading(false);
    } catch (error) {
      console.error("Error registering product:", error);
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Register New Product</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Product Name:</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Quantity:</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min="1"
            required
          />
        </div>
        <div>
          <label>Metadata (JSON):</label>
          <textarea
            onChange={handleMetadataChange}
            placeholder='{"brand": "YourBrand", "model": "XYZ-1000"}'
          />
        </div>
        <div>
          <label>Product Image:</label>
          <input type="file" onChange={handleImageChange} accept="image/*" />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register Product"}
        </button>
      </form>

      {qrCodes.length > 0 && (
        <div>
          <h3>Generated QR Codes:</h3>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {qrCodes.map((qrCode, index) => (
              <div key={qrCode.id} style={{ margin: "10px" }}>
                <Image
                  src={qrCode.qrCodeDataUrl}
                  alt={`QR Code ${index + 1}`}
                  width={150} // Adjust width as needed
                  height={150} // Adjust height as needed
                />
                <p>ID: {qrCode.id}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductRegistrationForm;
