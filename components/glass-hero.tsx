"use client";

import React, { useRef, useEffect, useState } from "react";

const DESKTOP_RADIUS = 235;
const MOBILE_RADIUS = 150;

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  verificationUrl: string;
  type: "Academic Course" | "Professional Course" | "Professional Certification";
}

const CERTIFICATES: Certificate[] = [
  {
    id: "B7N3QQCUCEMC",
    title: "Environment Science, Waste, and Disaster Management",
    issuer: "Chandigarh University",
    date: "Oct 16, 2024",
    verificationUrl: "https://coursera.org/verify/B7N3QQCUCEMC",
    type: "Academic Course"
  },
  {
    id: "UW43HGVAWV5V",
    title: "Health and Yoga",
    issuer: "Chandigarh University",
    date: "Oct 16, 2024",
    verificationUrl: "https://coursera.org/verify/UW43HGVAWV5V",
    type: "Academic Course"
  },
  {
    id: "4HC7JLIX2ZEN",
    title: "Microcontroller and Industrial Applications",
    issuer: "L&T EduTech",
    date: "Oct 16, 2024",
    verificationUrl: "https://coursera.org/verify/4HC7JLIX2ZEN",
    type: "Professional Course"
  },
  {
    id: "E0Q46KJO5UA8",
    title: "Public Health Perspectives on Sustainable Diets",
    issuer: "Johns Hopkins University",
    date: "Oct 16, 2024",
    verificationUrl: "https://coursera.org/verify/E0Q46KJO5UA8",
    type: "Academic Course"
  },
  {
    id: "V4C4MZMWVVJV",
    title: "Introduction to the Internet of Things and Embedded Systems",
    issuer: "University of California, Irvine",
    date: "Oct 16, 2024",
    verificationUrl: "https://coursera.org/verify/V4C4MZMWVVJV",
    type: "Academic Course"
  },
  {
    id: "VF84FHUSEDPQ",
    title: "The Arduino Platform and C Programming",
    issuer: "University of California, Irvine",
    date: "Oct 20, 2024",
    verificationUrl: "https://coursera.org/verify/VF84FHUSEDPQ",
    type: "Academic Course"
  },
  {
    id: "ELLXWGOMS6PD",
    title: "Interfacing with the Arduino",
    issuer: "University of California, Irvine",
    date: "Oct 22, 2024",
    verificationUrl: "https://coursera.org/verify/ELLXWGOMS6PD",
    type: "Academic Course"
  },
  {
    id: "SUUAY0CS7V41",
    title: "Introduction to Databases",
    issuer: "Meta",
    date: "Feb 25, 2025",
    verificationUrl: "https://coursera.org/verify/SUUAY0CS7V41",
    type: "Professional Certification"
  },
  {
    id: "PFZ9LDXTGHD0",
    title: "SQL: A Practical Introduction for Querying Databases",
    issuer: "IBM",
    date: "Feb 25, 2025",
    verificationUrl: "https://coursera.org/verify/PFZ9LDXTGHD0",
    type: "Professional Course"
  },
  {
    id: "EAOIUHSW6DG1",
    title: "5G Network Fundamentals",
    issuer: "Institut Mines-Télécom",
    date: "Mar 6, 2025",
    verificationUrl: "https://coursera.org/verify/EAOIUHSW6DG1",
    type: "Academic Course"
  },
  {
    id: "NEJNH33B4CGM",
    title: "Introduction to NoSQL Databases",
    issuer: "IBM",
    date: "Mar 19, 2025",
    verificationUrl: "https://coursera.org/verify/NEJNH33B4CGM",
    type: "Professional Course"
  },
  {
    id: "1POFF5E10YVH",
    title: "Introduction to Relational Databases (RDBMS)",
    issuer: "IBM",
    date: "Mar 20, 2025",
    verificationUrl: "https://coursera.org/verify/1POFF5E10YVH",
    type: "Professional Course"
  },
  {
    id: "UIK1NOXUEMBQ",
    title: "Databases and SQL for Data Science with Python",
    issuer: "IBM",
    date: "Mar 21, 2025",
    verificationUrl: "https://coursera.org/verify/UIK1NOXUEMBQ",
    type: "Professional Course"
  },
  {
    id: "GL0Q0W7MTWYE",
    title: "C# for .NET Developers",
    issuer: "Board Infinity",
    date: "Jun 11, 2025",
    verificationUrl: "https://coursera.org/verify/GL0Q0W7MTWYE",
    type: "Professional Course"
  },
  {
    id: "IEDSY67WHMKR",
    title: ".Net Full Stack Foundation",
    issuer: "Board Infinity",
    date: "Jun 11, 2025",
    verificationUrl: "https://coursera.org/verify/IEDSY67WHMKR",
    type: "Professional Course"
  },
  {
    id: "ZVRFY3DVQYW3",
    title: "Design and Analyze Secure Networked Systems",
    issuer: "University of Colorado System",
    date: "Mar 14, 2026",
    verificationUrl: "https://coursera.org/verify/ZVRFY3DVQYW3",
    type: "Academic Course"
  }
];

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

  // Certification Filtering & Expansion States
  const [certFilter, setCertFilter] = useState("all");
  const [showAllCerts, setShowAllCerts] = useState(false);

  // Verification Portal States
  const [verifyInput, setVerifyInput] = useState("");
  const [verificationResult, setVerificationResult] = useState<Certificate | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<"idle" | "searching" | "checking" | "verified" | "not_found">("idle");
  const [verifySteps, setVerifySteps] = useState<string[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(-1);

  // Handle simulated verification search
  const handleVerify = (credentialId: string) => {
    const cleanId = credentialId.trim().toUpperCase();
    if (!cleanId) return;

    setVerifyStatus("searching");
    setVerificationResult(null);
    setCurrentStepIdx(0);
    
    const steps = [
      "Locating credential record in local registry...",
      "Resolving signature from cryptographic vault...",
      "Authenticating verification status with Coursera network API...",
      "Verification complete. Certificate signature match found!"
    ];
    setVerifySteps(steps);

    // Step-by-step logging animation
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < steps.length) {
        setCurrentStepIdx(step);
      } else {
        clearInterval(interval);
        const match = CERTIFICATES.find(c => c.id.toUpperCase() === cleanId);
        if (match) {
          setVerificationResult(match);
          setVerifyStatus("verified");
        } else {
          setVerifyStatus("not_found");
        }
      }
    }, 400);
  };

  const triggerVerifyFromCard = (credentialId: string) => {
    setVerifyInput(credentialId);
    const portalEl = document.getElementById("verification-portal");
    if (portalEl) {
      portalEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    handleVerify(credentialId);
  };

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
      <header className="fixed top-0 left-[max(5.6vw,1rem)] right-[max(5.6vw,1rem)] pt-[max(2.5rem,env(safe-area-inset-top))] z-50 pointer-events-none animate-nav">
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
        className="relative flex flex-col justify-between w-full min-h-[max(720px,100svh)] h-auto lg:h-screen overflow-hidden select-none bg-slate-100"
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
          <div className="absolute top-0 bottom-0 left-[max(5.6vw,1rem)] w-[1px] bg-slate-900/[0.05] dark:bg-white/[0.05]" />
          <div className="absolute top-0 bottom-0 right-[max(5.6vw,1rem)] w-[1px] bg-slate-900/[0.05] dark:bg-white/[0.05]" />

          {/* Top-Left Intersection Node */}
          <div className="absolute top-[34%] left-[max(5.6vw,1rem)] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <div className="w-2.5 h-2.5 border border-slate-900/[0.12] dark:border-white/[0.12] rounded-full absolute" />
            <span className="absolute left-4 top-2 text-[8px] font-mono text-slate-500/50">34.00_N</span>
          </div>

          {/* Bottom-Left Intersection Node */}
          <div className="absolute bottom-[max(9vw,5.5rem)] left-[max(5.6vw,1rem)] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <div className="w-2.5 h-2.5 border border-slate-900/[0.12] dark:border-white/[0.12] rounded-full absolute" />
            <span className="absolute left-4 -top-3.5 text-[8px] font-mono text-slate-500/50"></span>
          </div>

          {/* Top-Right Intersection Node */}
          <div className="absolute top-[34%] right-[max(5.6vw,1rem)] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
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
        <section className="absolute top-[30%] left-[max(5.6vw,1rem)] z-20 pointer-events-none lg:top-[34%]">
          <h1 className="font-sans font-light tracking-[-0.085em] leading-[0.93] text-slate-950 dark:text-black uppercase select-none text-[clamp(2.75rem,14vw,3.6rem)] lg:text-[clamp(5.4rem,6.2vw,6.8rem)] flex flex-col">
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
        <footer className="w-full mt-auto px-[max(5.6vw,1rem)] pb-[max(4vw,2.5rem)] flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 z-20 pointer-events-none">
          {/* Bottom Left: Intro paragraph and work CTA */}
          <div className="max-w-[420px] pointer-events-auto animate-intro">
            <p className="font-sans font-light text-slate-800 dark:text-black text-base lg:text-[1.125rem] leading-[1.6] select-none mb-6">
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
          <div className="font-mono text-xs lg:text-[0.8rem] tracking-[0.08em] leading-[1.3] text-slate-500/80 dark:text-slate-400/80 lg:text-right select-none animate-manifesto self-start lg:self-end">
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
            <span className="text-cyan-600 font-mono tracking-widest text-xs uppercase font-medium stagger-item stagger-delay-1 block mb-2">
              VERIFIABLE CREDENTIALS
            </span>
            <h2 className="font-sans font-light text-[2.25rem] md:text-[3rem] leading-[1.15] tracking-[-0.035em] text-slate-950 mt-2 mb-10 stagger-item stagger-delay-2 uppercase">
              Certifications & Core Courses.
            </h2>

            {/* Interactive Verification Portal */}
            <div 
              id="verification-portal" 
              className="mb-16 p-8 md:p-10 rounded-[2.5rem] border border-slate-200/50 bg-gradient-to-b from-slate-50/50 to-white/70 backdrop-blur-lg shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-cyan-100/30 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-100/30 rounded-full blur-2xl pointer-events-none" />
              
              <div className="max-w-3xl relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-medium text-cyan-700 bg-cyan-50 border border-cyan-100 uppercase tracking-wider mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                  Instant Verification Registry
                </span>
                <h3 className="text-2xl font-medium text-slate-900 mb-2">
                  Verify Credentials in Real-Time
                </h3>
                <p className="text-sm font-light text-slate-500 mb-8 max-w-2xl leading-relaxed">
                  Enter a Coursera Credential ID manually, or choose a course from the selector below. The system will retrieve cryptographically signed completion records.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  {/* Select Dropdown */}
                  <div className="md:col-span-5">
                    <label htmlFor="cert-select" className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2 font-medium">
                      Select Certificate
                    </label>
                    <select
                      id="cert-select"
                      className="w-full h-11 px-4 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-700 font-light transition-all appearance-none cursor-pointer"
                      style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1.25rem', backgroundRepeat: 'no-repeat' }}
                      value={verifyInput}
                      onChange={(e) => setVerifyInput(e.target.value)}
                    >
                      <option value="" disabled>-- Choose a course --</option>
                      {CERTIFICATES.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.title} ({c.issuer})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Manual ID Input */}
                  <div className="md:col-span-4">
                    <label htmlFor="cert-id-input" className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2 font-medium">
                      Or Paste Credential ID
                    </label>
                    <input
                      id="cert-id-input"
                      type="text"
                      placeholder="e.g. B7N3QQCUCEMC"
                      className="w-full h-11 px-4 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 font-light placeholder:text-slate-400 text-slate-800 transition-all uppercase tracking-wider"
                      value={verifyInput}
                      onChange={(e) => setVerifyInput(e.target.value)}
                    />
                  </div>

                  {/* Verify Button */}
                  <div className="md:col-span-3">
                    <button
                      onClick={() => handleVerify(verifyInput)}
                      disabled={!verifyInput.trim() || verifyStatus === "searching"}
                      className="w-full h-11 inline-flex items-center justify-center bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-sm font-medium transition-all hover:scale-[1.02] disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs hover:shadow-md cursor-pointer"
                    >
                      {verifyStatus === "searching" ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Verifying...
                        </span>
                      ) : (
                        "Verify Credential"
                      )}
                    </button>
                  </div>
                </div>

                {/* Verification Process / Results display */}
                {verifyStatus === "searching" && (
                  <div className="mt-8 p-5 bg-slate-900 text-slate-300 rounded-2xl font-mono text-xs border border-slate-800 shadow-inner">
                    <div className="flex items-center gap-2 mb-3 text-cyan-400 font-bold border-b border-slate-800 pb-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                      CR-SYSTEM CERTIFICATE AUTHENTICATION SERVICE
                    </div>
                    <div className="space-y-1.5 font-light">
                      {verifySteps.slice(0, currentStepIdx + 1).map((stepText, idx) => (
                        <div key={idx} className="flex items-start gap-2 animate-fadeIn">
                          <span className="text-cyan-500 font-bold">&gt;</span>
                          <span>{stepText}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {verifyStatus === "verified" && verificationResult && (
                  <div className="mt-8 p-6 md:p-8 bg-emerald-50/50 border border-emerald-200 rounded-[2rem] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 animate-fadeIn">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            SECURELY VERIFIED
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                            ID: {verificationResult.id}
                          </span>
                        </div>
                        <h4 className="text-lg font-medium text-slate-950 leading-snug mb-1">
                          {verificationResult.title}
                        </h4>
                        <p className="text-xs font-light text-slate-600">
                          Issued by <span className="font-semibold">{verificationResult.issuer}</span> &bull; Completed {verificationResult.date}
                        </p>
                        <p className="text-xs font-light text-slate-500 mt-1 italic">
                          Recipient: Chirag Khanna &bull; Registry Authenticator: Coursera Authority Node
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto shrink-0 border-t border-emerald-200/50 md:border-t-0 pt-4 md:pt-0">
                      <a
                        href={verificationResult.verificationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 md:flex-initial h-10 inline-flex items-center justify-center px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-all hover:scale-[1.02] gap-1.5 focus:outline-none"
                      >
                        Official Profile
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </a>
                      <button
                        onClick={() => {
                          setVerifyStatus("idle");
                          setVerifyInput("");
                          setVerificationResult(null);
                        }}
                        className="flex-1 md:flex-initial h-10 inline-flex items-center justify-center px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-all cursor-pointer focus:outline-none"
                      >
                        Reset Search
                      </button>
                    </div>
                  </div>
                )}

                {verifyStatus === "not_found" && (
                  <div className="mt-8 p-6 bg-rose-50/50 border border-rose-200 rounded-[2rem] shadow-xs flex items-start gap-4 animate-fadeIn">
                    <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-mono font-medium text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full uppercase tracking-wider block w-fit mb-1">
                        RECORD NOT FOUND
                      </span>
                      <h4 className="text-base font-medium text-slate-950 mb-1 leading-snug">
                        Could not resolve Credential ID
                      </h4>
                      <p className="text-xs font-light text-slate-600 max-w-lg leading-relaxed mb-3">
                        We could not verify any certificate associated with ID &quot;<span className="font-mono font-semibold text-rose-700">{verifyInput}</span>&quot;. Please verify the code matches one of the values below (e.g. B7N3QQCUCEMC) and try again.
                      </p>
                      <button
                        onClick={() => {
                          setVerifyStatus("idle");
                          setVerifyInput("");
                        }}
                        className="h-9 inline-flex items-center justify-center px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-all cursor-pointer focus:outline-none"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-100 pb-6 stagger-item stagger-delay-3">
              {[
                { id: "all", name: "All", count: CERTIFICATES.length },
                { id: "IBM", name: "IBM", count: CERTIFICATES.filter(c => c.issuer === "IBM").length },
                { id: "UC Irvine", name: "UC Irvine", count: CERTIFICATES.filter(c => c.issuer.includes("Irvine")).length },
                { id: "Chandigarh University", name: "Chandigarh Univ", count: CERTIFICATES.filter(c => c.issuer.includes("Chandigarh")).length },
                { id: "Board Infinity", name: "Board Infinity", count: CERTIFICATES.filter(c => c.issuer.includes("Board")).length },
                { id: "others", name: "Others", count: CERTIFICATES.filter(c => !["IBM", "University of California, Irvine", "Chandigarh University", "Board Infinity"].includes(c.issuer)).length },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setCertFilter(tab.id);
                    setShowAllCerts(false);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer flex items-center gap-1.5 focus:outline-none ${
                    certFilter === tab.id
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  {tab.name}
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    certFilter === tab.id
                      ? "bg-slate-800 text-slate-200"
                      : "bg-slate-200/60 text-slate-500"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Expandable Certificate Grid */}
            {(() => {
              const filteredCerts = CERTIFICATES.filter(c => {
                if (certFilter === "all") return true;
                if (certFilter === "others") {
                  return !["IBM", "University of California, Irvine", "Chandigarh University", "Board Infinity"].includes(c.issuer);
                }
                return c.issuer.includes(certFilter) || certFilter.includes(c.issuer);
              });
              
              const displayedCerts = showAllCerts ? filteredCerts : filteredCerts.slice(0, 8);

              return (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-item stagger-delay-4">
                    {displayedCerts.map((cert) => (
                      <div 
                        key={cert.id} 
                        className="p-6 bg-slate-50/40 border border-slate-200/50 rounded-2xl flex flex-col justify-between hover:border-slate-300/80 transition-all duration-300 hover:shadow-xs group"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[9px] font-mono font-medium text-cyan-600 uppercase tracking-widest">
                              {cert.type}
                            </span>
                            
                            {/* Visual Logo Badges */}
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-500 scale-95 uppercase font-medium">
                              {cert.issuer.includes("IBM") ? "IBM" :
                               cert.issuer.includes("Irvine") ? "UCI" :
                               cert.issuer.includes("Chandigarh") ? "CU" :
                               cert.issuer.includes("Board") ? "BI" :
                               cert.issuer.includes("Meta") ? "Meta" : "EDU"}
                            </span>
                          </div>
                          
                          <h3 className="text-sm font-medium text-slate-900 mb-1.5 leading-snug line-clamp-2 h-10 group-hover:text-cyan-700 transition-colors">
                            {cert.title}
                          </h3>
                          <p className="text-xs font-light text-slate-500 mb-6">{cert.issuer}</p>
                        </div>
                        
                        <div className="border-t border-slate-200/40 pt-4 mt-auto">
                          <div className="flex items-center justify-between mb-3 text-[10px] font-mono text-slate-400">
                            <span>{cert.date.toUpperCase()}</span>
                            <span>ID: {cert.id}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => triggerVerifyFromCard(cert.id)}
                              className="h-8 inline-flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[10px] font-medium transition-all hover:border-cyan-500 hover:text-cyan-600 focus:outline-none cursor-pointer"
                            >
                              Verify Instantly
                            </button>
                            <a
                              href={cert.verificationUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="h-8 inline-flex items-center justify-center bg-slate-950 hover:bg-slate-900 text-white rounded-lg text-[10px] font-medium transition-all gap-1 focus:outline-none"
                            >
                              Link
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Show More / Show Less buttons */}
                  {filteredCerts.length > 8 && (
                    <div className="flex justify-center mt-12">
                      <button
                        onClick={() => setShowAllCerts(!showAllCerts)}
                        className="h-10 inline-flex items-center justify-center px-6 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-full text-xs transition-all shadow-xs cursor-pointer focus:outline-none"
                      >
                        {showAllCerts ? (
                          <span className="flex items-center gap-1.5">
                            Collapse View
                            <svg className="w-3.5 h-3.5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            View All ({filteredCerts.length}) Certificates
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                          </span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
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
                <a href="https://linkedin.com/in/chiragkhanna04" target="_blank" rel="noreferrer" className="text-sm text-slate-800 hover:text-cyan-600 transition-colors font-medium break-all focus-visible:outline-none">
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
