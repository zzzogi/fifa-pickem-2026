// lib/email.ts

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export interface DailySummaryEmailData {
  to: string;
  userName: string;
  unsubscribeToken: string;
  correctToday: number;
  wrongToday: number;
  pointsToday: number;
  totalPoints: number;
  rank: number;
  pointsToTop10: number | null;
  overtakenByName: string | null;
  overtakenByPoints: number | null;
  nextMatchHome: string | null;
  nextMatchAway: string | null;
  nextMatchHoursFromNow: number | null;
  hasPicksToday: boolean;
}

// ─────────────────────────────────────────
// SUBJECT GENERATOR — 5 tiers ưu tiên
// ─────────────────────────────────────────

function generateSubject(data: DailySummaryEmailData): string {
  if (!data.hasPicksToday) {
    if (
      data.nextMatchHome &&
      data.nextMatchAway &&
      data.nextMatchHoursFromNow !== null
    ) {
      return `⚽ Bạn chưa gửi dự đoán cho ${data.nextMatchHome} vs ${data.nextMatchAway}`;
    }

    return "⚽ Hôm nay bạn chưa gửi dự đoán nào";
  }

  // 1. Bị vượt hạng — urgent nhất
  if (data.overtakenByName && data.overtakenByPoints !== null) {
    return `${data.overtakenByName} vừa vượt bạn trên BXH • Cách ${data.overtakenByPoints} điểm`;
  }

  // 2. Tiến gần Top 10
  if (data.pointsToTop10 !== null && data.pointsToTop10 <= 5) {
    return `Bạn còn cách Top 10 đúng ${data.pointsToTop10} điểm`;
  }

  // 3. Có trận sắp diễn ra trong vòng 3 tiếng
  if (
    data.nextMatchHome &&
    data.nextMatchAway &&
    data.nextMatchHoursFromNow !== null &&
    data.nextMatchHoursFromNow <= 3
  ) {
    return `⚽ ${data.nextMatchHome} vs ${data.nextMatchAway} sắp diễn ra`;
  }

  // 4. Hôm nay có điểm — tổng kết tích cực
  if (data.pointsToday > 0) {
    return `+${data.pointsToday} điểm hôm nay · Hạng #${data.rank} — xem kết quả của bạn`;
  }

  // 5. Fallback — tổng kết ngày
  return `Kết quả Pick'em hôm nay: ${data.correctToday} đúng · ${data.wrongToday} sai · Hạng #${data.rank}`;
}

function buildMissingPickSection(
  data: DailySummaryEmailData,
  picksUrl: string,
): string {
  if (data.hasPicksToday) return "";

  return `
  <tr>
    <td style="
      padding:20px 24px;
      background:#451a03;
      border-left:4px solid #f59e0b;
    ">
      <p style="
        margin:0 0 8px;
        color:#f59e0b;
        font-size:12px;
        font-weight:700;
        text-transform:uppercase;
      ">
        ⚠ Chưa tham gia hôm nay
      </p>

      <p style="
        margin:0 0 14px;
        color:#fde68a;
        font-size:14px;
        line-height:1.6;
      ">
        Hôm nay bạn chưa có dự đoán nào được chấm điểm.
        World Cup vẫn đang diễn ra và bảng xếp hạng luôn thay đổi.
      </p>

      <a href="${picksUrl}"
        style="
          display:inline-block;
          background:#f59e0b;
          color:#111827;
          text-decoration:none;
          padding:10px 18px;
          font-weight:700;
          border-radius:4px;
        ">
        Gửi dự đoán ngay
      </a>
    </td>
  </tr>
  `;
}

// ─────────────────────────────────────────
// PREHEADER — hidden preview text
// ─────────────────────────────────────────

function buildPreheader(data: DailySummaryEmailData): string {
  let text = `Bạn đang đứng hạng #${data.rank}`;

  if (data.pointsToTop10 !== null && data.pointsToTop10 > 0) {
    text += ` và còn cách Top 10 chỉ ${data.pointsToTop10} điểm.`;
  } else if (data.rank <= 10) {
    text += ` — bạn đang trong Top 10! Giữ vững phong độ.`;
  } else {
    text += `. Hôm nay bạn nhận được ${data.pointsToday} điểm.`;
  }

  return `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  </div>`;
}

// ─────────────────────────────────────────
// SECTION BUILDERS
// ─────────────────────────────────────────

function buildPlainText(data: DailySummaryEmailData) {
  return `
Xin chào ${data.userName}

Hạng hiện tại: #${data.rank}
Điểm hôm nay: +${data.pointsToday}
Tổng điểm: ${data.totalPoints}

Xem bảng xếp hạng:
https://fifapickem2026.com/leaderboard
`;
}

function buildHeroSection(
  logo: string,
  headerBg: string,
  heroPlayer: string,
  userName: string,
): string {
  return `
  <tr>
    <td style="padding:0;border-radius:8px 8px 0 0;overflow:hidden;"
        background="${headerBg}"
        background-size:cover;
        background-position:center;
        border-radius:8px 8px 0 0;
        min-height:220px;
        bgcolor="#0a2a6e">
      <!--[if gte mso 9]>
      <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false"
        style="width:560px;height:220px;">
        <v:fill type="frame" src="${headerBg}" color="#0a2a6e"/>
        <v:textbox inset="0,0,0,0"><![endif]-->
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:28px 24px;vertical-align:bottom;width:60%;">
            <table cellpadding="0" cellspacing="0" border="0"
              style="background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.15);border-radius:12px;">
              <tr>
                <td style="padding:16px 18px;">
                  <img src="${logo}" alt="World Cup 2026" width="24" height="40"
                    style="display:block;margin-bottom:10px;" />
                  <p style="margin:0;color:#ffffff;font-size:10px;text-transform:uppercase;
                    letter-spacing:0.14em;font-weight:700;">FIFA WORLD CUP 2026</p>
                  <p style="margin:6px 0 0;color:#ffffff;font-size:34px;font-weight:900;
                    letter-spacing:0.03em;line-height:1;font-family:Arial Black,Arial,sans-serif;">
                    PICK'EM</p>
                  <p style="margin:8px 0 0;color:#e2e8f0;font-size:13px;">
                    Update nào, ${userName}!</p>
                </td>
              </tr>
            </table>
          </td>
          <td style="padding:0;vertical-align:bottom;width:40%;text-align:right;">
            <img src="${heroPlayer}" alt="" width="160" height="160"
              style="display:block;margin-left:auto;" />
          </td>
        </tr>
      </table>
      <!--[if gte mso 9]></v:textbox></v:rect><![endif]-->
    </td>
  </tr>
  <tr>
    <td style="background:#1d4ed8;padding:11px 24px;">
      <p style="margin:0;color:#ffffff;font-size:15px;font-weight:600;">
        Đây là bản tổng kết Pick'em của bạn hôm nay 👋
      </p>
    </td>
  </tr>`;
}

function buildStatsSection(data: DailySummaryEmailData): string {
  return `
  <tr>
    <td style="padding:0;background:#0f1f3d;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="33%" style="padding:20px 12px;text-align:center;
            border-right:1px solid #1e3a5f;">
            <p style="margin:0 0 4px;font-size:28px;font-weight:900;
              color:#22c55e;font-family:Arial Black,Arial,sans-serif;">
              ${data.correctToday}</p>
            <p style="margin:0;font-size:12px;text-transform:uppercase;
              letter-spacing:0.06em;color:#64748b;">Dự đoán đúng</p>
          </td>
          <td width="33%" style="padding:20px 12px;text-align:center;
            border-right:1px solid #1e3a5f;">
            <p style="margin:0 0 4px;font-size:28px;font-weight:900;
              color:#ef4444;font-family:Arial Black,Arial,sans-serif;">
              ${data.wrongToday}</p>
            <p style="margin:0;font-size:12px;text-transform:uppercase;
              letter-spacing:0.06em;color:#64748b;">Dự đoán sai</p>
          </td>
          <td width="33%" style="padding:20px 12px;text-align:center;">
            <p style="margin:0 0 4px;font-size:28px;font-weight:900;
              color:#f59e0b;font-family:Arial Black,Arial,sans-serif;">
              #${data.rank}</p>
            <p style="margin:0;font-size:12px;text-transform:uppercase;
              letter-spacing:0.06em;color:#64748b;">Hạng hiện tại</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr><td style="height:2px;background:#1e3a5f;"></td></tr>
  <tr>
    <td style="padding:0;background:#0f1f3d;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="50%" style="padding:18px 24px;border-right:1px solid #1e3a5f;">
            <p style="margin:0 0 3px;color:#64748b;font-size:11px;
              text-transform:uppercase;letter-spacing:0.08em;">Điểm nhận hôm nay</p>
            <p style="margin:0;color:#3b82f6;font-size:24px;font-weight:900;
              font-family:Arial Black,Arial,sans-serif;">
              +${data.pointsToday}
              <span style="font-size:13px;font-weight:400;color:#64748b;">điểm</span>
            </p>
          </td>
          <td width="50%" style="padding:18px 24px;">
            <p style="margin:0 0 3px;color:#64748b;font-size:11px;
              text-transform:uppercase;letter-spacing:0.08em;">Tổng điểm</p>
            <p style="margin:0;color:#ffffff;font-size:24px;font-weight:900;
              font-family:Arial Black,Arial,sans-serif;">
              ${data.totalPoints}
              <span style="font-size:13px;font-weight:400;color:#64748b;">điểm</span>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function buildCtaSection(picksUrl: string, leaderboardUrl: string): string {
  return `
  <tr>
    <td style="padding:20px 24px;background:#0f1f3d;
      border-top:2px solid #1e3a5f;border-bottom:2px solid #1e3a5f;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding-right:12px;">
            <a href="${picksUrl}"
              style="display:inline-block;background:#1d4ed8;color:#ffffff;
                font-size:13px;font-weight:700;text-decoration:none;
                padding:12px 22px;border-radius:4px;text-transform:uppercase;
                letter-spacing:0.06em;font-family:Arial,sans-serif;">
              &#9658; Dự đoán ngay
            </a>
          </td>
          <td>
            <a href="${leaderboardUrl}"
              style="display:inline-block;background:#1e3a5f;color:#ffffff;
                font-size:13px;font-weight:700;text-decoration:none;
                padding:12px 22px;border-radius:4px;text-transform:uppercase;
                letter-spacing:0.06em;font-family:Arial,sans-serif;">
              &#127942; Bảng xếp hạng
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function buildMotivationalSection(data: DailySummaryEmailData): string {
  if (data.overtakenByName && data.overtakenByPoints !== null) {
    return `
    <tr>
      <td style="padding:16px 24px;background:#0f1f3d;
        border-left:3px solid #ef4444;border-bottom:2px solid #1e3a5f;">
        <p style="margin:0 0 6px;color:#ef4444;font-size:11px;
          text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">
          Vừa bị vượt hạng
        </p>
        <p style="margin:0;color:#94a3b8;font-size:14px;line-height:1.6;">
          <strong style="color:#ffffff;">${data.overtakenByName}</strong>
          vừa qua mặt bạn trên bảng xếp hạng.
          Chỉ cần thêm
          <strong style="color:#ffffff;">${data.overtakenByPoints} điểm</strong>
          nữa là bạn lấy lại vị trí của mình!
        </p>
      </td>
    </tr>`;
  }

  if (data.pointsToTop10 !== null && data.pointsToTop10 > 0) {
    return `
    <tr>
      <td style="padding:16px 24px;background:#0f1f3d;
        border-left:3px solid #f59e0b;border-bottom:2px solid #1e3a5f;">
        <p style="margin:0 0 6px;color:#f59e0b;font-size:11px;
          text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">
          Gần Top 10 lắm rồi
        </p>
        <p style="margin:0;color:#94a3b8;font-size:14px;line-height:1.6;">
          Bạn chỉ còn cách Top 10 đúng
          <strong style="color:#f59e0b;">${data.pointsToTop10} điểm</strong>!
          Tiếp tục dự đoán để leo hạng.
        </p>
      </td>
    </tr>`;
  }

  if (data.rank <= 10) {
    return `
    <tr>
      <td style="padding:16px 24px;background:#0f1f3d;
        border-left:3px solid #22c55e;border-bottom:2px solid #1e3a5f;">
        <p style="margin:0 0 6px;color:#22c55e;font-size:11px;
          text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">
          Đang trong Top 10
        </p>
        <p style="margin:0;color:#94a3b8;font-size:14px;line-height:1.6;">
          Bạn đang giữ vị trí
          <strong style="color:#ffffff;">hạng #${data.rank}</strong>.
          Tiếp tục dự đoán để giữ vững phong độ!
        </p>
      </td>
    </tr>`;
  }

  return "";
}

function buildNextMatchSection(
  data: DailySummaryEmailData,
  picksUrl: string,
): string {
  if (
    !data.nextMatchHome ||
    !data.nextMatchAway ||
    data.nextMatchHoursFromNow === null
  ) {
    return "";
  }

  const hoursText =
    data.nextMatchHoursFromNow < 1
      ? "chưa đến 1 giờ"
      : `${Math.round(data.nextMatchHoursFromNow)} giờ nữa`;

  const isUrgent = data.nextMatchHoursFromNow <= 2;

  return `
  <tr>
    <td style="padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background:#0a1628;">
        <tr>
          <td style="padding:20px 24px;">
            <p style="margin:0 0 4px;color:#64748b;font-size:11px;
              text-transform:uppercase;letter-spacing:0.1em;">Trận tiếp theo</p>
            <p style="margin:0 0 4px;color:#ffffff;font-size:19px;font-weight:900;
              letter-spacing:0.02em;font-family:Arial Black,Arial,sans-serif;">
              ${data.nextMatchHome} vs ${data.nextMatchAway}
            </p>
            <p style="margin:0 0 14px;color:${isUrgent ? "#ef4444" : "#64748b"};
              font-size:13px;font-weight:${isUrgent ? "700" : "400"};">
              ${isUrgent ? "⚠" : "⏰"} Bắt đầu sau ${hoursText}
            </p>
            <a href="${picksUrl}"
              style="display:inline-block;background:#1d4ed8;color:#ffffff;
                font-size:13px;font-weight:700;text-decoration:none;
                padding:10px 20px;border-radius:4px;text-transform:uppercase;
                letter-spacing:0.06em;font-family:Arial,sans-serif;">
              Gửi dự đoán ngay
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function buildFooterSection(logo: string, unsubscribeUrl: string): string {
  return `
  <tr>
    <td style="background:#0a0f1e;padding:24px;text-align:center;
      border-top:1px solid #1e3a5f;">
      <img src="${logo}" alt="Pick'em 2026" width="20" height="32"
        style="display:block;margin:0 auto 12px;" />
        <p style="
  margin:0 0 12px;
  color:#64748b;
  font-size:12px;
  line-height:1.6;
">
  Bạn nhận email này vì đã tham gia World Cup Pick'em 2026.
</p>
      <p style="margin:0 0 4px;color:#334155;font-size:13px;">
        Chúc bạn may mắn và tiếp tục leo hạng!
      </p>
      <p style="margin:0 0 16px;color:#334155;font-size:13px;font-weight:700;">
        — World Cup Pick'em 2026
      </p>
      
      <a href="${unsubscribeUrl}"
        style="color:#475569;font-size:12px;text-decoration:underline;">
        Hủy đăng ký nhận email
      </a>
      <p style="
  margin:12px 0 0;
  color:#475569;
  font-size:12px;
">
  fifapickem2026.com
</p>
    </td>
  </tr>`;
}

// ─────────────────────────────────────────
// MAIN BUILDER
// ─────────────────────────────────────────

function buildEmailHtml(data: DailySummaryEmailData): string {
  const appUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://fifapickem2026.com";
  const unsubscribeUrl = `${appUrl}/api/unsubscribe?token=${data.unsubscribeToken}`;
  const picksUrl = `${appUrl}/picks`;
  const leaderboardUrl = `${appUrl}/leaderboard`;
  const headerBg = `${appUrl}/header-bg.png`;
  const heroPlayer = `${appUrl}/hero-player.png`;
  const logo = `${appUrl}/icon-wc-2026.png`;

  return `<!DOCTYPE html>
<html lang="vi" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Kết quả Pick'em hôm nay</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background:#0a0f1e;
  font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
  -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

${buildPreheader(data)}

<table width="100%" cellpadding="0" cellspacing="0" border="0"
  style="background:#0a0f1e;padding:24px 16px;">
  <tr>
    <td align="center">
      <table width="560" cellpadding="0" cellspacing="0" border="0"
        style="max-width:560px;width:100%;">

        ${buildHeroSection(logo, headerBg, heroPlayer, data.userName)}
        ${buildStatsSection(data)}
        ${buildCtaSection(picksUrl, leaderboardUrl)}
        ${buildMotivationalSection(data)}
        ${buildNextMatchSection(data, picksUrl)}
        ${buildFooterSection(logo, unsubscribeUrl)}
        ${buildMissingPickSection(data, picksUrl)}
        
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

// ─────────────────────────────────────────
// PUBLIC API — không thay đổi signature
// ─────────────────────────────────────────

export async function sendDailySummaryEmail(
  data: DailySummaryEmailData,
): Promise<boolean> {
  const appUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://fifapickem2026.com";
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail =
    process.env.BREVO_SENDER_EMAIL ?? "noreply@fifapickem2026.com";
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
        subject: generateSubject(data),
        htmlContent: buildEmailHtml(data),
        textContent: buildPlainText(data),
        headers: {
          "List-Unsubscribe": `<${appUrl}/api/unsubscribe?token=${data.unsubscribeToken}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          "X-Mailer": "Pick'em World Cup 2026",
          Precedence: "bulk",
          "X-Auto-Response-Suppress": "OOF, AutoReply",
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
