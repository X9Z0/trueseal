// server.js
import express from "express";
import cors from "cors";
import { ethers } from "ethers";
import mongoose from "mongoose";
import multer from "multer";
import { create } from "ipfs-http-client";
import QRCode from "qrcode";
import crypto from "crypto";
import contractABI from "./contractABI.json" with { type: "json" };
import dotenv from 'dotenv'
dotenv.config()

// Setup Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/product-authentication", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// MongoDB Schema for products
const ProductSchema = new mongoose.Schema({
  productId: String,
  productName: String,
  qrCodeIds: [String],
  metadata: Object,
  ipfsHash: String,
  transactionHash: String,
  manufacturerAddress: String,
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", ProductSchema);

// Setup IPFS client
const ipfs = create({ host: "localhost", port: "5001", protocol: "http" });

// Setup Ethereum provider and contract
const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
const privateKey =
  process.env.PRIVATE_KEY ||
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Default Hardhat test key
const wallet = new ethers.Wallet(privateKey, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// Generate a unique QR code ID
function generateQRCodeId() {
  return crypto.randomBytes(16).toString("hex");
}

// Endpoint to add a new product and generate QR codes
app.post("/api/products", upload.single("image"), async (req, res) => {
  try {
    const { productName, quantity, metadata } = req.body;
    const productId = crypto.randomBytes(8).toString("hex");

    // Upload image to IPFS if provided
    let ipfsHash = "";
    if (req.file) {
      const result = await ipfs.add(req.file.buffer);
      ipfsHash = result.path;
    }

    // Generate unique QR code IDs
    const qrCodeIds = [];
    for (let i = 0; i < parseInt(quantity); i++) {
      qrCodeIds.push(generateQRCodeId());
    }

    // Store in MongoDB
    const product = new Product({
      productId,
      productName,
      qrCodeIds,
      metadata: JSON.parse(metadata || "{}"),
      ipfsHash,
      manufacturerAddress: wallet.address,
    });

    await product.save();

    // Register products on the blockchain
    const tx = await contract.batchRegisterProducts(
      qrCodeIds,
      productId,
      productName,
      metadata || "",
      ipfsHash
    );

    const receipt = await tx.wait();

    // Update transaction hash in MongoDB
    product.transactionHash = receipt.transactionHash;
    await product.save();

    // Generate QR code images
    const qrCodeUrls = await Promise.all(
      qrCodeIds.map(async (id) => {
        const verificationUrl = `http://localhost:3000/verify/${id}`;
        const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);
        return { id, qrCodeDataUrl };
      })
    );

    res.status(201).json({
      message: "Product registered successfully",
      product,
      qrCodes: qrCodeUrls,
    });
  } catch (error) {
    console.error("Error registering product:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to verify a product
app.get("/api/verify/:qrCodeId", async (req, res) => {
  try {
    const { qrCodeId } = req.params;

    // Check with blockchain
    const [isAuthentic, productData] = await contract.verifyProduct(qrCodeId);

    // Get additional details from MongoDB
    const product = await Product.findOne({ qrCodeIds: qrCodeId });

    if (!product) {
      return res
        .status(404)
        .json({ isAuthentic: false, message: "Product not found" });
    }

    // Prepare response
    const response = {
      isAuthentic,
      productId: productData.productId,
      productName: productData.productName,
      metadata: product.metadata,
      ipfsHash: productData.ipfsHash,
      manufacturerAddress: productData.manufacturer,
      creationTime: new Date(productData.creationTime * 1000).toISOString(),
      imageUrl: product.ipfsHash
        ? `https://ipfs.io/ipfs/${product.ipfsHash}`
        : null,
    };

    res.json(response);
  } catch (error) {
    console.error("Error verifying product:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all products (for the manufacturer dashboard)
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find({
      manufacturerAddress: wallet.address,
    });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
