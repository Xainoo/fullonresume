import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import Pusher from "pusher-js";
import { useTranslation } from "../i18n";

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY as string | undefined;
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER as
  | string
  | undefined;

export default function ChatRealtime() {
  const [messages, setMessages] = useState<
    Array<{ id?: string; user: string; text: string; ts: number }>
  >([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const { t } = useTranslation();
  const { user: authUser } = useAuth();

  const displayName = authUser
    ? authUser.name || authUser.email || t("guest_label")
    : t("guest_label");
  const pusherAvailable = Boolean(PUSHER_KEY);

  // load persisted messages on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/.netlify/functions/messages?op=list");
        if (!res.ok) return;
        const json = await res.json();
        if (Array.isArray(json.records)) {
          setMessages(json.records as any);
        }
      } catch {
        // ignore
      }
    }
    void load();
  }, []);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // auto-scroll to bottom when messages change
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // small timeout to allow DOM update
    setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 50);
  }, [messages]);

  useEffect(() => {
    if (!pusherAvailable) {
      // show a small local note in chat when Pusher isn't configured
      setMessages((m) => [
        ...m,
        {
          user: "system",
          text: t("realtime_disabled"),
          ts: Date.now(),
        },
      ]);
      return;
    }
    const opts: any = { useTLS: true };
    if (PUSHER_CLUSTER) opts.cluster = PUSHER_CLUSTER;
    const pusher = new Pusher(PUSHER_KEY as string, opts);
    const channel = pusher.subscribe("ai-chat");
    channel.bind("message", (data: any) => {
      // dedupe incoming messages to avoid duplicates when using optimistic echo
      setMessages((m) => {
        const incoming = {
          id: data.id,
          user: data.user || "bot",
          text: data.text,
          ts: data.ts || Date.now(),
        } as any;
        // if incoming has an id, prefer id-based dedupe
        const duplicate = incoming.id
          ? m.some((msg) => (msg as any).id === incoming.id)
          : m.some(
              (msg) =>
                msg.user === incoming.user &&
                msg.text === incoming.text &&
                Math.abs((msg.ts || 0) - incoming.ts) < 5000
            );
        if (duplicate) return m;
        return [...m, incoming];
      });
    });
    return () => {
      try {
        channel.unbind_all();
        pusher.unsubscribe("ai-chat");
        pusher.disconnect();
      } catch {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function send() {
    if (!text.trim()) return;
    setSending(true);
    try {
      // generate an id for exact deduplication
      const id =
        typeof crypto !== "undefined" && (crypto as any).randomUUID
          ? (crypto as any).randomUUID()
          : `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const msg: any = { id, user: "visitor", text, ts: Date.now() };
      // persist message to messages function for demo persistence and capture returned record
      let persistedRecord: any = null;
      try {
        const res = await fetch("/.netlify/functions/messages?op=add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(msg),
        });
        if (res.ok) {
          const json = await res.json();
          persistedRecord = json.record || null;
        }
      } catch (e) {
        // ignore persistence failures
      }

      if (pusherAvailable) {
        // post to Netlify function which will trigger Pusher server-side
        await fetch("/.netlify/functions/pusher-trigger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: msg.id,
            text,
            user: "visitor",
            ts: msg.ts,
          }),
        });
        // do NOT optimistically echo when Pusher is enabled; the server broadcast will arrive and be added
        setText("");
      } else {
        // if no Pusher, show the persisted record (or fallback to local msg)
        setMessages((m) => [...m, persistedRecord || msg]);
        setText("");
      }
    } catch (e) {
      console.error(e);
      setMessages((m) => [
        ...m,
        { user: "system", text: `Send failed: ${String(e)}`, ts: Date.now() },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="card p-3 mb-3">
      <h6 className="mb-2">{t("chat_title")}</h6>
      <div className="small text-muted mb-2">
        {t("logged_in_as")} {displayName}
      </div>

      <div
        style={{
          height: 360,
          overflow: "auto",
          border: "1px solid var(--card-border)",
          borderRadius: 6,
          padding: 8,
        }}
        ref={containerRef}
      >
        {messages.length === 0 && (
          <div className="small text-muted">{t("no_messages_yet")}</div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 6 }}>
            <strong style={{ fontSize: 12 }}>{m.user}</strong>
            <div style={{ fontSize: 14 }}>{m.text}</div>
            <div className="small text-muted">
              {new Date(m.ts).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex gap-2 mt-2">
        <input
          className="form-control form-control-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("type_message_placeholder")}
        />
        <button
          className="btn btn-sm btn-primary"
          onClick={() => void send()}
          disabled={sending || !text.trim()}
        >
          {t("send")}
        </button>
      </div>
    </div>
  );
}
