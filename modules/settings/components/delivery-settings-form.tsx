"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateDeliverySettings } from "../actions/setting.actions";
import { deliverySchema } from "../schemas/setting.schema";
import type { DeliverySettings } from "../types/setting.types";

const PATHAO_FIELDS = [
  { name: "pathaoStoreId", label: "Store ID" },
  { name: "pathaoClientId", label: "Client ID" },
  { name: "pathaoClientSecret", label: "Client secret" },
  { name: "pathaoUsername", label: "Username" },
  { name: "pathaoPassword", label: "Password" },
] as const;

const STEADFAST_FIELDS = [
  { name: "steadfastApiKey", label: "API key" },
  { name: "steadfastSecretKey", label: "Secret key" },
] as const;

export function DeliverySettingsForm({ initial }: { initial: DeliverySettings }) {
  const form = useForm<DeliverySettings>({
    resolver: zodResolver(deliverySchema),
    defaultValues: initial,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: updateDeliverySettings,
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      toast.success("Delivery service settings saved");
    },
    onError: () => toast.error("Something went wrong"),
  });

  const active = form.watch("activeService");

  return (
    <form id="delivery-settings-form" onSubmit={form.handleSubmit((v) => mutate(v))}>
      <FieldGroup className="gap-4">
        <Controller
          name="activeService"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="delivery-service">Active courier service</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange} name={field.name}>
                <SelectTrigger id="delivery-service" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="steadfast">Steadfast Courier</SelectItem>
                  <SelectItem value="pathao">Pathao Courier</SelectItem>
                  <SelectItem value="none">None (manual delivery)</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {active === "steadfast" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {STEADFAST_FIELDS.map(({ name, label }) => (
              <Controller
                key={name}
                name={name}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`delivery-${name}`}>Steadfast {label}</FieldLabel>
                    <Input
                      {...field}
                      id={`delivery-${name}`}
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
        )}

        {active === "pathao" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {PATHAO_FIELDS.map(({ name, label }) => (
              <Controller
                key={name}
                name={name}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`delivery-${name}`}>Pathao {label}</FieldLabel>
                    <Input
                      {...field}
                      id={`delivery-${name}`}
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
        )}

        <Button type="submit" disabled={isPending} className="w-fit">
          {isPending && <Loader2 className="animate-spin" />}
          Save delivery settings
        </Button>
      </FieldGroup>
    </form>
  );
}
