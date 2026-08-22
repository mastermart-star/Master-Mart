// Public barrel — the ONLY cross-module import path.
// Mongoose models are deliberately NOT exported (server-only; would leak into
// client bundles). Server code imports them from ./models directly.
export * from "./actions/product.actions";
export * from "./api/product.keys";
export * from "./api/product.api";
export * from "./schemas/product.schema";
export * from "./schemas/product-form.schema";
export * from "./types/product.types";
export * from "./constants/categories";
export { CategoryIcon } from "./components/category-icon";
export { ProductCard } from "./components/product-card";
export { Catalog } from "./components/catalog";
export { ProductFormDialog } from "./components/product-form-dialog";
export { ProductPurchasePanel } from "./components/product-purchase-panel";
