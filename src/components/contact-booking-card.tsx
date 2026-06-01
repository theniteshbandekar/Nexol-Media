"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

import {
  type AvailableSlot,
  createBooking,
  getAvailableSlots,
} from "@/lib/actions/booking";
import {
  BOOKING_WEEKDAYS,
  BOOKING_WINDOW_DAYS,
  formatBookingDay,
  formatBookingTime,
  isoWeekday,
  toBookingDateISO,
} from "@/lib/booking-constants";

type MonthCell =
  | { blank: true }
  | {
      blank: false;
      iso: string;
      dayNum: number;
      state: "muted" | "open";
    };

type ViewMonth = { year: number; month: number };

const SERVICES = [
  "Post Production",
  "Personal Brand",
  "Podcast Distribution",
  "Launch Videos",
  "Clipping",
  "Not sure yet",
] as const;
type Service = (typeof SERVICES)[number];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setUTCDate(next.getUTCDate() + n);
  return next;
}

function addMonths({ year, month }: ViewMonth, delta: number): ViewMonth {
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

function ymKey({ year, month }: ViewMonth): number {
  return year * 12 + month;
}

function buildMonthGrid(
  view: ViewMonth,
  todayISO: string,
  lastBookableISO: string
): MonthCell[] {
  const { year, month } = view;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const firstJsDay = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const firstIsoDay = firstJsDay === 0 ? 7 : firstJsDay;
  const leadingBlanks = firstIsoDay - 1;

  const cells: MonthCell[] = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push({ blank: true });

  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const weekendOff = !BOOKING_WEEKDAYS.has(isoWeekday(iso));
    const isPast = iso < todayISO;
    const outsideWindow = iso > lastBookableISO;
    const bookable = !weekendOff && !isPast && !outsideWindow;
    cells.push({
      blank: false,
      iso,
      dayNum: d,
      state: bookable ? "open" : "muted",
    });
  }
  while (cells.length % 7 !== 0) cells.push({ blank: true });
  return cells;
}

function ChevLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}
function ChevRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
function ArrowOut() {
  return (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

type Props = {
  initialDate: string | null;
  initialSlots: AvailableSlot[];
  initialConfigured: boolean;
};

export function ContactBookingCard({
  initialDate,
  initialSlots,
  initialConfigured,
}: Props) {
  const { todayISO, lastBookableISO, firstViewMonth, lastViewMonth } = useMemo(
    () => {
      const now = new Date();
      const today = toBookingDateISO(now);
      const last = toBookingDateISO(addDays(now, BOOKING_WINDOW_DAYS - 1));
      const [ty, tm] = today.split("-").map(Number);
      const [ly, lm] = last.split("-").map(Number);
      return {
        todayISO: today,
        lastBookableISO: last,
        firstViewMonth: { year: ty, month: tm } as ViewMonth,
        lastViewMonth: { year: ly, month: lm } as ViewMonth,
      };
    },
    []
  );

  const [viewMonth, setViewMonth] = useState<ViewMonth>(() => {
    const ref = initialDate ?? todayISO;
    const [y, m] = ref.split("-").map(Number);
    return { year: y, month: m };
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate);
  const [slots, setSlots] = useState<AvailableSlot[] | null>(
    initialDate ? initialSlots : null
  );
  const [slotsConfigured, setSlotsConfigured] = useState(initialConfigured);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [loadingSlots, startLoading] = useTransition();
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [success, setSuccess] = useState<{
    slot: AvailableSlot;
    name: string;
    meetLink: string | null;
  } | null>(null);

  const monthCells = useMemo(
    () => buildMonthGrid(viewMonth, todayISO, lastBookableISO),
    [viewMonth, todayISO, lastBookableISO]
  );

  const canPrev = ymKey(viewMonth) > ymKey(firstViewMonth);
  const canNext = ymKey(viewMonth) < ymKey(lastViewMonth);

  const loadSlots = useCallback((iso: string) => {
    setSelectedSlot(null);
    setSlots(null);
    setSlotsError(null);
    startLoading(async () => {
      const res = await getAvailableSlots(iso);
      if (res.ok) {
        setSlots(res.slots);
        setSlotsConfigured(res.configured);
      } else {
        setSlotsError(res.error);
      }
    });
  }, []);

  const pickDay = (iso: string) => {
    if (iso === selectedDate) return;
    setSelectedDate(iso);
    loadSlots(iso);
  };

  const dialogRef = useRef<HTMLDialogElement>(null);
  const openDialog = () => dialogRef.current?.showModal();
  const closeDialog = () => dialogRef.current?.close();

  const handleBooked = (args: { name: string; meetLink: string | null }) => {
    if (!selectedSlot) return;
    closeDialog();
    setSuccess({ slot: selectedSlot, name: args.name, meetLink: args.meetLink });
  };

  const handleSlotTaken = () => {
    closeDialog();
    if (selectedDate) loadSlots(selectedDate);
  };

  const resetToPick = () => {
    setSuccess(null);
    setSelectedSlot(null);
    if (selectedDate) loadSlots(selectedDate);
  };

  if (success) {
    return (
      <SuccessCard
        name={success.name}
        slot={success.slot}
        meetLink={success.meetLink}
        onBookAnother={resetToPick}
      />
    );
  }

  return (
    <aside className="ct-card booking" id="book" aria-labelledby="book-h">
      <div className="ct-card-head">
        <h2 id="book-h">Book an intro call.</h2>
        <span className="tag">
          <span className="dot" />
          30 min · free
        </span>
      </div>

      <div className="top">
        <div className="avatar" aria-hidden="true">NB</div>
        <div className="who">
          <span className="name">Nitesh Bandekar</span>
          <span className="role">Founder · Nexol Media · Google Meet</span>
        </div>
        <span className="badge">
          <span className="pulse" aria-hidden="true" />
          Booking now
        </span>
      </div>

      <div className="mini-cal">
        <div className="mini-cal-head">
          <span className="month">
            {MONTH_NAMES[viewMonth.month - 1]} {viewMonth.year}
          </span>
          <div className="arrows">
            <button
              type="button"
              aria-label="Previous month"
              disabled={!canPrev}
              onClick={() => setViewMonth((v) => addMonths(v, -1))}
              style={!canPrev ? { opacity: 0.3, cursor: "not-allowed" } : undefined}
            >
              <ChevLeft />
            </button>
            <button
              type="button"
              aria-label="Next month"
              disabled={!canNext}
              onClick={() => setViewMonth((v) => addMonths(v, 1))}
              style={!canNext ? { opacity: 0.3, cursor: "not-allowed" } : undefined}
            >
              <ChevRight />
            </button>
          </div>
        </div>
        <div className="mini-cal-grid">
          {WEEKDAYS.map((d) => (
            <span key={d} className="dh">{d}</span>
          ))}
          {monthCells.map((cell, idx) => {
            if (cell.blank) return <span key={`b-${idx}`} aria-hidden="true" />;
            const isSelected = cell.state === "open" && cell.iso === selectedDate;
            const cls = isSelected ? "selected" : cell.state;
            if (cell.state !== "open") {
              // Unavailable day: expose it to assistive tech as "unavailable"
              // (consistent with the "available" label on open days) instead of
              // hiding it, so the calendar reads coherently. role="img" gives the
              // non-interactive cell an accessible name.
              return (
                <span
                  key={cell.iso}
                  className={`day ${cls}`}
                  role="img"
                  aria-label={`${cell.iso}, unavailable`}
                >
                  {cell.dayNum}
                </span>
              );
            }
            return (
              <button
                key={cell.iso}
                type="button"
                className={`day ${cls}`}
                aria-label={`${cell.iso}, available`}
                aria-pressed={isSelected}
                onClick={() => pickDay(cell.iso)}
              >
                {cell.dayNum}
              </button>
            );
          })}
        </div>
      </div>

      <div className="ct-slots">
        <div className="ct-slots-head">
          <b>{selectedDate ? formatBookingDay(selectedDate) : "Pick a date"}</b>
          <span className="sep" />
          IST
        </div>

        {!selectedDate && (
          <p style={{ margin: 0, color: "var(--gray-500)", fontSize: 13 }}>
            Choose a day above to see open slots.
          </p>
        )}

        {selectedDate && loadingSlots && (
          <div className="ct-slots-row">
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                aria-hidden="true"
                style={{
                  height: 32,
                  width: 64,
                  borderRadius: 999,
                  background: "var(--gray-100)",
                  display: "inline-block",
                }}
              />
            ))}
          </div>
        )}

        {selectedDate && !loadingSlots && slotsError && (
          <p role="alert" style={{ margin: 0, color: "var(--danger)", fontSize: 13 }}>
            {slotsError}
          </p>
        )}

        {selectedDate && !loadingSlots && !slotsError && !slotsConfigured && (
          <p role="status" style={{ margin: 0, color: "var(--gray-500)", fontSize: 13 }}>
            Booking calendar isn&rsquo;t connected — email{" "}
            <a href="mailto:info@nexolmedia.com" style={{ color: "var(--fg)", textDecoration: "underline" }}>
              info@nexolmedia.com
            </a>{" "}
            to schedule.
          </p>
        )}

        {selectedDate && !loadingSlots && !slotsError && slots && slots.length === 0 && (
          <p style={{ margin: 0, color: "var(--gray-500)", fontSize: 13 }}>
            No slots free that day — try another.
          </p>
        )}

        {selectedDate && !loadingSlots && !slotsError && slots && slots.length > 0 && (
          <div className="ct-slots-row">
            {slots.map((slot) => {
              const isSelected = selectedSlot?.startISO === slot.startISO;
              return (
                <button
                  key={slot.startISO}
                  type="button"
                  className={`ct-slot${isSelected ? " selected" : ""}`}
                  onClick={() => setSelectedSlot(slot)}
                  aria-pressed={isSelected}
                >
                  {formatBookingTime(slot.startISO)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="foot">
        <span className="picked">
          {selectedSlot && selectedDate ? (
            <>
              Selected:{" "}
              <b>
                {formatBookingDay(selectedDate)} ·{" "}
                {formatBookingTime(selectedSlot.startISO)} IST
              </b>
            </>
          ) : (
            <span style={{ color: "var(--gray-500)" }}>
              Pick a day and time to continue.
            </span>
          )}
        </span>
        <button
          type="button"
          className="btn-lg"
          disabled={!selectedSlot}
          onClick={openDialog}
        >
          Continue
          <ArrowOut />
        </button>
      </div>

      {selectedSlot && (
        <DetailsDialog
          ref={dialogRef}
          slot={selectedSlot}
          onClose={closeDialog}
          onBooked={handleBooked}
          onSlotTaken={handleSlotTaken}
        />
      )}
    </aside>
  );
}

type DetailsDialogProps = {
  ref: React.RefObject<HTMLDialogElement | null>;
  slot: AvailableSlot;
  onClose: () => void;
  onBooked: (args: { name: string; meetLink: string | null }) => void;
  onSlotTaken: () => void;
};

function DetailsDialog({
  ref,
  slot,
  onClose,
  onBooked,
  onSlotTaken,
}: DetailsDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [services, setServices] = useState<Set<Service>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Close on backdrop click (native <dialog> doesn't do this).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onClick = (e: MouseEvent) => {
      if (e.target === el) onClose();
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [ref, onClose]);

  const toggleService = (s: Service) => {
    setServices((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  return (
    <dialog ref={ref} className="bk-dialog" aria-labelledby="bk-dlg-h">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isPending) return;
          setError(null);
          startTransition(async () => {
            const res = await createBooking({
              startISO: slot.startISO,
              endISO: slot.endISO,
              name: name.trim(),
              email: email.trim(),
              services: Array.from(services),
            });
            if (res.ok) {
              onBooked({ name: name.trim(), meetLink: res.meetLink });
              return;
            }
            if (res.reason === "slot_taken") {
              setError(res.error);
              window.setTimeout(onSlotTaken, 1200);
              return;
            }
            setError(res.error);
          });
        }}
      >
        <div className="bk-head">
          <div className="eyebrow">
            {formatBookingDay(slot.startISO)} · {formatBookingTime(slot.startISO)} IST · 30 min
          </div>
          <h2 id="bk-dlg-h">Confirm your booking</h2>
        </div>

        <div className="bk-body">
          {error && <p className="bk-alert" role="alert">{error}</p>}

          <div className="bk-row">
            <div className="bk-field">
              <label htmlFor="bk-name">Your name</label>
              <input
                id="bk-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
                maxLength={80}
                placeholder="Riya Mehta"
              />
            </div>
            <div className="bk-field">
              <label htmlFor="bk-email">Email</label>
              <input
                id="bk-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                maxLength={120}
                placeholder="you@channel.com"
              />
            </div>
          </div>

          <div className="bk-field">
            <label>What are you interested in?</label>
            <div className="ct-chips" role="group" aria-label="Services of interest">
              {SERVICES.map((s) => {
                const pressed = services.has(s);
                return (
                  <button
                    key={s}
                    type="button"
                    className="chip-svc"
                    aria-pressed={pressed}
                    onClick={() => toggleService(s)}
                  >
                    <span className="check" aria-hidden="true">
                      <CheckIcon />
                    </span>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bk-foot">
          <button
            type="button"
            className="btn-ghost"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button type="submit" className="btn-lg" disabled={isPending}>
            {isPending ? "Booking…" : "Confirm booking"}
            {!isPending && <ArrowOut />}
          </button>
        </div>
      </form>
    </dialog>
  );
}

function SuccessCard({
  name,
  slot,
  meetLink,
  onBookAnother,
}: {
  name: string;
  slot: AvailableSlot;
  meetLink: string | null;
  onBookAnother: () => void;
}) {
  return (
    <aside className="ct-card booking" id="book" role="status">
      <div className="ct-card-head">
        <h2>You&rsquo;re on the calendar.</h2>
        <span className="tag">
          <span className="dot" />
          Booked
        </span>
      </div>
      <div style={{ padding: "28px 32px 32px" }}>
        <h3
          style={{
            margin: "0 0 10px",
            fontFamily: "var(--font-display)",
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: "var(--fg)",
          }}
        >
          See you soon, {name}.
        </h3>
        <p
          style={{
            margin: "0 0 24px",
            color: "var(--gray-500)",
            fontSize: 15,
            lineHeight: 1.55,
          }}
        >
          {formatBookingDay(slot.startISO)} ·{" "}
          {formatBookingTime(slot.startISO)} IST. A Google Calendar invite is
          on its way — check your inbox for the Meet link.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {meetLink && (
            <a
              href={meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-lg"
            >
              Join Google Meet
              <ArrowOut />
            </a>
          )}
          <button type="button" className="btn-ghost" onClick={onBookAnother}>
            Book another
          </button>
        </div>
      </div>
    </aside>
  );
}
