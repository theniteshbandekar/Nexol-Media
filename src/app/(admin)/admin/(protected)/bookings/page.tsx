import { adminListBookings } from "@/lib/firebase/admin-content";
import { requireAdminPage } from "@/lib/firebase/auth";

function fmt(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

export default async function AdminBookingsPage() {
  await requireAdminPage();
  const bookings = await adminListBookings();
  return (
    <div className="adm-editor">
      <div className="adm-list-head">
        <h1>Bookings</h1>
      </div>
      <div className="adm-list">
        {bookings.map((b) => (
          <div key={b.id} className="adm-list-row" style={{ cursor: "default" }}>
            <span className="adm-list-title">
              {b.name ?? "—"} · {b.email ?? "—"}
            </span>
            <span className="adm-list-meta">
              {fmt(b.startsAt)} · {b.status ?? "confirmed"}
              {b.services?.length ? ` · ${b.services.join(", ")}` : ""}
              {b.meetLink ? (
                <>
                  {" · "}
                  <a href={b.meetLink} target="_blank" rel="noopener noreferrer">
                    Meet ↗
                  </a>
                </>
              ) : null}
            </span>
          </div>
        ))}
        {bookings.length === 0 && <p className="adm-hint">No bookings yet.</p>}
      </div>
    </div>
  );
}
