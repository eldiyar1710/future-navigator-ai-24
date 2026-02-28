import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export type DocumentStatus = "DRAFT" | "NEEDS_REVISION" | "APPROVED";

export interface Document {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  version: number;
  parent_id: string | null;
  status: DocumentStatus;
  reviewer_id: string | null;
  reviewer_notes: string | null;
  document_type: string | null;
  target_program_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useDocuments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Ошибка загрузки документов", description: error.message, variant: "destructive" });
    } else {
      setDocuments((data as Document[]) || []);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("documents-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "documents", filter: `user_id=eq.${user.id}` }, () => {
        fetchDocuments();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchDocuments]);

  const uploadDocument = async (file: File, documentType?: string, targetProgramId?: string, parentId?: string) => {
    if (!user) return null;

    // Determine version
    let version = 1;
    if (parentId) {
      const parent = documents.find((d) => d.id === parentId);
      if (parent) version = parent.version + 1;
    }

    const ext = file.name.split(".").pop();
    const baseName = file.name.replace(`.${ext}`, "");
    const fileName = parentId ? `${baseName}_v${version}.${ext}` : file.name;
    const filePath = `${user.id}/${Date.now()}_${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("student-documents")
      .upload(filePath, file);

    if (uploadError) {
      toast({ title: "Ошибка загрузки файла", description: uploadError.message, variant: "destructive" });
      return null;
    }

    const { data, error } = await supabase.from("documents").insert({
      user_id: user.id,
      file_name: fileName,
      file_path: filePath,
      version,
      parent_id: parentId || null,
      document_type: documentType || null,
      target_program_id: targetProgramId || null,
      status: "DRAFT",
    }).select().single();

    if (error) {
      toast({ title: "Ошибка сохранения документа", description: error.message, variant: "destructive" });
      return null;
    }

    toast({ title: "Документ загружен ✓", description: `${fileName} (v${version})` });
    return data as Document;
  };

  const getSignedUrl = async (filePath: string): Promise<string | null> => {
    const { data, error } = await supabase.functions.invoke("document-signed-url", {
      body: { file_path: filePath },
    });
    if (error || !data?.url) {
      toast({ title: "Ошибка получения ссылки", variant: "destructive" });
      return null;
    }
    return data.url;
  };

  // Group documents by chain (parent_id)
  const getDocumentChains = () => {
    const roots = documents.filter((d) => !d.parent_id);
    const chains: Record<string, Document[]> = {};
    for (const root of roots) {
      const chain = [root, ...documents.filter((d) => d.parent_id === root.id)];
      chain.sort((a, b) => a.version - b.version);
      chains[root.id] = chain;
    }
    // Also include orphan revisions that reference parents not in roots
    for (const doc of documents) {
      if (doc.parent_id && !roots.find((r) => r.id === doc.parent_id)) {
        if (!chains[doc.id]) chains[doc.id] = [doc];
      }
    }
    return chains;
  };

  return { documents, loading, uploadDocument, getSignedUrl, getDocumentChains, refetch: fetchDocuments };
}
