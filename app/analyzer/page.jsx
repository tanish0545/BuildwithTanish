"use client";

import { useState, useEffect } from "react";
import Card from "@/components/card";
import FileUpload from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, AlertTriangle, CheckCircle, Clock, FileText, Zap, MoreHorizontal } from "lucide-react";

export default function AnalyzerPage() {
  const [isDark, setIsDark] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [links, setLinks] = useState([]);
  const [mobileNumbers, setMobileNumbers] = useState([]);
  const [scanResults, setScanResults] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  // Theme on load
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (theme === "dark" || (!theme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Theme toggle
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

  // Load previous scan results
  useEffect(() => {
    const stored = localStorage.getItem("recentScans");
    if (stored) setScanResults(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("recentScans", JSON.stringify(scanResults));
  }, [scanResults]);

  // Threat detection logic
  const detectThreat = (item, type) => {
    if (type === "file") {
      const ext = item.name.split(".").pop().toLowerCase();
      if (["exe", "js", "bat", "scr"].includes(ext)) return "high";
      if (["doc", "pdf", "txt", "log"].includes(ext)) return "low";
      return "medium";
    }

    if (type === "link") {
      const suspiciousKeywords = ["free", "login", "verify", "bank", "update", "secure", "confirm"];
      const url = item.toLowerCase();
      if (url.includes("malware") || url.includes("phish")) return "high";
      if (suspiciousKeywords.some((kw) => url.includes(kw))) return "medium";
      return "low";
    }

    if (type === "mobile") {
      const valid = /^\+?\d{10,14}$/.test(item);
      const riskyPrefixes = ["123", "000", "999"];
      if (!valid) return "medium";
      if (riskyPrefixes.some((p) => item.startsWith(p))) return "high";
      return "low";
    }

    return "low";
  };

  const getStatusIcon = (level) => {
    switch (level) {
      case "high":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "medium":
        return <AlertTriangle className="h-5 w-5 text-secondary-foreground" />;
      case "low":
        return <CheckCircle className="h-5 w-5 text-chart-4" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const handleFileSelect = (files) => setUploadedFiles(Array.from(files));
  const handleAddLink = (e) => {
    e.preventDefault();
    const url = e.target.elements.link.value.trim();
    if (url) setLinks([...links, url]);
    e.target.reset();
  };
  const handleAddMobile = (e) => {
    e.preventDefault();
    const number = e.target.elements.mobile.value.trim();
    if (number) setMobileNumbers([...mobileNumbers, number]);
    e.target.reset();
  };

  const startScan = () => {
    if (uploadedFiles.length === 0 && links.length === 0 && mobileNumbers.length === 0)
      return alert("Add at least one file, link, or mobile number to scan.");

    setIsScanning(true);
    const results = [];

    uploadedFiles.forEach((file) => {
      const threatLevel = detectThreat(file, "file");
      results.push({
        id: Date.now() + Math.random(),
        type: "file",
        name: file.name,
        scanTime: new Date().toLocaleString(),
        threatLevel,
      });
    });

    links.forEach((link) => {
      const threatLevel = detectThreat(link, "link");
      results.push({
        id: Date.now() + Math.random(),
        type: "link",
        name: link,
        scanTime: new Date().toLocaleString(),
        threatLevel,
      });
    });

    mobileNumbers.forEach((number) => {
      const threatLevel = detectThreat(number, "mobile");
      results.push({
        id: Date.now() + Math.random(),
        type: "mobile",
        name: number,
        scanTime: new Date().toLocaleString(),
        threatLevel,
      });
    });

    setScanResults((prev) => [...results, ...prev]);
    setUploadedFiles([]);
    setLinks([]);
    setMobileNumbers([]);
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen bg-background p-6">
    {/* Theme toggle at top right */}
      <div className="flex justify-end mb-6">
        <Button onClick={toggleTheme}>{isDark ? "☀️ Light" : "🌙 Dark"}</Button>
      </div>
  <h1 className="text-3xl font-bold mb-2 text-foreground">ThreatScope Analyzer</h1>
      <p className="text-muted-foreground mb-6">Scan files, links, and mobile numbers for potential risks</p>

      {/* File Upload */}
      <Card title="Upload Files">
        <FileUpload
          onFileSelect={handleFileSelect}
          acceptedTypes={[".txt", ".pdf", ".log", ".doc", ".exe", ".js", ".bat", ".scr"]}
        />
        {uploadedFiles.length > 0 && (
          <ul className="mt-2 text-sm">
            {uploadedFiles.map((f, idx) => <li key={idx}>{f.name}</li>)}
          </ul>
        )}
      </Card>

      {/* Link input */}
      <Card title="Add Links" className="mt-4">
        <form onSubmit={handleAddLink} className="flex gap-2">
          <input name="link" type="text" placeholder="Enter URL" className="flex-1 p-2 border rounded" />
          <Button type="submit">Add</Button>
        </form>
        {links.length > 0 && <ul className="mt-2 text-sm">{links.map((l, i) => <li key={i}>{l}</li>)}</ul>}
      </Card>

      {/* Mobile input */}
      <Card title="Add Mobile Numbers" className="mt-4">
        <form onSubmit={handleAddMobile} className="flex gap-2">
          <input name="mobile" type="text" placeholder="Enter Mobile Number" className="flex-1 p-2 border rounded" />
          <Button type="submit">Add</Button>
        </form>
        {mobileNumbers.length > 0 && <ul className="mt-2 text-sm">{mobileNumbers.map((m, i) => <li key={i}>{m}</li>)}</ul>}
      </Card>

      {/* Scan Button */}
      <Button onClick={startScan} className="mt-6" disabled={isScanning}>
        {isScanning ? "Scanning..." : "Start Scan"}
      </Button>

      {/* Scan Results */}
      {scanResults.length > 0 && (
        <Card title="Scan Results" className="mt-6">
          <ul className="space-y-2">
            {scanResults.map((r) => (
              <li key={r.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  {getStatusIcon(r.threatLevel)}
                  <span>{r.name}</span>
                </div>
                <Badge variant={r.threatLevel === "high" ? "destructive" : r.threatLevel === "medium" ? "secondary" : "outline"}>
                  {r.threatLevel.toUpperCase()}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
