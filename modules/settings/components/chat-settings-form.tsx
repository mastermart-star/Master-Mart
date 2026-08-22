"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateChatSupportSettings } from "../actions/setting.actions";
import { chatSupportSchema } from "../schemas/setting.schema";
import type { ChatSupportSettings } from "../types/setting.types";

export function ChatSettingsForm({ initial }: { initial: ChatSupportSettings }) {
  const form = useForm<ChatSupportSettings>({
    resolver: zodResolver(chatSupportSchema),
    defaultValues: initial,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: updateChatSupportSettings,
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      toast.success("Chat support settings saved");
    },
    onError: () => toast.error("Something went wrong"),
  });

  return (
    <form id="chat-settings-form" onSubmit={form.handleSubmit((v) => mutate(v))}>
      <FieldGroup className="gap-4">
        <Controller
          name="activePlatform"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="chat-platform">Active platform</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange} name={field.name}>
                <SelectTrigger id="chat-platform" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">Facebook Messenger</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                  <SelectItem value="none">Disabled</SelectItem>
                </SelectContent>
              </Select>
              <FieldDescription>
                Shown as the floating chat bubble on every storefront page.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="facebookUrl"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="chat-facebook">Facebook page URL</FieldLabel>
              <Input {...field} id="chat-facebook" aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="whatsappNumber"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="chat-wa-number">WhatsApp number</FieldLabel>
                <Input
                  {...field}
                  id="chat-wa-number"
                  placeholder="8801XXXXXXXXX"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="whatsappMessage"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="chat-wa-message">Prefilled message</FieldLabel>
                <Input {...field} id="chat-wa-message" aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>
        <Button type="submit" disabled={isPending} className="w-fit">
          {isPending && <Loader2 className="animate-spin" />}
          Save chat settings
        </Button>
      </FieldGroup>
    </form>
  );
}
