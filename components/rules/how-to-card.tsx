// components/rules/how-to-card.tsx
const steps = [
  {
    number: "01",
    title: "Đăng nhập",
    desc: "Đăng nhập bằng tài khoản Google của bạn. Bắt đầu ngay với chỉ một cú nhấp.",
  },
  {
    number: "02",
    title: "Chọn trận đấu",
    desc: 'Truy cập mục "Dự đoán của tôi" và xem lịch thi đấu World Cup. Tất cả 104 trận đấu đều được hiển thị tại đây.',
  },
  {
    number: "03",
    title: "Gửi dự đoán",
    desc: "Nhập tỷ số mà bạn dự đoán sẽ xảy ra — số bàn thắng của đội chủ nhà và đội khách. Sau đó nhấn Lưu dự đoán.",
  },
  {
    number: "04",
    title: "Chốt dự đoán trước giờ bóng lăn",
    desc: "Bạn có thể chỉnh sửa dự đoán bất kỳ lúc nào trước khi trận đấu bắt đầu. Khi trọng tài thổi còi khai cuộc, dự đoán sẽ bị khóa.",
  },
  {
    number: "05",
    title: "Nhận điểm tự động",
    desc: "Sau khi trận đấu kết thúc, điểm số sẽ được tính tự động. Bạn không cần thực hiện thêm thao tác nào.",
  },
  {
    number: "06",
    title: "Leo bảng xếp hạng",
    desc: "Theo dõi bảng xếp hạng để xem vị trí của bạn so với những người chơi khác. Chúc bạn trở thành nhà dự đoán xuất sắc nhất.",
  },
];

export default function HowToCard() {
  return (
    <div className="card-sports p-6">
      <h2
        className="text-2xl mb-6"
        style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
      >
        CÁCH THAM GIA
      </h2>

      <div className="space-y-0">
        {steps.map((step, index) => (
          <div
            key={step.number}
            className="flex gap-4 pb-6"
            style={{
              borderLeft:
                index < steps.length - 1
                  ? "2px solid var(--outline-variant)"
                  : "2px solid transparent",
              marginLeft: "15px",
              paddingLeft: "24px",
              position: "relative",
            }}
          >
            {/* Vòng tròn — bước 01 sử dụng màu primary nổi bật hơn */}
            <div
              className="absolute flex items-center justify-center rounded-full text-sm font-bold flex-shrink-0"
              style={{
                width: 32,
                height: 32,
                left: -16,
                top: 0,
                background:
                  index === 0 ? "var(--primary)" : "var(--surface-high)",
                color: index === 0 ? "white" : "var(--outline)",
                fontFamily: "var(--font-display)",
                fontSize: "0.9rem",
                boxShadow:
                  index === 0
                    ? "0 0 0 4px oklch(from var(--primary) l c h / 0.2)"
                    : "none",
              }}
            >
              {step.number}
            </div>

            <div className="pt-0.5">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3
                  className="text-base font-bold"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    color: "var(--foreground)",
                  }}
                >
                  {step.title}
                </h3>

                {/* Nhãn "Bắt đầu tại đây" cho bước 01 */}
                {index === 0 && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-[4px] font-bold uppercase tracking-wide"
                    style={{
                      background: "var(--primary)",
                      color: "white",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    Bắt đầu tại đây
                  </span>
                )}
              </div>

              <p
                className="text-sm"
                style={{
                  color: "var(--outline)",
                  fontFamily: "var(--font-body)",
                  lineHeight: 1.6,
                }}
              >
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
