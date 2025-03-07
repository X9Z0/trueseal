// src/pages/verify/[qrCodeId].tsx
"use client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { verifyProduct, VerificationResponse } from "@/utils/api";
import Head from "next/head";

export default function VerificationPage() {
  const router = useRouter();
  const { qrCodeId } = router.query;
  const [verification, setVerification] = useState<VerificationResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyProductWithId() {
      if (!qrCodeId) return;

      try {
        setLoading(true);
        const result = await verifyProduct(qrCodeId as string);
        setVerification(result);
        setLoading(false);
      } catch (err) {
        console.error("Error verifying product:", err);
        setError(
          "Unable to verify product. It may be counterfeit or the QR code is invalid.",
        );
        setLoading(false);
      }
    }

    verifyProductWithId();
  }, [qrCodeId]);

  if (!qrCodeId) {
    return null; // Wait until we have the query param
  }

  return (
    <>
      <Head>
        <title>Product Verification</title>
        <meta
          name="description"
          content="Verify the authenticity of your product"
        />
      </Head>

      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Product Verification
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <p className="font-bold">Verification Failed</p>
            <p>{error}</p>
          </div>
        ) : verification ? (
          <div
            className={`border-l-4 ${verification.isAuthentic ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"} p-6 rounded-lg shadow-md`}
          >
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold">{verification.productName}</h2>
              {verification.isAuthentic ? (
                <span className="px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full">
                  Authentic ✓
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full">
                  Counterfeit ✗
                </span>
              )}
            </div>

            {verification.imageUrl && (
              <div className="mt-4">
                <img
                  src={verification.imageUrl}
                  alt={verification.productName}
                  className="max-w-full h-auto rounded"
                />
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Product ID</p>
                <p className="font-medium">{verification.productId}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Registration Date</p>
                <p className="font-medium">
                  {new Date(verification.creationTime).toLocaleString()}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Manufacturer</p>
                <p className="font-medium break-all">
                  {verification.manufacturerAddress}
                </p>
              </div>
            </div>

            {verification.metadata &&
              Object.keys(verification.metadata).length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">
                    Product Specifications
                  </h3>
                  <div className="bg-white p-4 rounded border">
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                      {Object.entries(verification.metadata).map(
                        ([key, value]) => (
                          <div key={key} className="py-1">
                            <dt className="text-sm font-medium text-gray-500">
                              {key}
                            </dt>
                            <dd className="mt-1">{String(value)}</dd>
                          </div>
                        ),
                      )}
                    </dl>
                  </div>
                </div>
              )}
          </div>
        ) : null}

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            This verification was performed using blockchain technology to
            ensure authenticity.
          </p>
        </div>
      </div>
    </>
  );
}
