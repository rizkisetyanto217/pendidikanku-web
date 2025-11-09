// src/components/marketing/TestimonialCarousel.tsx
import * as React from "react";
import { Star } from "lucide-react";
/* shadcn/ui only */
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

export type TestimonialItem = {
  name: string;
  role: string;
  quote: string;
  img: string;
  rating?: number; // 1..5
};

type Props = {
  items: TestimonialItem[];
  className?: string;
  /** aktifkan autoplay manual tanpa plugin */
  autoplay?: boolean;
  autoplayDelayMs?: number; // default 4000
  pauseOnHover?: boolean; // default true
  pauseOnFocus?: boolean; // default true
  stopOnInteraction?: boolean; // default true (pause saat user drag/klik)
  showArrows?: boolean;
  showDots?: boolean;
  threeColsOnLg?: boolean; // md=2 kolom, lg=3 kolom bila true
};

export default function CTestimonialCarousel({
  items,
  className = "",
  autoplay = true,
  autoplayDelayMs = 4000,
  pauseOnHover = true,
  pauseOnFocus = true,
  stopOnInteraction = true,
  showArrows = true,
  showDots = true,
  threeColsOnLg = false,
}: Props) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef = React.useRef(false);

  // helper start/stop timer
  const clearTimer = React.useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = React.useCallback(() => {
    if (!autoplay || !api || timerRef.current) return;
    timerRef.current = setInterval(() => {
      if (pausedRef.current) return;
      if (document.hidden) return; // pause bila tab tidak aktif
      if (!api) return;

      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, Math.max(1200, autoplayDelayMs));
  }, [api, autoplay, autoplayDelayMs]);

  // init + event bindings
  React.useEffect(() => {
    if (!api) return;

    // set awal
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);

    // pause saat user interaksi (drag/klik) bila di-aktifkan
    const onPointerDown = () => {
      if (!stopOnInteraction) return;
      pausedRef.current = true;
      clearTimer();
    };
    api.on("pointerDown", onPointerDown);

    // lifecycle timer
    clearTimer();
    startTimer();

    return () => {
      api.off("select", onSelect);
      api.off("pointerDown", onPointerDown);
      clearTimer();
    };
  }, [api, startTimer, clearTimer, stopOnInteraction]);

  // pause di hover/focus
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onEnter = () => {
      if (pauseOnHover) pausedRef.current = true;
    };
    const onLeave = () => {
      if (pauseOnHover) {
        pausedRef.current = false;
        // jangan startTimer dua kali
        if (!timerRef.current) startTimer();
      }
    };
    const onFocusIn = () => {
      if (pauseOnFocus) pausedRef.current = true;
    };
    const onFocusOut = () => {
      if (pauseOnFocus) {
        pausedRef.current = false;
        if (!timerRef.current) startTimer();
      }
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("focusin", onFocusIn);
    el.addEventListener("focusout", onFocusOut);

    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("focusin", onFocusIn);
      el.removeEventListener("focusout", onFocusOut);
    };
  }, [pauseOnHover, pauseOnFocus, startTimer]);

  // pause/resume saat tab visibility berubah
  React.useEffect(() => {
    const onVis = () => {
      if (!autoplay) return;
      if (document.hidden) {
        pausedRef.current = true;
      } else {
        pausedRef.current = false;
        if (!timerRef.current) startTimer();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [autoplay, startTimer]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{ align: "start", loop: true }}
      >
        <CarouselContent className="-ml-3 md:-ml-4">
          {items.map((t, idx) => {
            const stars = Math.max(1, Math.min(t.rating ?? 5, 5));
            return (
              <CarouselItem
                key={`${t.name}-${idx}`}
                className={`
                  pl-3 md:pl-4
                  basis-full
                  md:basis-1/2
                  ${threeColsOnLg ? "lg:basis-1/3" : "lg:basis-1/2"}
                `}
              >
                <Card className="h-full rounded-3xl border bg-card shadow-sm transition hover:shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <img
                        src={t.img}
                        alt={t.name}
                        className="h-14 w-14 rounded-2xl object-cover"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-yellow-500 dark:text-yellow-400">
                          {Array.from({ length: stars }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current" />
                          ))}
                        </div>
                        <blockquote className="mt-2 text-sm text-foreground">
                          “{t.quote}”
                        </blockquote>
                        <footer className="mt-3 text-xs text-muted-foreground">
                          <cite className="not-italic font-medium text-foreground">
                            {t.name}
                          </cite>{" "}
                          • {t.role}
                        </footer>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {showArrows && (
          <>
            <CarouselPrevious className="left-2 md:-left-3" />
            <CarouselNext className="right-2 md:-right-3" />
          </>
        )}
      </Carousel>

      {/* Dots */}
      {showDots && count > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              aria-label={`Slide ${i + 1}`}
              onClick={() => api?.scrollTo(i)}
              className={`
                h-2 w-2 rounded-full transition
                ${i === current ? "bg-primary" : "bg-muted"}
              `}
            />
          ))}
        </div>
      )}
    </div>
  );
}
