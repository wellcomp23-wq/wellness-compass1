import React, { useState, useCallback, useEffect } from 'react';
import { Phone, AlertCircle, CheckCircle } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error?: string;
  success?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  onSubmit,
  isLoading,
  error,
  success,
}) => {
  const [displayValue, setDisplayValue] = useState('');

  // Synchronize display value with prop value on mount
  useEffect(() => {
    if (value && !displayValue) {
      setDisplayValue(value);
    }
  }, [value, displayValue]);

  // Normalize Yemeni phone number
  const normalizePhoneNumber = useCallback((input: string): string => {
    const cleaned = input.replace(/\D/g, '');
    if (cleaned.startsWith('967')) return cleaned.substring(3);
    if (cleaned.startsWith('0')) return cleaned.substring(1);
    return cleaned;
  }, []);

  // Format phone number for display
  const formatPhoneDisplay = useCallback((phone: string): string => {
    if (phone.length === 0) return '';
    if (phone.length <= 3) return phone;
    if (phone.length <= 6) return `${phone.slice(0, 3)} ${phone.slice(3)}`;
    return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 9)}`;
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const normalized = normalizePhoneNumber(input);
    const formatted = formatPhoneDisplay(normalized);
    
    setDisplayValue(formatted);
    onChange(normalized);
  };

  // Validate phone number: Must be exactly 9 digits starting with 7 or 1
  const isValidPhone = (): boolean => {
    const normalized = value.replace(/\D/g, '');
    const valid = /^(7|1)\d{8}$/.test(normalized);
    return valid;
  };

  const handleSubmitClick = (e: React.MouseEvent<HTMLButtonElement> | React.FormEvent) => {
    e.preventDefault();
    console.log("--- BUTTON CLICKED IN PhoneInput ---");
    console.log("Value in component:", value);
    console.log("Is valid:", isValidPhone());
    
    if (isValidPhone()) {
      console.log("Calling onSubmit prop...");
      onSubmit();
    } else {
      console.warn("Submit blocked: Invalid phone number format");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            تحقق من رقم هاتفك
          </h2>
          <p className="text-gray-600 text-sm">
            سنرسل لك رمز التحقق عبر رسالة نصية
          </p>
        </div>

        {/* Phone Input Field */}
        <div className="relative">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            رقم الهاتف
          </label>

          <div className="relative flex items-center">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-teal-500 to-sky-500 text-white px-3 py-1 rounded-md text-sm font-semibold">
              +967
            </div>

            <input
              id="phone"
              type="tel"
              value={displayValue}
              onChange={handleInputChange}
              placeholder="771 234 567"
              disabled={isLoading || success}
              className={`w-full pl-20 pr-4 py-3 border-2 rounded-lg font-mono text-lg transition-all focus:outline-none ${
                error
                  ? 'border-red-500 bg-red-50 focus:border-red-600'
                  : success
                  ? 'border-green-500 bg-green-50 focus:border-green-600'
                  : 'border-gray-300 bg-white focus:border-teal-500'
              } ${isLoading || success ? 'opacity-75 cursor-not-allowed' : ''}`}
              inputMode="numeric"
              maxLength={15}
            />

            {success && (
              <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 w-5 h-5" />
            )}
            {error && !success && (
              <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 w-5 h-5" />
            )}
            {!error && !success && value && (
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            )}
          </div>

          <p className="mt-2 text-xs text-gray-500">
            أدخل رقم هاتفك المكون من 9 أرقام (مثال: 771234567)
          </p>
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
                تم إرسال رمز التحقق بنجاح!
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmitClick}
          disabled={!isValidPhone() || isLoading || success}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
            !isValidPhone() || isLoading || success
              ? 'bg-gray-400 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600 active:scale-95 shadow-md hover:shadow-lg'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              جاري الإرسال...
            </span>
          ) : success ? (
            'تم الإرسال'
          ) : (
            'إرسال رمز التحقق'
          )}
        </button>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-900">
            <span className="font-semibold">ملاحظة:</span> سيصلك الرمز على الرقم الموثق في حساب Twilio (لأن الحساب تجريبي).
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhoneInput;
