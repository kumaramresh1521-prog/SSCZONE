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
  FileCheck
} from "lucide-react";

export default function SSCPhotoResizerPage() {
  const [mode, setMode] = useState<"photo" | "signature">("photo");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  
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
        name: "Official Signature",
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
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white py-8 px-4 sm:px-6 shadow-md">
        <div className="max-w-5xl mx-auto">
          <Link href="/toolkit" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-100 hover:text-white mb-3">
            <ArrowLeft className="w-4 h-4" /> Back to SSC Toolkit
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-emerald-700 flex items-center justify-center font-black shadow-md">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                SSC Photo & Signature Resizer Tool
              </h1>
              <p className="text-emerald-100 text-xs sm:text-sm mt-0.5 font-medium">
                Crop & format your photo (20-50 KB) & signature (10-20 KB) to official SSC CGL / CHSL upload specifications.
              </p>
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
            <FileCheck className="w-4 h-4" /> Official Signature (10 KB – 20 KB)
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
                Official SSC Guidelines for {specs.name}:
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
      </div>
    </div>
  );
}
