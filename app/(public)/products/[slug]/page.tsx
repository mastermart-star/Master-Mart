import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CATEGORIES,
  getProductBySlug,
  getProductSlugs,
  ProductPurchasePanel,
} from "@/modules/products";
import { AddReviewForm, getProductReviews, ReviewList } from "@/modules/reviews";
import { resolveSlugParam } from "@/utils/slug";
import { formatTaka } from "@/utils/format-currency";

// React cache() dedupes the read between generateMetadata and the page —
// one database round-trip per render, not two.
const loadProduct = cache(async (slug: string) =>
  getProductBySlug(slug).catch(() => null)
);

// Prerenders every known slug at build. Unknown slugs still render on first
// request and are cached afterwards.
export async function generateStaticParams() {
  const slugs = await getProductSlugs().catch(() => []);
  return slugs.map((slug) => ({ slug }));
}

// params is a Promise in Next 16 — the sync compat shim is gone.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(resolveSlugParam(slug));
  if (!product) return {};
  return {
    title: product.nameEn, // BARE — the root layout appends the brand
    description: product.descriptionEn ?? `${product.nameEn} — ${product.unitEn}`,
    openGraph: {
      title: product.nameEn,
      description: product.descriptionEn ?? undefined,
      images: product.image.startsWith("http") ? [product.image] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await loadProduct(resolveSlugParam(slug));
  if (!product) notFound();

  const reviews = await getProductReviews(product._id).catch(() => []);
  const category = CATEGORIES.find((c) => c.id === product.category);
  const hasDiscount = product.discountPrice != null && product.discountPrice > 0;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative h-72 overflow-hidden rounded-2xl border bg-muted md:h-96">
          {product.image.startsWith("data:") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.nameEn}
              className="h-full w-full object-cover"
            />
          ) : (
            <Image
              src={product.image}
              alt={product.nameEn}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {category && <Badge variant="secondary">{category.nameEn}</Badge>}
            <Badge variant={product.isVeg ? "success" : "warning"}>
              {product.isVeg ? "VEG" : "NON-VEG"}
            </Badge>
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              {product.rating} · {reviews.length} reviews
            </span>
          </div>

          <h1 className="text-3xl font-black">{product.nameEn}</h1>
          <p className="text-lg font-semibold text-muted-foreground">{product.nameBn}</p>
          <p className="text-sm text-muted-foreground">
            {product.unitEn} · {product.unitBn}
          </p>

          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-3xl font-black text-primary">
              {formatTaka(product.discountPrice ?? product.price)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-muted-foreground line-through">
                {formatTaka(product.price)}
              </span>
            )}
          </div>

          <div className="mt-2">
            <ProductPurchasePanel product={product} />
          </div>

          {(product.descriptionEn || product.descriptionBn) && (
            <>
              <Separator className="my-3" />
              {product.descriptionEn && (
                <p className="text-sm leading-relaxed">{product.descriptionEn}</p>
              )}
              {product.descriptionBn && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {product.descriptionBn}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <section className="mt-12 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-black">Customer Reviews</h2>
          <ReviewList reviews={reviews} emptyLabel="No reviews yet — be the first!" />
        </div>
        <Card className="h-fit p-6">
          <h2 className="text-xl font-black">Write a Review</h2>
          <AddReviewForm productId={product._id} />
        </Card>
      </section>
    </main>
  );
}
