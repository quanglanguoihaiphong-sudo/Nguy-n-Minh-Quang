import React, { useState } from 'react';
import { DailyTask, ExamPlan } from '../types';
import {
  Calendar,
  Clock,
  Target,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  BookOpen,
  Plus,
  Play,
  ArrowRight,
  Filter,
  Flame,
  Award,
} from 'lucide-react';

interface ExamPlannerViewProps {
  onTasksUpdated?: (completedCount: number, totalCount: number) => void;
}

const DEFAULT_PLAN: ExamPlan = {
  examName: 'Kỳ thi Tốt nghiệp THPT & Đánh giá năng lực 2026',
  targetDate: '2026-06-25',
  dailyMinutes: 45,
  totalWeeks: 3,
  strategyNote: 'Lịch trình cân đối 40% lý thuyết và 60% bài tập thực chiến, tích hợp mốc thi thử cuối mỗi tuần.',
  dailyTasks: [
    {
      id: 'task_1',
      dayNumber: 1,
      dateOffsetDays: 0,
      topic: 'Đại số: Hàm số & Khảo sát sự biến thiên',
      taskName: 'Ngày 1: Lý thuyết đơn điệu & 15 câu nhận biết - thông hiểu',
      type: 'theory',
      estimatedMinutes: 45,
      priority: 'high',
      actionDetails: 'Học lại điều kiện đủ của tính đơn điệu f\'(x) >= 0. Làm bài tập xét dấu bảng biến thiên.',
      completed: true,
      missed: false,
    },
    {
      id: 'task_2',
      dayNumber: 2,
      dateOffsetDays: 1,
      topic: 'Đại số: Cực trị hàm số & Tiệm cận đồ thị',
      taskName: 'Ngày 2: Bài tập cực trị hàm bậc 3 và bậc 4 trùng phương',
      type: 'practice',
      estimatedMinutes: 45,
      priority: 'high',
      actionDetails: 'Luyện 20 bài trắc nghiệm tìm m để hàm số có 3 điểm cực trị.',
      completed: true,
      missed: false,
    },
    {
      id: 'task_3',
      dayNumber: 3,
      dateOffsetDays: 2,
      topic: 'Hình học: Thể tích khối chóp & Lăng trụ đứng',
      taskName: 'Ngày 3: Công thức tính nhanh thể tích khối đa diện cơ bản',
      type: 'theory',
      estimatedMinutes: 45,
      priority: 'medium',
      actionDetails: 'Tổng ôn công thức V = 1/3 * B * h và V = B * h. Xác định chân đường cao hình chiếu.',
      completed: false,
      missed: false,
    },
    {
      id: 'task_4',
      dayNumber: 4,
      dateOffsetDays: 3,
      topic: 'Hình học: Góc và khoảng cách trong không gian',
      taskName: 'Ngày 4: Bài tập góc giữa đường thẳng và mặt phẳng',
      type: 'practice',
      estimatedMinutes: 45,
      priority: 'high',
      actionDetails: 'Phương pháp kẻ đường vuông góc phụ hoặc gắn trục tọa độ Oxyz.',
      completed: false,
      missed: false,
    },
    {
      id: 'task_5',
      dayNumber: 5,
      dateOffsetDays: 4,
      topic: 'Giải tích: Nguyên hàm & Bảng công thức cơ bản',
      taskName: 'Ngày 5: Ôn tập 12 công thức nguyên hàm bảng chuẩn',
      type: 'theory',
      estimatedMinutes: 45,
      priority: 'medium',
      actionDetails: 'Nắm vững phương pháp đổi biến số u = u(x).',
      completed: false,
      missed: false,
    },
    {
      id: 'task_6',
      dayNumber: 6,
      dateOffsetDays: 5,
      topic: 'Giải tích: Tích phân từng phần',
      taskName: 'Ngày 6: Bài tập "Nhất log, nhì đa, tam lượng, tứ mũ"',
      type: 'practice',
      estimatedMinutes: 45,
      priority: 'high',
      actionDetails: 'Thực hành kỹ thuật múa cột / sơ đồ đường chéo giải nhanh tích phân từng phần.',
      completed: false,
      missed: false,
    },
    {
      id: 'task_7',
      dayNumber: 7,
      dateOffsetDays: 6,
      topic: 'Kiểm tra tiến độ Tuần 1: Thi thử tổng hợp 50 câu (90 phút)',
      taskName: 'Ngày 7: Mốc thi thử tuần 1 bấm giờ nghiêm túc',
      type: 'mock_test',
      estimatedMinutes: 90,
      priority: 'high',
      actionDetails: 'Đánh giá điểm số và phát hiện chuyên đề bị hổng để tự động điều chỉnh tuần 2.',
      completed: false,
      missed: false,
    },
    {
      id: 'task_8',
      dayNumber: 8,
      dateOffsetDays: 7,
      topic: 'Số phức: Các phép toán cơ bản & Biểu diễn hình học',
      taskName: 'Ngày 8: Môđun số phức & Tập hợp điểm trong mặt phẳng Oxy',
      type: 'theory',
      estimatedMinutes: 45,
      priority: 'medium',
      actionDetails: 'Lý thuyết số phức liên hợp, phương trình đường tròn và đường elip.',
      completed: false,
      missed: false,
    },
    {
      id: 'task_9',
      dayNumber: 9,
      dateOffsetDays: 8,
      topic: 'Vật lý / Hóa học: Tổ hợp tự nhiên trọng điểm',
      taskName: 'Ngày 9: Dao động điều hòa & Este - Lipit nâng cao',
      type: 'practice',
      estimatedMinutes: 45,
      priority: 'medium',
      actionDetails: '25 câu trắc nghiệm đồ thị dao động và bài tập đốt cháy este.',
      completed: false,
      missed: false,
    },
  ],
};

export const ExamPlannerView: React.FC<ExamPlannerViewProps> = ({ onTasksUpdated }) => {
  const [plan, setPlan] = useState<ExamPlan>(DEFAULT_PLAN);
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'completed' | 'missed'>('all');
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [rebalanceMessage, setRebalanceMessage] = useState<string | null>(null);

  // Form setup state
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [examNameInput, setExamNameInput] = useState(plan.examName);
  const [targetDateInput, setTargetDateInput] = useState(plan.targetDate);
  const [dailyMinutesInput, setDailyMinutesInput] = useState(plan.dailyMinutes);
  const [totalWeeksInput, setTotalWeeksInput] = useState(plan.totalWeeks);

  // Toggle complete task
  const handleToggleTask = (taskId: string) => {
    const updatedTasks = plan.dailyTasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, completed: !t.completed, missed: false };
      }
      return t;
    });

    setPlan((prev) => ({ ...prev, dailyTasks: updatedTasks }));
    const completedCount = updatedTasks.filter((t) => t.completed).length;
    if (onTasksUpdated) {
      onTasksUpdated(completedCount, updatedTasks.length);
    }
  };

  // Simulate missed task
  const handleMarkMissed = (taskId: string) => {
    const updatedTasks = plan.dailyTasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, missed: true, completed: false };
      }
      return t;
    });
    setPlan((prev) => ({ ...prev, dailyTasks: updatedTasks }));
  };

  // Trigger Adaptive Re-balancing
  const handleTriggerRebalance = async () => {
    setIsRebalancing(true);
    setRebalanceMessage(null);

    const missedIds = plan.dailyTasks.filter((t) => t.missed).map((t) => t.id);
    const lowScoreTopics = [
      { topic: 'Tích phân từng phần', score: 45 },
      { topic: 'Cực trị khối Oxyz', score: 50 },
    ];

    try {
      const res = await fetch('/api/planner/rebalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentTasks: plan.dailyTasks,
          missedTaskIds: missedIds.length > 0 ? missedIds : ['task_3'],
          lowScoreTopics,
          dailyMinutes: plan.dailyMinutes,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPlan((prev) => ({
          ...prev,
          dailyTasks: data.data.rescheduledTasks,
        }));
        setRebalanceMessage(
          data.data.adjustmentReason ||
            'Lịch trình đã tự động phân bổ lại: các nhiệm vụ trễ hạn và các chuyên đề điểm yếu đã được dàn đều sang các ngày kế tiếp.'
        );
      }
    } catch (err) {
      console.error('Error rebalancing:', err);
    } finally {
      setIsRebalancing(false);
    }
  };

  // Save new plan settings
  const handleSavePlanConfig = async () => {
    setIsRebalancing(true);
    setShowConfigModal(false);
    try {
      const res = await fetch('/api/planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examName: examNameInput,
          targetDate: targetDateInput,
          dailyMinutes: dailyMinutesInput,
          totalWeeks: totalWeeksInput,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPlan({
          examName: data.data.examName,
          targetDate: data.data.targetDate,
          dailyMinutes: data.data.dailyMinutes,
          totalWeeks: totalWeeksInput,
          strategyNote: data.data.strategyNote,
          dailyTasks: data.data.dailyTasks,
        });
      }
    } catch (err) {
      console.error('Error generating plan:', err);
    } finally {
      setIsRebalancing(false);
    }
  };

  // Filter tasks
  const filteredTasks = plan.dailyTasks.filter((task) => {
    if (filterType === 'pending') return !task.completed && !task.missed;
    if (filterType === 'completed') return task.completed;
    if (filterType === 'missed') return task.missed;
    return true;
  });

  const completedCount = plan.dailyTasks.filter((t) => t.completed).length;
  const missedCount = plan.dailyTasks.filter((t) => t.missed).length;
  const progressPct = Math.round((completedCount / plan.dailyTasks.length) * 100);

  return (
    <div className="space-y-6">
      {/* Target & Pacing Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Mục tiêu kỳ thi:
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {plan.dailyMinutes} phút/ngày · {plan.totalWeeks} tuần ôn tập
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {plan.examName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">{plan.strategyNote}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowConfigModal(true)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cấu hình mục tiêu
            </button>

            <button
              onClick={handleTriggerRebalance}
              disabled={isRebalancing}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRebalancing ? 'animate-spin' : ''}`} />
              <span>Tự động Tái cân bằng (Re-balance)</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
          <div className="sm:col-span-2 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700">Tiến độ ôn tập chung</span>
              <span className="text-indigo-600">{progressPct}% hoàn thành</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              {completedCount}
            </div>
            <div>
              <span className="block font-semibold text-slate-800">Đã hoàn thành</span>
              <span className="text-[11px] text-slate-400">Nhiệm vụ đúng hạn</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              {missedCount}
            </div>
            <div>
              <span className="block font-semibold text-slate-800">Cần bù đắp</span>
              <span className="text-[11px] text-slate-400">Trễ hạn / Lỗ hổng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Adaptive Rebalance Notification banner if active */}
      {rebalanceMessage && (
        <div className="bg-indigo-50/90 border border-indigo-200 rounded-2xl p-4 text-xs sm:text-sm text-indigo-950 flex items-start justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-indigo-900 block mb-0.5">
                Thuật toán thích ứng đã tự động điều chỉnh lịch trình:
              </span>
              <p className="leading-relaxed">{rebalanceMessage}</p>
            </div>
          </div>
          <button
            onClick={() => setRebalanceMessage(null)}
            className="text-indigo-400 hover:text-indigo-700 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter Tabs and Quick Simulation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả ({plan.dailyTasks.length})
          </button>
          <button
            onClick={() => setFilterType('pending')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filterType === 'pending'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Chưa học ({plan.dailyTasks.length - completedCount - missedCount})
          </button>
          <button
            onClick={() => setFilterType('completed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filterType === 'completed'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đã hoàn thành ({completedCount})
          </button>
          <button
            onClick={() => setFilterType('missed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filterType === 'missed'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bị bỏ lỡ ({missedCount})
          </button>
        </div>

        {/* Quick simulation trigger for testing adaptive algorithm */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 hidden sm:inline">Mô phỏng tình huống:</span>
          <button
            onClick={() => {
              const pendingTask = plan.dailyTasks.find((t) => !t.completed && !t.missed);
              if (pendingTask) handleMarkMissed(pendingTask.id);
            }}
            className="px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
          >
            + Giả lập Bỏ lỡ buổi học hôm nay
          </button>
        </div>
      </div>

      {/* Daily Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map((task, idx) => {
          let badgeColor = 'bg-slate-100 text-slate-700';
          if (task.type === 'theory') badgeColor = 'bg-blue-50 text-blue-700';
          else if (task.type === 'practice') badgeColor = 'bg-emerald-50 text-emerald-700';
          else if (task.type === 'mock_test') badgeColor = 'bg-purple-50 text-purple-700';
          else if (task.type === 'review') badgeColor = 'bg-amber-50 text-amber-700';

          return (
            <div
              key={task.id}
              className={`bg-white rounded-2xl border p-4 sm:p-5 flex items-start justify-between gap-4 transition-all ${
                task.completed
                  ? 'border-emerald-200 bg-emerald-50/20 opacity-80'
                  : task.missed
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-slate-200 shadow-xs hover:border-indigo-200'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Complete checkbox button */}
                <button
                  onClick={() => handleToggleTask(task.id)}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${
                    task.completed
                      ? 'bg-emerald-600 text-white'
                      : 'border-2 border-slate-300 hover:border-indigo-600'
                  }`}
                >
                  {task.completed && <CheckCircle2 className="w-4 h-4" />}
                </button>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">
                      Ngày {task.dayNumber}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${badgeColor}`}>
                      {task.type === 'theory'
                        ? 'Lý thuyết 40%'
                        : task.type === 'practice'
                        ? 'Bài tập vận dụng 60%'
                        : task.type === 'mock_test'
                        ? 'Mốc Thi thử'
                        : 'Củng cố kiến thức'}
                    </span>
                    {task.missed && (
                      <span className="text-[11px] font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded">
                        Đã trễ hạn (Tự động bù)
                      </span>
                    )}
                  </div>

                  <h3
                    className={`text-sm sm:text-base font-bold ${
                      task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}
                  >
                    {task.taskName}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{task.actionDetails}</p>
                </div>
              </div>

              {/* Action buttons & duration */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{task.estimatedMinutes} phút</span>
                </span>

                {!task.completed && !task.missed && (
                  <button
                    onClick={() => handleMarkMissed(task.id)}
                    className="text-[11px] text-slate-400 hover:text-amber-700 cursor-pointer"
                  >
                    Đánh dấu bỏ lỡ
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Thiết Lập Mục Tiêu Ôn Thi</h3>
            <p className="text-xs text-slate-500">
              Nhập thông tin kỳ thi để hệ thống tự động sinh đề cương và phân bổ tải trọng thích ứng.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Tên kỳ thi:</label>
                <input
                  type="text"
                  value={examNameInput}
                  onChange={(e) => setExamNameInput(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Ngày thi:</label>
                  <input
                    type="date"
                    value={targetDateInput}
                    onChange={(e) => setTargetDateInput(e.target.value)}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Thời gian/ngày:
                  </label>
                  <select
                    value={dailyMinutesInput}
                    onChange={(e) => setDailyMinutesInput(parseInt(e.target.value))}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value={30}>30 phút/ngày</option>
                    <option value={45}>45 phút/ngày (Khuyên dùng)</option>
                    <option value={60}>60 phút/ngày</option>
                    <option value={90}>90 phút/ngày</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Số tuần ôn tập:</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={totalWeeksInput}
                  onChange={(e) => setTotalWeeksInput(parseInt(e.target.value) || 3)}
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSavePlanConfig}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer shadow-xs"
              >
                Tạo lộ trình thích ứng mới
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
