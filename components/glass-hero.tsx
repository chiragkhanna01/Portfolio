"use client";

import React, { useRef, useEffect, useState } from "react";

const DESKTOP_RADIUS = 235;
const MOBILE_RADIUS = 150;

export default function GlassHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rawXRef = useRef(-999);
  const rawYRef = useRef(-999);
  const smoothedXRef = useRef(-999);
  const smoothedYRef = useRef(-999);
  const currentRadiusRef = useRef(0);
  const targetRadiusRef = useRef(0);
  const isTouchRef = useRef(false);
  const frameIdRef = useRef<number | null>(null);

  // State to track the active viewport section
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isReduced = mediaQuery.matches;

    const handleMotionChange = (e: MediaQueryListEvent) => {
      isReduced = e.matches;
    };

    mediaQuery.addEventListener("change", handleMotionChange);

    const tick = () => {
      const el = containerRef.current;
      if (!el) {
        frameIdRef.current = requestAnimationFrame(tick);
        return;
      }

      // Easing interpolation factors
      const posFactor = isReduced ? 1.0 : 0.14;
      const radFactor = isReduced ? 1.0 : 0.12;

      // Interpolate position
      if (rawXRef.current !== -999 && rawYRef.current !== -999) {
        if (smoothedXRef.current === -999) {
          smoothedXRef.current = rawXRef.current;
          smoothedYRef.current = rawYRef.current;
        } else {
          smoothedXRef.current += (rawXRef.current - smoothedXRef.current) * posFactor;
          smoothedYRef.current += (rawYRef.current - smoothedYRef.current) * posFactor;
        }
      }

      // Interpolate radius
      currentRadiusRef.current += (targetRadiusRef.current - currentRadiusRef.current) * radFactor;

      // Apply style variables to container element
      el.style.setProperty("--reveal-x", `${smoothedXRef.current}px`);
      el.style.setProperty("--reveal-y", `${smoothedYRef.current}px`);
      el.style.setProperty("--reveal-radius", `${currentRadiusRef.current}px`);

      frameIdRef.current = requestAnimationFrame(tick);
    };

    frameIdRef.current = requestAnimationFrame(tick);

    return () => {
      mediaQuery.removeEventListener("change", handleMotionChange);
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, []);

  // Intersection Observer for scroll reveal animations (trigger once)
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.05,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target); // Animate once
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll(".reveal-section");
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // Intersection Observer to highlight current active navigation tab
  useEffect(() => {
    const sections = ["hero", "about", "skills", "projects", "education", "contact"];
    const observerOptions = {
      root: null,
      rootMargin: "-40% 0px -50% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  // Event handlers
  const updatePointerPosition = (clientX: number, clientY: number, currentTarget: HTMLDivElement) => {
    const rect = currentTarget.getBoundingClientRect();
    rawXRef.current = clientX - rect.left;
    rawYRef.current = clientY - rect.top;
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      rawXRef.current = x;
      rawYRef.current = y;
      smoothedXRef.current = x;
      smoothedYRef.current = y;
      targetRadiusRef.current = DESKTOP_RADIUS;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    updatePointerPosition(e.clientX, e.clientY, e.currentTarget);
    if (e.pointerType === "mouse") {
      targetRadiusRef.current = DESKTOP_RADIUS;
    } else if (e.pointerType === "touch" && isTouchRef.current) {
      targetRadiusRef.current = MOBILE_RADIUS;
    }
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") {
      targetRadiusRef.current = 0;
    } else if (e.pointerType === "touch") {
      isTouchRef.current = false;
      targetRadiusRef.current = 0;
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") {
      isTouchRef.current = true;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      rawXRef.current = x;
      rawYRef.current = y;
      smoothedXRef.current = x;
      smoothedYRef.current = y;
      targetRadiusRef.current = MOBILE_RADIUS;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") {
      isTouchRef.current = false;
      targetRadiusRef.current = 0;
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-white select-none">
      {/* Navigation overlay (Fixed at the top) */}
      <header className="fixed top-0 left-[max(5.6vw,2rem)] right-[max(5.6vw,2rem)] pt-[max(2.5rem,env(safe-area-inset-top))] z-50 pointer-events-none animate-nav">
        <nav className="flex items-center justify-between w-full">
          {/* Logo & Brand */}
          <a
            href="#hero"
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/20 rounded-md p-1 min-h-[44px] pointer-events-auto"
          >
            <div className="w-8 h-8 flex items-center justify-center border border-slate-900/10 dark:border-white/10 rounded-md bg-white/50 backdrop-blur-sm shadow-sm group-hover:scale-105 transition-transform">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-slate-900 dark:text-white+"
                aria-hidden="true"
              >
                <path
                  d="M18 8V5H6L4 7V17L6 19H18V16"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                />
              </svg>
            </div>
            <span className="font-sans font-medium text-base tracking-tight text-slate-950 dark:text-Grey">
              Chirag
            </span>
          </a>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-1 bg-white/40 backdrop-blur-md border border-slate-200/30 rounded-full px-2 py-1 pointer-events-auto shadow-sm">
            {["About", "Skills", "Projects", "Education", "Contact"].map((item) => {
              const id = item === "Projects" ? "projects" : item.toLowerCase();
              const isActive = activeSection === id;
              return (
                <li key={item}>
                  <a
                    href={`#${id}`}
                    className={`inline-flex items-center justify-center px-4 py-2 text-sm font-normal rounded-full transition-all duration-300 min-h-[44px] ${isActive
                      ? "bg-slate-950 text-white font-medium shadow-sm"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/50"
                      }`}
                  >
                    {item}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Let's talk CTA */}
          <a
            href="https://www.linkedin.com/in/chiragkhanna04/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center px-5 h-11 bg-white text-slate-950 border border-slate-200/50 hover:bg-slate-50 font-medium rounded-full text-xs md:text-sm tracking-wide transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 min-h-[44px] min-w-[100px] pointer-events-auto"
          >
            Let&apos;s talk
          </a>
        </nav>
      </header>

      {/* ──────────────────────────────────────────────────────── */}
      {/* Focused Hero Section */}
      <section
        id="hero"
        ref={containerRef}
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative flex flex-col justify-between w-full h-screen overflow-hidden select-none bg-slate-100"
      >
        {/* 1. Base portrait (Base_image_desktop) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 w-full h-full bg-[url('/images/Base_image_desktop.png')] bg-center bg-no-repeat bg-cover animate-portrait"
        />

        {/* 2. Reveal portrait (Reveal_image_desktop) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 w-full h-full bg-[url('/images/Reveal_image_desktop.png')] bg-center bg-no-repeat bg-cover reveal-mask"
        />

        {/* 3. Technical grid and large circle */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-10 select-none">
          {/* Horizontal grid lines */}
          <div className="absolute left-0 right-0 top-[34%] h-[1px] bg-slate-900/[0.05] dark:bg-white/[0.05]" />
          <div className="absolute left-0 right-0 bottom-[max(9vw,5.5rem)] h-[1px] bg-slate-900/[0.05] dark:bg-white/[0.05]" />

          {/* Vertical grid lines matching content margins */}
          <div className="absolute top-0 bottom-0 left-[max(5.6vw,2rem)] w-[1px] bg-slate-900/[0.05] dark:bg-white/[0.05]" />
          <div className="absolute top-0 bottom-0 right-[max(5.6vw,2rem)] w-[1px] bg-slate-900/[0.05] dark:bg-white/[0.05]" />

          {/* Top-Left Intersection Node */}
          <div className="absolute top-[34%] left-[max(5.6vw,2rem)] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <div className="w-2.5 h-2.5 border border-slate-900/[0.12] dark:border-white/[0.12] rounded-full absolute" />
            <span className="absolute left-4 top-2 text-[8px] font-mono text-slate-500/50">34.00_N</span>
          </div>

          {/* Bottom-Left Intersection Node */}
          <div className="absolute bottom-[max(9vw,5.5rem)] left-[max(5.6vw,2rem)] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <div className="w-2.5 h-2.5 border border-slate-900/[0.12] dark:border-white/[0.12] rounded-full absolute" />
            <span className="absolute left-4 -top-3.5 text-[8px] font-mono text-slate-500/50">88.50_S</span>
          </div>

          {/* Top-Right Intersection Node */}
          <div className="absolute top-[34%] right-[max(5.6vw,2rem)] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <div className="w-2.5 h-2.5 border border-slate-900/[0.12] dark:border-white/[0.12] rounded-full absolute" />
          </div>

          {/* Center alignment circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55vw] h-[55vw] max-w-[650px] max-h-[650px] border border-slate-900/[0.035] dark:border-white/[0.035] rounded-full flex items-center justify-center">
            <div className="w-[96%] h-[96%] border border-dashed border-slate-900/[0.015] dark:border-white/[0.015] rounded-full" />
            <div className="absolute w-3 h-[1px] bg-slate-900/10 dark:bg-white/10" />
            <div className="absolute h-3 w-[1px] bg-slate-900/10 dark:bg-white/10" />
          </div>
        </div>

        {/* 4. Headline and Copy */}
        {/* Editorial Headline */}
        <section className="absolute top-[34%] left-[max(5.6vw,2rem)] z-20 pointer-events-none">
          <h1 className="font-sans font-light tracking-[-0.085em] leading-[0.93] text-slate-950 dark:text-black uppercase select-none text-[3.6rem] md:text-[clamp(5.4rem,6.2vw,6.8rem)] flex flex-col">
            <span className="block overflow-hidden pb-1.5 pr-4">
              <span className="block animate-headline-1">Building</span>
            </span>
            <span className="block overflow-hidden pb-1.5 pr-4">
              <span className="block animate-headline-2">Beyond</span>
            </span>
            <span className="block overflow-hidden pb-1.5 pr-4">
              <span className="block animate-headline-3">Possible.</span>
            </span>
          </h1>
        </section>

        {/* Footer Elements (Intro CTA & Manifesto) */}
        <footer className="w-full mt-auto px-[max(5.6vw,2rem)] pb-[max(4vw,2.5rem)] flex flex-col md:flex-row md:items-end md:justify-between gap-8 z-20 pointer-events-none">
          {/* Bottom Left: Intro paragraph and work CTA */}
          <div className="max-w-[420px] pointer-events-auto animate-intro">
            <p className="font-sans font-light text-slate-800 dark:text-black text-base md:text-[1.125rem] leading-[1.6] select-none mb-6">
              I build useful products, experiment with emerging technology, and turn the process into stories worth sharing.
            </p>
            <a
              href="https://www.linkedin.com/in/chiragkhanna04/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-8 h-12 bg-white text-slate-900 border border-slate-200/50 hover:bg-slate-50 font-medium rounded-full text-sm tracking-wide transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 min-h-[44px]"
            >
              Explore my work
            </a>
          </div>

          {/* Bottom Right: Manifesto */}
          <div className="font-mono text-xs md:text-[0.8rem] tracking-[0.08em] leading-[1.3] text-slate-500/80 dark:text-slate-400/80 md:text-right select-none animate-manifesto self-start md:self-end">
            <div>BUILDING THE</div>
            <div>NEXT VERSION</div>
            <div>IN PUBLIC</div>
          </div>
        </footer>
      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* Portfolio Body Sections (Extended below the Hero) */}
      <div className="relative w-full bg-white text-slate-800">

        {/* 1. About Section */}
        <section
          id="about"
          className="reveal-section w-full px-[max(5.6vw,2rem)] py-24 md:py-36 border-b border-slate-100 flex flex-col md:flex-row gap-12 md:gap-20 items-center justify-between"
        >
          <div className="w-full md:w-1/2 flex flex-col items-start text-left">
            <span className="text-cyan-600 font-mono tracking-widest text-xs uppercase font-medium stagger-item stagger-delay-1">

            </span>
            <h2 className="font-sans font-light text-[2.25rem] md:text-[3rem] leading-[1.15] tracking-[-0.035em] text-slate-950 mt-4 mb-8 stagger-item stagger-delay-2 uppercase">
              Engineering <br />With Intent.
            </h2>
            <div className="w-full text-slate-600 font-light text-base md:text-[1.125rem] leading-[1.75] space-y-6 stagger-item stagger-delay-3">
              <p>
                I am Chirag, a Computer Science undergraduate focused on crafting precise interfaces, designing structured software logic, and automating workflows.
              </p>
              <div className="p-6 bg-[#f4f7fc]/50 border-l-2 border-cyan-500 rounded-r-xl text-slate-800 italic leading-[1.6] font-normal shadow-sm">
                &ldquo;Seeking an opportunity to apply my technical skills, contribute to meaningful projects, and grow as a software professional while delivering quality solutions in a collaborative environment.&rdquo;
              </div>
              <p>
                Currently pursuing my Bachelor of Engineering in Computer Science at Chandigarh University (2023 - 2027), I actively bridge UI/UX design with test-automation scripts to build resilient digital systems.
              </p>
            </div>
            <div className="mt-8 stagger-item stagger-delay-4">
              <a
                href="mailto:khannachirag2004@gmail.com?subject=Resume%20Request%20-%20Chirag"
                className="inline-flex items-center justify-center px-7 h-12 bg-slate-950 hover:bg-slate-900 text-white font-medium rounded-full text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/20 shadow-md min-h-[44px]"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Resume
              </a>
            </div>
          </div>
          <div className="w-full md:w-1/2 flex items-center justify-center md:justify-end stagger-item stagger-delay-3">
            <div className="w-full aspect-[3/4] max-w-[380px] rounded-[2rem] overflow-hidden border border-slate-200/50 shadow-lg bg-slate-50 relative group">
              <div className="absolute inset-0 bg-cyan-500/5 mix-blend-overlay z-10 pointer-events-none" />
              <img
                src="/images/img.jpeg"
                alt="Chirag Portrait Visual"
                className="object-cover w-full h-full filter saturate-[0.8] contrast-[1.05] group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </section>

        {/* 2. Skills Section */}
        <section
          id="skills"
          className="reveal-section w-full px-[max(5.6vw,2rem)] py-24 md:py-36 bg-[#fbfcfd] border-b border-slate-100 text-left"
        >
          <div className="max-w-6xl mx-auto">
            <span className="text-cyan-600 font-mono tracking-widest text-xs uppercase font-medium stagger-item stagger-delay-1">

            </span>
            <h2 className="font-sans font-light text-[2.25rem] md:text-[3rem] leading-[1.15] tracking-[-0.035em] text-slate-950 mt-4 mb-16 stagger-item stagger-delay-2 uppercase">
              Technical Core.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-item stagger-delay-3">
              {/* Category 1 */}
              <div className="glass-card rounded-[2rem] p-8 flex flex-col justify-between min-h-[220px]">
                <div>
                  <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200/40 text-slate-800 mb-6">
                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-950 mb-3">Programming Languages</h3>
                  <p className="text-sm font-light text-slate-600 leading-relaxed">
                    Writing typed and structured scripts across distinct environments.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-6">
                  {["C++", "Java", "JavaScript", "SQL", "HTML", "CSS"].map((tech) => (
                    <span key={tech} className="px-3.5 py-1 bg-white border border-slate-200/40 rounded-full text-xs text-slate-700 font-mono">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Category 2 */}
              <div className="glass-card rounded-[2rem] p-8 flex flex-col justify-between min-h-[220px]">
                <div>
                  <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200/40 text-slate-800 mb-6">
                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-950 mb-3">Frontend</h3>
                  <p className="text-sm font-light text-slate-600 leading-relaxed">
                    Building clean web interfaces and intuitive client layouts.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-6">
                  {["HTML", "CSS", "JavaScript", "Responsive Design"].map((tech) => (
                    <span key={tech} className="px-3.5 py-1 bg-white border border-slate-200/40 rounded-full text-xs text-slate-700 font-mono">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Category 3 */}
              <div className="glass-card rounded-[2rem] p-8 flex flex-col justify-between min-h-[220px]">
                <div>
                  <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200/40 text-slate-800 mb-6">
                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a3 3 0 013-3m0 0V5.25A2.25 2.25 0 017.5 3h9a2.25 2.25 0 012.25 2.25V6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-950 mb-3">Backend</h3>
                  <p className="text-sm font-light text-slate-600 leading-relaxed">
                    Developing application components and script integrations.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-6">
                  {["SQL", "Java", "Object-Oriented Logic"].map((tech) => (
                    <span key={tech} className="px-3.5 py-1 bg-white border border-slate-200/40 rounded-full text-xs text-slate-700 font-mono">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Category 4 */}
              <div className="glass-card rounded-[2rem] p-8 flex flex-col justify-between min-h-[220px]">
                <div>
                  <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200/40 text-slate-800 mb-6">
                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75M3.75 10.125v3.75m16.5 0v3.75M3.75 13.875v3.75" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-950 mb-3">Databases</h3>
                  <p className="text-sm font-light text-slate-600 leading-relaxed">
                    Structuring relational schemas and executing query validation.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-6">
                  {["SQL", "Relational DBMS", "Database Validation"].map((tech) => (
                    <span key={tech} className="px-3.5 py-1 bg-white border border-slate-200/40 rounded-full text-xs text-slate-700 font-mono">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Category 5 */}
              <div className="glass-card rounded-[2rem] p-8 flex flex-col justify-between min-h-[220px]">
                <div>
                  <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200/40 text-slate-800 mb-6">
                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.67 2.67 0 1021 17.25l-5.83-5.83m-3.75 3.75a2.67 2.67 0 01-3.75-3.75M11.42 15.17l-1.2-1.2m0 0l-5.83 5.83a2.67 2.67 0 01-3.75-3.75l5.83-5.83m0 0l-1.2-1.2m0 0a2.67 2.67 0 013.75-3.75l5.83 5.83" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-950 mb-3">Tools</h3>
                  <p className="text-sm font-light text-slate-600 leading-relaxed">
                    Managing code bases and writing automated workflow scripts.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-6">
                  {["Git", "GitHub", "VS Code", "Selenium WebDriver"].map((tech) => (
                    <span key={tech} className="px-3.5 py-1 bg-white border border-slate-200/40 rounded-full text-xs text-slate-700 font-mono">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Category 6 */}
              <div className="glass-card rounded-[2rem] p-8 flex flex-col justify-between min-h-[220px]">
                <div>
                  <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200/40 text-slate-800 mb-6">
                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-950 mb-3">Cloud & Technologies</h3>
                  <p className="text-sm font-light text-slate-600 leading-relaxed">
                    Working with system paradigms and testing integrations.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-6">
                  {["Automated Testing", "DSA", "OOP Design Patterns", "UI Testing"].map((tech) => (
                    <span key={tech} className="px-3.5 py-1 bg-white border border-slate-200/40 rounded-full text-xs text-slate-700 font-mono">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Featured Projects Section */}
        <section
          id="projects"
          className="reveal-section w-full px-[max(5.6vw,2rem)] py-24 md:py-36 bg-white border-b border-slate-100 text-left"
        >
          <div className="max-w-6xl mx-auto">
            <span className="text-cyan-600 font-mono tracking-widest text-xs uppercase font-medium stagger-item stagger-delay-1">

            </span>
            <h2 className="font-sans font-light text-[2.25rem] md:text-[3rem] leading-[1.15] tracking-[-0.035em] text-slate-950 mt-4 mb-16 stagger-item stagger-delay-2 uppercase">
              Featured Projects.
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 stagger-item stagger-delay-3">
              {/* Project Card 1 */}
              <div className="glass-card rounded-[2.5rem] p-8 flex flex-col justify-between h-full bg-white/60 border border-slate-200/50 hover:border-cyan-500/25 transition-all duration-300">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-2">
                    QA & AUTOMATION · 2024 - 2025
                  </span>
                  <h3 className="text-xl font-medium text-slate-950 mb-4">BookCart</h3>
                  <p className="text-sm font-light text-slate-600 leading-relaxed mb-6">
                    An automated end-to-end testing framework built to guarantee functional stability across dynamic e-commerce pipelines.
                  </p>
                  <ul className="space-y-3 mb-8 text-xs font-light text-slate-600">
                    <li className="flex gap-2">
                      <span className="text-cyan-600 font-bold font-sans">✓</span>
                      <span>Designed and built an automated end-to-end testing framework for e-commerce checkouts.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-cyan-600 font-bold font-sans">✓</span>
                      <span>Automated critical user workflows including multi-page navigation and browser inputs.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-cyan-600 font-bold font-sans">✓</span>
                      <span>Implemented explicit wait strategies to drastically reduce flaky script execution.</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {["Java", "Selenium", "Git"].map((tech) => (
                      <span key={tech} className="px-2.5 py-0.5 bg-slate-100/60 border border-slate-200/40 rounded-full text-[10px] text-slate-600 font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <a
                      href="https://github.com/chiragkhanna01"
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 inline-flex items-center justify-center h-10 border border-slate-200/60 hover:bg-slate-50 text-slate-700 font-medium rounded-full text-xs transition-colors min-h-[40px] focus:outline-none"
                    >
                      Code Source
                    </a>
                  </div>
                </div>
              </div>

              {/* Project Card 2 */}
              <div className="glass-card rounded-[2.5rem] p-8 flex flex-col justify-between h-full bg-white/60 border border-slate-200/50 hover:border-cyan-500/25 transition-all duration-300">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-2">
                    DESKTOP APPLICATION · 2024
                  </span>
                  <h3 className="text-xl font-medium text-slate-950 mb-4">Walletly</h3>
                  <p className="text-sm font-light text-slate-600 leading-relaxed mb-6">
                  A minimalist full-stack expense tracking application designed to make personal finance management visual, fast, and clutter-free.
                  </p>
                  <ul className="space-y-3 mb-8 text-xs font-light text-slate-600">
                    <li className="flex gap-2">
                      <span className="text-cyan-600 font-bold font-sans">✓</span>
                      <span>Built a responsive React 19 frontend with Vite, featuring route-based navigation via React Router and a Tailwind CSS design system.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-cyan-600 font-bold font-sans">✓</span>
                      <span>Implemented interactive data visualizations (doughnut and trend charts) using Chart.js to break down spending patterns at a glance.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-cyan-600 font-bold font-sans">✓</span>
                      <span>Integrated a custom animated cursor interaction and smooth page transitions using Framer Motion for a polished, tactile user experience.</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {["React", "Vite", "Tailwind CSS", "MongoDB"].map((tech) => (
                      <span key={tech} className="px-2.5 py-0.5 bg-slate-100/60 border border-slate-200/40 rounded-full text-[10px] text-slate-600 font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <a
                      href="https://github.com/chiragkhanna01"
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 inline-flex items-center justify-center h-10 border border-slate-200/60 hover:bg-slate-50 text-slate-700 font-medium rounded-full text-xs transition-colors min-h-[40px] focus:outline-none"
                    >
                      Code Source
                    </a>
                  </div>
                </div>
              </div>

              {/* Project Card 3 */}
              <div className="glass-card rounded-[2.5rem] p-8 flex flex-col justify-between h-full bg-white/60 border border-slate-200/50 hover:border-cyan-500/25 transition-all duration-300">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-2">
                    WEB APPLICATION · 2025 - 2026
                  </span>
                  <h3 className="text-xl font-medium text-slate-950 mb-4">BookNest</h3>
                  <p className="text-sm font-light text-slate-600 leading-relaxed mb-6">
                  A community-driven book discovery platform built to help readers explore genres, browse featured titles, and connect with fellow book lovers.
                  </p>
                  <ul className="space-y-3 mb-8 text-xs font-light text-slate-600">
                    <li className="flex gap-2">
                      <span className="text-cyan-600 font-bold font-sans">✓</span>
                      <span>Built a multi-page responsive site from scratch using vanilla HTML, CSS, and JavaScript, with modular pages for Explore, My Library, Community, and About.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-cyan-600 font-bold font-sans">✓</span>
                      <span>Designed an animated, glassmorphism-style navigation header with a frosted-glass blur effect and an expandable live search bar with genre/author/book filters.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-cyan-600 font-bold font-sans">✓</span>
                      <span>Implemented a dynamic featured books showcase and a horizon</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {["HTML", "CSS", "JavaScript"].map((tech) => (
                      <span key={tech} className="px-2.5 py-0.5 bg-slate-100/60 border border-slate-200/40 rounded-full text-[10px] text-slate-600 font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <a
                      href="https://github.com/chiragkhanna01"
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 inline-flex items-center justify-center h-10 border border-slate-200/60 hover:bg-slate-50 text-slate-700 font-medium rounded-full text-xs transition-colors min-h-[40px] focus:outline-none"
                    >
                      Code Source
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Experience Timeline / Learning Journey Section */}
        <section
          id="experience"
          className="reveal-section w-full px-[max(5.6vw,2rem)] py-24 md:py-36 bg-[#fbfcfd] border-b border-slate-100 text-left"
        >
          <div className="max-w-4xl mx-auto">
            <span className="text-cyan-600 font-mono tracking-widest text-xs uppercase font-medium stagger-item stagger-delay-1">

            </span>
            <h2 className="font-sans font-light text-[2.25rem] md:text-[3rem] leading-[1.15] tracking-[-0.035em] text-slate-950 mt-4 mb-16 stagger-item stagger-delay-2 uppercase">
              Learning Journey.
            </h2>

            <div className="relative border-l border-slate-200 ml-4 md:ml-6 pl-8 md:pl-10 space-y-16 py-4 stagger-item stagger-delay-3">
              {/* Timeline Item 1 */}
              <div className="relative">
                <div className="absolute -left-[41px] md:-left-[49px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-cyan-500 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                </div>
                <span className="text-xs font-mono text-cyan-600 tracking-wider uppercase block mb-1">
                  August 2023
                </span>
                <h3 className="text-lg font-medium text-slate-950 mb-2">CS Fundamentals & Matriculation</h3>
                <p className="text-sm font-light text-slate-600 leading-relaxed max-w-2xl">
                  Enrolled in Chandigarh University for B.E. Computer Science. Formulated solid theoretical concepts in algorithmic logic, structured query scripts, and programming foundations.
                </p>
              </div>

              {/* Timeline Item 2 */}
              <div className="relative">
                <div className="absolute -left-[41px] md:-left-[49px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-cyan-500 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                </div>
                <span className="text-xs font-mono text-cyan-600 tracking-wider uppercase block mb-1">
                  Mid 2024
                </span>
                <h3 className="text-lg font-medium text-slate-950 mb-2">Desktop Client Architecture</h3>
                <p className="text-sm font-light text-slate-600 leading-relaxed max-w-2xl">
                  Studied object-oriented mechanics in depth. Designed and developed the desktop-based responsive Music Player client utilizing system audio libraries and OOP modular layouts.
                </p>
              </div>

              {/* Timeline Item 3 */}
              <div className="relative">
                <div className="absolute -left-[41px] md:-left-[49px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-cyan-500 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                </div>
                <span className="text-xs font-mono text-cyan-600 tracking-wider uppercase block mb-1">
                  Late 2024 - 2025
                </span>
                <h3 className="text-lg font-medium text-slate-950 mb-2">E2E Automated Testing Workflows</h3>
                <p className="text-sm font-light text-slate-600 leading-relaxed max-w-2xl">
                  Familiarized with QA testing methods and database checks. Programmed the BookCart E2E testing system using Selenium, Java, and Git to resolve flaky test timings.
                </p>
              </div>

              {/* Timeline Item 4 */}
              <div className="relative">
                <div className="absolute -left-[41px] md:-left-[49px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-cyan-500 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                </div>
                <span className="text-xs font-mono text-cyan-600 tracking-wider uppercase block mb-1">
                  2025 - 2026
                </span>
                <h3 className="text-lg font-medium text-slate-950 mb-2">Modular UI Engineering</h3>
                <p className="text-sm font-light text-slate-600 leading-relaxed max-w-2xl">
                  Applied clean front-end UI structures. Built the Library Explorer web application using structured CSS and semantic nodes to achieve modularity and optimized assets workflows.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Certifications Section */}
        <section
          id="certifications"
          className="reveal-section w-full px-[max(5.6vw,2rem)] py-24 md:py-36 bg-white border-b border-slate-100 text-left"
        >
          <div className="max-w-6xl mx-auto">
            <span className="text-cyan-600 font-mono tracking-widest text-xs uppercase font-medium stagger-item stagger-delay-1">

            </span>
            <h2 className="font-sans font-light text-[2.25rem] md:text-[3rem] leading-[1.15] tracking-[-0.035em] text-slate-950 mt-4 mb-16 stagger-item stagger-delay-2 uppercase">
              Certifications & Core Courses.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-item stagger-delay-3">
              {/* Certification 1 */}
              <div className="p-6 bg-[#f4f7fc]/40 border border-slate-200/50 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-colors">
                <div>
                  <span className="text-[10px] font-mono text-cyan-600 uppercase tracking-widest block mb-2">
                    ACADEMIC COURSE
                  </span>
                  <h3 className="text-base font-medium text-slate-950 mb-1 leading-snug">
                    Object-Oriented Programming
                  </h3>
                  <p className="text-xs font-light text-slate-500">Chandigarh University</p>
                </div>
                <div className="mt-8 flex items-center justify-between border-t border-slate-200/40 pt-4">
                  <span className="text-[10px] font-mono text-slate-400">COMPLETED 2024</span>
                  <span className="text-xs font-light text-slate-400 italic">Certified Core</span>
                </div>
              </div>

              {/* Certification 2 */}
              <div className="p-6 bg-[#f4f7fc]/40 border border-slate-200/50 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-colors">
                <div>
                  <span className="text-[10px] font-mono text-cyan-600 uppercase tracking-widest block mb-2">
                    ACADEMIC COURSE
                  </span>
                  <h3 className="text-base font-medium text-slate-950 mb-1 leading-snug">
                    Data Structures & Algorithms
                  </h3>
                  <p className="text-xs font-light text-slate-500">Chandigarh University</p>
                </div>
                <div className="mt-8 flex items-center justify-between border-t border-slate-200/40 pt-4">
                  <span className="text-[10px] font-mono text-slate-400">COMPLETED 2024</span>
                  <span className="text-xs font-light text-slate-400 italic">Certified Core</span>
                </div>
              </div>

              {/* Certification 3 */}
              <div className="p-6 bg-[#f4f7fc]/40 border border-slate-200/50 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-colors">
                <div>
                  <span className="text-[10px] font-mono text-cyan-600 uppercase tracking-widest block mb-2">
                    ACADEMIC COURSE
                  </span>
                  <h3 className="text-base font-medium text-slate-950 mb-1 leading-snug">
                    Database Management (DBMS)
                  </h3>
                  <p className="text-xs font-light text-slate-500">Chandigarh University</p>
                </div>
                <div className="mt-8 flex items-center justify-between border-t border-slate-200/40 pt-4">
                  <span className="text-[10px] font-mono text-slate-400">COMPLETED 2025</span>
                  <span className="text-xs font-light text-slate-400 italic">Certified Core</span>
                </div>
              </div>

              {/* Certification 4 */}
              <div className="p-6 bg-[#f4f7fc]/40 border border-slate-200/50 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-colors">
                <div>
                  <span className="text-[10px] font-mono text-cyan-600 uppercase tracking-widest block mb-2">
                    SELF DIRECTED
                  </span>
                  <h3 className="text-base font-medium text-slate-950 mb-1 leading-snug">
                    UI automated quality testing
                  </h3>
                  <p className="text-xs font-light text-slate-500">WebDriver Frameworks</p>
                </div>
                <div className="mt-8 flex items-center justify-between border-t border-slate-200/40 pt-4">
                  <span className="text-[10px] font-mono text-slate-400">COMPLETED 2025</span>
                  <span className="text-xs font-light text-slate-400 italic">Applied Skills</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Education Section */}
        <section
          id="education"
          className="reveal-section w-full px-[max(5.6vw,2rem)] py-24 md:py-36 bg-[#fbfcfd] border-b border-slate-100 text-left"
        >
          <div className="max-w-4xl mx-auto">
            <span className="text-cyan-600 font-mono tracking-widest text-xs uppercase font-medium stagger-item stagger-delay-1">

            </span>
            <h2 className="font-sans font-light text-[2.25rem] md:text-[3rem] leading-[1.15] tracking-[-0.035em] text-slate-950 mt-4 mb-16 stagger-item stagger-delay-2 uppercase">
              Education.
            </h2>

            <div className="relative border-l border-slate-200 ml-4 pl-8 stagger-item stagger-delay-3">
              <div className="relative">
                {/* Node marker */}
                <div className="absolute -left-[37px] top-1.5 w-4 h-4 rounded-full bg-cyan-500 ring-4 ring-cyan-100 animate-pulse" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-xl font-medium text-slate-950">Chandigarh University, Gharuan</h3>
                    <p className="text-md font-light text-slate-600">Bachelor of Engineering in Computer Science</p>
                  </div>
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 border border-slate-200/40 px-3.5 py-1 rounded-full self-start md:self-center">
                    08/2023 - 05/2027
                  </span>
                </div>

                <div className="text-sm font-light text-slate-600 leading-relaxed space-y-6">
                  <p>
                    Studying core algorithms, system methodologies, database schemas, object-oriented concepts, and clean layout programming models.
                  </p>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block mb-3">RELEVANT COURSEWORK</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Object-Oriented Programming (OOP)",
                        "Data Structures & Algorithms (DSA)",
                        "Database Management Systems (DBMS)",
                        "UI Testing Frameworks",
                        "Automated Test Synchronization",
                      ].map((course) => (
                        <span key={course} className="px-3.5 py-1 bg-white border border-slate-200/50 rounded-full text-xs text-slate-700">
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Achievements Section */}
        <section
          id="achievements"
          className="reveal-section w-full px-[max(5.6vw,2rem)] py-24 md:py-36 bg-white border-b border-slate-100 text-left"
        >
          <div className="max-w-6xl mx-auto">
            <span className="text-cyan-600 font-mono tracking-widest text-xs uppercase font-medium stagger-item stagger-delay-1">

            </span>
            <h2 className="font-sans font-light text-[2.25rem] md:text-[3rem] leading-[1.15] tracking-[-0.035em] text-slate-950 mt-4 mb-16 stagger-item stagger-delay-2 uppercase">
              Achievements & Strengths.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-item stagger-delay-3">
              {/* Card 1 */}
              <div className="p-8 bg-[#f4f7fc]/40 border border-slate-200/40 rounded-[2rem] flex flex-col justify-between hover:border-slate-300 transition-all duration-300">
                <div>
                  <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200/40 text-slate-800 mb-6">
                    <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-950 mb-3">OOP Principles</h3>
                  <p className="text-sm font-light text-slate-600 leading-relaxed">
                    Built scalable applications utilizing foundational design patterns to guarantee modular code maintainability.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-8 bg-[#f4f7fc]/40 border border-slate-200/40 rounded-[2rem] flex flex-col justify-between hover:border-slate-300 transition-all duration-300">
                <div>
                  <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200/40 text-slate-800 mb-6">
                    <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5A1.5 1.5 0 007.5 3h-3A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5V15m-18-3h18m-6-6h6m-6 3h6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-950 mb-3">Versatile Builder</h3>
                  <p className="text-sm font-light text-slate-600 leading-relaxed">
                    Practical experience constructing solutions spanning front-end designs, database scripts, and desktop frameworks.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-8 bg-[#f4f7fc]/40 border border-slate-200/40 rounded-[2rem] flex flex-col justify-between hover:border-slate-300 transition-all duration-300">
                <div>
                  <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200/40 text-slate-800 mb-6">
                    <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-950 mb-3">Problem Solver</h3>
                  <p className="text-sm font-light text-slate-600 leading-relaxed">
                    Consistently diagnosed script execution flows, optimized algortihmic processes, and developed user-centric features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Contact Section */}
        <section
          id="contact"
          className="reveal-section w-full px-[max(5.6vw,2rem)] py-28 md:py-40 bg-[#fbfcfd] text-center"
        >
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            <span className="text-cyan-600 font-mono tracking-widest text-xs uppercase font-medium stagger-item stagger-delay-1">

            </span>
            <h2 className="font-sans font-light text-[2.5rem] md:text-[3.5rem] leading-[1.1] tracking-[-0.035em] text-slate-950 mt-4 mb-6 stagger-item stagger-delay-2 uppercase">
              Let&apos;s Connect.
            </h2>
            <p className="font-sans font-light text-slate-600 text-base md:text-lg max-w-md mb-12 stagger-item stagger-delay-3 leading-relaxed">
              Seeking new software development opportunities, workflow validations, or technical project collaborations.
            </p>

            <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-6 mb-16 stagger-item stagger-delay-4 text-left">
              <div className="p-5 bg-white border border-slate-200/50 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">EMAIL</span>
                <a href="mailto:khannachirag2004@gmail.com" className="text-sm text-slate-800 hover:text-cyan-600 transition-colors font-medium break-all focus-visible:outline-none">
                  khannachirag2004@gmail.com
                </a>
              </div>
              <div className="p-5 bg-white border border-slate-200/50 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">PHONE</span>
                <a href="tel:+917027182022" className="text-sm text-slate-800 hover:text-cyan-600 transition-colors font-medium focus-visible:outline-none">
                  +91-7027182022
                </a>
              </div>
              <div className="p-5 bg-white border border-slate-200/50 rounded-xl col-span-2 md:col-span-1">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">LOCATION</span>
                <span className="text-sm text-slate-800 font-medium">Chandigarh, India</span>
              </div>
              <div className="p-5 bg-white border border-slate-200/50 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">GITHUB</span>
                <a href="https://github.com/chiragkhanna01" target="_blank" rel="noreferrer" className="text-sm text-slate-800 hover:text-cyan-600 transition-colors font-medium focus-visible:outline-none">
                  github.com/chiragkhanna01
                </a>
              </div>
              <div className="p-5 bg-white border border-slate-200/50 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">LINKEDIN</span>
                <a href="https://linkedin.com/in/chiragkhanna04" target="_blank" rel="noreferrer" className="text-sm text-slate-800 hover:text-cyan-600 transition-colors font-medium focus-visible:outline-none">
                  linkedin.com/in/chiragkhanna04
                </a>
              </div>
              <div className="p-5 bg-white border border-slate-200/50 rounded-xl col-span-2 md:col-span-1 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">RESUME</span>
                <a href="mailto:khannachirag2004@gmail.com?subject=Resume%20Request%20-%20Chirag" className="text-xs text-cyan-600 hover:underline flex items-center gap-1 font-medium mt-1 focus-visible:outline-none">
                  Request PDF Copy &rarr;
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 stagger-item stagger-delay-5">
              <a
                href="https://www.linkedin.com/in/chiragkhanna04/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-8 h-12 bg-slate-950 hover:bg-slate-900 text-white font-medium rounded-full text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/20 shadow-md min-h-[44px]"
              >
                Let&apos;s Connect
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
