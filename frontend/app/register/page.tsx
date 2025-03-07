"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { registerProduct } from "@/utils/api";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RegisterFormData {
  productName: string;
  metadata: string;
  image: FileList;
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("productName", data.productName);
      formData.append("metadata", data.metadata);
      if (data.image[0]) {
        formData.append("image", data.image[0]);
      }

      await registerProduct(formData);
      toast("Product registered successfully");
      router.push("/");
    } catch (error) {
      console.error("Error registering product:", error);
      toast("Failed to register product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Register New Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  {...register("productName", {
                    required: "Product name is required",
                  })}
                  placeholder="Enter product name"
                />
                {errors.productName && (
                  <p className="text-sm text-destructive">
                    {errors.productName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="metadata">Metadata (JSON)</Label>
                <Textarea
                  id="metadata"
                  {...register("metadata", {
                    required: "Metadata is required",
                    validate: (value) => {
                      try {
                        JSON.parse(value);
                        return true;
                      } catch {
                        return "Invalid JSON format";
                      }
                    },
                  })}
                  placeholder="Enter product metadata in JSON format"
                  className="h-32"
                />
                {errors.metadata && (
                  <p className="text-sm text-destructive">
                    {errors.metadata.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Product Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  {...register("image", {
                    required: "Product image is required",
                  })}
                />
                {errors.image && (
                  <p className="text-sm text-destructive">
                    {errors.image.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register Product"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
