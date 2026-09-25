import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { todayISO } from "@/lib/date";
import { HABITS, DAILY_TARGET_POINTS, PERIOD_TARGET_POINTS, type HabitKey } from "@/lib/habits";

export const dynamic = "force-dynamic";

// Vercel ajoute automatiquement "Authorization: Bearer <CRON_SECRET>" aux
// requêtes déclenchées par ses propres Cron Jobs quand cette variable
// d'environnement est définie — ça évite que n'importe qui puisse
// déclencher l'envoi de notifications en visitant cette URL.
// Le paramètre ?secret=... est accepté en plus, pour pouvoir déclencher un
// test manuel depuis un navigateur (pas moyen d'y régler un en-tête).
function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  if (request.headers.get("authorization") === `Bearer ${cronSecret}`) return true;
  const secretParam = request.nextUrl.searchParams.get("secret");
  return secretParam === cronSecret;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT;
  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    return NextResponse.json({ error: "Variables VAPID manquantes" }, { status: 500 });
  }
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const supabase = createSupabaseAdminClient();
  // Cette tâche se déclenche une fois par jour en soirée, loin de minuit :
  // pas besoin de reproduire ici le décalage de 7h30 utilisé côté client
  // (lib/date.ts).
  const today = todayISO();

  const [habitLogsRes, periodDaysRes, subscriptionsRes] = await Promise.all([
    supabase.from("habit_logs").select("habit_key, user_id").eq("log_date", today),
    supabase.from("period_days").select("user_id").eq("log_date", today),
    supabase.from("push_subscriptions").select("*"),
  ]);

  const queryError = habitLogsRes.error ?? periodDaysRes.error ?? subscriptionsRes.error;
  if (queryError) {
    console.error(queryError);
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  const pointsByKey = new Map(HABITS.map((h) => [h.key, h.points]));
  const periodUserIds = new Set((periodDaysRes.data ?? []).map((p) => p.user_id));

  const totalsByUser = new Map<string, number>();
  for (const log of habitLogsRes.data ?? []) {
    const points = pointsByKey.get(log.habit_key as HabitKey) ?? 0;
    totalsByUser.set(log.user_id, (totalsByUser.get(log.user_id) ?? 0) + points);
  }

  let sent = 0;
  let skipped = 0;
  let removed = 0;

  for (const sub of subscriptionsRes.data ?? []) {
    const total = totalsByUser.get(sub.user_id) ?? 0;
    const target = periodUserIds.has(sub.user_id) ? PERIOD_TARGET_POINTS : DAILY_TARGET_POINTS;

    if (total >= target) {
      skipped++;
      continue;
    }

    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth_key },
        },
        JSON.stringify({
          title: "Habit Tracker",
          body: `Objectif pas encore atteint (${total}/${target} pts) — encore le temps de t'y mettre !`,
        })
      );
      sent++;
    } catch (err) {
      console.error("Échec d'envoi push", err);
      const statusCode = (err as { statusCode?: number }).statusCode;
      if (statusCode === 404 || statusCode === 410) {
        // Abonnement expiré ou révoqué côté navigateur : on nettoie.
        await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        removed++;
      }
    }
  }

  return NextResponse.json({ today, sent, skipped, removed });
}
