/**
 * توليد اسم مستخدم فريد بناءً على الاسم الأول والأخير
 * @param firstName - الاسم الأول
 * @param lastName - الاسم الأخير
 * @returns اسم مستخدم فريد
 */
export function generateUsername(firstName: string, lastName: string): string {
  // إزالة المسافات والأحرف الخاصة
  const cleanFirstName = firstName.toLowerCase().trim();
  const cleanLastName = lastName.toLowerCase().trim();
  
  // توليد اسم مستخدم من الاسم الأول والأخير
  const baseUsername = `${cleanFirstName}.${cleanLastName}`;
  
  // إضافة رقم عشوائي لضمان الفرادة
  const randomNumber = Math.floor(Math.random() * 10000);
  
  return `${baseUsername}${randomNumber}`;
}

/**
 * توليد كلمة مرور قوية
 * @returns كلمة مرور قوية
 */
export function generatePassword(): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";
  
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = "";
  
  // إضافة حرف واحد من كل فئة
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // إضافة أحرف عشوائية إضافية
  for (let i = 0; i < 8; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // خلط الأحرف
  return password.split("").sort(() => Math.random() - 0.5).join("");
}

/**
 * التحقق من قوة كلمة المرور
 * @param password - كلمة المرور
 * @returns درجة القوة (0-100)
 */
export function getPasswordStrength(password: string): number {
  let strength = 0;
  
  // الطول
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (password.length >= 16) strength += 10;
  
  // الأحرف الكبيرة
  if (/[A-Z]/.test(password)) strength += 15;
  
  // الأحرف الصغيرة
  if (/[a-z]/.test(password)) strength += 15;
  
  // الأرقام
  if (/[0-9]/.test(password)) strength += 15;
  
  // الرموز الخاصة
  if (/[!@#$%^&*]/.test(password)) strength += 15;
  
  return Math.min(strength, 100);
}

/**
 * التحقق من صحة البريد الإلكتروني
 * @param email - البريد الإلكتروني
 * @returns true إذا كان البريد صحيحاً
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * التحقق من صحة رقم الهاتف (صيغة E.164)
 * @param phone - رقم الهاتف
 * @returns true إذا كان رقم الهاتف صحيحاً
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}
