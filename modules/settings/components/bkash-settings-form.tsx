"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, ShieldAlert } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { updateBkashSettings } from "../actions/setting.actions";
import { bkashSchema } from "../schemas/setting.schema";
import type { BkashSettings } from "../types/setting.types";

const CREDENTIAL_FIELDS = [
  { name: "appKey", label: "App key" },
  { name: "secretKey", label: "Secret key" },
  { name: "username", label: "Merchant username" },
  { name: "password", label: "Merchant password" },
] as const;

export function BkashSettingsForm({ initial }: { initial: BkashSettings }) {
  const form = useForm<BkashSettings>({
    resolver: zodResolver(bkashSchema),
    defaultValues: initial,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: updateBkashSettings,
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      toast.success("bKash merchant settings saved");
    },
    onError: () => toast.error("Something went wrong"),
  });

  return (
    <form id="bkash-settings-form" onSubmit={form.handleSubmit((v) => mutate(v))}>
      <FieldGroup className="gap-4">
        <p className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
          <ShieldAlert className="size-4 shrink-0" />
          Credentials are stored server-side and are never sent to the storefront.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {CREDENTIAL_FIELDS.map(({ name, label }) => (
            <Controller
              key={name}
              name={name}
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`bkash-${name}`}>{label}</FieldLabel>
                  <Input
                    {...field}
                    id={`bkash-${name}`}
                    type="password"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
          <Controller
            name="isEnabled"
            control={form.control}
            render={({ field }) => (
              <Field className="flex-row items-center gap-2">
                <Switch
                  id="bkash-enabled"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  name={field.name}
                />
                <FieldLabel htmlFor="bkash-enabled">Enable bKash payments</FieldLabel>
              </Field>
            )}
          />
          <Controller
            name="isCoDEnabled"
            control={form.control}
            render={({ field }) => (
              <Field className="flex-row items-center gap-2">
                <Switch
                  id="bkash-cod-enabled"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  name={field.name}
                />
                <FieldLabel htmlFor="bkash-cod-enabled">Enable Cash on Delivery</FieldLabel>
              </Field>
            )}
          />
        </div>

        <Button type="submit" disabled={isPending} className="w-fit">
          {isPending && <Loader2 className="animate-spin" />}
          Save payment settings
        </Button>
      </FieldGroup>
    </form>
  );
}
