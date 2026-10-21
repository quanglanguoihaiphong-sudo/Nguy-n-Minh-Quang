import React from 'react';
import {
  Users,
  ShieldCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  HeartHandshake,
  PieChart,
  Calendar,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';

interface ParentMentorViewProps {
  onSwitchBack: () => void;
}

export const ParentMentorView: React.FC<ParentMentorViewProps> = ({ onSwitchBack }) => {
  return (
    <div className="space-y-6">
      {/* Top Banner for Parent Mode */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider bg-amber-100 px-2.5 py-0.5 rounded-md">
              Chế độ Dành Cho Phụ Huynh & Người Giám Sát
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Báo Cáo Tiến Độ Ôn Thi & Đồng Hành Tích Cực
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Nắm bắt toàn cảnh sự tiến bộ, tính tự giác và phân bổ thời gian của học sinh mà không can thiệp vi mô gây áp lực.
          </p>
        </div>

        <button
          onClick={onSwitchBack}
          className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          Trở về Chế độ Học sinh
        </button>
      </div>

      {/* 3 Macro Key Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Exam Target Completion Rate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Tiến độ mục tiêu kỳ thi</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900">68%</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Đúng tiến độ đề ra
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '68%' }} />
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Học sinh đã hoàn thành 14 / 21 nhiệm vụ trọng tâm của kỳ thi THPT & Đánh giá năng lực.
          </p>
        </div>

        {/* 2. Proactiveness / Autonomy Index */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Chỉ số tự giác học tập</span>
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-indigo-600">86 / 100</span>
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                Rất chủ động
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: '86%' }} />
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Học sinh tự giác mở bài học đúng khung giờ mục tiêu và tương tác Socratic đều đặn mà không cần nhắc nhở.
          </p>
        </div>

        {/* 3. Consistency / Streak */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Thời gian học tập tuần này</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900">14.5 giờ</span>
              <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                Chuỗi 7 ngày liên tục
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '82%' }} />
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Trung bình 48 phút mỗi ngày. Tỷ lệ tập trung cao qua các phiên Pomodoro 25 phút.
          </p>
        </div>
      </div>

      {/* Subject Time Allocation & Encouragement Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Time Spent by Subject */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-600" />
              Phân Bổ Thời Gian Theo Môn Học (Time Allocation)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Các môn học sinh dành nhiều thời gian nhất trong 14 ngày qua
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-1">
                <span className="text-slate-800">Toán học (Giải tích, Hàm số, Oxyz)</span>
                <span className="text-slate-900 font-mono">6.5 giờ (45%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-1">
                <span className="text-slate-800">Sinh học & Di truyền học</span>
                <span className="text-slate-900 font-mono">3.8 giờ (26%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '26%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-1">
                <span className="text-slate-800">Vật lý (Dao động cơ & Sóng)</span>
                <span className="text-slate-900 font-mono">2.6 giờ (18%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '18%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-1">
                <span className="text-slate-800">Hóa học & Tiếng Anh</span>
                <span className="text-slate-900 font-mono">1.6 giờ (11%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '11%' }} />
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200">
            <strong>Nhận xét từ AI:</strong> Học sinh dành nhiều tâm huyết cho môn Toán và Sinh. Cần khuyến khích cân đối thêm 15-20 phút mỗi tuần cho môn Hóa học và tiếng Anh để điểm tổ hợp đạt độ đồng đều tối ưu.
          </div>
        </div>

        {/* Right: Positive Parenting & Encouragement Guidelines */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">Gợi Ý Đồng Hành Tích Cực</h3>
          </div>

          <div className="space-y-3 text-xs leading-relaxed text-slate-700">
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-1">
              <span className="font-bold text-amber-900 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-600" /> Khen ngợi sự kiên trì:
              </span>
              <p className="text-amber-950">
                "Bố/mẹ thấy con đã giữ chuỗi học tập 7 ngày liên tục rất đều đặn. Con đã rất nỗ lực đấy!" — Giúp kích hoạt hoocmon Dopamine tạo động lực tự giác lâu dài.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
              <span className="font-bold text-slate-800">Không soi xét lỗi sai chi tiết:</span>
              <p className="text-slate-600">
                Phương pháp Socratic khuyến khích học sinh phạm sai lầm để tự sửa (Productive Struggle). Phụ huynh không cần lo lắng khi thấy điểm quiz ban đầu chưa cao, vì hệ thống tự động tái cấu trúc lịch ôn bù.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
              <span className="font-bold text-slate-800">Tạo không gian nghỉ ngơi:</span>
              <p className="text-slate-600">
                Khuyến khích học sinh rời bàn học sau 25 phút tập trung để uống nước hoặc vận động nhẹ, giúp hồi phục vỏ não trước trán trước khi bắt đầu phiên tiếp theo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
