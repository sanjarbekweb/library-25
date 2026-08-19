import { Star, Quote } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function LandingTestimonials() {
  const testimonials = [
    {
      name: "Dr. Arisov B.",
      role: "Head Librarian at Central Campus Library",
      rating: "5.0",
      quote:
        "ShelfSync has revolutionized our campus library operations. Desk checkout times dropped to under 10 seconds, and students love reserving physical titles directly from their phones.",
      avatar: "AB",
      bg: "bg-brand-blue text-white",
    },
    {
      name: "Malika Akhmedova",
      role: "Senior Student & Research Assistant",
      rating: "5.0",
      quote:
        "Finding textbooks for course research and tracking hold availability is effortless. The catalog search is fast, accurate, and always displays real-time copy stock.",
      avatar: "MA",
      bg: "bg-purple-600 text-white",
    },
  ];

  return (
    <section id="resources" className="py-20 bg-card border-b border-hairline">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-foreground text-xs font-mono border border-hairline">
            <span>Library Stories</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight">
            Trusted by Librarians &amp; Students
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Discover how ShelfSync simplifies catalog discovery, hold fulfillment, and circulation desk transactions.
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
