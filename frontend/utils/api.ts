import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface ProductData {
  productId: string;
  productName: string;
  qrCodeIds: string[];
  metadata: Record<string, any>;
  ipfsHash: string;
  transactionHash: string;
  manufacturerAddress: string;
  createdAt: string;
}

export interface QRCode {
  id: string;
  qrCodeDataUrl: string;
}

export interface ProductRegisterResponse {
  message: string;
  product: ProductData;
  qrCodes: QRCode[];
}

export interface VerificationResponse {
  isAuthentic: boolean;
  productId: string;
  productName: string;
  metadata: Record<string, any>;
  ipfsHash: string;
  manufacturerAddress: string;
  creationTime: string;
  imageUrl: string | null;
}

// Register a new product
export const registerProduct = async (
  formData: FormData,
): Promise<ProductRegisterResponse> => {
  const response = await apiClient.post("/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Verify a product by QR code ID
export const verifyProduct = async (
  qrCodeId: string,
): Promise<VerificationResponse> => {
  const response = await apiClient.get(`/verify/${qrCodeId}`);
  return response.data;
};

// Get all products
export const getAllProducts = async (): Promise<ProductData[]> => {
  const response = await apiClient.get("/products");
  return response.data;
};
