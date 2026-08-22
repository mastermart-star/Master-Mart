"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Star } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/hooks/use-language";
import { createReview } from "../actions/review.actions";

const reviewFormSchema = z.object({
  userName: z.string().min(2, "Enter your name").max(80),
  rating: z.number().int().min(1, "Pick a rating").max(5),
  comment: z.string().min(3, "Write a short comment").max(1000),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export function AddReviewForm({ productId }: { productId: string }) {
  const { dict } = useLanguage();
  const router = useRouter();
  const [hovered, setHovered] = useState(0);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: { userName: "", rating: 5, comment: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: ReviewFormValues) => createReview({ productId, ...values }),
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      toast.success(dict.submitReview + " ✓");
      form.reset();
      router.refresh(); // pull the freshly revalidated static page
    },
    onError: () => toast.error("Something went wrong"),
  });

  return (
    <form id={`review-form-${productId}`} onSubmit={form.handleSubmit((v) => mutate(v))}>
      <FieldGroup className="gap-4">
        <Controller
          name="userName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="review-name">{dict.yourName}</FieldLabel>
              <Input {...field} id="review-name" aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="rating"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{dict.ratingLabel}</FieldLabel>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className="cursor-pointer"
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => field.onChange(n)}
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`size-6 transition-colors ${
                        n <= (hovered || field.value)
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="comment"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="review-comment">{dict.commentLabel}</FieldLabel>
              <Textarea
                {...field}
                id="review-comment"
                rows={3}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-fit">
          {isPending && <Loader2 className="animate-spin" />}
          {dict.submitReview}
        </Button>
      </FieldGroup>
    </form>
  );
}
