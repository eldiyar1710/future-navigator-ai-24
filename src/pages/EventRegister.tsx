import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabaseAny as supabase } from "@/lib/supabase-helpers";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Calendar, MapPin } from "lucide-react";

interface EventData {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string | null;
  promo_code: string | null;
  custom_questions: { question: string }[];
}

const EventRegister = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!eventId) return;
    supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .eq("is_active", true)
      .single()
      .then(({ data }) => {
        if (data) {
          setEvent(data as unknown as EventData);
          if (user?.email) setEmail(user.email);
        }
        setLoading(false);
      });
  }, [eventId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    setSubmitting(true);

    const { error } = await supabase.from("event_registrations").insert({
      event_id: event.id,
      first_name: firstName.trim(),
      last_name: lastName.trim() || null,
      email: email.trim(),
      phone: phone.trim() || null,
      answers,
      user_id: user?.id || null,
    });

    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    } else {
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 text-center text-muted-foreground">Мероприятие не найдено</div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-16 px-4 flex items-center justify-center min-h-screen">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Вы зарегистрированы!</h1>
            <p className="text-muted-foreground">Спасибо за интерес к «{event.title}». Наш эксперт свяжется с вами в ближайшее время.</p>
            {event.promo_code && (
              <div className="mt-6 p-4 rounded-2xl bg-secondary/10 border border-secondary/20">
                <p className="text-sm text-muted-foreground mb-1">Ваш промокод</p>
                <p className="text-2xl font-bold text-secondary">{event.promo_code}</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 pb-16 px-4 flex items-center justify-center min-h-screen">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="bg-card rounded-3xl border border-border/50 p-8 shadow-card">
            <div className="mb-6">
              <h1 className="text-2xl font-heading font-bold text-foreground">{event.title}</h1>
              {event.description && <p className="text-muted-foreground text-sm mt-2">{event.description}</p>}
              <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                {event.location && (
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {event.location}</span>
                )}
                {event.event_date && (
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(event.event_date).toLocaleDateString("ru")}</span>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Имя *</Label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Имя" className="rounded-xl" required />
                </div>
                <div className="space-y-2">
                  <Label>Фамилия</Label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Фамилия" className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className="rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label>Телефон</Label>
                <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 ..." className="rounded-xl" />
              </div>

              {event.custom_questions?.length > 0 && event.custom_questions.map((q, i) => (
                <div key={i} className="space-y-2">
                  <Label>{q.question}</Label>
                  <Input
                    value={answers[q.question] || ""}
                    onChange={(e) => setAnswers({ ...answers, [q.question]: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              ))}

              <Button type="submit" disabled={submitting} className="w-full rounded-xl h-12">
                {submitting ? "Отправка..." : "Зарегистрироваться"}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EventRegister;
