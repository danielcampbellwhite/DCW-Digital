"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle, Send, RotateCcw } from "lucide-react";
import {
  contactSchema,
  serviceOptions,
  budgetOptions,
  type ContactFormValues,
} from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type Status = "idle" | "submitting" | "success" | "error";

/** Field-level error text. */
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
      <AlertCircle className="size-3" /> {message}
    </p>
  );
}

export function ContactForm({ defaultService }: { defaultService?: string }) {
  const [status, setStatus] = React.useState<Status>("idle");
  const [serverError, setServerError] = React.useState<string | null>(null);

  const presetService = serviceOptions.includes(defaultService as never)
    ? (defaultService as ContactFormValues["service"])
    : undefined;

  // When the form first mounted — used for the server-side time-trap.
  const mountedAt = React.useRef<number>(Date.now());

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      service: presetService ?? ("" as ContactFormValues["service"]),
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    setStatus("submitting");
    setServerError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          elapsedMs: Date.now() - mountedAt.current,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Something went wrong. Please try again.");
      }
      setStatus("success");
      reset();
    } catch (err) {
      setStatus("error");
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  // Success state
  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center rounded-2xl border border-accent/40 bg-accent/5 p-10 text-center"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="size-12 text-accent" />
        <h3 className="mt-4 font-heading text-2xl font-bold">Message sent — thank you!</h3>
        <p className="mt-2 max-w-md text-muted-foreground">
          Your enquiry has landed safely. I&apos;ll be in touch within one working
          day. For anything urgent, feel free to email me directly.
        </p>
        <Button
          onClick={() => setStatus("idle")}
          variant="outline"
          className="mt-6"
        >
          <RotateCcw className="size-4" /> Send another message
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Honeypot (hidden from humans) */}
      <div className="hidden" aria-hidden>
        <label htmlFor="website">Website</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">
            Name <span className="text-primary">*</span>
          </Label>
          <Input
            id="name"
            className="mt-1.5"
            placeholder="Your name"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="email">
            Email <span className="text-primary">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            className="mt-1.5"
            placeholder="you@company.com"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            className="mt-1.5"
            placeholder="Company (optional)"
            {...register("company")}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            className="mt-1.5"
            placeholder="Phone (optional)"
            {...register("phone")}
          />
        </div>
        <div>
          <Label htmlFor="service">
            Service required <span className="text-primary">*</span>
          </Label>
          <Select
            id="service"
            className="mt-1.5"
            aria-invalid={!!errors.service}
            defaultValue={presetService ?? ""}
            {...register("service")}
          >
            <option value="" disabled>
              Select a service…
            </option>
            {serviceOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <FieldError message={errors.service?.message} />
        </div>
        <div>
          <Label htmlFor="budget">Budget</Label>
          <Select id="budget" className="mt-1.5" defaultValue="" {...register("budget")}>
            <option value="">Select a budget (optional)…</option>
            {budgetOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="message">
          Project description <span className="text-primary">*</span>
        </Label>
        <Textarea
          id="message"
          className="mt-1.5"
          placeholder="Tell me about your project, goals, timeline — or the role you're hiring for."
          aria-invalid={!!errors.message}
          {...register("message")}
        />
        <FieldError message={errors.message?.message} />
      </div>

      {/* Error state */}
      <AnimatePresence>
        {status === "error" && serverError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            role="alert"
          >
            <AlertCircle className="size-4 shrink-0" />
            {serverError}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4 pt-1">
        <Button type="submit" variant="primary" size="lg" disabled={status === "submitting"}>
          {status === "submitting" ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Sending…
            </>
          ) : (
            <>
              <Send className="size-4" /> Send message
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          I&apos;ll reply within one working day.
        </p>
      </div>
    </form>
  );
}
