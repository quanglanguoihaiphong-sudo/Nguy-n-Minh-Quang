import React, { useState } from 'react';
import { ExtractedMaterials, Flashcard, QuizQuestion } from '../types';
import { FormattedMathText } from './MathView';
import {
  FileText,
  UploadCloud,
  Layers,
  HelpCircle,
  BookOpen,
  RotateCw,
  Check,
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Table,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface DocumentConverterViewProps {
  onQuizScoreRecorded?: (subject: string, score: number) => void;
}

const SAMPLE_DOCUMENTS = [
  {
    title: 'Sinh học 12: Đột biến gen & Mã di truyền',
    subject: 'Sinh học',
    text: `Chương 1: Cơ chế di truyền và biến dị
1. Đột biến gen:
Là những biến đổi trong cấu trúc của gen liên quan đến một hoặc một số cặp nucleotide. Đột biến điểm bao gồm: thay thế 1 cặp, thêm 1 cặp, mất 1 cặp nucleotide.
Đột biến thay thế 1 cặp thường ít gây hậu quả nhất vì có thể là đột biến đồng nghĩa do tính thoái hóa của mã di truyền. Đột biến thêm hoặc mất 1 cặp dẫn tới đột biến dịch khung đọc, làm thay đổi toàn bộ trình tự acid amin phía sau.
2. Mã di truyền:
Gồm 64 bộ ba (codon), trong đó có 61 bộ ba mã hóa cho 20 loại amino acid, 3 bộ ba kết thúc (UAA, UAG, UGA) và 1 bộ ba mở đầu (AUG - mã hóa Methionine ở sinh vật nhân thực).
Đặc điểm: Tính phổ biến, tính đặc hiệu (1 codon chỉ mã hóa 1 amino acid), tính thoái hóa (nhiều codon cùng mã hóa 1 amino acid).
3. Operon Lac ở vi khuẩn E. coli:
Bao gồm vùng khởi động P (Promoter), vùng vận hành O (Operator), và cụm gen cấu trúc Z, Y, A. Gen điều hòa R nằm ngoài operon, tổng hợp protein ức chế. Khi môi trường có lactose, lactose liên kết làm biến đổi cấu hình protein ức chế, giải phóng vùng vận hành.`,
  },
  {
    title: 'Vật lý: Sóng cơ & Giao thoa sóng',
    subject: 'Vật lý',
    text: `Chương 2: Sóng cơ học và Sóng âm
1. Khái niệm sóng cơ:
Sóng cơ là sự lan truyền dao động cơ học trong môi trường vật chất theo thời gian. Sóng cơ không truyền được trong chân không.
Sóng ngang: phương dao động vuông góc với phương truyền sóng (truyền trong chất rắn và bề mặt chất lỏng).
Sóng dọc: phương dao động trùng với phương truyền sóng (truyền trong chất rắn, lỏng, khí).
2. Giao thoa sóng:
Hai nguồn sóng kết hợp là hai nguồn dao động cùng phương, cùng tần số và có hiệu số pha không đổi theo thời gian.
Điều kiện cực đại giao thoa: d2 - d1 = k * lambda (k là số nguyên).
Điều kiện cực tiểu giao thoa: d2 - d1 = (k + 0.5) * lambda.
Khoảng cách giữa hai cực đại liên tiếp trên đoạn thẳng nối hai nguồn là lambda / 2.`,
  },
  {
    title: 'Toán học: Ứng dụng đạo hàm khảo sát hàm số',
    subject: 'Toán học',
    text: `Chương 1: Ứng dụng đạo hàm
1. Tính đơn điệu:
Cho hàm số y = f(x) có đạo hàm trên K. Nếu f'(x) > 0 với mọi x thuộc K thì hàm số đồng biến trên K. Nếu f'(x) < 0 thì hàm số nghịch biến.
2. Cực trị hàm số:
Điểm x0 là điểm cực đại nếu f'(x) đổi dấu từ dương sang âm khi qua x0.
Quy tắc 2: Nếu f'(x0) = 0 và f''(x0) < 0 thì x0 là điểm cực đại. Nếu f''(x0) > 0 thì x0 là điểm cực tiểu.
3. Đường tiệm cận:
Đường thẳng y = y0 là tiệm cận ngang nếu lim f(x) khi x tiến tới vô cùng bằng y0.
Đường thẳng x = x0 là tiệm cận đứng nếu lim f(x) khi x tiến tới x0 bằng vô cùng.`,
  },
];

export const DocumentConverterView: React.FC<DocumentConverterViewProps> = ({
  onQuizScoreRecorded,
}) => {
  const [inputText, setInputText] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Active view tab inside converted materials
  const [materialTab, setMaterialTab] = useState<'flashcards' | 'quiz' | 'summary'>('flashcards');

  // Materials State
  const [materials, setMaterials] = useState<ExtractedMaterials | null>(null);

  // Flashcards state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardMastery, setCardMastery] = useState<Record<string, 'new' | 'learning' | 'mastered'>>({});

  // Quiz state
  const [userQuizAnswers, setUserQuizAnswers] = useState<Record<string, string>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState<{ correct: number; total: number } | null>(null);

  // Trigger material generation
  const handleGenerateMaterials = async (customText?: string, customTitle?: string) => {
    const textToProcess = customText !== undefined ? customText : inputText;
    const titleToProcess = customTitle !== undefined ? customTitle : (docTitle || 'Tài liệu bài giảng');

    if (!textToProcess.trim() && !uploadedImage) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/materials/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentText: textToProcess,
          title: titleToProcess,
          imageBase64: uploadedImage,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setMaterials(data.data);
        setCardIndex(0);
        setIsFlipped(false);
        setUserQuizAnswers({});
        setSubmittedQuiz(false);
        setQuizScore(null);
      }
    } catch (err) {
      console.error('Error generating materials:', err);
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
        if (!docTitle) setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
      };
      reader.readAsDataURL(file);
    }
  };

  // Flashcard Actions
  const handleCardMastery = (level: 'learning' | 'mastered') => {
    if (!materials || materials.flashcards.length === 0) return;
    const currentCard = materials.flashcards[cardIndex];
    setCardMastery((prev) => ({ ...prev, [currentCard.id]: level }));
    setIsFlipped(false);
    if (cardIndex < materials.flashcards.length - 1) {
      setCardIndex((prev) => prev + 1);
    }
  };

  // Quiz answer submission
  const handleSelectQuizAnswer = (questionId: string, answer: string) => {
    if (submittedQuiz) return;
    setUserQuizAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleGradeQuiz = () => {
    if (!materials || materials.quizzes.length === 0) return;
    let correctCount = 0;
    materials.quizzes.forEach((q) => {
      const userAns = userQuizAnswers[q.id]?.trim().toUpperCase();
      const correctAns = q.correctAnswer?.trim().toUpperCase();
      if (userAns && (userAns === correctAns || userAns.startsWith(correctAns))) {
        correctCount++;
      }
    });

    const scorePct = Math.round((correctCount / materials.quizzes.length) * 100);
    setQuizScore({ correct: correctCount, total: materials.quizzes.length });
    setSubmittedQuiz(true);

    if (onQuizScoreRecorded) {
      onQuizScoreRecorded(materials.title || 'Tổng hợp', scorePct);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload & Document Ingestion Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Bộ Chuyển Đổi Tài Liệu (Content-to-Study Materials)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Tải slide bài giảng, file PDF hoặc ảnh sách giáo khoa để tự động tạo Flashcards, Quiz trắc nghiệm và Bảng so sánh.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="Tên tài liệu / Môn học..."
              className="text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Input Text Area & Upload */}
        <div className="space-y-3">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Dán nội dung giáo trình, slide bài giảng hoặc đề cương cần trích xuất vào đây..."
            rows={3}
            className="w-full text-sm rounded-xl border border-slate-200 p-3.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none outline-none font-sans"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors">
                <UploadCloud className="w-4 h-4 text-slate-500" />
                <span>Tải lên Slide / PDF / Ảnh</span>
                <input
                  type="file"
                  accept=".pdf,image/*,.txt"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {/* Sample Documents */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
                <span>Mẫu có sẵn:</span>
                {SAMPLE_DOCUMENTS.map((doc, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputText(doc.text);
                      setDocTitle(doc.title);
                      handleGenerateMaterials(doc.text, doc.title);
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 underline truncate max-w-[140px] cursor-pointer"
                  >
                    {doc.title.split(':')[0]}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleGenerateMaterials()}
              disabled={isLoading || (!inputText.trim() && !uploadedImage)}
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang quét & trích xuất học liệu...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Tự động tạo Flashcards, Quiz & Tóm tắt</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Extracted Materials Dashboard */}
      {materials ? (
        <div className="space-y-6">
          {/* Sub Navigation Segmented Control */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMaterialTab('flashcards')}
                className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                  materialTab === 'flashcards'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Bộ Thẻ Flashcards ({materials.flashcards.length})</span>
              </button>

              <button
                onClick={() => setMaterialTab('quiz')}
                className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                  materialTab === 'quiz'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Đề Thi Thử & Quiz ({materials.quizzes.length})</span>
              </button>

              <button
                onClick={() => setMaterialTab('summary')}
                className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                  materialTab === 'summary'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <Table className="w-4 h-4" />
                <span>Tóm Tắt & Bảng So Sánh</span>
              </button>
            </div>

            <span className="text-xs text-slate-500 hidden sm:inline font-medium">
              Chủ đề: {materials.title}
            </span>
          </div>

          {/* TAB 1: 3D Flashcards */}
          {materialTab === 'flashcards' && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Thẻ {cardIndex + 1} / {materials.flashcards.length}
                </span>
                <span>
                  Đã ghi nhớ:{' '}
                  {
                    Object.values(cardMastery).filter((lvl) => lvl === 'mastered').length
                  }{' '}
                  thẻ
                </span>
              </div>

              {/* Flashcard container with flip animation */}
              {materials.flashcards[cardIndex] && (
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full min-h-[320px] bg-white rounded-3xl border border-slate-200 shadow-md p-7 sm:p-8 flex flex-col justify-between cursor-pointer transition-all hover:shadow-lg select-none relative group"
                >
                  {/* Category Pill/Text */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-indigo-600 uppercase tracking-wider text-[11px]">
                      {materials.flashcards[cardIndex].category}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>{isFlipped ? 'Mặt sau (Giải nghĩa)' : 'Mặt trước (Nhấn để lật)'}</span>
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="my-auto py-6 text-center space-y-4">
                    {!isFlipped ? (
                      /* Front of card */
                      <div className="space-y-3">
                        <span className="text-xs text-slate-400 font-medium">
                          Thuật ngữ / Định lý then chốt:
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                          <FormattedMathText text={materials.flashcards[cardIndex].term} />
                        </h3>
                      </div>
                    ) : (
                      /* Back of card */
                      <div className="space-y-4 text-left">
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Định nghĩa & Bản chất:
                          </span>
                          <div className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
                            <FormattedMathText text={materials.flashcards[cardIndex].definition} />
                          </div>
                        </div>

                        {materials.flashcards[cardIndex].contextExample && (
                          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-950 space-y-1">
                            <span className="font-bold text-indigo-800 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" /> Ví dụ ngữ cảnh thực tiễn:
                            </span>
                            <FormattedMathText
                              text={materials.flashcards[cardIndex].contextExample}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom Navigation within card */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
                    <span>Nhấn bất kỳ vị trí nào để lật thẻ</span>
                    <span className="font-mono text-[11px]">Space to flip</span>
                  </div>
                </div>
              )}

              {/* Spaced Repetition Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCardIndex((prev) => Math.max(0, prev - 1));
                  }}
                  disabled={cardIndex === 0}
                  className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Thẻ trước</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCardMastery('learning')}
                    className="px-4 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Cần ôn lại
                  </button>
                  <button
                    onClick={() => handleCardMastery('mastered')}
                    className="flex items-center gap-1 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Đã nhớ vững</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCardIndex((prev) => Math.min(materials.flashcards.length - 1, prev + 1));
                  }}
                  disabled={cardIndex >= materials.flashcards.length - 1}
                  className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <span>Thẻ tiếp</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Quiz Engine with deep explanations */}
          {materialTab === 'quiz' && (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Quiz Header & Result Banner */}
              {submittedQuiz && quizScore && (
                <div
                  className={`p-5 rounded-2xl border ${
                    quizScore.correct / quizScore.total >= 0.7
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold">
                        Kết quả: {quizScore.correct} / {quizScore.total} câu đúng (
                        {Math.round((quizScore.correct / quizScore.total) * 100)}%)
                      </h4>
                      <p className="text-xs mt-0.5">
                        {quizScore.correct / quizScore.total >= 0.7
                          ? 'Xuất sắc! Bạn đã nắm vững các khái niệm then chốt của bài giảng này.'
                          : 'Cần củng cố thêm một số bẫy kiến thức. Hãy đọc kỹ phần giải thích chi tiết bên dưới.'}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSubmittedQuiz(false);
                        setUserQuizAnswers({});
                        setQuizScore(null);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-white rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs"
                    >
                      Làm lại đề này
                    </button>
                  </div>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-5">
                {materials.quizzes.map((q, qIndex) => {
                  const selected = userQuizAnswers[q.id];
                  const isAnswered = !!selected;
                  const isCorrect =
                    submittedQuiz &&
                    selected &&
                    (selected === q.correctAnswer || selected.startsWith(q.correctAnswer));

                  return (
                    <div
                      key={q.id}
                      className={`bg-white rounded-2xl border p-5 sm:p-6 transition-all ${
                        submittedQuiz
                          ? isCorrect
                            ? 'border-emerald-300 ring-1 ring-emerald-100'
                            : 'border-red-300 ring-1 ring-red-100'
                          : 'border-slate-200 shadow-xs'
                      }`}
                    >
                      {/* Question Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                          Câu {qIndex + 1} · {q.type === 'multiple-choice' ? 'Trắc nghiệm' : q.type === 'true-false' ? 'Đúng / Sai' : 'Điền khuyết'}
                        </span>
                        {submittedQuiz && (
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              isCorrect
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {isCorrect ? 'Chính xác' : 'Chưa đúng'}
                          </span>
                        )}
                      </div>

                      <div className="text-sm sm:text-base font-semibold text-slate-900 mb-4">
                        <FormattedMathText text={q.question} />
                      </div>

                      {/* Options */}
                      {q.options && q.options.length > 0 && (
                        <div className="space-y-2.5">
                          {q.options.map((option, optIdx) => {
                            const optKey = option.charAt(0); // A, B, C, D
                            const isSelected = selected === option || selected === optKey;
                            const isThisOptionCorrect =
                              q.correctAnswer === option || q.correctAnswer === optKey;

                            let optStyle = 'border-slate-200 hover:bg-slate-50 text-slate-800';
                            if (submittedQuiz) {
                              if (isThisOptionCorrect) {
                                optStyle =
                                  'border-emerald-500 bg-emerald-50/90 text-emerald-950 font-semibold';
                              } else if (isSelected) {
                                optStyle = 'border-red-400 bg-red-50 text-red-950';
                              }
                            } else if (isSelected) {
                              optStyle = 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-medium';
                            }

                            return (
                              <div
                                key={optIdx}
                                onClick={() => handleSelectQuizAnswer(q.id, option)}
                                className={`p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all flex items-center justify-between ${optStyle}`}
                              >
                                <div>
                                  <FormattedMathText text={option} />
                                </div>
                                {submittedQuiz && isThisOptionCorrect && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                                )}
                                {submittedQuiz && isSelected && !isThisOptionCorrect && (
                                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 ml-2" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Explanation Section (Revealed after submission) */}
                      {submittedQuiz && (
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl">
                          <div className="flex items-start gap-1.5">
                            <span className="font-bold text-emerald-700 shrink-0">
                              ✓ Giải thích đáp án đúng:
                            </span>
                            <div className="leading-relaxed">
                              <FormattedMathText text={q.explanationCorrect} />
                            </div>
                          </div>

                          {/* Trap Analysis for wrong options */}
                          {q.explanationWrong && Object.keys(q.explanationWrong).length > 0 && (
                            <div className="pt-2 border-t border-slate-200 space-y-1">
                              <span className="font-bold text-slate-600 block mb-1">
                                ⚠️ Phân tích các bẫy sai lầm phổ biến:
                              </span>
                              {Object.entries(q.explanationWrong).map(([key, reason]) => (
                                <p key={key} className="text-slate-600 pl-2">
                                  <strong className="text-slate-800">Phương án {key}:</strong> {reason}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit Quiz Button */}
              {!submittedQuiz && (
                <div className="text-center pt-2">
                  <button
                    onClick={handleGradeQuiz}
                    disabled={Object.keys(userQuizAnswers).length === 0}
                    className="px-8 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Nộp bài & Xem giải thích chi tiết
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Smart Summary & Comparison Table */}
          {materialTab === 'summary' && (
            <div className="space-y-6">
              {/* Key Takeaways */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-indigo-600" />
                  Gạch Đầu Dòng Then Chốt (Key Takeaways)
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                  {materials.summary.keyTakeaways.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="leading-relaxed">
                        <FormattedMathText text={item} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Comparison Table */}
              {materials.summary.comparisonTable && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Table className="w-5 h-5 text-indigo-600" />
                        {materials.summary.comparisonTable.title ||
                          'Bảng Ma Trận So Sánh Các Khái Niệm Dễ Nhầm Lẫn'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Phân biệt các ranh giới bản chất tránh mất điểm trong đề thi
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          {materials.summary.comparisonTable.headers.map((header, hIdx) => (
                            <th key={hIdx} className="p-3 font-bold text-slate-800">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {materials.summary.comparisonTable.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className={`p-3 leading-relaxed ${
                                  cIdx === 0
                                    ? 'font-semibold text-slate-900 bg-slate-50/50'
                                    : 'text-slate-700'
                                }`}
                              >
                                <FormattedMathText text={cell} />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Zero state for materials */
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
          <Layers className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Chưa có tài liệu nào được chuyển đổi</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Dán nội dung bài học vào ô phía trên hoặc chọn một bài giảng mẫu để hệ thống tự động bóc tách Flashcards, Quiz trắc nghiệm và Tóm tắt đối chiếu.
          </p>
        </div>
      )}
    </div>
  );
};
