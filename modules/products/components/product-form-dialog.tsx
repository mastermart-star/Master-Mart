"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SmartImage } from "@/components/shared/smart-image";
import { createProduct, updateProduct } from "../actions/product.actions";
import { productKeys } from "../api/product.keys";
import { CATEGORIES } from "../constants/categories";
import {
  productFormSchema,
  type ProductFormValues,
} from "../schemas/product-form.schema";
import type { Product } from "../types/product.types";

type ProductFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present when editing; absent when creating. */
  product?: Product | null;
};

const EMPTY: ProductFormValues = {
  nameEn: "",
  nameBn: "",
  category: "vegetables-fruits",
  price: 100,
  discountPrice: "",
  unitEn: "1 kg",
  unitBn: "১ কেজি",
  image: "",
  stock: 10,
  isVeg: true,
  descriptionEn: "",
  descriptionBn: "",
};

export function ProductFormDialog({ open, onOpenChange, product }: ProductFormDialogProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      product
        ? {
            nameEn: product.nameEn,
            nameBn: product.nameBn,
            category: product.category,
            price: product.price,
            discountPrice: product.discountPrice ?? "",
            unitEn: product.unitEn,
            unitBn: product.unitBn,
            image: product.image,
            stock: product.stock,
            isVeg: product.isVeg,
            descriptionEn: product.descriptionEn ?? "",
            descriptionBn: product.descriptionBn ?? "",
          }
        : EMPTY
    );
  }, [open, product, form]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const payload = {
        ...values,
        discountPrice:
          values.discountPrice === "" || values.discountPrice == null
            ? null
            : Number(values.discountPrice),
      };
      return product ? updateProduct(product._id, payload) : createProduct(payload);
    },
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success(product ? "Product updated" : "Product created");
      onOpenChange(false);
    },
    onError: () => toast.error("Something went wrong"),
  });

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { url: string };
      form.setValue("image", data.url, { shouldValidate: true, shouldDirty: true });
      toast.success("Image ready");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const imageValue = form.watch("image");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? "Edit product" : "Add a new product"}</DialogTitle>
          <DialogDescription>
            {product
              ? "Update the catalog entry. Changes go live on the storefront instantly."
              : "New products appear on the storefront as soon as you save."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="product-form"
          onSubmit={form.handleSubmit((v) => mutate(v))}
          className="space-y-5"
        >
          <FieldGroup className="gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="nameEn"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-form-name-en">Name (English)</FieldLabel>
                    <Input {...field} id="product-form-name-en" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="nameBn"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-form-name-bn">Name (বাংলা)</FieldLabel>
                    <Input {...field} id="product-form-name-bn" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Controller
                name="category"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-form-category">Category</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      name={field.name}
                    >
                      <SelectTrigger id="product-form-category" className="w-full">
                        <SelectValue placeholder="Pick a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="price"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-form-price">Price (৳)</FieldLabel>
                    <Input
                      {...field}
                      id="product-form-price"
                      type="number"
                      min={0}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="discountPrice"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-form-discount">Discount price</FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      id="product-form-discount"
                      type="number"
                      min={0}
                      placeholder="Optional"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Controller
                name="unitEn"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-form-unit-en">Unit (EN)</FieldLabel>
                    <Input {...field} id="product-form-unit-en" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="unitBn"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-form-unit-bn">Unit (BN)</FieldLabel>
                    <Input {...field} id="product-form-unit-bn" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="stock"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-form-stock">Stock</FieldLabel>
                    <Input
                      {...field}
                      id="product-form-stock"
                      type="number"
                      min={0}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="image"
              control={form.control}
              render={({ fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-form-image-file">Product image</FieldLabel>
                  <div className="flex items-center gap-4">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
                      {imageValue ? (
                        <SmartImage
                          src={imageValue}
                          alt="Product preview"
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-muted-foreground">
                          <ImagePlus className="size-6" />
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <input
                        ref={fileInputRef}
                        id="product-form-image-file"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleUpload(file);
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploading}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {uploading && <Loader2 className="animate-spin" />}
                        {uploading ? "Uploading…" : "Upload image"}
                      </Button>
                      <Input
                        placeholder="…or paste an image URL"
                        value={imageValue.startsWith("data:") ? "" : imageValue}
                        onChange={(e) =>
                          form.setValue("image", e.target.value, { shouldValidate: true })
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="isVeg"
              control={form.control}
              render={({ field }) => (
                <Field className="flex-row items-center gap-2">
                  <Checkbox
                    id="product-form-isveg"
                    checked={field.value}
                    onCheckedChange={(v) => field.onChange(v === true)}
                    name={field.name}
                  />
                  <FieldLabel htmlFor="product-form-isveg">Vegetarian item</FieldLabel>
                </Field>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="descriptionEn"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-form-desc-en">Description (EN)</FieldLabel>
                    <Textarea {...field} id="product-form-desc-en" rows={3} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="descriptionBn"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-form-desc-bn">Description (BN)</FieldLabel>
                    <Textarea {...field} id="product-form-desc-bn" rows={3} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || uploading}>
              {isPending && <Loader2 className="animate-spin" />}
              {isPending ? "Saving…" : product ? "Save changes" : "Create product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
