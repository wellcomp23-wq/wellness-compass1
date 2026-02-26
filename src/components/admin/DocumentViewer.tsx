import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, X } from "lucide-react";

interface DocumentViewerProps {
  applicationName: string;
  documentUrl: string;
  onClose?: () => void;
}

const DocumentViewer = ({ applicationName, documentUrl, onClose }: DocumentViewerProps) => {
  const handleDownload = () => {
    // محاكاة تحميل الملف
    const link = document.createElement("a");
    link.href = documentUrl;
    link.download = `${applicationName}_documents.pdf`;
    link.click();
  };

  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 pb-6 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-black flex items-center gap-2">
            <FileText className="w-5 h-5" /> عرض الوثائق
          </CardTitle>
          <CardDescription className="text-xs font-bold">{applicationName}</CardDescription>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-8">
        <div className="space-y-6">
          {/* Document Preview Area */}
          <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center min-h-96">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm font-bold text-muted-foreground text-center mb-4">
              تم استقبال الوثائق من {applicationName}
            </p>
            <p className="text-xs text-muted-foreground text-center mb-6">
              يمكنك تحميل الملف أو عرضه في نافذة جديدة
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleDownload}
                className="rounded-xl font-bold gap-2"
              >
                <Download className="w-4 h-4" /> تحميل الملف
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(documentUrl, "_blank")}
                className="rounded-xl font-bold"
              >
                عرض في نافذة جديدة
              </Button>
            </div>
          </div>

          {/* Document Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <p className="text-xs font-bold text-blue-900">
              📄 معلومات الملف: تم استقبال الوثائق الرسمية من المتقدم. يرجى مراجعة الملف والتأكد من صحة البيانات قبل الموافقة على الطلب.
            </p>
          </div>

          {/* Close Button */}
          {onClose && (
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full rounded-xl font-bold"
            >
              إغلاق
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentViewer;
