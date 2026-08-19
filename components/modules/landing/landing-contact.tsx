"use client";

import { useState, useEffect } from "react";
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
  Tag,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitTelegramContactAction } from "@/app/actions/contact-actions";
import { ContactCategory } from "@/lib/schemas/contact-schema";

const CATEGORY_OPTIONS: { value: ContactCategory; label: string; icon: string }[] = [
  { value: "FEEDBACK", label: "Feedback", icon: "💬" },
  { value: "FEATURE_REQUEST", label: "Feature Suggestion", icon: "💡" },
  { value: "BUG_REPORT", label: "Bug Report", icon: "🐛" },
  { value: "GENERAL_INQUIRY", label: "General Inquiry", icon: "❓" },
];

export function LandingContact() {
  const { user, isLoaded } = useUser();

  const [category, setCategory] = useState<ContactCategory>("FEEDBACK");
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
        category,
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
    } catch (err) {
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
    <section id="contact" className="py-20 bg-background relative overflow-hidden border-b border-hairline">
      {/* Background Decorative Blur Highlights */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-brand-yellow/5 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-12">
        {/* Section Header */}
        <div data-aos="fade-up" className="text-center space-y-4 max-w-2xl mx-auto">
          <Badge variant="outline" className="px-3.5 py-1 font-mono text-xs gap-1.5 border-brand-yellow/30 bg-brand-yellow/10 text-foreground">
            <Bot className="h-3.5 w-3.5 text-amber-500" />
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
        <div data-aos="fade-up" data-aos-delay="100" className="max-w-3xl mx-auto">
          <Card className="rounded-3xl border border-hairline bg-card shadow-soft-floating overflow-hidden">
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
                      className="rounded-xl px-6 font-medium gap-2 hover:bg-accent"
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

                  {/* Category Selector */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5" />
                      <span>Select Topic</span>
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CATEGORY_OPTIONS.map((opt) => {
                        const isSelected = category === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setCategory(opt.value)}
                            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                              isSelected
                                ? "bg-brand-yellow/15 border-brand-yellow text-foreground font-semibold shadow-xs"
                                : "bg-background/50 border-hairline text-muted-foreground hover:bg-accent hover:text-foreground"
                            }`}
                          >
                            <span>{opt.icon}</span>
                            <span className="truncate">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
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
                        className="rounded-xl border-hairline bg-background/50 focus:bg-background h-11 text-sm"
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
                        className="rounded-xl border-hairline bg-background/50 focus:bg-background h-11 text-sm"
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
                      className="w-full rounded-2xl border border-hairline bg-background/50 focus:bg-background p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 transition-all resize-none"
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
                      <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span>Direct end-to-end bot notification</span>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting || message.trim().length < 10}
                      className="w-full sm:w-auto h-11 px-8 rounded-xl bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold text-sm shadow-sm gap-2 transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-black" />
                          <span>Sending to Bot...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 text-black" />
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
