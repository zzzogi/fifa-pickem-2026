// app/api/unsubscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function htmlPage(
  title: string,
  message: string,
  isError = false,
): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — Pick'em 2026</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0a0f1e;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: #0f1f3d;
      border: 1px solid #1e3a5f;
      border-radius: 8px;
      padding: 40px 32px;
      max-width: 440px;
      width: 100%;
      text-align: center;
    }
    .brand {
      color: #64748b;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 4px;
    }
    .logo {
      color: #ffffff;
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 0.02em;
      margin-bottom: 32px;
    }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 {
      color: #ffffff;
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 12px;
    }
    p {
      color: #94a3b8;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    a.btn {
      display: inline-block;
      background: #1d4ed8;
      color: #ffffff;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      padding: 10px 24px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .error { color: #ef4444; }
  </style>
</head>
<body>
  <div class="card">
    <p class="brand">FIFA World Cup 2026</p>
    <p class="logo">PICK'EM</p>
    <div class="icon">${isError ? "⚠️" : "✅"}</div>
    <h1 class="${isError ? "error" : ""}">${title}</h1>
    <p>${message}</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "/"}" class="btn">
      Về trang chính
    </a>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
    status: isError ? 400 : 200,
  });
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return htmlPage(
      "Link không hợp lệ",
      "Token hủy đăng ký không tồn tại. Vui lòng kiểm tra lại link trong email.",
      true,
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { unsubscribeToken: token },
      select: { id: true, emailSubscribed: true },
    });

    if (!user) {
      return htmlPage(
        "Link không hợp lệ",
        "Token này không tồn tại hoặc đã hết hạn.",
        true,
      );
    }

    if (!user.emailSubscribed) {
      return htmlPage(
        "Đã hủy đăng ký",
        "Bạn đã hủy đăng ký nhận email trước đó. Chúng tôi sẽ không gửi thêm email cho bạn.",
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailSubscribed: false },
    });

    return htmlPage(
      "Hủy đăng ký thành công",
      "Bạn sẽ không còn nhận được email tổng kết từ Pick'em nữa. Bạn vẫn có thể tiếp tục chơi và theo dõi bảng xếp hạng trên website.",
    );
  } catch (err) {
    console.error("Unsubscribe error:", err);
    return htmlPage(
      "Có lỗi xảy ra",
      "Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.",
      true,
    );
  }
}
