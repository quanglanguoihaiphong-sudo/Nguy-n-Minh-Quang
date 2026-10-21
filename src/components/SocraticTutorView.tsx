import React, { useState } from 'react';
import { SocraticProblem, SocraticStep, ChatMessage } from '../types';
import { FormattedMathText, MathView } from './MathView';
import {
  Sparkles,
  HelpCircle,
  Lightbulb,
  Calculator,
  MessageSquare,
  Send,
  CheckCircle2,
  ChevronRight,
  Eye,
  RotateCcw,
  BookOpen,
  Image as ImageIcon,
  ArrowRight,
  Smile,
  Zap,
} from 'lucide-react';

interface SocraticTutorViewProps {
  onMasteryUpdate?: (subject: string, delta: number) => void;
}

const SAMPLE_PROBLEMS = [
  {
    title: 'Toán học: Phương trình lượng giác',
    subject: 'Toán học',
    text: 'Giải phương trình: 2*sin^2(x) + 3*cos(x) - 3 = 0',
  },
  {
    title: 'Vật lý 12: Dao động điều hòa & Năng lượng',
    subject: 'Vật lý',
    text: 'Một con lắc lò xo có k = 100 N/m, m = 100g dao động với biên độ A = 5cm. Tại vị trí nào thì thế năng bằng 3 lần động năng, và vận tốc lúc đó bằng bao nhiêu?',
  },
  {
    title: 'Hóa học: Cân bằng Este hóa & Hiệu suất',
    subject: 'Hóa học',
    text: 'Cho 12g axit axetic (CH3COOH) tác dụng với 13.8g etanol (C2H5OH) có xúc tác H2SO4 đặc, đun nóng. Sau phản ứng thu được 11g este etyl axetat. Tính hiệu suất của phản ứng este hóa.',
  },
  {
    title: 'Giải tích: Tích phân từng phần',
    subject: 'Toán học',
    text: 'Tính tích phân: I = \\int_{0}^{\\pi/2} x \\cdot \\cos(x) \\, dx',
  },
];

export const SocraticTutorView: React.FC<SocraticTutorViewProps> = ({ onMasteryUpdate }) => {
  const [inputText, setInputText] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Toán học');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Current active problem
  const [problem, setProblem] = useState<SocraticProblem | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [revealedHints, setRevealedHints] = useState<Record<string, number>>({});
  const [revealedExplanations, setRevealedExplanations] = useState<Record<string, boolean>>({});
  const [studentReflections, setStudentReflections] = useState<Record<string, string>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  // Line selection & Follow-up Chat State
  const [selectedText, setSelectedText] = useState('');
  const [selectedStepTitle, setSelectedStepTitle] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Handle solving a problem
  const handleSolveProblem = async (customText?: string, customSubj?: string) => {
    const textToSolve = customText !== undefined ? customText : inputText;
    const subjToSolve = customSubj !== undefined ? customSubj : selectedSubject;

    if (!textToSolve.trim() && !uploadedImage) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/socratic/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemText: textToSolve,
          subject: subjToSolve,
          imageBase64: uploadedImage,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProblem(data.data);
        setActiveStepIndex(0);
        setRevealedHints({});
        setRevealedExplanations({});
        setStudentReflections({});
        setCompletedSteps({});

        // Add welcome message to chat
        setChatMessages([
          {
            id: 'init',
            sender: 'assistant',
            text: `Xin chào! Tôi là Gia sư Socratic đồng hành cùng bạn. Với bài toán "${data.data.title}", chúng ta sẽ cùng giải quyết theo 4 bước tư duy. Bạn có thể nhấn vào bất kỳ dòng giải nào để tôi phân tích sâu hơn hoặc chỉ mẹo bấm máy tính Casio nhé!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      console.error('Error solving problem:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Image Upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reveal progressive hints
  const handleRevealHint = (stepId: string, maxHints: number) => {
    const current = revealedHints[stepId] || 0;
    if (current < maxHints) {
      setRevealedHints((prev) => ({ ...prev, [stepId]: current + 1 }));
    }
  };

  // Complete step and unlock next
  const handleCompleteStep = (index: number, stepId: string) => {
    setCompletedSteps((prev) => ({ ...prev, [stepId]: true }));
    if (onMasteryUpdate && problem) {
      onMasteryUpdate(problem.subject, 15);
    }
    if (index + 1 < (problem?.steps.length || 0)) {
      setActiveStepIndex(index + 1);
    }
  };

  // Handle line selection inside step explanation
  const handleTextSelection = (stepTitle: string) => {
    const selection = window.getSelection()?.toString().trim();
    if (selection && selection.length > 3) {
      setSelectedText(selection);
      setSelectedStepTitle(stepTitle);
    }
  };

  // Trigger quick follow-up action
  const handleQuickFollowUp = async (mode: 'explain_step' | 'casio' | 'analogy', customQuery?: string) => {
    const query =
      customQuery ||
      (mode === 'explain_step'
        ? `Giải thích chi tiết vì sao từ bước trước lại ra được dòng này: "${selectedText || selectedStepTitle}"?`
        : mode === 'casio'
        ? `Có mẹo bấm máy tính Casio fx-580VNX hoặc bấm máy nhanh cho đoạn này không: "${selectedText || selectedStepTitle}"?`
        : `Hãy giải thích dòng này bằng một ẩn dụ đời thường dễ hiểu: "${selectedText || selectedStepTitle}"`);

    // Add user message
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      referencedStepTitle: selectedStepTitle,
      selectedText: selectedText,
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/socratic/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemContext: problem?.title || inputText,
          stepTitle: selectedStepTitle,
          selectedText: selectedText,
          userQuestion: query,
          mode,
        }),
      });
      const data = await res.json();
      if (data.success && data.answer) {
        const assistantMsg: ChatMessage = {
          id: `a_${Date.now()}`,
          sender: 'assistant',
          text: data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      console.error('Error in followup:', err);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Submit custom chat message
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;
    const q = chatInput.trim();
    setChatInput('');
    await handleQuickFollowUp('explain_step', q);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Question Input Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 lg:p-6 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Gia Sư Socratic & Giải Toán Đào Sâu
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Tách bài toán thành 4 giai đoạn tư duy logic. Đặt câu hỏi gợi mở để người học tự tìm ra lời giải.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-lg bg-slate-100 text-slate-700 border-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="Toán học">Toán học</option>
              <option value="Vật lý">Vật lý</option>
              <option value="Hóa học">Hóa học</option>
              <option value="Sinh học">Sinh học</option>
              <option value="Tiếng Anh">Tiếng Anh & Logic</option>
            </select>
          </div>
        </div>

        {/* Input box */}
        <div className="space-y-3">
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Nhập đề bài toán, bài tập tự nhiên hoặc dán công thức vào đây (Ví dụ: Cho hàm số y = x^3 - 3x + 1, tìm điểm cực trị...)"
              rows={3}
              className="w-full text-sm rounded-xl border border-slate-200 p-3.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none outline-none font-sans"
            />

            {/* Uploaded image indicator */}
            {uploadedImage && (
              <div className="absolute right-3 bottom-3 flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md text-xs text-indigo-700">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Đã đính kèm ảnh</span>
                <button
                  onClick={() => setUploadedImage(null)}
                  className="text-slate-400 hover:text-red-500 font-bold ml-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors">
                <ImageIcon className="w-4 h-4 text-slate-500" />
                <span>Chụp / Tải ảnh bài tập</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {/* Sample problems dropdown */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
                <span>Mẫu thử:</span>
                {SAMPLE_PROBLEMS.slice(0, 3).map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputText(sample.text);
                      setSelectedSubject(sample.subject);
                      handleSolveProblem(sample.text, sample.subject);
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 underline truncate max-w-[120px] cursor-pointer"
                  >
                    {sample.title.split(':')[0]}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleSolveProblem()}
              disabled={isLoading || (!inputText.trim() && !uploadedImage)}
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang phân tích Socratic...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Phân tích theo 4 bước Socratic</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Zone Sandbox Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Zone: Socratic 4-step interactive solver */}
        <div className="lg:col-span-7 space-y-4">
          {problem ? (
            <>
              {/* Problem overview header */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span className="font-semibold text-indigo-600">{problem.subject}</span>
                  <span>
                    Tiến độ: {Object.keys(completedSteps).length} / {problem.steps.length} bước
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  <FormattedMathText text={problem.title} />
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{problem.summary}</p>
              </div>

              {/* Steps Accordion / Progression */}
              <div className="space-y-4">
                {problem.steps.map((step, index) => {
                  const isCompleted = !!completedSteps[step.id];
                  const isActive = index === activeStepIndex;
                  const currentHintCount = revealedHints[step.id] || 0;
                  const isExplanationOpen = !!revealedExplanations[step.id];

                  return (
                    <div
                      key={step.id}
                      className={`bg-white rounded-2xl border transition-all ${
                        isActive
                          ? 'border-indigo-400 ring-2 ring-indigo-50 shadow-sm'
                          : isCompleted
                          ? 'border-emerald-200 bg-emerald-50/20'
                          : 'border-slate-200 opacity-90'
                      }`}
                    >
                      {/* Step Header */}
                      <div
                        onClick={() => setActiveStepIndex(index)}
                        className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer select-none"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                              isCompleted
                                ? 'bg-emerald-600 text-white'
                                : isActive
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
                              {isCompleted && (
                                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                  Đã hoàn thành
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 font-medium">
                              Khái niệm: {step.concept}
                            </p>
                          </div>
                        </div>

                        <ChevronRight
                          className={`w-5 h-5 text-slate-400 transition-transform ${
                            isActive ? 'rotate-90 text-indigo-600' : ''
                          }`}
                        />
                      </div>

                      {/* Step Active Body */}
                      {isActive && (
                        <div className="px-4 pb-5 sm:px-5 border-t border-slate-100 pt-4 space-y-4">
                          {/* Formula Box if available */}
                          {step.formula && (
                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center">
                              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                                Công thức trọng tâm
                              </span>
                              <MathView math={step.formula} block={true} />
                            </div>
                          )}

                          {/* Socratic Guiding Question Box */}
                          <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-4">
                            <div className="flex items-start gap-2.5">
                              <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                              <div className="space-y-1.5 flex-1">
                                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
                                  Câu hỏi gợi mở tư duy:
                                </span>
                                <div className="text-sm font-semibold text-indigo-950">
                                  <FormattedMathText text={step.guidanceQuestion} />
                                </div>
                              </div>
                            </div>

                            {/* Student Reflection Input */}
                            <div className="mt-3.5 space-y-2">
                              <input
                                type="text"
                                value={studentReflections[step.id] || ''}
                                onChange={(e) =>
                                  setStudentReflections((prev) => ({
                                    ...prev,
                                    [step.id]: e.target.value,
                                  }))
                                }
                                placeholder="Gõ câu trả lời / suy luận của bạn vào đây..."
                                className="w-full text-xs sm:text-sm bg-white rounded-lg border border-indigo-200 p-2.5 focus:border-indigo-500 outline-none"
                              />

                              {/* Action buttons: Hints & Reveal */}
                              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                <div className="flex items-center gap-2">
                                  {step.hints && step.hints.length > 0 && (
                                    <button
                                      onClick={() => handleRevealHint(step.id, step.hints.length)}
                                      disabled={currentHintCount >= step.hints.length}
                                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200 cursor-pointer disabled:opacity-50"
                                    >
                                      <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                                      <span>
                                        {currentHintCount === 0
                                          ? 'Mở Gợi ý 1'
                                          : currentHintCount === 1
                                          ? 'Mở Gợi ý 2'
                                          : 'Đã mở hết gợi ý'}
                                      </span>
                                    </button>
                                  )}

                                  <button
                                    onClick={() =>
                                      setRevealedExplanations((prev) => ({
                                        ...prev,
                                        [step.id]: !prev[step.id],
                                      }))
                                    }
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                                    <span>
                                      {isExplanationOpen ? 'Thu gọn phân tích' : 'Xem phân tích chi tiết'}
                                    </span>
                                  </button>
                                </div>

                                <button
                                  onClick={() => handleCompleteStep(index, step.id)}
                                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-xs"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>{index === problem.steps.length - 1 ? 'Hoàn thành bài' : 'Xong bước này'}</span>
                                </button>
                              </div>
                            </div>

                            {/* Hints Display */}
                            {currentHintCount > 0 && (
                              <div className="mt-3.5 space-y-2 border-t border-indigo-100 pt-3">
                                {step.hints.slice(0, currentHintCount).map((hint, hIdx) => (
                                  <div
                                    key={hIdx}
                                    className="bg-amber-50/80 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-900 flex items-start gap-2"
                                  >
                                    <span className="font-bold text-amber-700 shrink-0">
                                      Gợi ý {hIdx + 1}:
                                    </span>
                                    <div>
                                      <FormattedMathText text={hint} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Detailed Explanation Block (with line selection affordance) */}
                          {isExplanationOpen && (
                            <div
                              onMouseUp={() => handleTextSelection(step.title)}
                              className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs sm:text-sm text-slate-800 space-y-3 relative"
                            >
                              <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200/80 pb-2">
                                <span className="font-semibold text-slate-700">
                                  Lời giải & Biến đổi đại số
                                </span>
                                <span className="text-[11px] text-indigo-600">
                                  💡 Mẹo: Bôi đen dòng bất kỳ để hỏi nhanh
                                </span>
                              </div>

                              <FormattedMathText text={step.detailedExplanation} />

                              {/* Casio Shortcut Card if available */}
                              {step.casioTip && (
                                <div className="mt-2.5 bg-blue-50/90 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 flex items-start gap-2">
                                  <Calculator className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                  <div className="space-y-1">
                                    <span className="font-bold text-blue-800">
                                      Mẹo Casio fx-580VNX:
                                    </span>
                                    <div>
                                      <FormattedMathText text={step.casioTip} />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Analogy Box */}
                              {step.analogy && (
                                <div className="mt-2 bg-emerald-50/90 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900 flex items-start gap-2">
                                  <Smile className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                  <div className="space-y-1">
                                    <span className="font-bold text-emerald-800">
                                      Ẩn dụ đời thường:
                                    </span>
                                    <p className="leading-relaxed">{step.analogy}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Zero State */
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-slate-900">Sẵn sàng giải toán theo phương pháp Socratic</h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Hãy nhập đề bài vào ô phía trên hoặc chọn một trong các ví dụ mẫu có sẵn để trải nghiệm hướng dẫn từng bước.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap justify-center gap-2">
                {SAMPLE_PROBLEMS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputText(s.text);
                      setSelectedSubject(s.subject);
                      handleSolveProblem(s.text, s.subject);
                    }}
                    className="text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Zone: Follow-up Chat with Selection Context */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[650px] sticky top-20">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Hội thoại Đào sâu (Follow-up)</h3>
                <p className="text-[11px] text-slate-500">Hỏi vì sao, đổi văn phong, mẹo bấm máy</p>
              </div>
            </div>

            <button
              onClick={() => {
                setChatMessages([]);
                setSelectedText('');
              }}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
              title="Làm mới hội thoại"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Line Selection Action Bar (Triggered when user highlights text) */}
          {selectedText && (
            <div className="bg-indigo-50 border-b border-indigo-100 p-3 text-xs space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-indigo-900 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-indigo-600" />
                  Đang chọn đoạn giải:
                </span>
                <button
                  onClick={() => setSelectedText('')}
                  className="text-indigo-400 hover:text-indigo-700 cursor-pointer text-xs"
                >
                  ✕ Hủy chọn
                </button>
              </div>
              <p className="text-slate-600 italic bg-white/80 p-1.5 rounded border border-indigo-100 text-[11px] truncate">
                "{selectedText}"
              </p>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <button
                  onClick={() => handleQuickFollowUp('explain_step')}
                  className="px-2.5 py-1 text-[11px] font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  Tại sao ra bước này?
                </button>
                <button
                  onClick={() => handleQuickFollowUp('casio')}
                  className="px-2.5 py-1 text-[11px] font-medium bg-white text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Mẹo Casio
                </button>
                <button
                  onClick={() => handleQuickFollowUp('analogy')}
                  className="px-2.5 py-1 text-[11px] font-medium bg-white text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Ẩn dụ đời thường
                </button>
              </div>
            </div>
          )}

          {/* Chat Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-sm">
            {chatMessages.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto stroke-1" />
                <p>Chưa có tin nhắn nào.</p>
                <p className="text-xs">Bôi đen dòng giải hoặc gõ câu hỏi bất kỳ để trò chuyện cùng gia sư.</p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  {msg.referencedStepTitle && (
                    <span className="text-[10px] text-slate-400 mb-0.5 px-1">
                      Về: {msg.referencedStepTitle}
                    </span>
                  )}
                  <div
                    className={`max-w-[88%] rounded-2xl p-3 leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200/60'
                    }`}
                  >
                    <FormattedMathText text={msg.text} />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))
            )}

            {isChatLoading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs py-2">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span>Gia sư đang suy nghĩ và chuẩn bị lời giải...</span>
              </div>
            )}
          </div>

          {/* Quick prompt chips */}
          <div className="px-4 py-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <button
              onClick={() => handleQuickFollowUp('explain_step', 'Có cách giải nào nhanh hơn hoặc dùng đạo hàm được không?')}
              className="whitespace-nowrap px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors cursor-pointer"
            >
              ⚡ Có cách giải nhanh hơn?
            </button>
            <button
              onClick={() => handleQuickFollowUp('casio')}
              className="whitespace-nowrap px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors cursor-pointer"
            >
              📟 Hướng dẫn bấm máy tính Casio
            </button>
            <button
              onClick={() => handleQuickFollowUp('analogy')}
              className="whitespace-nowrap px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors cursor-pointer"
            >
              🌱 Giải thích dễ hiểu hơn
            </button>
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSendChat} className="p-3 border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Đặt câu hỏi cho bước giải này..."
              className="flex-1 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:border-indigo-500 focus:bg-white outline-none"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isChatLoading}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
