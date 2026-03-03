import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart } from "lucide-react";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-subtle p-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-primary" fill="hsl(var(--primary))" />
            <h1 className="text-2xl font-bold">بوصلة العافية</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-3xl">
              سياسة الاستخدام والخصوصية
            </CardTitle>
            <p className="text-center text-muted-foreground">
              آخر تحديث: 3 أكتوبر 2025
            </p>
          </CardHeader>

          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-8 text-base leading-relaxed">
                {/* Introduction */}
                <div className="space-y-3">
                  <p>
                    مرحبًا بك في "بوصلة العافية". قبل استخدام خدماتنا، يرجى قراءة الشروط التالية بعناية. 
                    استخدامك للتطبيق يعني موافقتك الكاملة على هذه السياسة.
                  </p>
                </div>

                {/* Terms of Use */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-primary">أولاً: سياسة الاستخدام</h2>
                  
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">1. الغرض من التطبيق:</h3>
                    <ul className="list-disc list-inside space-y-2 mr-4">
                      <li>
                        "بوصلة العافية" هو منصة رقمية تهدف إلى مساعدتك في إدارة رحلتك الصحية وتسهيل 
                        التواصل بينك وبين مقدمي الرعاية الصحية (الأطباء، الصيدليات، المختبرات، والمستشفيات).
                      </li>
                      <li>
                        التطبيق ليس بديلاً عن الاستشارة الطبية المتخصصة ولا يقدم تشخيصًا طبيًا نهائيًا.
                      </li>
                      <li>
                        المعلومات والتوصيات المقدمة، بما في ذلك نتائج "محلل الأعراض"، هي لأغراض 
                        إرشادية وتوجيهية فقط.
                      </li>
                      <li>
                        القرار الطبي النهائي والمسؤولية تقع دائمًا على عاتق الطبيب المعتمد.
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">2. التزامات المستخدم:</h3>
                    <ul className="list-disc list-inside space-y-2 mr-4">
                      <li>أنت المسؤول الوحيد عن دقة وصحة المعلومات التي تقدمها في ملفك الصحي.</li>
                      <li>تتعهد باستخدام التطبيق لأغراض شخصية وقانونية فقط.</li>
                      <li>
                        تتعهد بعدم استخدام "مجتمعات الدعم" لنشر محتوى غير لائق، أو مضلل، أو يسيء للآخرين، 
                        أو يروج لمنتجات أو خدمات غير مرخصة.
                      </li>
                      <li>أنت المسؤول عن الحفاظ على سرية بيانات تسجيل الدخول الخاصة بك.</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">3. دور مقدمي الخدمة:</h3>
                    <ul className="list-disc list-inside space-y-2 mr-4">
                      <li>
                        مقدمو الخدمة (الأطباء، الصيادلة، إلخ) المسجلون في التطبيق هم أطراف مستقلة، 
                        والتطبيق هو مجرد وسيط لتسهيل التواصل.
                      </li>
                      <li>
                        "بوصلة العافية" غير مسؤول عن جودة الخدمة الطبية المقدمة، أو دقة التشخيص، 
                        أو فعالية العلاج.
                      </li>
                      <li>
                        التقييمات الموجودة في التطبيق تعكس آراء المستخدمين الآخرين ولا تمثل رأي 
                        إدارة التطبيق.
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">4. إخلاء المسؤولية:</h3>
                    <ul className="list-disc list-inside space-y-2 mr-4">
                      <li>نحن نسعى لتقديم معلومات دقيقة وموثوقة، ولكننا لا نضمن خلو التطبيق من الأخطاء.</li>
                      <li>استخدامك للتطبيق وجميع خدماته يقع على مسؤوليتك الشخصية.</li>
                      <li>
                        "بوصلة العافية" وفريق عمله يخلون مسؤوليتهم عن أي أضرار مباشرة أو غير مباشرة 
                        قد تنشأ عن استخدام أو عدم القدرة على استخدام التطبيق.
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Privacy Policy */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-primary">ثانياً: سياسة الخصوصية</h2>
                  
                  <p>
                    نحن في "بوصلة العافية" ندرك حساسية بياناتك الصحية، ونتعهد بحمايتها والحفاظ على سريتها.
                  </p>

                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">1. البيانات التي نجمعها:</h3>
                    <ul className="list-disc list-inside space-y-2 mr-4">
                      <li><strong>بيانات التسجيل:</strong> الاسم، البريد الإلكتروني.</li>
                      <li>
                        <strong>بيانات الملف الصحي:</strong> المعلومات التي تدخلها طواعية مثل تاريخ الميلاد، 
                        الجنس، الأمراض المزمنة، الحساسيات، الأدوية، إلخ.
                      </li>
                      <li>
                        <strong>المستندات المرفوعة:</strong> صور الوصفات ونتائج الفحوصات التي تقوم برفعها.
                      </li>
                      <li>
                        <strong>بيانات الاستخدام:</strong> معلومات حول كيفية تفاعلك مع التطبيق 
                        (بدون الكشف عن هويتك) لتحسين خدماتنا.
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">2. كيف نستخدم بياناتك؟</h3>
                    <ul className="list-disc list-inside space-y-2 mr-4">
                      <li>لتقديم خدمات التطبيق الأساسية (مثل تذكيرك بمواعيد الأدوية أو حجز المواعيد).</li>
                      <li>لتخصيص تجربتك وعرض محتوى قد يهمك.</li>
                      <li>للسماح بالتواصل بينك وبين مقدمي الخدمة الذين تختارهم.</li>
                      <li>
                        لأغراض التحليل الداخلي لتحسين وتطوير التطبيق (باستخدام بيانات مجهولة الهوية).
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">3. مشاركة البيانات:</h3>
                    <ul className="list-disc list-inside space-y-2 mr-4">
                      <li>نحن لا نبيع أو نؤجر بياناتك الشخصية لأي طرف ثالث.</li>
                      <li>
                        تتم مشاركة بياناتك فقط في الحالات التالية وبموافقتك:
                        <ul className="list-circle list-inside mr-6 mt-2 space-y-1">
                          <li>
                            <strong>مع مقدمي الخدمة:</strong> عند حجز موعد مع طبيب أو إرسال طلب فحص 
                            لمختبر، أنت من يقرر ما هي المعلومات التي ستتم مشاركتها من ملفك الصحي.
                          </li>
                          <li>
                            <strong>مع الصيدليات:</strong> عند طلب دواء، تتم مشاركة الوصفة أو أسماء 
                            الأدوية التي تحددها.
                          </li>
                          <li>
                            <strong>امتثالاً للقانون:</strong> قد نكشف عن معلوماتك إذا طُلب منا ذلك 
                            بموجب أمر قضائي أو قانوني.
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">4. أمان البيانات:</h3>
                    <ul className="list-disc list-inside space-y-2 mr-4">
                      <li>نستخدم تقنيات تشفير متقدمة (مثل SSL) لحماية بياناتك أثناء نقلها.</li>
                      <li>يتم تخزين بياناتك في خوادم سحابية آمنة تتبع معايير الأمان العالمية.</li>
                      <li>الوصول إلى بياناتك مقيد ومحصور بالخدمات التي تطلبها.</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">5. التحكم في بياناتك:</h3>
                    <ul className="list-disc list-inside space-y-2 mr-4">
                      <li>لديك الحق في الوصول إلى بياناتك وتعديلها في أي وقت من خلال ملفك الشخصي.</li>
                      <li>لديك الحق في حذف حسابك وبياناتك بشكل نهائي من خلال إعدادات التطبيق.</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">6. التغييرات على السياسة:</h3>
                    <p>
                      قد نقوم بتحديث هذه السياسة من وقت لآخر. سنقوم بإعلامك بأي تغييرات جوهرية 
                      عبر إشعار داخل التطبيق أو عبر البريد الإلكتروني.
                    </p>
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-3 bg-accent p-6 rounded-lg">
                  <h3 className="text-xl font-semibold">للتواصل معنا:</h3>
                  <p>
                    إذا كان لديك أي استفسارات حول سياسة الاستخدام أو الخصوصية، يرجى التواصل معنا 
                    من خلال قسم الدعم الفني في التطبيق.
                  </p>
                </div>
              </div>
            </ScrollArea>

            <div className="mt-6 flex gap-4 justify-center">
              <Button
                onClick={() => navigate(-1)}
                className="btn-medical"
              >
                فهمت وأوافق
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}