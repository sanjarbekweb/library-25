"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-toastify";
import {
  Send,
  MessageSquare,
  Bot,
  CheckCircle2,
  Sparkles,
  Loader2,
  Mail,
  User,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitTelegramContactAction } from "@/app/actions/contact-actions";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export function LandingContact() {
  const { user, isLoaded } = useUser();
  const sectionRef = useRef<HTMLElement>(null);

  const [name, setName] = useState("");
  const [emailOrHandle, setEmailOrHandle] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-fill form fields if user is signed in with Clerk
  useEffect(() => {
    if (isLoaded && user) {
      if (user.fullName) {
        setName(user.fullName);
      } else if (user.firstName) {
        setName(user.firstName);
      }

      const primaryEmail = user.primaryEmailAddress?.emailAddress;
      if (primaryEmail) {
        setEmailOrHandle(primaryEmail);
      }
    }
  }, [isLoaded, user]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { reduceMotion } = context.conditions as { reduceMotion: boolean };

          if (reduceMotion) {
            gsap.set([".contact-header", ".contact-card"], {
              opacity: 1,
              visibility: "visible",
              y: 0,
            });
            return;
          }

          gsap.fromTo(
            ".contact-header",
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power2.out",
              clearProps: "transform,opacity,visibility",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 85%",
                toggleActions: "play none none none",
              },
            }
          );

          gsap.fromTo(
            ".contact-card",
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power2.out",
              clearProps: "transform,opacity,visibility",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 80%",
                toggleActions: "play none none none",
              },
            }
          );
        }
      );
    },
    { scope: sectionRef }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side quick checks
    if (!emailOrHandle.trim()) {
      setErrorMessage("Please enter an email address or Telegram handle.");
      return;
    }

    if (message.trim().length < 10) {
      setErrorMessage("Message must be at least 10 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitTelegramContactAction({
        name: name.trim() || undefined,
        emailOrHandle: emailOrHandle.trim(),
        category: "FEEDBACK",
        message: message.trim(),
        honeypot,
      });

      if (response.ok && response.data?.success) {
        setIsSuccess(true);
        toast.success("Your message was delivered directly to our Telegram bot!");
      } else {
        const errStr = response.error?.message || "Failed to deliver message.";
        setErrorMessage(errStr);
        toast.error(errStr);
      }
    } catch {
      const fallbackErr = "An unexpected network error occurred.";
      setErrorMessage(fallbackErr);
      toast.error(fallbackErr);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setMessage("");
    setErrorMessage(null);
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="py-20 bg-slate-100/60 dark:bg-zinc-900/40 relative overflow-hidden border-b border-border/80"
    >
      {/* Background Decorative Blur Highlights */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="contact-header text-center space-y-4 max-w-2xl mx-auto will-change-transform">
          <Badge variant="outline" className="px-3.5 py-1 font-mono text-xs gap-1.5 border-border/80 bg-card text-foreground">
            <Bot className="h-3.5 w-3.5 text-brand-blue" />
            <span>Direct Telegram Channel</span>
          </Badge>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight">
            Have Questions or Feedback?
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Send a message directly to our library team. Submissions are delivered instantly to our Telegram bot for fast responses.
          </p>
        </div>

        {/* Contact Form Container */}
        <div className="contact-card max-w-3xl mx-auto will-change-transform">
          <Card className="rounded-3xl border border-border/90 bg-card shadow-xs overflow-hidden">
            <CardContent className="p-6 sm:p-10 space-y-8">
              {isSuccess ? (
                /* Success Feedback State */
                <div className="text-center py-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-display text-2xl font-bold text-foreground">
                      Message Delivered!
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                      Thank you for reaching out. Your feedback has been dispatched straight to our Telegram channel.
                    </p>
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      className="rounded-xl px-6 font-medium gap-2 hover:bg-accent border-border"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Send Another Message
                    </Button>
                  </div>
                </div>
              ) : (
                /* Form Inputs */
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Honeypot field (hidden from real users, catches bots) */}
                  <div className="hidden" aria-hidden="true">
                    <input
                      type="text"
                      name="websiteUrl"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  {/* 2-Column Name & Contact inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Your Name (Optional)</span>
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. Alex Turner"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-xl border-border/80 bg-slate-50/70 dark:bg-zinc-900/70 focus:bg-background h-11 text-sm transition-colors"
                        maxLength={100}
                      />
                    </div>

                    {/* Contact (Email or Telegram handle) */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Email or Telegram Handle <span className="text-rose-500">*</span></span>
                      </label>
                      <Input
                        type="text"
                        placeholder="alex@campus.edu or @alex_t"
                        value={emailOrHandle}
                        onChange={(e) => setEmailOrHandle(e.target.value)}
                        required
                        className="rounded-xl border-border/80 bg-slate-50/70 dark:bg-zinc-900/70 focus:bg-background h-11 text-sm transition-colors"
                        maxLength={150}
                      />
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Message <span className="text-rose-500">*</span></span>
                      </label>
                      <span className={`text-[11px] font-mono ${message.length > 1900 ? "text-amber-500" : "text-muted-foreground"}`}>
                        {message.length} / 2000
                      </span>
                    </div>

                    <textarea
                      rows={5}
                      placeholder="Share your thoughts, report an issue, or ask a question..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      minLength={10}
                      maxLength={2000}
                      className="w-full rounded-2xl border border-border/80 bg-slate-50/70 dark:bg-zinc-900/70 focus:bg-background p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all resize-none"
                    />
                  </div>

                  {/* Inline Error Message */}
                  {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-brand-blue shrink-0" />
                      <span>Direct end-to-end bot notification</span>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting || message.trim().length < 10}
                      className="w-full sm:w-auto h-11 px-8 rounded-xl bg-brand-blue text-white hover:bg-brand-blue/90 font-bold text-sm shadow-sm gap-2 transition-all cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          <span>Sending to Bot...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 text-white" />
                          <span>Send Message</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
