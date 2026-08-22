import * as z from "zod";

/** Only what the customer types at checkout. */
export const checkoutFormSchema = z.object({
  customerName: z.string().min(2, "Enter your full name").max(120),
  customerPhone: z
    .string()
    .regex(/^01[0-9]{9}$/, "Enter a valid 11-digit mobile number (01XXXXXXXXX)"),
  customerAddress: z.string().min(5, "Enter your full delivery address").max(500),
  customerEmail: z.email("Enter a valid email").optional().or(z.literal("")),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
