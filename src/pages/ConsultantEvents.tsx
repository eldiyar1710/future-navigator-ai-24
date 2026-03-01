import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabaseAny as supabase } from "@/lib/supabase-helpers";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, QrCode, Users, MapPin, Calendar, Copy, ExternalLink } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  promo_code: string | null;
  custom_questions: any[];
  event_date: string | null;
  is_active: boolean;
  created_at: string;
}

interface Registration {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  answers: any;
  created_at: string;
}

const ConsultantEvents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showQR, setShowQR] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [questions, setQuestions] = useState<string[]>([""]);

  useEffect(() => {
    if (user) fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("consultant_id", user!.id)
      .order("created_at", { ascending: false });
    if (data) setEvents(data as unknown as Event[]);
  };

  const fetchRegistrations = async (eventId: string) => {
    const { data } = await supabase
      .from("event_registrations")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });
    if (data) setRegistrations(data as unknown as Registration[]);
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    setLoading(true);
    const customQuestions = questions.filter((q) => q.trim());
    const code = promoCode.trim() || title.replace(/\s+/g, "").toUpperCase().slice(0, 8) + Math.floor(Math.random() * 100);

    const { error } = await supabase.from("events").insert({
      consultant_id: user!.id,
      title: title.trim(),
      description: description.trim() || null,
      location: location.trim() || null,
      promo_code: code,
      custom_questions: customQuestions.map((q) => ({ question: q })),
      event_date: eventDate || null,
    });

    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Мероприятие создано!" });
      setShowCreate(false);
      resetForm();
      fetchEvents();
    }
    setLoading(false);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLocation("");
    setPromoCode("");
    setEventDate("");
    setQuestions([""]);
  };

  const getRegistrationUrl = (eventId: string) =>
    `${window.location.origin}/event/${eventId}`;

  const copyUrl = (eventId: string) => {
    navigator.clipboard.writeText(getRegistrationUrl(eventId));
    toast({ title: "Ссылка скопирована!" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Мероприятия</h1>
            <p className="text-muted-foreground mt-1">Создавайте мероприятия и собирайте лиды</p>
          </div>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl gap-2">
                <Plus className="w-4 h-4" /> Новое
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg rounded-3xl">
              <DialogHeader>
                <DialogTitle className="font-heading">Создать мероприятие</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Название *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Мастер-класс в Haileybury" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Описание</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="О чём мероприятие..." className="rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Место</Label>
                    <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Алматы" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Дата</Label>
                    <Input type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Промокод</Label>
                  <Input value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} placeholder="HAILEY10 (автогенерация)" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Кастомные вопросы анкеты</Label>
                  {questions.map((q, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={q}
                        onChange={(e) => {
                          const nq = [...questions];
                          nq[i] = e.target.value;
                          setQuestions(nq);
                        }}
                        placeholder={`Вопрос ${i + 1}`}
                        className="rounded-xl"
                      />
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" onClick={() => setQuestions([...questions, ""])} className="text-xs">
                    + Добавить вопрос
                  </Button>
                </div>
                <Button onClick={handleCreate} disabled={loading || !title.trim()} className="w-full rounded-xl h-11">
                  {loading ? "Создание..." : "Создать мероприятие"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Events list */}
        <div className="space-y-4">
          {events.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <QrCode className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Нет мероприятий. Создайте первое!</p>
            </div>
          )}
          {events.map((evt, i) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-3xl border border-border/50 p-5 shadow-card"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-heading font-bold text-foreground">{evt.title}</h3>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                    {evt.location && (
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {evt.location}</span>
                    )}
                    {evt.event_date && (
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(evt.event_date).toLocaleDateString("ru")}</span>
                    )}
                    {evt.promo_code && (
                      <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-xs font-semibold">{evt.promo_code}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={() => { setShowQR(evt.id); }}>
                    <QrCode className="w-4 h-4" /> QR
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={() => copyUrl(evt.id)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-xl gap-1.5" onClick={() => { setSelectedEvent(evt); fetchRegistrations(evt.id); }}>
                    <Users className="w-4 h-4" /> Лиды
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* QR Modal */}
        <Dialog open={!!showQR} onOpenChange={() => setShowQR(null)}>
          <DialogContent className="max-w-sm rounded-3xl text-center">
            <DialogHeader>
              <DialogTitle className="font-heading">QR-код мероприятия</DialogTitle>
            </DialogHeader>
            {showQR && (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="p-4 bg-card rounded-2xl border border-border/50">
                  <QRCodeSVG value={getRegistrationUrl(showQR)} size={220} />
                </div>
                <p className="text-xs text-muted-foreground">Покажите на экране — студенты перейдут по ссылке</p>
                <Button variant="outline" className="rounded-xl gap-2" onClick={() => copyUrl(showQR)}>
                  <ExternalLink className="w-4 h-4" /> Скопировать ссылку
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Registrations Modal */}
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-2xl rounded-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">Лиды: {selectedEvent?.title}</DialogTitle>
            </DialogHeader>
            {registrations.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Пока нет регистраций</p>
            ) : (
              <div className="space-y-3 mt-4">
                {registrations.map((reg) => (
                  <div key={reg.id} className="p-4 rounded-2xl bg-muted/50 border border-border/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{reg.first_name} {reg.last_name || ""}</p>
                        <p className="text-sm text-muted-foreground">{reg.email}</p>
                        {reg.phone && <p className="text-sm text-muted-foreground">{reg.phone}</p>}
                      </div>
                      <span className="px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-bold">HOT LEAD</span>
                    </div>
                    {reg.answers && Object.keys(reg.answers).length > 0 && (
                      <div className="mt-3 space-y-1">
                        {Object.entries(reg.answers).map(([q, a]) => (
                          <p key={q} className="text-xs text-muted-foreground">
                            <span className="font-medium">{q}:</span> {String(a)}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ConsultantEvents;
