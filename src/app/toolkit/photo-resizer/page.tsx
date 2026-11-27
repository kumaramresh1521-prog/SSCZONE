"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Image as ImageIcon,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sliders,
  ShieldCheck,
  ArrowLeft,
  FileCheck,
  HelpCircle,
  ChevronDown,
  BookOpen,
  ArrowRight
} from "lucide-react";

export default function SSCPhotoResizerPage() {
  const [mode, setMode] = useState<"photo" | "signature">("photo");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  // Dimensions & Compression
  const [quality, setQuality] = useState<number>(0.85);
  const [resizedDataUrl, setResizedDataUrl] = useState<string | null>(null);
  const [resizedSizeBytes, setResizedSizeBytes] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Specs
  const specs = mode === "photo" 
    ? {
        name: "Passport Size Photo",
        widthCm: "3.5 cm",
        heightCm: "4.5 cm",
        pxWidth: 350,
        pxHeight: 450,
        minKb: 20,
        maxKb: 50,
        filename: "ssc_photo_20to50kb.jpg"
      }
    : {
        name: "Candidate Signature",
        widthCm: "4.0 cm",
        heightCm: "2.0 cm",
        pxWidth: 400,
        pxHeight: 200,
        minKb: 10,
        maxKb: 20,
        filename: "ssc_signature_10to20kb.jpg"
      };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (imageSrc) {
      processImage();
    }
  }, [imageSrc, mode, quality]);

  const processImage = () => {
    if (!imageSrc) return;
    setIsProcessing(true);

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = specs.pxWidth;
      canvas.height = specs.pxHeight;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Fill white background for signature/photo clarity
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, specs.pxWidth, specs.pxHeight);

        // Aspect ratio cover algorithm
        const imgAspect = img.width / img.height;
        const targetAspect = specs.pxWidth / specs.pxHeight;
        let drawWidth = specs.pxWidth;
        let drawHeight = specs.pxHeight;
        let offsetX = 0;
        let offsetY = 0;

        if (imgAspect > targetAspect) {
          drawWidth = specs.pxHeight * imgAspect;
          offsetX = (specs.pxWidth - drawWidth) / 2;
        } else {
          drawHeight = specs.pxWidth / imgAspect;
          offsetY = (specs.pxHeight - drawHeight) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

        // Export as JPEG with targeted quality compression
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        setResizedDataUrl(dataUrl);

        // Calculate file size in Bytes from Data URL
        const stringLength = dataUrl.length - "data:image/jpeg;base64,".length;
        const sizeInBytes = Math.round(stringLength * (3 / 4));
        setResizedSizeBytes(sizeInBytes);
      }
      setIsProcessing(false);
    };
  };

  const fileSizeKb = Math.round(resizedSizeBytes / 1024);
  const isSizeValid = fileSizeKb >= specs.minKb && fileSizeKb <= specs.maxKb;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white py-10 px-4 sm:px-6 shadow-md">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs font-bold text-emerald-200 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/toolkit" className="hover:text-white transition-colors">Candidate Toolkit</Link>
            <span>/</span>
            <span className="text-white">Photo &amp; Signature Resizer</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white text-emerald-700 flex items-center justify-center font-black shadow-lg shrink-0">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  SSC Photo &amp; Signature Resizer Tool 2026
                </h1>
                <p className="text-emerald-100 text-xs sm:text-sm mt-0.5 font-medium">
                  Crop &amp; format your photo (20-50 KB) &amp; signature (10-20 KB) to SSC CGL / CHSL upload specifications.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold border border-white/20 self-start sm:self-auto">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>100% In-Browser Private</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
        
        {/* MODE SELECTOR TABS */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <button
            onClick={() => setMode("photo")}
            className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 border shadow-sm ${
              mode === "photo"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20"
                : "bg-white text-slate-700 border-slate-200 hover:border-emerald-400"
            }`}
          >
            <ImageIcon className="w-4 h-4" /> Passport Photo (20 KB – 50 KB)
          </button>
          
          <button
            onClick={() => setMode("signature")}
            className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 border shadow-sm ${
              mode === "signature"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20"
                : "bg-white text-slate-700 border-slate-200 hover:border-emerald-400"
            }`}
          >
            <FileCheck className="w-4 h-4" /> Signature (10 KB – 20 KB)
          </button>
        </div>

        {/* UPLOAD & PROCESSING CARD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-lg">
          
          {/* LEFT: UPLOAD & CONTROLS */}
          <div>
            <h3 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-600" /> Step 1: Upload Image File
            </h3>

            <label className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all text-center mb-6">
              <Upload className="w-8 h-8 text-emerald-600 mb-2" />
              <span className="text-xs font-extrabold text-slate-800">Click or Drag & Drop {specs.name}</span>
              <span className="text-[10px] text-slate-500 mt-1">Supports JPG, JPEG, PNG</span>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>

            {/* SPECS SUMMARY BOX */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
              <p className="font-extrabold text-slate-900 border-b border-slate-200 pb-1.5">
                SSC Guidelines for {specs.name}:
              </p>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>Dimensions: <b>{specs.widthCm} x {specs.heightCm}</b></div>
                <div>Format: <b>JPEG / JPG</b></div>
                <div>Min Size: <b>{specs.minKb} KB</b></div>
                <div>Max Size: <b>{specs.maxKb} KB</b></div>
              </div>
            </div>

            {/* QUALITY COMPRESSION SLIDER */}
            {imageSrc && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-emerald-600" /> Fine-Tune Compression Size
                  </span>
                  <span className="text-emerald-700 font-extrabold">{Math.round(quality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
            )}
          </div>

          {/* RIGHT: PREVIEW & DOWNLOAD */}
          <div className="flex flex-col items-center justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
            <div className="w-full text-center">
              <h3 className="text-base font-black text-slate-900 mb-4 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Step 2: Form-Ready Preview
              </h3>

              {resizedDataUrl ? (
                <div className="flex flex-col items-center">
                  {/* IMAGE PREVIEW FRAME */}
                  <div
                    className="border-2 border-slate-300 rounded-xl overflow-hidden bg-white shadow-md p-1 mb-4 flex items-center justify-center"
                    style={{
                      width: mode === "photo" ? "140px" : "240px",
                      height: mode === "photo" ? "180px" : "120px"
                    }}
                  >
                    <img
                      src={resizedDataUrl}
                      alt="SSC Form Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* FILE SIZE VALIDATION BADGE */}
                  <div className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 mb-4 border ${
                    isSizeValid 
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800" 
                      : "bg-amber-50 border-amber-300 text-amber-900"
                  }`}>
                    {isSizeValid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
                    <span>File Size: {fileSizeKb} KB ({isSizeValid ? "Valid for SSC Form" : `Target: ${specs.minKb}-${specs.maxKb} KB`})</span>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-xs">
                  <ImageIcon className="w-12 h-12 text-slate-300 mb-2" />
                  <span>Upload an image to generate form-ready preview</span>
                </div>
              )}
            </div>

            {/* DOWNLOAD BUTTON */}
            {resizedDataUrl && (
              <a
                href={resizedDataUrl}
                download={specs.filename}
                className={`w-full py-4 rounded-2xl font-black text-xs tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isSizeValid
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                    : "bg-amber-500 hover:bg-amber-600 text-slate-950"
                }`}
              >
                <Download className="w-4 h-4" />
                <span>Download Form-Ready {specs.name} ({fileSizeKb} KB)</span>
              </a>
            )}
          </div>
        </div>

        {/* 100% PRIVATE SECURITY BANNER */}
        <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-5 text-center text-xs font-bold text-slate-600 flex items-center justify-center gap-2 shadow-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>100% Privacy Guaranteed: Your photos & signatures are processed inside your browser and NEVER uploaded to any server.</span>
        </div>

        {/* SSC SPECIFICATIONS REFERENCE TABLE */}
        <div className="mt-12 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black uppercase tracking-wider mb-2">
              <FileCheck className="w-3.5 h-3.5" /> Form Guidelines
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Staff Selection Commission (SSC) Photo &amp; Signature Criteria
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Strict rules enforced during online application verification for SSC CGL, CHSL, CPO, MTS, and GD exams.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-50 text-slate-900 font-black uppercase tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Parameter</th>
                  <th className="py-3 px-4 text-emerald-700">Passport Photograph</th>
                  <th className="py-3 px-4 text-blue-700">Candidate Signature</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">Allowed File Size</td>
                  <td className="py-3 px-4 text-emerald-700 font-black">20.0 KB to 50.0 KB</td>
                  <td className="py-3 px-4 text-blue-700 font-black">10.0 KB to 20.0 KB</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">Dimensions in cm</td>
                  <td className="py-3 px-4">3.5 cm (width) × 4.5 cm (height)</td>
                  <td className="py-3 px-4">4.0 cm (width) × 2.0 cm (height)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">Pixel Resolution</td>
                  <td className="py-3 px-4 font-mono">Approx. 350 × 450 px</td>
                  <td className="py-3 px-4 font-mono">Approx. 400 × 200 px</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">File Format</td>
                  <td className="py-3 px-4">JPEG / JPG only</td>
                  <td className="py-3 px-4">JPEG / JPG only</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">Background</td>
                  <td className="py-3 px-4">Plain light / white background</td>
                  <td className="py-3 px-4">Plain white paper, black/blue ink</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* CRITICAL REJECTION WARNINGS */}
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 space-y-3">
            <h3 className="text-sm font-black text-amber-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Top 5 Reasons SSC Rejects Application Forms:
            </h3>
            <ul className="text-xs text-amber-950 space-y-2 font-medium">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold shrink-0">1.</span>
                <span><b>Wearing Cap, Spectacles, or Goggles:</b> SSC strictly rejects any photo with eyewear (including power glasses) or head coverings that obscure facial features.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold shrink-0">2.</span>
                <span><b>Blurry or Distorted Aspect Ratio:</b> Stretching or squishing photos makes facial recognition fail at examination centers.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold shrink-0">3.</span>
                <span><b>Dark or Patterned Background:</b> Photos taken against outdoor trees, curtains, or dark walls are instantly rejected.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold shrink-0">4.</span>
                <span><b>Selfies or Side Angles:</b> Both ears and full frontal face must be clearly visible and evenly illuminated.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold shrink-0">5.</span>
                <span><b>Incorrect File Size:</b> Uploading photos under 20 KB or over 50 KB triggers a form validation error on the SSC portal.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* HOW TO RESIZE IN 4 EASY STEPS */}
        <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> Step-by-Step Instructions
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              How to Resize Photos &amp; Signatures for SSC Online Applications
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Follow these simple steps to ensure your files meet strict SSC validation criteria.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="text-xs font-black text-slate-900">Select Mode</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Choose between <b>Passport Photo</b> (20-50 KB, 3.5×4.5 cm) or <b>Candidate Signature</b> (10-20 KB, 4.0×2.0 cm).
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="text-xs font-black text-slate-900">Upload Image</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Click upload or drag and drop your original image (JPEG, PNG, or WebP). All processing stays inside your browser.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="text-xs font-black text-slate-900">Adjust File Size</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Use the compression slider if needed until the live size badge turns green (<span className="text-emerald-700 font-bold">Valid for SSC Form</span>).
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                4
              </span>
              <h3 className="text-xs font-black text-slate-900">Download JPEG</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Click "Download Form-Ready JPEG" to save the calibrated, correctly dimensioned file ready for instant upload.
              </p>
            </div>
          </div>
        </div>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-2">
              <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              SSC Photo &amp; Signature Resizer FAQs
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Clear answers to the most common questions regarding SSC photograph and signature uploads.
            </p>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {[
              {
                q: "Do I need to write my name and date on the photo for SSC CGL 2025/2026?",
                a: "No! Staff Selection Commission has officially discontinued the requirement of printing candidate name and date on the passport photo. However, the photo must be recent (not older than 3 months from the date of notification) and taken without spectacles or caps."
              },
              {
                q: "Can I wear power reading spectacles in my SSC application photo?",
                a: "No. SSC rules state in examination guidelines that photographs wearing spectacles, eyewear, tinted glasses, or goggles will be straightaway REJECTED. Even if you wear regular prescription glasses, you MUST take off your glasses for the application photograph."
              },
              {
                q: "What ink color should be used for the candidate signature?",
                a: "You should sign on clean, unruled white paper with either blue or black ink. Do NOT use red, green, or gel pens with excessive ink bleeding, as the signature must be crisp and legible."
              },
              {
                q: "What should I do if my resized photo is slightly over 50 KB?",
                a: "Simply drag the compression quality slider on the tool slightly to the left (e.g. from 85% to 75%). The file size will decrease immediately while preserving sharpness and clarity until the green 'Valid for SSC Form' badge appears."
              },
              {
                q: "Is live webcam photo required on the new SSC portal?",
                a: "Yes, on the new SSC One-Time Registration (OTR) portal (ssc.gov.in), candidates must capture a live photo during form submission AND also upload scanned photographs/signatures as required. This tool prepares your offline scanned photo and signature to exact dimensions."
              }
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "transform rotate-180 text-emerald-700" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RELATED CANDIDATE TOOLS */}
        <div className="mt-8 bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="text-center mb-6">
            <span className="px-3 py-1 rounded-full bg-teal-500/30 text-teal-200 font-extrabold text-[11px] uppercase border border-teal-400/30">
              More Free Tools
            </span>
            <h3 className="text-xl font-black text-white mt-2">
              Explore Other Essential SSC Candidate Utilities
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "SSC Age Calculator", desc: "Calculate exact years, months, and days on crucial cutoff dates.", href: "/toolkit/age-calculator" },
              { title: "SSC Typing Test Practice", desc: "2000 Key Depressions in 15 mins exam hall interface.", href: "/typing" },
              { title: "SSC Rank Predictor", desc: "Calculate raw marks and shift difficulty normalization score.", href: "/toolkit/rank-predictor" },
              { title: "Master Syllabus Tracker", desc: "Track chapter-wise 3-pillar progress for CGL, CHSL, CPO.", href: "/syllabus" },
            ].map((t, idx) => (
              <Link
                key={idx}
                href={t.href}
                className="bg-white/5 border border-white/10 hover:border-teal-400/40 p-4 rounded-2xl flex flex-col justify-between group transition-all hover:bg-white/10"
              >
                <div>
                  <h4 className="text-xs font-black text-white group-hover:text-amber-300 transition-colors mb-1">
                    {t.title}
                  </h4>
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {t.desc}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-amber-300">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
