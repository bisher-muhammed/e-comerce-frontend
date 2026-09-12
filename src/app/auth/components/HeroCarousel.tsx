"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";

const slides = [
  { src: "/photos/hero-1.jpeg", alt: "Model wearing a linen button-down shirt" },
  { src: "/photos/hero-2.jpeg", alt: "Model wearing an oversized cotton tee" },
  { src: "/photos/hero-3.jpeg", alt: "Model wearing a tailored formal shirt" },
];

const SLIDE_INTERVAL = 4000;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const subscribeToReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);

  query.addEventListener("change", onChange);

  return () => query.removeEventListener("change", onChange);
};

const getReducedMotion = () =>
  window.matchMedia(REDUCED_MOTION_QUERY).matches;

const getReducedMotionOnServer = () => false;

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [mountedSlides, setMountedSlides] = useState<
    ReadonlySet<number>
  >(() => new Set([0]));

  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotion,
    getReducedMotionOnServer
  );

  const autoAdvancing =
    !userPaused && !interacting && !prefersReducedMotion;

  useEffect(() => {
    if (prefersReducedMotion) return;

    const nextIndex = (currentIndex + 1) % slides.length;

    if (mountedSlides.has(nextIndex)) return;

    const timer = setTimeout(() => {
      setMountedSlides((previous) =>
        previous.has(nextIndex)
          ? previous
          : new Set(previous).add(nextIndex)
      );
    }, SLIDE_INTERVAL / 2);

    return () => clearTimeout(timer);
  }, [currentIndex, mountedSlides, prefersReducedMotion]);

  useEffect(() => {
    if (!autoAdvancing) return;

    const interval = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % slides.length);
    }, SLIDE_INTERVAL);

    return () => clearInterval(interval);
  }, [autoAdvancing]);

  const goToSlide = (index: number) => {
    setMountedSlides((previous) =>
      previous.has(index) ? previous : new Set(previous).add(index)
    );

    setCurrentIndex(index);
  };

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="Featured looks"
      className="relative aspect-4/5 overflow-hidden bg-secondary"
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocus={() => setInteracting(true)}
      onBlur={(event) => {
        if (
          !event.currentTarget.contains(
            event.relatedTarget as Node | null
          )
        ) {
          setInteracting(false);
        }
      }}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.src}
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${slides.length}`}
          aria-hidden={index !== currentIndex}
          className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          {mountedSlides.has(index) && (
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          )}
        </div>
      ))}

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentIndex}
            className={`h-1.5 rounded-full transition-all ${
              index === currentIndex
                ? "w-8 bg-white"
                : "w-2 bg-white/50"
            }`}
          />
        ))}

        {!prefersReducedMotion && (
          <button
            type="button"
            onClick={() => setUserPaused((value) => !value)}
            aria-label={
              userPaused
                ? "Resume the slideshow"
                : "Pause the slideshow"
            }
            aria-pressed={userPaused}
            className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/70 text-black transition-colors hover:bg-white"
          >
            {userPaused ? (
              <Play className="h-3 w-3" aria-hidden="true" />
            ) : (
              <Pause className="h-3 w-3" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
