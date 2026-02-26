import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface OTPInputProps {
  phoneNumber: string;
  onSubmit: (otp: string) => void;
  onBack: () => void;
  isLoading: boolean;
  error?: string;
  success?: boolean;
  expiresIn?: number; // Time in seconds
}

export const OTPInput: React.FC<OTPInputProps> = ({
  phoneNumber,
  onSubmit,
  onBack,
  isLoading,
  error,
  success,
  expiresIn = 600, // 10 minutes default
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(expiresIn);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle input change
  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '');

    if (digit.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

    if (pastedData.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length && i < 6; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);

      // Focus last filled input or next empty
      const lastFilledIndex = Math.min(pastedData.length - 1, 5);
      inputRefs.current[lastFilledIndex]?.focus();
    }
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      onSubmit(otpCode);
    }
  };

  const isComplete = otp.every((digit) => digit !== '');
  const isExpired = timeLeft === 0;

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            أدخل رمز التحقق
          </h2>
          <p className="text-gray-600 text-sm">
            أرسلنا رمز التحقق إلى <span className="font-semibold">{phoneNumber}</span>
          </p>
        </div>

        {/* OTP Input Fields */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            رمز التحقق (6 أرقام)
          </label>

          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isLoading || success || isExpired}
                maxLength={1}
                className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg transition-all focus:outline-none ${
                  error && !success
                    ? 'border-red-500 bg-red-50 focus:border-red-600'
                    : success
                    ? 'border-green-500 bg-green-50 focus:border-green-600'
                    : 'border-gray-300 bg-white focus:border-teal-500'
                } ${isLoading || success || isExpired ? 'opacity-75 cursor-not-allowed' : ''}`}
              />
            ))}
          </div>

          {/* Paste hint */}
          <p className="text-xs text-gray-500 text-center">
            يمكنك لصق الرمز مباشرة
          </p>
        </div>

        {/* Timer */}
        <div
          className={`flex items-center justify-center gap-2 text-sm font-semibold ${
            isExpired ? 'text-red-600' : timeLeft < 60 ? 'text-orange-600' : 'text-gray-600'
          }`}
        >
          <Clock className="w-4 h-4" />
          {isExpired ? 'انتهت صلاحية الرمز' : `الوقت المتبقي: ${formatTime(timeLeft)}`}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900">
                تم التحقق بنجاح!
              </p>
            </div>
          </div>
        )}

        {/* Expired Message */}
        {isExpired && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">
                انتهت صلاحية الرمز. يرجى طلب رمز جديد.
              </p>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          {/* Back Button */}
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading || success}
            className="flex-1 py-3 px-4 rounded-lg font-semibold text-gray-700 border-2 border-gray-300 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            رجوع
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isComplete || isLoading || success || isExpired}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
              !isComplete || isLoading || success || isExpired
                ? 'bg-gray-400 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600 active:scale-95'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري التحقق...
              </span>
            ) : success ? (
              'تم التحقق'
            ) : isExpired ? (
              'انتهت الصلاحية'
            ) : (
              'تحقق'
            )}
          </button>
        </div>

        {/* Resend Option */}
        {isExpired && (
          <button
            type="button"
            onClick={onBack}
            className="w-full py-2 px-4 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
          >
            طلب رمز جديد
          </button>
        )}
      </form>
    </div>
  );
};

export default OTPInput;
