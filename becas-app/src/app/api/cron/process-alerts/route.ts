import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { sendEmail } from "@/lib/email/send";
import { buildAlertEmailHtml } from "@/lib/email/templates";

const CRON_SECRET = process.env.CRON_SECRET;

// GET /api/cron/process-alerts - process scheduled alerts
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all active alerts with user info
    const alerts = await prisma.scholarshipAlert.findMany({
      where: { isActive: true },
      include: {
        user: { select: { email: true, firstName: true } },
      },
    });

    let sent = 0;
    let skipped = 0;

    for (const alert of alerts) {
      if (!alert.user.email) {
        skipped++;
        continue;
      }

      // Parse criteria from JSON
      const criteria = alert.criteria as {
        categories?: string[];
        countries?: string[];
      } | null;

      // Build scholarship query based on alert criteria
      const conditions: object[] = [{ status: "PUBLISHED" }];

      // Only fetch scholarships created since last notification
      if (alert.lastSentAt) {
        conditions.push({ createdAt: { gt: alert.lastSentAt } });
      }

      if (criteria?.categories && criteria.categories.length > 0) {
        conditions.push({
          categories: { some: { slug: { in: criteria.categories } } },
        });
      }

      if (criteria?.countries && criteria.countries.length > 0) {
        conditions.push({
          countries: { some: { slug: { in: criteria.countries } } },
        });
      }

      const matches = await prisma.scholarship.findMany({
        where: { AND: conditions },
        select: {
          title: true,
          slug: true,
          country: true,
          deadline: true,
          fundingType: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      if (matches.length === 0) {
        skipped++;
        continue;
      }

      // Send email
      const html = buildAlertEmailHtml(alert.name, matches);
      const success = await sendEmail({
        to: alert.user.email,
        subject: `🎓 ${matches.length} nueva${matches.length !== 1 ? "s" : ""} beca${matches.length !== 1 ? "s" : ""} — ${alert.name}`,
        html,
      });

      if (success) {
        // Update lastSentAt
        await prisma.scholarshipAlert.update({
          where: { id: alert.id },
          data: { lastSentAt: new Date() },
        });
        sent++;
      } else {
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: alerts.length,
      sent,
      skipped,
    });
  } catch (error) {
    console.error("Cron process-alerts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
