"use client";

import { useEffect, useState } from "react";
import { getAllProducts, ProductData } from "@/utils/api";
import Image from "next/image";
import Head from "next/head";

export default function ProductsDashboard() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await getAllProducts();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again");
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Head>
        <title>Products Dashboard</title>
        <meta name="description" content="Manage your authenticated products" />
      </Head>
      {loading ? (
        <div className="text-center text-gray-600">Loading products...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-500">
          No products registered yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.productId}
              className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              {product.ipfsHash && (
                <Image
                  src={`https://ipfs.io/ipfs/${product.ipfsHash}`}
                  alt={product.productName}
                  width={200}
                  height={200}
                  className="rounded-lg mb-4 object-cover"
                />
              )}
              <h3 className="text-lg font-semibold text-gray-800">
                {product.productName}
              </h3>
              <div className="text-sm text-gray-600">
                ID: {product.productId}
              </div>
              <div className="text-sm text-gray-600">
                QR Codes:{" "}
                <span className="font-bold">{product.qrCodeIds.length}</span>
              </div>
              <div className="text-sm text-gray-600">
                Created: {new Date(product.createdAt).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-600 truncate">
                Transaction:{" "}
                <span className="font-mono">{product.transactionHash}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
