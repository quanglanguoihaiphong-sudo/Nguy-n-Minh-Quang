import React, { useState, useEffect } from 'react';
import { TopicMastery, KnowledgeGap } from '../types';
import {
  Compass,
  Flame,
  Clock,
  AlertOctagon,
  Award,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface AnalyticsViewProps {
  onFixGapClicked?: (topic: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onFixGapClicked }) => {
  // Topic Mastery Data
  const [topics, setTopics] = useState<TopicMastery[]>([
    { subject: 'Đại số & Hàm số', score: 85, questionsAnswered: 42, status: 'good' },
    { subject: 'Hình học không gian', score: 68, questionsAnswered: 35, status: 'average' },
    { subject: 'Tích phân & Nguyên hàm', score: 52, questionsAnswered: 28, status: 'needs_work' },
    { subject: 'Số phức & Oxyz', score: 74, questionsAnswered: 30, status: 'average' },
    { subject: 'Di truyền học & Đột biến', score: 88, questionsAnswered: 45, status: 'good' },
    { subject: 'Dao động điều hòa', score: 60, questionsAnswered: 24, status: 'average' },
  ]);

  // Knowledge Gaps
  const [knowledgeGaps, setKnowledgeGaps] = useState<KnowledgeGap[]>([
    {
      id: 'gap_1',
      topic: 'Tích phân từng phần (Kỹ thuật múa cột & hàm hợp)',
      subject: 'Toán học',
      currentAccuracy: 48,
      recommendation: 'Cần ôn lại quy tắc đặt u = đa thức, dv = hàm lượng giác/mũ và dấu đan xen.',
      suggestedAction: 'Luyện 5 câu Socratic & xem Flashcard',
    },
    {
      id: 'gap_2',
      topic: 'Đột biến dịch khung đọc (Thêm / mất cặp nucleotide)',
      subject: 'Sinh học',
      currentAccuracy: 55,
      recommendation: 'Thường nhầm lẫn giữa đột biến thay thế đồng nghĩa với đột biến dịch khung.',
      suggestedAction: 'Xem Bảng đối chiếu so sánh đột biến',
    },
    {
      id: 'gap_3',
      topic: 'Khoảng cách giữa hai đường thẳng chéo nhau',
      subject: 'Toán học',
      currentAccuracy: 58,
      recommendation: 'Cần nắm vững cách dựng mặt phẳng song song chứa đường này và song song với đường kia.',
      suggestedAction: 'Xem mẹo Casio bấm tích có hướng',
    },
  ]);

  // Pomodoro Timer State
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [streakDays, setStreakDays] = useState(7);
  const [totalFocusHours, setTotalFocusHours] = useState(14.5);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && pomodoroSeconds > 0) {
      interval = setInterval(() => {
        setPomodoroSeconds((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setTotalFocusHours((prev) => prev + 0.4);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, pomodoroSeconds]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Overview Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Chuỗi học liên tục
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1 flex items-center gap-1.5">
              <span>{streakDays} ngày</span>
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Top 10% học sinh kiên trì</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        {/* Total Focus Time */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Tổng giờ tập trung
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalFocusHours} giờ</div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">+2.5 giờ so với tuần trước</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Average Accuracy */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Độ chính xác trung bình
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">73%</div>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Tăng +8% sau các bài Socratic</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Knowledge Gaps count */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Lỗ hổng kiến thức
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{knowledgeGaps.length} chủ đề</div>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">Cần ưu tiên lấp đầy tuần này</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Radar/Subject Mastery & Pomodoro Timer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Knowledge Mastery Radar / Bars */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-600" />
                Bản Đồ Năng Lực Chuyên Đề (Knowledge Radar)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Đánh giá mức độ thành thạo dựa trên kết quả giải bài Socratic và làm Quiz kiểm tra
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              Cập nhật trực tiếp
            </span>
          </div>

          {/* Mastery Progress Bars */}
          <div className="space-y-4">
            {topics.map((t, idx) => {
              let barColor = 'bg-indigo-600';
              let badgeColor = 'bg-blue-50 text-blue-700';
              let statusLabel = 'Đạt yêu cầu';

              if (t.score >= 80) {
                barColor = 'bg-emerald-600';
                badgeColor = 'bg-emerald-50 text-emerald-700';
                statusLabel = 'Vững vàng';
              } else if (t.score < 60) {
                barColor = 'bg-amber-500';
                badgeColor = 'bg-amber-50 text-amber-700';
                statusLabel = 'Cần ôn gấp';
              }

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
                    <span className="text-slate-800">{t.subject}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${badgeColor}`}>
                        {statusLabel}
                      </span>
                      <span className="font-mono text-slate-900 tabular-nums">{t.score}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${t.score}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Đã giải {t.questionsAnswered} câu hỏi & tương tác Socratic</span>
                    <span>Mục tiêu: $\ge 85\%$</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Knowledge Gaps Detailed List */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-amber-600" />
              <span>Các lỗ hổng kiến thức cần lấp đầy ngay (Actionable Gaps):</span>
            </h4>

            <div className="space-y-2.5">
              {knowledgeGaps.map((gap) => (
                <div
                  key={gap.id}
                  className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{gap.topic}</span>
                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                        Độ chính xác: {gap.currentAccuracy}%
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{gap.recommendation}</p>
                  </div>

                  <button
                    onClick={() => {
                      if (onFixGapClicked) onFixGapClicked(gap.topic);
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg whitespace-nowrap self-start sm:self-auto cursor-pointer shadow-xs"
                  >
                    Luyện tập ngay
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Integrated Pomodoro Focus Timer */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Phiên học sâu
            </span>
            <h3 className="text-base font-bold text-slate-900">Đồng Hồ Focus Pomodoro</h3>
            <p className="text-xs text-slate-500">25 phút tập trung cao độ, không phân tâm</p>
          </div>

          {/* Timer Display */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center space-y-4">
            <div className="font-mono text-5xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {formatTimer(pomodoroSeconds)}
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all cursor-pointer ${
                  isTimerRunning
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Tạm dừng</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Bắt đầu học</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setPomodoroSeconds(25 * 60);
                }}
                className="p-2.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl cursor-pointer"
                title="Đặt lại 25 phút"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Study streak & tips */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-950 space-y-2">
            <span className="font-bold text-indigo-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Mẹo duy trì phong độ:
            </span>
            <p className="leading-relaxed text-indigo-900/90">
              Mỗi ngày hoàn thành ít nhất 2 phiên Pomodoro (50 phút) kết hợp lật 10 thẻ Flashcard giúp não bộ củng cố synap thần kinh sâu hơn 300% so với học dồn trước ngày thi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
