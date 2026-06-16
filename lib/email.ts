// lib/email.ts

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export interface DailySummaryEmailData {
  to: string;
  userName: string;
  unsubscribeToken: string;

  // Kết quả hôm nay
  correctToday: number;
  wrongToday: number;
  pointsToday: number;

  // Tổng quan
  totalPoints: number;
  rank: number;

  // Motivational context
  pointsToTop10: number | null; // null nếu đã trong top 10
  overtakenByName: string | null; // tên user vừa vượt qua (nếu có)
  overtakenByPoints: number | null; // cần thêm bao nhiêu điểm để giành lại

  // Trận tiếp theo
  nextMatchHome: string | null;
  nextMatchAway: string | null;
  nextMatchHoursFromNow: number | null;
}

function buildEmailHtml(data: DailySummaryEmailData): string {
  const appUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://fifapickem2026.com";
  const unsubscribeUrl = `${appUrl}/api/unsubscribe?token=${data.unsubscribeToken}`;
  const picksUrl = `${appUrl}/picks`;
  const leaderboardUrl = `${appUrl}/leaderboard`;

  const headerBg = `${appUrl}/header-bg.png`;
  const heroPlayer = `${appUrl}/hero-player.png`;
  const logo = `${appUrl}/icon-wc-2026.png`;

  // Motivational message
  let motivationalHtml = "";
  if (data.overtakenByName && data.overtakenByPoints !== null) {
    motivationalHtml = `
      <tr>
        <td style="padding: 16px 24px; background: #0f1f3d; border-left: 3px solid #ef4444;">
          <p style="margin: 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
            Một người chơi vừa vượt qua bạn trên bảng xếp hạng. Chỉ cần thêm
            <strong style="color: #ffffff;">${data.overtakenByPoints} điểm</strong>
            nữa là bạn có thể giành lại vị trí của mình.
          </p>
        </td>
      </tr>
      <tr><td style="height: 2px; background: #1e3a5f;"></td></tr>`;
  } else if (data.pointsToTop10 !== null && data.pointsToTop10 > 0) {
    motivationalHtml = `
      <tr>
        <td style="padding: 16px 24px; background: #0f1f3d; border-left: 3px solid #f59e0b;">
          <p style="margin: 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
            🔥 Bạn chỉ còn cách Top 10 đúng
            <strong style="color: #f59e0b;">${data.pointsToTop10} điểm</strong>!
          </p>
        </td>
      </tr>
      <tr><td style="height: 2px; background: #1e3a5f;"></td></tr>`;
  }

  // Next match block
  let nextMatchHtml = "";
  if (
    data.nextMatchHome &&
    data.nextMatchAway &&
    data.nextMatchHoursFromNow !== null
  ) {
    const hoursText =
      data.nextMatchHoursFromNow < 1
        ? "chưa đến 1 giờ"
        : `${Math.round(data.nextMatchHoursFromNow)} giờ`;

    nextMatchHtml = `
      <!-- Next match -->
      <tr>
        <td style="padding: 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background: #0a1628; border-radius: 0 0 8px 8px;">
            <tr>
              <td style="padding: 20px 24px;">
                <p style="margin: 0 0 6px; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">Trận tiếp theo</p>
                <p style="margin: 0 0 4px; color: #ffffff; font-size: 20px; font-weight: 900; letter-spacing: 0.02em;">
                  ⚽ ${data.nextMatchHome} vs ${data.nextMatchAway}
                </p>
                <p style="margin: 0; color: #64748b; font-size: 13px;">⏰ Bắt đầu sau ${hoursText}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
  }

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kết quả Pick'em hôm nay</title>
</head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1e;padding:24px 16px;">
  <tr>
    <td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- ── HERO HEADER ── -->
        <tr>
  <td
    style="
      border-radius:8px 8px 0 0;
      overflow:hidden;
      padding:0;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="
        background-image:url('${headerBg}');
        background-size:cover;
        background-position:center;
        border-radius:8px 8px 0 0;
        min-height:220px;
      "
    >
      <tr>
        <!-- Left: Logo + Title -->
        <td
          style="
            padding:28px 24px;
            vertical-align:bottom;
            width:60%;
          "
        >
          <!-- Dark glass card -->
          <div
            style="
              display:inline-block;
              background:rgba(0,0,0,0.45);
              border:1px solid rgba(255,255,255,0.15);
              border-radius:16px;
              padding:18px 20px;
              max-width:320px;
            "
          >
            <img
              src="${logo}"
              alt="World Cup 2026"
              width="48"
              height="48"
              style="
                display:block;
                margin-bottom:12px;
              "
            />

            <p
              style="
                margin:0;
                color:#ffffff;
                font-size:11px;
                text-transform:uppercase;
                letter-spacing:0.14em;
                font-weight:700;
                text-shadow:0 2px 6px rgba(0,0,0,.6);
              "
            >
              FIFA WORLD CUP 2026
            </p>

            <h1
              style="
                margin:6px 0 0;
                color:#ffffff;
                font-size:38px;
                font-weight:900;
                letter-spacing:0.03em;
                line-height:1;
                text-shadow:
                  0 2px 8px rgba(0,0,0,.6),
                  0 4px 16px rgba(0,0,0,.5);
              "
            >
              PICK'EM
            </h1>

            <p
              style="
                margin:10px 0 0;
                color:#f5f5f5;
                font-size:13px;
                line-height:1.4;
                text-shadow:0 2px 6px rgba(0,0,0,.6);
              "
            >
              Update nào bạn ơi!
            </p>
          </div>
        </td>

        <!-- Right: Hero Player -->
        <td
          style="
            padding:0;
            vertical-align:bottom;
            width:40%;
            text-align:right;
          "
        >
          <img
            src="${heroPlayer}"
            alt=""
            width="180"
            style="
              display:block;
              margin-left:auto;
              max-height:220px;
              object-fit:contain;
              object-position:bottom;
            "
          />
        </td>
      </tr>
    </table>
  </td>
</tr>

        <!-- ── GREETING BANNER ── -->
        <tr>
          <td style="background:#1d4ed8;padding:12px 24px;">
            <p style="margin:0;color:#ffffff;font-size:15px;font-weight:600;">
              Xin chào, <strong>${data.userName}</strong>! 👋
            </p>
          </td>
        </tr>

        <!-- ── STATS ROW ── -->
        <tr>
          <td style="padding:0;background:#0f1f3d;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <!-- Correct -->
                <td style="width:33.33%;padding:20px 16px;text-align:center;border-right:1px solid #1e3a5f;">
                  <p style="margin:0 0 4px;font-size:28px;font-weight:900;color:#22c55e;">
                    ${data.correctToday}
                  </p>
                  <p style="margin:0;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">
                    ✅ Đúng
                  </p>
                </td>
                <!-- Wrong -->
                <td style="width:33.33%;padding:20px 16px;text-align:center;border-right:1px solid #1e3a5f;">
                  <p style="margin:0 0 4px;font-size:28px;font-weight:900;color:#ef4444;">
                    ${data.wrongToday}
                  </p>
                  <p style="margin:0;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">
                    ❌ Sai
                  </p>
                </td>
                <!-- Rank -->
                <td style="width:33.33%;padding:20px 16px;text-align:center;">
                  <p style="margin:0 0 4px;font-size:28px;font-weight:900;color:#f59e0b;">
                    #${data.rank}
                  </p>
                  <p style="margin:0;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">
                    🥇 Hạng
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── DIVIDER ── -->
        <tr><td style="height:2px;background:#1e3a5f;"></td></tr>

        <!-- ── POINTS ROW ── -->
        <tr>
          <td style="padding:0;background:#0f1f3d;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <!-- Points today -->
                <td style="width:50%;padding:20px 24px;border-right:1px solid #1e3a5f;">
                  <p style="margin:0 0 4px;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;">
                    📈 Điểm nhận hôm nay
                  </p>
                  <p style="margin:0;color:#3b82f6;font-size:26px;font-weight:900;">
                    +${data.pointsToday}
                    <span style="font-size:14px;font-weight:400;color:#64748b;">điểm</span>
                  </p>
                </td>
                <!-- Total points -->
                <td style="width:50%;padding:20px 24px;">
                  <p style="margin:0 0 4px;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;">
                    ⭐ Tổng điểm hiện tại
                  </p>
                  <p style="margin:0;color:#ffffff;font-size:26px;font-weight:900;">
                    ${data.totalPoints}
                    <span style="font-size:14px;font-weight:400;color:#64748b;">điểm</span>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── DIVIDER ── -->
        <tr><td style="height:2px;background:#1e3a5f;"></td></tr>

        <!-- ── MOTIVATIONAL ── -->
        ${motivationalHtml}

        <!-- ── CTA ── -->
        <tr>
          <td style="padding:24px;background:#0f1f3d;">
            <p style="margin:0 0 16px;color:#94a3b8;font-size:14px;line-height:1.7;">
              Đừng quên gửi dự đoán trước khi trận đấu diễn ra để tiếp tục
              tích lũy điểm và cạnh tranh trên bảng xếp hạng.
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:12px;">
                  <a href="${picksUrl}"
                    style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;padding:12px 20px;border-radius:4px;text-transform:uppercase;letter-spacing:0.06em;">
                    👉 Dự đoán ngay
                  </a>
                </td>
                <td>
                  <a href="${leaderboardUrl}"
                    style="display:inline-block;background:#1e3a5f;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;padding:12px 20px;border-radius:4px;text-transform:uppercase;letter-spacing:0.06em;">
                    🏆 Bảng xếp hạng
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── NEXT MATCH ── -->
        ${nextMatchHtml}

        <!-- ── FOOTER ── -->
        <tr>
          <td style="background:#0a0f1e;padding:24px;text-align:center;border-top:1px solid #1e3a5f;">
            <img src="${logo}" alt="Pick'em 2026" width="32" height="32"
              style="display:block;margin:0 auto 12px;" />
            <p style="margin:0 0 4px;color:#334155;font-size:13px;">
              Chúc bạn may mắn và tiếp tục leo hạng!
            </p>
            <p style="margin:0 0 16px;color:#334155;font-size:13px;font-weight:700;">
              — World Cup Pick'em 2026
            </p>
            <a href="${unsubscribeUrl}"
              style="color:#334155;font-size:12px;text-decoration:underline;">
              Hủy đăng ký nhận email
            </a>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

export async function sendDailySummaryEmail(
  data: DailySummaryEmailData,
): Promise<boolean> {
  const appUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://fifapickem2026.com";
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail =
    process.env.BREVO_SENDER_EMAIL ?? "noreply@pickem2026.com";
  const senderName = process.env.BREVO_SENDER_NAME ?? "Pick'em World Cup 2026";

  if (!apiKey) {
    console.error("BREVO_API_KEY is not set");
    return false;
  }

  try {
    const res = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: data.to, name: data.userName }],
        subject: `Pick'em hôm nay: +${data.pointsToday} điểm · Hạng #${data.rank}`,
        htmlContent: buildEmailHtml(data),
        headers: {
          "List-Unsubscribe": `<${appUrl}/api/unsubscribe?token=${data.unsubscribeToken}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          "X-Mailer": "Pick'em World Cup 2026",
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Brevo send failed:", err);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Brevo request error:", err);
    return false;
  }
}
