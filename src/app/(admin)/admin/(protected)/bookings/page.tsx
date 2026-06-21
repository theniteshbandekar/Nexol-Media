import { adminListBookings } from "@/lib/firebase/admin-content";
import { requireAdminPage } from "@/lib/firebase/auth";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] as const;
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"] as const;

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day  = DAYS[d.getUTCDay()];
  const date = d.getUTCDate();
  const mon  = MONTHS[d.getUTCMonth()];
  const hh   = String(d.getUTCHours()).padStart(2, "0");
  const mm   = String(d.getUTCMinutes()).padStart(2, "0");
  return `${day}, ${date} ${mon} · ${hh}:${mm} IST`;
}

function relativeLabel(iso?: string): { label: string; upcoming: boolean } {
  if (!iso) return { label: "", upcoming: false };
  const diff = new Date(iso).getTime() - Date.now();
  const upcoming = diff > 0;
  const abs = Math.abs(diff);
  const mins = Math.round(abs / 60000);
  if (mins < 60) return { label: upcoming ? `in ${mins}m` : `${mins}m ago`, upcoming };
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return { label: upcoming ? `in ${hrs}h` : `${hrs}h ago`, upcoming };
  const days = Math.round(hrs / 24);
  return { label: upcoming ? `in ${days}d` : `${days}d ago`, upcoming };
}

export default async function AdminBookingsPage() {
  await requireAdminPage();
  const bookings = await adminListBookings();

  const now = Date.now();
  const upcoming = bookings.filter((b) => b.startsAt && new Date(b.startsAt).getTime() > now);
  const past     = bookings.filter((b) => !b.startsAt || new Date(b.startsAt).getTime() <= now);

  function BookingCard({ b }: { b: typeof bookings[number] }) {
    const { label, upcoming: isUpcoming } = relativeLabel(b.startsAt);
    return (
      <div
        className="adm-list-row"
        style={{
          cursor: "default",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          padding: "16px 18px",
          borderLeft: isUpcoming ? "3px solid var(--accent)" : "3px solid transparent",
        }}
      >
        {/* Row 1: name + time badge */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <span className="adm-list-title" style={{ fontSize: 15 }}>
            {b.name ?? "—"}
          </span>
          {label && (
            <span style={{
              flexShrink: 0,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              padding: "2px 8px",
              borderRadius: 999,
              background: isUpcoming ? "var(--accent)" : "var(--gray-100)",
              color: isUpcoming ? "#0A0A0B" : "var(--fg-muted)",
            }}>
              {label}
            </span>
          )}
        </div>

        {/* Row 2: email + datetime */}
        <span className="adm-list-meta" style={{ fontSize: 13 }}>
          {b.email ?? "—"} · {fmtDate(b.startsAt)}
        </span>

        {/* Row 3: services */}
        {b.services && b.services.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {b.services.map((s) => (
              <span key={s} style={{
                fontSize: 11,
                padding: "2px 10px",
                borderRadius: 999,
                border: "1px solid var(--border)",
                color: "var(--fg-muted)",
              }}>
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Row 4: Meet link */}
        {b.meetLink ? (
          <a
            href={b.meetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="adm-btn"
            style={{ alignSelf: "flex-start", height: 34, fontSize: 13, padding: "0 14px" }}
          >
            Join Meet →
          </a>
        ) : (
          <span className="adm-hint" style={{ fontSize: 12 }}>No Meet link</span>
        )}
      </div>
    );
  }

  return (
    <div className="adm-editor">
      <div className="adm-list-head">
        <h1>Bookings</h1>
      </div>

      {bookings.length === 0 && <p className="adm-hint">No bookings yet.</p>}

      {upcoming.length > 0 && (
        <>
          <p className="adm-hint" style={{ marginBottom: 10, fontWeight: 600, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.06em" }}>
            Upcoming — {upcoming.length}
          </p>
          <div className="adm-list" style={{ marginBottom: 32 }}>
            {upcoming.map((b) => <BookingCard key={b.id} b={b} />)}
          </div>
        </>
      )}

      {past.length > 0 && (
        <>
          <p className="adm-hint" style={{ marginBottom: 10, fontWeight: 600, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.06em" }}>
            Past — {past.length}
          </p>
          <div className="adm-list">
            {past.map((b) => <BookingCard key={b.id} b={b} />)}
          </div>
        </>
      )}
    </div>
  );
}
