import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Salt Lake Puja Trail 2026 — Pandal Hopping Checklist" },
      { name: "description", content: "A maximalist Durga Puja 2026 pandal-hopping checklist for Salt Lake, Bidhannagar: EC, FD, AK, BJ Block and Labony Estate." },
      { property: "og:title", content: "Salt Lake Puja Trail 2026" },
      { property: "og:description", content: "Five Salt Lake pandals, Google Maps links, a route plan and a packing checklist." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Pandal = { id: string; name: string; sector: string; address: string; note?: string; color: string };

const PANDALS: Pandal[] = [
  { id: "ec", name: "EC Block", sector: "Sector I", address: "EC Block, Salt Lake, Bidhannagar, Kolkata, West Bengal", note: "Theme: confirm on arrival (a Mahabharat theme has been reported but is unverified).", color: "bg-vermilion" },
  { id: "labony", name: "Labony Estate", sector: "Sector I", address: "Labony Estate, Salt Lake, Bidhannagar, Kolkata, West Bengal", color: "bg-pink" },
  { id: "ak", name: "AK Block", sector: "Sector II", address: "AK Block, Salt Lake, Bidhannagar, Kolkata, West Bengal", color: "bg-cobalt" },
  { id: "bj", name: "BJ Block", sector: "Sector II", address: "BJ Block, Salt Lake, Bidhannagar, Kolkata, West Bengal", color: "bg-emerald" },
  { id: "fd", name: "FD Block", sector: "Sector III", address: "FD Block, Sector III, Bidhannagar, Kolkata, West Bengal", color: "bg-marigold" },
];

const PACK = [
  { id: "phone", label: "Phone charged" },
  { id: "power", label: "Power bank" },
  { id: "water", label: "Water" },
  { id: "shoes", label: "Comfortable shoes" },
  { id: "cash", label: "Cash / UPI ready" },
  { id: "crowd", label: "Check crowd & traffic" },
  { id: "access", label: "Check local access" },
  { id: "confirm", label: "Confirm pandal location" },
];

const ROUTE = [
  { sector: "Sector I", ids: ["ec", "labony"] },
  { sector: "Sector II", ids: ["ak", "bj"] },
  { sector: "Sector III", ids: ["fd"] },
];

const mapsUrl = (a: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a)}`;
const dirUrl = (a: string) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(a)}`;

function usePersisted(key: string) {
  const [v, setV] = useState<Record<string, boolean>>({});
  const loaded = useRef(false);
  useEffect(() => {
    try { setV(JSON.parse(localStorage.getItem(key) || "{}")); } catch { /* ignore */ }
    loaded.current = true;
  }, [key]);
  useEffect(() => { if (loaded.current) localStorage.setItem(key, JSON.stringify(v)); }, [key, v]);
  return [v, setV] as const;
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function Pin({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 64" className={className} aria-hidden>
      <path d="M24 2C12 2 3 11 3 23c0 16 21 38 21 38s21-22 21-38C45 11 36 2 24 2z" fill="var(--vermilion)" stroke="var(--ink)" strokeWidth="3" />
      <circle cx="24" cy="23" r="10" fill="var(--gold)" stroke="var(--ink)" strokeWidth="3" />
      <path d="M24 15c2 4 6 6 6 8s-3 5-6 7c-3-2-6-5-6-7s4-4 6-8z" fill="var(--pink)" />
    </svg>
  );
}

function Lotus({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 60" className={className} aria-hidden>
      {[-50, -25, 0, 25, 50].map((r, i) => (
        <ellipse key={i} cx="50" cy="32" rx="9" ry="26" transform={`rotate(${r} 50 55)`} fill={i % 2 ? "var(--pink)" : "var(--marigold)"} stroke="var(--ink)" strokeWidth="2" />
      ))}
    </svg>
  );
}

function Alpona({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="50" cy="50" r="8" />
      <circle cx="50" cy="50" r="44" strokeDasharray="2 6" />
      {Array.from({ length: 12 }).map((_, i) => (
        <path key={i} d="M50 42 C44 30 46 20 50 12 C54 20 56 30 50 42" transform={`rotate(${i * 30} 50 50)`} />
      ))}
    </svg>
  );
}

function Check({ on }: { on: boolean }) {
  return (
    <span className={`grid size-7 shrink-0 place-items-center rounded-md border-[3px] border-ink ${on ? "bg-emerald animate-pop" : "bg-card"}`}>
      {on && <svg viewBox="0 0 20 20" className="size-4" aria-hidden><path d="M4 10l4 4 8-9" stroke="var(--paper)" strokeWidth="3.5" fill="none" strokeLinecap="round" /></svg>}
    </span>
  );
}

function Index() {
  const [visited, setVisited] = usePersisted("slpt26-visited");
  const [packed, setPacked] = usePersisted("slpt26-pack");
  const [filter, setFilter] = useState<"all" | "todo" | "done">("all");
  const [confirmReset, setConfirmReset] = useState(false);
  const [toast, setToast] = useState("");
  useReveal();

  const count = PANDALS.filter((p) => visited[p.id]).length;
  const pct = (count / PANDALS.length) * 100;
  const shown = useMemo(() => PANDALS.filter((p) => filter === "all" || (filter === "done" ? visited[p.id] : !visited[p.id])), [filter, visited]);

  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2400); return () => clearTimeout(t); }, [toast]);

  const share = async () => {
    const text = "Salt Lake Puja Trail 2026 (suggested grouping)\n" + ROUTE.map((g) => `${g.sector}: ${g.ids.map((id) => {
      const p = PANDALS.find((x) => x.id === id)!; return `${visited[id] ? "✓" : "○"} ${p.name} — ${mapsUrl(p.address)}`;
    }).join("\n  ")}`).join("\n") + `\nProgress: ${count}/5. Confirm locations, dates & access locally.`;
    try {
      if (navigator.share) { await navigator.share({ title: "Salt Lake Puja Trail 2026", text }); return; }
      await navigator.clipboard.writeText(text); setToast("Itinerary copied!");
    } catch (e) {
      if ((e as Error).name !== "AbortError") { try { await navigator.clipboard.writeText(text); setToast("Itinerary copied!"); } catch { setToast("Couldn't copy — try again"); } }
    }
  };

  const ticker = "SHUBHO SHARODIYA ✦ EC BLOCK ✦ LABONY ESTATE ✦ AK BLOCK ✦ BJ BLOCK ✦ FD BLOCK ✦ DHAAK ON ✦ ";

  return (
    <div className="overflow-x-hidden">
      <div className="h-3 alpona-border" />
      {/* HERO */}
      <header className="relative bg-vermilion text-primary-foreground">
        <div className="absolute inset-0 dots-bg opacity-40" aria-hidden />
        <Alpona className="pointer-events-none absolute -right-24 -top-24 size-80 text-gold opacity-60 animate-spin-slow" />
        <Lotus className="pointer-events-none absolute left-4 top-24 w-16 animate-floaty md:w-24" />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-5 pb-16 pt-10 md:grid-cols-[1.2fr_1fr] md:items-center md:pt-16">
          <div className="reveal">
            <p className="inline-block -rotate-2 rounded-full border-[3px] border-ink bg-gold px-4 py-1 text-sm font-bold text-ink shadow-pop-sm">
              Durga Puja 2026 • Salt Lake, Kolkata
            </p>
            <h1 className="mt-6 font-display text-[3.2rem] leading-[0.9] tracking-tight sm:text-7xl lg:text-8xl">
              PANDAL HOPPING, <span className="block text-gold [text-shadow:4px_4px_0_var(--ink)]">MAXIMALIST MODE</span>
            </h1>
            <p className="mt-5 max-w-md text-lg">Salt Lake Puja Trail 2026 — five pandals, one checklist, zero dead batteries.</p>
            <p className="mt-3 max-w-md rounded-lg border-2 border-dashed border-gold/80 bg-ink/30 p-3 text-sm">
              Heads-up: puja dates, events and access change year to year. Please confirm locally before you go.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#pandals" className="spring rounded-xl border-[3px] border-ink bg-gold px-5 py-3 font-bold text-ink shadow-pop">Start the trail →</a>
              <a href="#route" className="spring rounded-xl border-[3px] border-ink bg-cobalt px-5 py-3 font-bold text-secondary-foreground shadow-pop">See route plan</a>
            </div>
          </div>
          <div className="reveal relative">
            <div className="rotate-2 overflow-hidden rounded-[2rem] border-4 border-ink shadow-pop">
              <img src={hero} alt="Illustrated dhaak drum, lotus flowers and alpona patterns" width={1280} height={960} className="h-full w-full object-cover" />
            </div>
            <span className="absolute -bottom-5 -left-3 -rotate-6 rounded-md border-[3px] border-ink bg-pink px-3 py-1 font-display text-xl shadow-pop-sm">5 pandals!</span>
            <Pin className="absolute -right-3 -top-8 w-14 animate-floaty md:w-20" />
          </div>
        </div>
      </header>

      {/* TICKER */}
      <div className="-rotate-1 border-y-4 border-ink bg-marigold py-3 text-ink" aria-hidden>
        <div className="flex w-max animate-marquee whitespace-nowrap font-display text-2xl">
          <span>{ticker.repeat(3)}</span><span>{ticker.repeat(3)}</span>
        </div>
      </div>

      {/* PROGRESS */}
      <section aria-label="Progress" className="sticky top-0 z-30 border-b-4 border-ink bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-5 py-3">
          <p className="font-display text-2xl" aria-live="polite">{count}/5 <span className="font-sans text-sm font-bold">visited</span></p>
          <div className="h-5 flex-1 min-w-[140px] overflow-hidden rounded-full border-[3px] border-ink bg-card" role="progressbar" aria-valuenow={count} aria-valuemin={0} aria-valuemax={5} aria-label="Pandals visited">
            <div className="h-full alpona-border transition-[width] duration-700 ease-[cubic-bezier(.3,1.4,.5,1)]" style={{ width: `${pct}%` }} />
          </div>
          <button onClick={share} className="spring rounded-lg border-[3px] border-ink bg-cobalt px-3 py-1.5 text-sm font-bold text-secondary-foreground shadow-pop-sm">Copy / share itinerary</button>
        </div>
      </section>

      <main>
        {/* PANDALS */}
        <section id="pandals" className="mx-auto max-w-6xl px-5 py-16">
          <div className="reveal flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-5xl leading-none md:text-7xl">The <span className="text-vermilion">Shortlist</span></h2>
            <div role="group" aria-label="Filter pandals" className="flex gap-2">
              {([["all", "All"], ["todo", "To visit"], ["done", "Visited"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setFilter(k)} aria-pressed={filter === k}
                  className={`spring rounded-full border-[3px] border-ink px-4 py-1.5 text-sm font-bold shadow-pop-sm ${filter === k ? "bg-ink text-paper" : "bg-card"}`}>{l}</button>
              ))}
            </div>
          </div>

          <ul className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-6">
            {shown.length === 0 && <li className="col-span-full rounded-xl border-[3px] border-dashed border-ink p-8 text-center font-bold">Nothing here yet — {filter === "done" ? "go mark a pandal visited!" : "you've seen them all. Bravo!"}</li>}
            {shown.map((p, i) => {
              const on = !!visited[p.id];
              const span = ["lg:col-span-4", "lg:col-span-2", "lg:col-span-2", "lg:col-span-4", "lg:col-span-6"][PANDALS.indexOf(p)];
              return (
                <li key={p.id} className={`reveal ${span}`} style={{ animationDelay: `${i * 80}ms` }}>
                  <article className={`spring relative h-full overflow-hidden rounded-2xl border-4 border-ink bg-card shadow-pop ${i % 2 ? "md:rotate-1" : "md:-rotate-1"} ${on ? "opacity-90" : ""}`}>
                    <div className={`${p.color} relative flex items-center justify-between gap-3 px-5 py-4 text-primary-foreground`}>
                      <div className="absolute inset-0 dots-bg opacity-40" aria-hidden />
                      <div className="relative">
                        <p className="text-xs font-bold uppercase tracking-widest text-ink">{p.sector}</p>
                        <h3 className="font-display text-4xl leading-none text-ink [text-shadow:2px_2px_0_var(--paper)] md:text-5xl">{p.name}</h3>
                      </div>
                      <Pin className="relative w-10 shrink-0" />
                    </div>
                    <div className="h-2 alpona-border" aria-hidden />
                    <div className="space-y-3 p-5">
                      <p className="font-medium">{p.address}</p>
                      <p className="inline-block -rotate-1 rounded bg-gold px-2 py-0.5 text-xs font-bold">Block-level location; confirm pin locally.</p>
                      <p className="text-sm text-muted-foreground">{p.note ?? "Theme: confirm on arrival."}</p>
                      <div className="flex flex-wrap gap-3 pt-2">
                        <a href={mapsUrl(p.address)} target="_blank" rel="noopener noreferrer" className="spring rounded-lg border-[3px] border-ink bg-cobalt px-4 py-2 text-sm font-bold text-secondary-foreground shadow-pop-sm">Open in Google Maps ↗</a>
                        <a href={dirUrl(p.address)} target="_blank" rel="noopener noreferrer" className="spring rounded-lg border-[3px] border-ink bg-card px-4 py-2 text-sm font-bold shadow-pop-sm">Directions ↗</a>
                        <button onClick={() => setVisited((v) => ({ ...v, [p.id]: !v[p.id] }))} aria-pressed={on}
                          className={`spring flex items-center gap-2 rounded-lg border-[3px] border-ink px-4 py-2 text-sm font-bold shadow-pop-sm ${on ? "bg-emerald text-primary-foreground" : "bg-marigold"}`}>
                          <Check on={on} /> {on ? "Visited!" : "Mark visited"}
                        </button>
                      </div>
                    </div>
                    {on && <span className="absolute right-3 top-20 rotate-12 rounded-full border-[3px] border-ink bg-pink px-3 py-1 font-display text-lg shadow-pop-sm animate-pop">DONE ✦</span>}
                  </article>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ROUTE */}
        <section id="route" className="relative border-y-4 border-ink bg-cobalt py-16 text-secondary-foreground">
          <Alpona className="pointer-events-none absolute -left-16 bottom-0 size-64 text-marigold opacity-40" />
          <div className="relative mx-auto max-w-6xl px-5">
            <h2 className="reveal font-display text-5xl md:text-7xl">Route <span className="text-gold">Plan</span></h2>
            <p className="reveal mt-3 inline-block rounded-md border-2 border-ink bg-gold px-3 py-1 text-sm font-bold text-ink">Suggested grouping by sector — not a guaranteed shortest route.</p>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {ROUTE.map((g, i) => (
                <li key={g.sector} className={`reveal spring relative rounded-2xl border-4 border-ink bg-paper p-5 text-ink shadow-pop ${i === 1 ? "md:translate-y-8" : ""}`}>
                  <span className="absolute -top-5 left-4 grid size-12 place-items-center rounded-full border-4 border-ink bg-vermilion font-display text-2xl text-primary-foreground">{i + 1}</span>
                  <h3 className="mt-4 font-display text-3xl">{g.sector}</h3>
                  <ul className="mt-3 space-y-2">
                    {g.ids.map((id) => { const p = PANDALS.find((x) => x.id === id)!; return (
                      <li key={id} className="flex items-center justify-between gap-2">
                        <span className={`font-bold ${visited[id] ? "line-through decoration-vermilion decoration-4" : ""}`}>{p.name}</span>
                        <a href={dirUrl(p.address)} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-cobalt underline underline-offset-4">Directions</a>
                      </li>); })}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CHECKLIST */}
        <section id="checklist" className="mx-auto max-w-6xl px-5 py-20">
          <div className="grid gap-10 md:grid-cols-[1fr_1.3fr]">
            <div className="reveal">
              <h2 className="font-display text-5xl leading-none md:text-7xl">Master <span className="text-pink">Checklist</span></h2>
              <p className="mt-4 text-lg">Pack it, tick it, hop it. Everything saves on this device.</p>
              <p className="mt-2 font-bold">{PACK.filter((x) => packed[x.id]).length}/{PACK.length} ready</p>
              <Lotus className="mt-6 w-32 animate-floaty" />
              <div className="mt-6">
                {!confirmReset ? (
                  <button onClick={() => setConfirmReset(true)} className="spring rounded-lg border-[3px] border-ink bg-card px-4 py-2 font-bold shadow-pop-sm">Reset checklist</button>
                ) : (
                  <div role="alertdialog" aria-label="Confirm reset" className="rounded-xl border-[3px] border-ink bg-gold p-4 shadow-pop-sm">
                    <p className="font-bold">Clear all visited pandals and checklist ticks?</p>
                    <div className="mt-3 flex gap-2">
                      <button autoFocus onClick={() => { setVisited({}); setPacked({}); setConfirmReset(false); setToast("Checklist reset"); }} className="rounded-lg border-[3px] border-ink bg-destructive px-4 py-2 font-bold text-destructive-foreground">Yes, reset</button>
                      <button onClick={() => setConfirmReset(false)} className="rounded-lg border-[3px] border-ink bg-card px-4 py-2 font-bold">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {PACK.map((x, i) => { const on = !!packed[x.id]; return (
                <li key={x.id} className="reveal" style={{ animationDelay: `${i * 50}ms` }}>
                  <button onClick={() => setPacked((v) => ({ ...v, [x.id]: !v[x.id] }))} aria-pressed={on}
                    className={`spring flex w-full items-center gap-3 rounded-xl border-[3px] border-ink p-4 text-left font-bold shadow-pop-sm ${on ? "bg-emerald/20" : "bg-card"} ${i % 3 === 1 ? "sm:rotate-1" : ""}`}>
                    <Check on={on} /><span className={on ? "line-through decoration-2" : ""}>{x.label}</span>
                  </button>
                </li>); })}
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t-4 border-ink bg-ink text-paper">
        <div className="h-3 alpona-border" />
        <div className="mx-auto max-w-6xl px-5 py-10">
          <p className="font-display text-4xl text-gold">Salt Lake Puja Trail 2026</p>
          <p className="mt-3 max-w-2xl text-sm opacity-90">Locations are block/area-level only. Themes, dates, timings and access are not verified here — confirm locally. Map links open a Google Maps search; this site does not track your location.</p>
          <p className="mt-4 text-sm opacity-70">Shubho Sharodiya ✦ Bidhannagar, Kolkata</p>
        </div>
      </footer>

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
        {toast && <p className="animate-pop rounded-full border-[3px] border-ink bg-gold px-5 py-2 font-bold text-ink shadow-pop-sm">{toast}</p>}
      </div>
    </div>
  );
}
