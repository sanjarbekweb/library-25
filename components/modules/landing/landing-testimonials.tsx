import { Star, Quote } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function LandingTestimonials() {
  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "HR Director at Nexa Solutions",
      rating: "5.0",
      quote:
        "CoreShift has streamlined our HR processes, making tasks like onboarding and performance tracking more efficient. It helps us stay organized and saves our team time, allowing us to focus more on supporting our employees.",
      avatar: "SM",
      bg: "bg-purple-600 text-white",
    },
    {
      name: "James Carter",
      role: "HR Manager at BrightPath Solutions",
      rating: "5.0",
      quote:
        "The platform is easy to use, keeps everything in one place, and helps our team stay on top of things without extra hassle.",
      avatar: "JC",
      bg: "bg-brand-blue text-white",
    },
  ];

  return (
    <section className="py-20 bg-card border-b border-hairline">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-foreground text-xs font-mono border border-hairline">
            <span>Customer Stories</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight">
            Words of Appreciation
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Thousands of businesses, from startups to enterprises, use CoreShift to handle payments and operations.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {testimonials.map((item, idx) => (
            <Card
              key={idx}
              className="p-8 rounded-3xl border border-hairline bg-background shadow-soft-floating flex flex-col justify-between space-y-6 transition-spring hover:scale-[1.01]"
            >
              <CardHeader className="p-0 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                    <span className="text-xs font-mono font-bold text-foreground ml-1.5">{item.rating}</span>
                  </div>
                  <Quote className="h-6 w-6 text-muted-foreground/30" />
                </div>

                <p className="text-sm sm:text-base text-foreground leading-relaxed italic">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </CardHeader>

              <CardContent className="p-0 flex items-center gap-3 border-t border-hairline pt-4">
                <div className={`h-11 w-11 rounded-2xl ${item.bg} font-bold flex items-center justify-center text-sm shrink-0`}>
                  {item.avatar}
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-foreground">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
