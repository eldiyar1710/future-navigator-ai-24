import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabaseAny as supabase } from "@/lib/supabase-helpers";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Mail, CheckCircle, Clock, Copy } from "lucide-react";

interface Invitation {
  id: string;
  email: string;
  role: string;
  token: string;
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
}

const AdminInvite = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    const { data } = await supabase
      .from("invitations")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setInvitations(data as Invitation[]);
  };

  const handleInvite = async () => {
    if (!email.trim() || !user) return;
    setLoading(true);

    const { error } = await supabase.from("invitations").insert({
      email: email.trim().toLowerCase(),
      role: "consultant",
      invited_by: user.id,
    });

    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Приглашение создано!" });
      setEmail("");
      fetchInvitations();
    }
    setLoading(false);
  };

  const getSignupUrl = (inv: Invitation) =>
    `${window.location.origin}/auth?invite=${inv.token}&email=${encodeURIComponent(inv.email)}`;

  const copyLink = (inv: Invitation) => {
    navigator.clipboard.writeText(getSignupUrl(inv));
    toast({ title: "Ссылка скопирована!" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 pb-16 px-4 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground">Приглашения</h1>
          <p className="text-muted-foreground mt-1">Пригласите экспертов на платформу</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-3xl border border-border/50 p-6 shadow-card mb-8">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="sr-only">Email эксперта</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="expert@email.com"
                className="rounded-xl"
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              />
            </div>
            <Button onClick={handleInvite} disabled={loading || !email.trim()} className="rounded-xl gap-2">
              <UserPlus className="w-4 h-4" /> Пригласить
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Эксперт получит ссылку для регистрации. При регистрации ему автоматически присвоится роль «Консультант».
          </p>
        </motion.div>

        <div className="space-y-3">
          {invitations.map((inv, i) => (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.03 }}
              className="bg-card rounded-2xl border border-border/50 p-4 shadow-card flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${inv.accepted_at ? "bg-accent/10" : "bg-secondary/10"}`}>
                  {inv.accepted_at ? <CheckCircle className="w-4 h-4 text-accent" /> : <Clock className="w-4 h-4 text-secondary" />}
                </div>
                <div>
                  <p className="font-medium text-foreground flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" /> {inv.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {inv.accepted_at ? `Принято ${new Date(inv.accepted_at).toLocaleDateString("ru")}` : `Истекает ${new Date(inv.expires_at).toLocaleDateString("ru")}`}
                  </p>
                </div>
              </div>
              {!inv.accepted_at && (
                <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => copyLink(inv)}>
                  <Copy className="w-4 h-4" />
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminInvite;
