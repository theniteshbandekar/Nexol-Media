import { NextResponse } from "next/server";
import { Resend } from "resend";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

export async function POST(req: Request) {
  try {
    const ip = await clientIp();
    if (!rateLimit(`quotation:${ip}`, 5, 60 * 60 * 1000).ok) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email } = body;

    if (!name || typeof name !== "string" || name.trim().length < 1) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (name.length > 80) {
      return NextResponse.json({ error: "Name is too long." }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !isEmail(email)) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }
    if (email.length > 254) {
      return NextResponse.json({ error: "Email is too long." }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set. Simulating email send for now.");
      return NextResponse.json({ success: true, simulated: true });
    }

    const safeName = escapeHtml(name.trim());
    const fromAddress =
      process.env.RESEND_FROM_ADDRESS ?? "Nexol Media <noreply@nexolmedia.com>";

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: email.trim().toLowerCase(),
      subject: "Your Price Quotation from Nexol Media",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Hi ${safeName},</h2>
          <p>Thank you for requesting a price quotation.</p>
          <p>Please find the quotation details attached.</p>
          <br />
          <p>Best regards,<br/>The Nexol Media Team</p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Quotation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
