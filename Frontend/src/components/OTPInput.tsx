import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  isLoading?: boolean;
}

export default function OTPInput({ length = 6, onComplete, isLoading = false }: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    // Only take the last character entered
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Shift focus to next input
    if (value && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if OTP is complete
    const fullOtp = newOtp.join("");
    if (fullOtp.length === length) {
      onComplete(fullOtp);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").substring(0, length);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, i) => {
      if (i < length) newOtp[i] = char;
    });
    setOtp(newOtp);
    
    // Focus last character or next empty
    const lastIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[lastIndex]?.focus();

    if (pastedData.length === length) {
      onComplete(pastedData);
    }
  };

  return (
    <div className="flex justify-center gap-3">
      {otp.map((data, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          ref={(el) => (inputRefs.current[index] = el)}
          value={data}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          disabled={isLoading}
          className={cn(
            "w-12 h-14 md:w-16 md:h-20 text-center text-2xl font-black rounded-2xl border-2 transition-all outline-none shadow-sm",
            "bg-slate-50 border-slate-100 text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10",
            data ? "border-blue-500 bg-white" : "",
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          )}
        />
      ))}
    </div>
  );
}
