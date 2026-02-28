import { useState, useRef } from "react";
import { Upload, FileText, Eye, Clock, CheckCircle2, AlertTriangle, UploadCloud, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDocuments, Document, DocumentStatus } from "@/hooks/useDocuments";
import { motion, AnimatePresence } from "framer-motion";

const statusConfig: Record<DocumentStatus, { label: string; icon: React.ElementType; className: string }> = {
  DRAFT: { label: "Черновик", icon: Clock, className: "bg-muted text-muted-foreground" },
  NEEDS_REVISION: { label: "На доработку", icon: AlertTriangle, className: "bg-secondary/10 text-secondary" },
  APPROVED: { label: "Одобрен", icon: CheckCircle2, className: "bg-accent/10 text-accent" },
};

const documentTypes = [
  { value: "motivation_letter", label: "Мотивационное письмо" },
  { value: "cv", label: "Резюме / CV" },
  { value: "passport", label: "Паспорт" },
  { value: "transcript", label: "Аттестат / Транскрипт" },
  { value: "certificate", label: "Сертификат (IELTS/TOEFL)" },
  { value: "other", label: "Другое" },
];

export default function DocumentUpload() {
  const { documents, loading, uploadDocument, getSignedUrl, getDocumentChains } = useDocuments();
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState("other");
  const [expandedChain, setExpandedChain] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const revisionInputRef = useRef<HTMLInputElement>(null);
  const [revisionParentId, setRevisionParentId] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await uploadDocument(file, selectedType);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRevisionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !revisionParentId) return;
    setUploading(true);
    await uploadDocument(file, undefined, undefined, revisionParentId);
    setUploading(false);
    setRevisionParentId(null);
    if (revisionInputRef.current) revisionInputRef.current.value = "";
  };

  const handleView = async (filePath: string) => {
    const url = await getSignedUrl(filePath);
    if (url) window.open(url, "_blank");
  };

  const startRevision = (parentId: string) => {
    setRevisionParentId(parentId);
    revisionInputRef.current?.click();
  };

  const chains = getDocumentChains();
  const chainEntries = Object.entries(chains);

  if (loading) {
    return (
      <div className="p-6 rounded-xl bg-card shadow-card border border-border/50 animate-pulse">
        <div className="h-6 bg-muted rounded w-40 mb-4" />
        <div className="h-20 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <div className="p-6 rounded-xl bg-card shadow-card border border-border/50">
        <h3 className="font-heading font-semibold text-foreground flex items-center gap-2 mb-4">
          <UploadCloud className="w-5 h-5 text-primary" /> Загрузить документ
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {documentTypes.map((t) => (
            <button
              key={t.value}
              onClick={() => setSelectedType(t.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedType === t.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div
          className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-1">
            {uploading ? "Загрузка..." : "Нажмите или перетащите файл"}
          </p>
          <p className="text-xs text-muted-foreground">PDF, JPG, DOCX — до 10MB</p>
        </div>
        <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.docx,.doc" onChange={handleUpload} />
        <input ref={revisionInputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.docx,.doc" onChange={handleRevisionUpload} />
      </div>

      {/* Document list */}
      {chainEntries.length > 0 && (
        <div className="p-6 rounded-xl bg-card shadow-card border border-border/50">
          <h3 className="font-heading font-semibold text-foreground flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" /> Мои документы
          </h3>
          <div className="space-y-3">
            {chainEntries.map(([rootId, chain]) => {
              const latest = chain[chain.length - 1];
              const conf = statusConfig[latest.status as DocumentStatus] || statusConfig.DRAFT;
              const StatusIcon = conf.icon;
              const typeLabel = documentTypes.find((t) => t.value === latest.document_type)?.label || latest.document_type || "Документ";
              const isExpanded = expandedChain === rootId;

              return (
                <div key={rootId} className="rounded-lg border border-border/50 overflow-hidden">
                  <div className="flex items-center justify-between p-4 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{latest.file_name}</p>
                        <p className="text-xs text-muted-foreground">{typeLabel} · v{latest.version}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge className={`${conf.className} gap-1 text-xs`}>
                        <StatusIcon className="w-3 h-3" />
                        {conf.label}
                      </Badge>
                      {latest.reviewer_notes && (
                        <span className="text-xs text-muted-foreground max-w-[120px] truncate hidden sm:inline" title={latest.reviewer_notes}>
                          💬 {latest.reviewer_notes}
                        </span>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleView(latest.file_path)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {latest.status === "NEEDS_REVISION" && (
                        <Button variant="outline" size="sm" onClick={() => startRevision(rootId)} className="gap-1 text-xs">
                          <Upload className="w-3 h-3" /> Исправить
                        </Button>
                      )}
                      {chain.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => setExpandedChain(isExpanded ? null : rootId)}>
                          <History className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && chain.length > 1 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border/50 bg-muted/30"
                      >
                        <div className="p-3 space-y-2">
                          <p className="text-xs font-medium text-muted-foreground mb-2">История версий</p>
                          {chain.map((doc) => {
                            const dConf = statusConfig[doc.status as DocumentStatus] || statusConfig.DRAFT;
                            const DIcon = dConf.icon;
                            return (
                              <div key={doc.id} className="flex items-center justify-between text-xs p-2 rounded-md bg-card">
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">v{doc.version}</span>
                                  <span className="text-foreground">{doc.file_name}</span>
                                  <Badge className={`${dConf.className} gap-1 text-[10px] px-1.5 py-0`}>
                                    <DIcon className="w-2.5 h-2.5" />
                                    {dConf.label}
                                  </Badge>
                                </div>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleView(doc.file_path)}>
                                  <Eye className="w-3 h-3" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
