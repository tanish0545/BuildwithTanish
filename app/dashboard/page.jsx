"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import Card from "@/components/card";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CircleUser, Shield, CheckCircle, Zap } from "lucide-react";
import { Moon, Sun } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [recentScans, setRecentScans] = useState([]);
  const [feedback, setFeedback] = useState("");

  // Load recent scans from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("recentScans");
    if (stored) setRecentScans(JSON.parse(stored));
  }, []);

  // Save scans to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("recentScans", JSON.stringify(recentScans));
  }, [recentScans]);

  // Stats data
  const statsData = {
    totalFilesScanned: recentScans.length,
    threatsFound: recentScans.filter((r) => r.threatLevel === "high").length,
    riskDistribution: {
      high: recentScans.filter((r) => r.threatLevel === "high").length,
      medium: recentScans.filter((r) => r.threatLevel === "medium").length,
      low: recentScans.filter((r) => r.threatLevel === "low").length,
    },
  };

  //theme
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Security tips
  const securityTips = [
    "Always update your software",
    "Check suspicious links before clicking",
    "Use strong and unique passwords",
    "Scan files from unknown sources",
    "Backup important data regularly",
  ];

  const handleSubmitFeedback = () => {
    if (!feedback.trim()) return alert("Please enter feedback.");
    const existing = JSON.parse(localStorage.getItem("feedback") || "[]");
    localStorage.setItem("feedback", JSON.stringify([feedback, ...existing]));
    alert("Thank you for your feedback!");
    setFeedback("");
  };

  const statsInfo = [
    {
      title: "ThreatScope",
      description:
        "ThreatScope is a web application for analyzing files, links, and phone numbers for potential threats in real-time.",
      icon: Shield,
      color: "chart-3",
    },
    {
      title: "Usage",
      description: "No login required. Simply scan files, links, or phone numbers instantly.",
      icon: CheckCircle,
      color: "chart-4",
    },
    {
      title: "Goal",
      description: "Provide users with a simple, interactive tool to detect potential threats quickly and safely.",
      icon: Zap,
      color: "chart-2",
    },
    {
      title: "About developer",
      description: "Hi, I am Tanish, a BCA student passionate about cybersecurity and web development.",
      icon: CircleUser,
      color: "primary",
    },
  ];

  return (
  <div className="min-h-screen bg-background p-6">

      {/* Banner */}
      <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-lg mx-6 mt-6 flex flex-col items-center justify-center overflow-hidden">
        {/* Background particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full opacity-20 w-1 h-1 animate-particle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 5}s`,
              }}
            ></div>
          ))}
        </div>

        {/* Logo / Title */}
        <div className="relative z-10 flex flex-col items-center">
          <img
            src="/Logo.png"
            alt="ThreatScope Logo"
            className="w-20 h-20 mb-2 animate-pulse-slow"
          />
          <h1 className="text-3xl font-bold">Welcome to ThreatScope</h1>
          <p className="mt-2 text-center">
            Real-time Threat Analysis for Files, Links, and Mobile Numbers
          </p>
        </div>
        

        {/* Scanning line */}
        <div className="absolute bottom-0 left-0 w-full h-1 overflow-hidden">
          <div className="h-1 bg-white/50 w-1/3 animate-slide"></div>
        </div>
      </div>

      <main className="flex flex-col lg:flex-row p-6 gap-6 mt-6">
        {/* Left Column - Stats & Info */}
        <div className="flex-1 space-y-6">
          <p className="text-muted-foreground mb-4">
            ThreatScope is your interactive threat analyzer for files, links, and phone numbers.
          </p>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsInfo.map((stat, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-sm text-foreground mt-2">{stat.description}</p>
                  </div>
                  <div
                    className={`h-12 w-12 bg-${stat.color}/10 rounded-lg flex items-center justify-center`}
                  >
                    <stat.icon className={`h-6 w-6 text-${stat.color}`} />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Next Steps */}
          <Card title="Next Steps" description="Try the Threat Analyzer directly">
            <p className="text-sm text-muted-foreground mb-4">
              Go to the Analyzer page to upload files, scan links, or check phone numbers for potential threats.
            </p>
            <Button className="mt-2" onClick={() => router.push("/analyzer")}>
              Go to Analyzer
            </Button>
          </Card>
        </div>

        {/* Right Column - Security Tips & Feedback */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
          {/* Security Tips */}
          <Card>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
              Security Tips
            </h3>
            <ul className="list-disc list-inside text-xs space-y-1">
              {securityTips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </Card>

          {/* Feedback Section */}
          <Card>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
              Feedback
            </h3>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Your feedback..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="p-2 text-xs border rounded"
              />
              <button
                onClick={handleSubmitFeedback}
                className="bg-primary text-white text-xs py-1 rounded"
              >
                Submit
              </button>
            </div>
          </Card>
          {/* Theme toggle at top right */}
      <div className="flex justify-end mb-6">
        <Button onClick={toggleTheme}>{isDark ? "☀️ Light" : "🌙 Dark"}</Button>
      </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes slide {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-slide {
          animation: slide 2s linear infinite;
        }
        @keyframes particle {
          0% {
            transform: translateY(0) translateX(0) scale(0.5);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-10px) translateX(5px) scale(1);
            opacity: 0.5;
          }
          100% {
            transform: translateY(0) translateX(0) scale(0.5);
            opacity: 0.2;
          }
        }
        .animate-particle {
          animation: particle infinite ease-in-out;
        }
        .animate-pulse-slow {
          animation: pulse 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
