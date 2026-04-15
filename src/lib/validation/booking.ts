import { z } from "zod";

export const bookingRequestSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(80, "Use a shorter name"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9\s-]{8,16}$/, "Enter a valid phone number"),
  quantity: z.coerce.number().int().min(1).max(10),
});

export const paymentVerificationSchema = z.object({
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  signature: z.string().min(1),
});

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;
export type PaymentVerificationInput = z.infer<typeof paymentVerificationSchema>;
