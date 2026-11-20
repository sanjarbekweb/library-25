import Image from "next/image";
import logoImg from "@/public/images/logo.jpg";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  className?: string;
  size?: "sm" | "default" | "lg";
  showLabel?: boolean;
  labelSubtitle?: string;
}

export function AppLogo({
  className,
  size = "default",
  showLabel = true,
  labelSubtitle,
}: AppLogoProps) {
  const sizeMap = {
    sm: { box: "h-8 w-8 rounded-xl", img: 32, text: "text-base", sub: "text-[8px]" },
    default: { box: "h-9 w-9 rounded-xl", img: 36, text: "text-lg", sub: "text-[9px]" },
    lg: { box: "h-10 w-10 rounded-xl", img: 40, text: "text-xl", sub: "text-[10px]" },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={cn("inline-flex items-center gap-2.5 group select-none", className)}>
      <div
        className={cn(
          "relative overflow-hidden flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-105 shrink-0 border border-border/40",
          currentSize.box
        )}
      >
        <Image
          src={logoImg}
          alt="libra25 logo"
          width={currentSize.img}
          height={currentSize.img}
          className="w-full h-full object-cover"
          priority
        />
      </div>

      {showLabel && (
        <div className="flex flex-col leading-tight">
          <span
            className={cn(
              "font-display font-extrabold tracking-tight text-foreground",
              currentSize.text
            )}
          >
            libra25
          </span>
          {labelSubtitle && (
            <span
              className={cn(
                "font-semibold uppercase tracking-widest text-muted-foreground -mt-0.5",
                currentSize.sub
              )}
            >
              {labelSubtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
