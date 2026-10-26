"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeroSlide {
  kicker: string;
  title: string;
  text: string;
  cta: { label: string; href: string };
  image: string;
  tab: string;
  tabLabel: string;
}

/**
 * Theme 1 full-bleed banner carousel. The active tab's progress bar drives
 * autoplay (animationend), so pausing the CSS animation pauses the slideshow.
 */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [current, setCurrent] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [isStatic, setIsStatic] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focusInside, setFocusInside] = useState(false);
  const startX = useRef<number | null>(null);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsStatic(true);
      setUserPaused(true);
    }
  }, []);

  const go = (index: number) => {
    setCurrent((index + slides.length) % slides.length);
    setCycle((c) => c + 1);
  };

  const paused = userPaused || hovering || focusInside;

  return (
    <section
      ref={rootRef}
      className={cn("hero", paused && "is-paused", isStatic && "is-static")}
      id="top"
      aria-roledescription="carousel"
      aria-label="Highlights"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setFocusInside(true)}
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node | null))
          setFocusInside(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(current + 1);
        if (e.key === "ArrowLeft") go(current - 1);
      }}
      onPointerDown={(e) => {
        if (e.pointerType !== "mouse") startX.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (startX.current === null) return;
        const dx = e.clientX - startX.current;
        if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1));
        startX.current = null;
      }}
    >
      <div className="hero__slides">
        {slides.map((slide, i) => {
          const active = i === current;
          const Heading = i === 0 ? "h1" : "h2";
          return (
            <article
              key={slide.title}
              className={cn("hero__slide", active && "is-active")}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${slides.length}`}
              aria-hidden={!active}
              inert={!active}
            >
              <Image
                className="hero__img"
                src={slide.image}
                alt=""
                width={1920}
                height={1080}
                priority={i === 0}
                unoptimized
              />
              <div className="hero__content">
                <p className="hero__kicker">{slide.kicker}</p>
                <Heading className="hero__title">
                  {slide.title}
                  <span className="dot">.</span>
                </Heading>
                <span className="hero__rule" aria-hidden="true" />
                <p className="hero__text">{slide.text}</p>
                <Link className="pill" href={slide.cta.href}>
                  {slide.cta.label}{" "}
                  <ArrowRight className="i" aria-hidden="true" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      <div className="hero__controls">
        <div className="hero__tabs" role="group" aria-label="Choose slide">
          {slides.map((slide, i) => (
            <button
              key={slide.tab}
              className={cn("hero__tab", i === current && "is-active")}
              type="button"
              aria-label={slide.tabLabel}
              aria-current={i === current ? "true" : undefined}
              onClick={() => go(i)}
            >
              <span className="hero__tab-label">{slide.tab}</span>
              <span className="hero__bar">
                <span
                  key={i === current ? `active-${cycle}` : "idle"}
                  onAnimationEnd={() => {
                    if (i === current && !isStatic) go(current + 1);
                  }}
                />
              </span>
            </button>
          ))}
        </div>
        <div className="hero__buttons">
          <button
            className="hero__btn"
            type="button"
            aria-label="Previous slide"
            onClick={() => go(current - 1)}
          >
            <ChevronLeft className="i" aria-hidden="true" />
          </button>
          <button
            className="hero__btn"
            type="button"
            aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
            onClick={() => {
              setUserPaused((p) => !p);
              if (userPaused) setIsStatic(false);
            }}
          >
            {userPaused ? (
              <Play className="i i--fill" aria-hidden="true" />
            ) : (
              <Pause className="i" aria-hidden="true" />
            )}
          </button>
          <button
            className="hero__btn"
            type="button"
            aria-label="Next slide"
            onClick={() => go(current + 1)}
          >
            <ChevronRight className="i" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
