import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import { GraduationCap, Target, FileText, Calendar, User, TrendingUp, QrCode, UserPlus } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  const { user, roles } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [portrait, setPortrait] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [profileRes, portraitRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("student_portraits").select("*").eq("user_id", user.id).single(),
      ]);
      if (profileRes.data) setProfile(profileRes.data);
      if (portraitRes.data) setPortrait(portraitRes.data);
    };
    fetchData();
  }, [user]);

  const calculateProgress = () => {
    if (!profile || !portrait) return 0;
    let score = 0;
    if (profile.first_name) score += 15;
    if (profile.last_name) score += 15;
    if (portrait.gpa) score += 20;
    if (portrait.ielts_score || portrait.toefl_score) score += 20;
    if (portrait.interests?.length > 0) score += 15;
    if (portrait.preferred_countries?.length > 0) score += 15;
    return score;
  };

  const progress = calculateProgress();
  const displayName = profile?.first_name || user?.email?.split("@")[0] || "Студент";

  const statCards = [
    { icon: Target, label: "Целевые вузы", value: "0", color: "text-primary" },
    { icon: FileText, label: "Документы", value: "0", color: "text-secondary" },
    { icon: Calendar, label: "Консультации", value: portrait?.consultation_balance ?? 0, color: "text-accent" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Привет, {displayName}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {roles.includes("consultant") ? "Панель эксперта" : roles.includes("admin") ? "Панель администратора" : "Твой личный кабинет"}
          </p>
        </motion.div>

        {/* Profile Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-3xl border border-border/50 p-6 mb-6 shadow-card"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Профиль</p>
                <p className="text-xs text-muted-foreground">Заполни данные для точных рекомендаций</p>
              </div>
            </div>
            <span className="text-lg font-bold text-primary">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-card rounded-3xl border border-border/50 p-5 shadow-card"
            >
              <card.icon className={`w-6 h-6 ${card.color} mb-3`} />
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-sm text-muted-foreground">{card.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Role-specific actions */}
        {roles.includes("consultant") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-3xl border border-border/50 p-6 shadow-card mb-6"
          >
            <h2 className="text-lg font-heading font-bold text-foreground mb-4 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              Инструменты эксперта
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link to="/events" className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors">
                <QrCode className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Мероприятия</p>
                  <p className="text-xs text-muted-foreground">QR-коды и сбор лидов</p>
                </div>
              </Link>
            </div>
          </motion.div>
        )}

        {roles.includes("admin") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-3xl border border-border/50 p-6 shadow-card mb-6"
          >
            <h2 className="text-lg font-heading font-bold text-foreground mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Администрирование
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link to="/admin/invites" className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors">
                <UserPlus className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Приглашения</p>
                  <p className="text-xs text-muted-foreground">Пригласить экспертов</p>
                </div>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card rounded-3xl border border-border/50 p-6 shadow-card"
        >
          <h2 className="text-lg font-heading font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Следующие шаги
          </h2>
          <div className="space-y-3">
            {progress < 100 && (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary/5 border border-primary/10">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <p className="text-sm text-foreground">Заполни профиль — введи GPA и баллы IELTS</p>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50">
              <div className="w-2 h-2 rounded-full bg-muted-foreground" />
              <p className="text-sm text-foreground">Пройди AI-опросник для персональных рекомендаций</p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50">
              <div className="w-2 h-2 rounded-full bg-muted-foreground" />
              <p className="text-sm text-foreground">Выбери целевые вузы и программы</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
