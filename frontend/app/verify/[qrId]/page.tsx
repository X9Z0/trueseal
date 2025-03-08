"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // Correct import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyProduct, type VerificationResponse } from "@/utils/api";
import { format } from "date-fns";
import { Shield, AlertTriangle, Loader2 } from "lucide-react";

export default function VerifyPage() {
  // Use useParams to get qrId
  const { qrId } = useParams(); // qrId should be in the URL path, e.g., /products/[qrId]

  const [verification, setVerification] = useState<VerificationResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      try {
        if (!qrId) throw new Error("QR ID is missing");
        const data = await verifyProduct(qrId);
        setVerification(data);
      } catch (error) {
        console.error("Error verifying product:", error);
        setError("Failed to verify product");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [qrId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !verification) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-destructive mb-2">
                Verification Failed
              </h2>
              <p className="text-muted-foreground">
                {error || "Unable to verify product"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {verification.isAuthentic ? (
              <Shield className="h-12 w-12 text-green-500" />
            ) : (
              <AlertTriangle className="h-12 w-12 text-destructive" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {verification.isAuthentic ? (
              <span className="text-green-500">Authentic Product</span>
            ) : (
              <span className="text-destructive">Counterfeit Product</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {verification.imageUrl && (
              <div className="aspect-video relative rounded-lg overflow-hidden">
                <img
                  src={verification.imageUrl}
                  alt={verification.productName}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
            <div className="grid gap-4">
              <div>
                <h3 className="font-semibold mb-1">Product Name</h3>
                <p className="text-muted-foreground">
                  {verification.productName}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Product ID</h3>
                <p className="text-muted-foreground break-all">
                  {verification.productId}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Manufacturer</h3>
                <p className="text-muted-foreground break-all">
                  {verification.manufacturerAddress}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Creation Time</h3>
                <p className="text-muted-foreground">
                  {format(new Date(verification.creationTime), "PPP")}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">IPFS Hash</h3>
                <p className="text-muted-foreground break-all">
                  {verification.ipfsHash}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Metadata</h3>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  {JSON.stringify(verification.metadata, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
