import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Phone, AlertCircle, CheckCircle } from 'lucide-react';

export const OTPVerification: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState<'US' | 'YE'>('YE'); // US = +1, YE = +967
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);

  const phoneInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on inputs
  useEffect(() => {
    if (step === 'phone') {
      phoneInputRef.current?.focus();
    } else {
      otpInputRef.current?.focus();
    }
  }, [step]);

  const getFullPhoneNumber = () => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (countryCode === 'US') {
      return `+1${cleaned}`;
    } else {
      return `+967${cleaned}`;
    }
  };

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log("--- ATTEMPTING TO SEND OTP ---");
    
    if (!phoneNumber || phoneNumber.length < (countryCode === 'US' ? 10 : 9)) {
      setError(countryCode === 'US' ? "يرجى إدخال رقم هاتف أمريكي صحيح (10 أرقام)." : "يرجى إدخال رقم هاتف يمني صحيح (9 أرقام).");
      phoneInputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const formattedPhone = getFullPhoneNumber();
      console.log("Target Phone:", formattedPhone);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ phone_number: formattedPhone }),
        }
      );

      const data = await response.json();
      console.log("Supabase Response:", data);

      if (!response.ok) throw new Error(data.error || 'Failed to send OTP');

      setSuccess(true);
      setTimeout(() => {
        setStep('otp');
        setSuccess(false);
      }, 1500);
    } catch (err: any) {
      console.error("OTP Send Error:", err);
      setError(err.message);
      phoneInputRef.current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log("--- ATTEMPTING TO VERIFY OTP ---");
    
    if (!otpCode || otpCode.length < 6) {
      setError("يرجى إدخال رمز التحقق الكامل (6 أرقام).");
      otpInputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const formattedPhone = getFullPhoneNumber();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            phone_number: formattedPhone,
            otp_code: otpCode,
          }),
        }
      );

      const data = await response.json();
      console.log("Verify Response:", data);
      
      if (!response.ok) throw new Error(data.error || 'Verification failed');

      localStorage.setItem('wellness_compass_session', JSON.stringify(data.data));
      setSuccess(true);
      
      setTimeout(() => navigate('/home'), 1500);
    } catch (err: any) {
      console.error("OTP Verify Error:", err);
      setError(err.message);
      otpInputRef.current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex flex-col items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Heart className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">بوصلة العافية</h1>
          <p className="text-gray-600">التحقق من رقم الهاتف</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              {/* Country Code Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">اختر دولتك</label>
                <div className="grid grid-cols-2 gap-3" role="radiogroup">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={countryCode === 'YE'}
                    tabIndex={0}
                    onClick={() => setCountryCode('YE')}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') setCountryCode('US');
                    }}
                    className={`py-3 px-4 rounded-xl font-bold transition-all ${
                      countryCode === 'YE'
                        ? 'bg-teal-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🇾🇪 اليمن (+967)
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={countryCode === 'US'}
                    tabIndex={0}
                    onClick={() => setCountryCode('US')}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') setCountryCode('YE');
                    }}
                    className={`py-3 px-4 rounded-xl font-bold transition-all ${
                      countryCode === 'US'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🇺🇸 أمريكا (+1)
                  </button>
                </div>
              </div>

              {/* Phone Input */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-3">رقم الهاتف</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500 font-bold text-lg">
                    {countryCode === 'US' ? '+1' : '+967'}
                  </span>
                  <input
                    id="phone"
                    ref={phoneInputRef}
                    type="tel"
                    tabIndex={0}
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      setError(undefined);
                    }}
                    placeholder={countryCode === 'US' ? '7744971610' : '771234567'}
                    className="w-full pl-20 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {countryCode === 'US' ? 'أدخل 10 أرقام' : 'أدخل 9 أرقام'}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-700">تم إرسال الرمز بنجاح!</p>
                </div>
              )}

              {/* Send Button */}
              <button
                type="submit"
                disabled={isLoading || !phoneNumber}
                tabIndex={0}
                className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white py-3 rounded-xl font-bold hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? '⏳ جاري الإرسال...' : '📱 إرسال رمز التحقق'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              {/* OTP Display */}
              <div className="text-center">
                <p className="text-gray-600 mb-2">تم إرسال الرمز إلى</p>
                <p className="text-lg font-bold text-teal-600">{getFullPhoneNumber()}</p>
              </div>

              {/* OTP Input */}
              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-3">أدخل رمز التحقق</label>
                <input
                  id="otp"
                  ref={otpInputRef}
                  type="text"
                  tabIndex={0}
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setError(undefined);
                  }}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full text-center text-3xl tracking-widest font-bold py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {otpCode.length}/6 أرقام
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-700">تم التحقق بنجاح!</p>
                </div>
              )}

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isLoading || otpCode.length < 6}
                tabIndex={0}
                className="w-full bg-gradient-to-r from-sky-600 to-blue-600 text-white py-3 rounded-xl font-bold hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? '⏳ جاري التحقق...' : '✓ تأكيد الرمز'}
              </button>

              {/* Change Number Button */}
              <button
                type="button"
                tabIndex={0}
                onClick={() => {
                  setStep('phone');
                  setOtpCode('');
                  setError(undefined);
                }}
                className="w-full text-teal-600 font-semibold py-2 hover:text-teal-700 transition-colors"
              >
                ← تغيير الرقم
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-6">
          بوصلة العافية © 2026 | جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
};

export default OTPVerification;
