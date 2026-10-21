# SocratesAI: Nền Tảng Học Tập Socratic & Luyện Thi Thích Ứng Toàn Diện

Một nền tảng học tập thông minh tích hợp phương pháp gợi mở tư duy Socratic từng bước, bộ công cụ tự động chuyển đổi tài liệu bài giảng thành Flashcards/Quiz/Tóm tắt so sánh, cùng hệ thống lập kế hoạch ôn thi tự động tái phân bổ tải trọng và bản đồ năng lực theo dõi chuyên sâu.

## User Review & Critical Decisions

> [!IMPORTANT]
> Vui lòng kiểm tra các quyết định thiết kế và tính năng cốt lõi trước khi tiến hành triển khai. Mọi mô-đun đều được thiết kế đầy đủ tương tác và xử lý thực tế qua Gemini API máy chủ:

- **Confirmed Decision 1 (Phương pháp Socratic & Hướng dẫn từng bước)**: Hệ thống chia bài toán thành 4 giai đoạn chuẩn: (1) Xác định giả thiết & điều kiện $\rightarrow$ (2) Nhận diện nguyên lý / công thức áp dụng $\rightarrow$ (3) Biến đổi đại số & trung gian $\rightarrow$ (4) Kết luận & kiểm tra nghiệm ngoại lai. Học sinh có thể chọn giữa chế độ **"Gợi mở tư duy"** (AI đặt câu hỏi gợi ý, ẩn kết quả để học sinh suy luận) hoặc **"Xem lời giải phân tích kèm đào sâu"**.
- **Confirmed Decision 2 (Follow-up Chat theo từng dòng & Đổi văn phong)**: Cho phép người học bôi đen hoặc click trực tiếp vào bất kỳ bước giải nào để mở menu hỏi nhanh: *"Tại sao từ bước 2 lại ra bước 3?"*, *"Có mẹo bấm máy tính Casio fx-580VNX không?"*, *"Giải thích bằng ẩn dụ đời thường dễ hiểu hơn"*.
- **Confirmed Decision 3 (Trích xuất tài liệu đa định dạng)**: Hỗ trợ kéo thả tài liệu giáo trình, slide bài giảng, file văn bản, hoặc ảnh chụp trang sách bài tập. Hệ thống sử dụng Gemini phân tích để trích xuất song song: Bộ thẻ ghi nhớ Flashcard hai mặt kèm ví dụ ngữ cảnh, Đề thi trắc nghiệm đa dạng (trắc nghiệm 4 lựa chọn, đúng/sai, điền khuyết) có giải thích chi tiết đáp án đúng lẫn sai, và Bản tóm tắt cô đọng / bảng đối chiếu các khái niệm dễ nhầm lẫn.
- **Confirmed Decision 4 (Thuật toán lập lịch thi thích ứng - Adaptive Pacing)**: Người học thiết lập kỳ thi mục tiêu (ví dụ: Tốt nghiệp THPT, ĐGNL ĐHQG, SAT, Đại số tuyến tính, Giữa kỳ...), ngày thi, và quỹ thời gian học mỗi ngày (ví dụ: 45 phút/ngày). Khi học sinh bỏ lỡ bài học hoặc đạt điểm thấp (<60%) ở một chuyên đề kiểm tra thử, hệ thống tự động chạy lại thuật toán phân bổ tải trọng (Dynamic Re-balancing), đẩy lịch ôn tập củng cố vào các ngày tiếp theo mà không làm quá tải tuần thi.
- **Confirmed Decision 5 (Báo cáo & Chế độ Giám sát Phụ huynh / Giáo viên)**: Cung cấp bản đồ mạng nhện năng lực (Knowledge Radar), theo dõi lỗ hổng kiến thức theo chủ đề, chuỗi streak học tập và đồng hồ Pomodoro. Có chế độ chuyển đổi riêng "Chế độ Giám sát Phụ huynh/Cố vấn" cho phép xem tiến độ vĩ mô, độ chủ động làm bài và phân bổ thời gian mà không can thiệp áp lực vào chi tiết bài làm của học sinh.

---

## 1. Overview & Core Concept

- **What It Does**: SocratesAI là một người bạn đồng hành học tập và gia sư ảo toàn diện. Khác với các công cụ giải bài thụ động chỉ trả ra đáp án thô, SocratesAI rèn luyện tư duy phản biện cho học sinh thông qua phương pháp Socratic, biến đổi mọi tài liệu thô thành tài liệu ôn tập chuẩn mực (flashcard, đề thi thử, bảng so sánh), và quản lý lộ trình ôn thi cá nhân hóa có khả năng tự sửa đổi theo năng lực thực tế.
- **Target Audience / Persona**: Học sinh THPT ôn thi Tốt nghiệp / Đánh giá năng lực; sinh viên đại học học các môn tự nhiên/kỹ thuật/kinh tế; người tự học chứng chỉ (SAT, IELTS, TOEIC); và phụ huynh/gia sư cần công cụ giám sát tiến độ minh bạch, tích cực.
- **Key Value**: Nâng cao năng lực tự học và ghi nhớ dài hạn (retrieval practice & spaced repetition), chấm dứt tình trạng học vẹt hoặc chép giải thụ động; cá nhân hóa lộ trình ôn thi khoa học, không bị dồn ứ trước kỳ thi.

---

## 2. User Experience & Visual Design

### A. Kiến trúc Giao diện & Luồng Người dùng (Key User Flows)

1. **Top Bar Contract**:
   - Vùng 1: Logo nhận diện `SocratesAI` kèm biểu tượng học thuật tinh tế.
   - Vùng 2: 4 liên kết điều hướng chính: `Gia sư Socratic`, `Bộ chuyển đổi tài liệu`, `Lịch ôn thi thích ứng`, `Bản đồ năng lực`.
   - Vùng 3: Nút chuyển chế độ `Chế độ Phụ huynh / Cố vấn` và hồ sơ học tập.

2. **Mô-đun 1: Gia sư Socratic & Phân tích Đào sâu (Socratic Tutor)**:
   - **Khu vực nhập đề bài**: Hỗ trợ gõ văn bản, tải ảnh bài tập chụp từ sách giáo khoa, hoặc chọn bài mẫu phong phú (Toán, Lý, Hóa, Sinh, Kinh tế lượng, Logic).
   - **Bảng tương tác Socratic (Two-zone Sandbox)**:
     - Bên trái: Tiến trình giải quyết bài toán với 4 giai đoạn (`Xác định giả thiết` $\rightarrow$ `Nguyên lý/Công thức` $\rightarrow$ `Biến đổi trung gian` $\rightarrow$ `Kết luận`). Từng bước có câu hỏi gợi mở, gợi ý tăng dần (Tier 1 Hint $\rightarrow$ Tier 2 Hint) và ô trả lời để học sinh tự suy nghĩ.
     - Bên phải: Hộp thoại đào sâu (Follow-up Chat). Khi học sinh bôi đen hoặc click vào dòng công thức/bước giải bên trái, hệ thống tự động liên kết ngữ cảnh để giải thích chi tiết, minh họa Casio hoặc giải thích bằng ẩn dụ trực quan.
   - Công thức toán học và khoa học được render chuẩn mực bằng định dạng KaTeX/LaTeX sắc nét.

3. **Mô-đun 2: Bộ Chuyển Đổi Tài Liệu (Content-to-Study Materials)**:
   - **Khu vực tải lên**: Kéo thả file PDF, ảnh tài liệu, bài giảng text hoặc giáo trình mẫu có sẵn.
   - **3 Tab đầu ra thông minh**:
     - *Thẻ ghi nhớ (Flashcards)*: Thẻ 2 mặt lật 3D mượt mà (Mặt trước: Thuật ngữ/Định lý/Công thức; Mặt sau: Định nghĩa cốt lõi, ví dụ thực tế và mẹo nhớ). Tích hợp chế độ "Đã nhớ" / "Cần ôn lại" theo Spaced Repetition.
     - *Đề thi thử & Quiz trắc nghiệm*: Hỗ trợ trắc nghiệm 4 phương án, đúng/sai, điền khuyết. Khi làm bài, học sinh nhận ngay phản hồi chấm điểm và lời giải thích chuyên sâu: vì sao đáp án A đúng, tại sao B, C, D là bẫy sai lầm phổ biến.
     - *Tóm tắt cô đọng (Smart Summary)*: Bản đồ khái niệm phân cấp, danh sách gạch đầu dòng then chốt, và bảng ma trận so sánh các khái niệm dễ nhầm lẫn (ví dụ: Ma trận so sánh Đột biến gen vs Đột biến nhiễm sắc thể, Tích phân từng phần vs Đổi biến số).

4. **Mô-đun 3: Lập Kế Hoạch Ôn Thi Thích Ứng (Smart Exam Planner)**:
   - Form thiết lập mục tiêu: Tên kỳ thi, ngày thi, số phút/ngày, số tuần ôn tập, mức độ thành thạo khởi điểm.
   - **Lịch trình Ngày (Daily Tasks View)**: Phân bổ từng ngày thành các nhiệm vụ cụ thể, cân đối tỷ lệ 40% lý thuyết / 60% bài tập vận dụng.
   - **Cơ chế Tự động Tái cân bằng (Auto Re-balancing)**: Nút mô phỏng hoặc trigger thực tế: nếu học sinh đánh dấu "Bỏ lỡ ngày hôm nay" hoặc vừa làm quiz một chương bị điểm kém (<60%), hệ thống phân tích và tái cấu trúc lịch học các ngày tới, tăng cường giờ luyện tập chuyên đề yếu.

5. **Mô-đun 4: Phân Tích Năng Lực & Chế Độ Giám Sát (Analytics & Oversight)**:
   - **Học sinh View**: Bản đồ mạng nhện năng lực chuyên đề (Mastery Radar), danh sách lỗ hổng kiến thức (Knowledge Gaps), chuỗi ngày học liên tục (Streak), tổng thời gian học tập và đồng hồ Pomodoro tập trung.
   - **Chế độ Phụ huynh / Người giám sát (Parent/Mentor Mode)**: Giao diện trực quan tóm tắt: Tỷ lệ hoàn thành mục tiêu ôn thi (%), chuyên đề dành nhiều thời gian nhất, chỉ số chủ động hoàn thành bài tập, và khuyến nghị tích cực giúp phụ huynh đồng hành mà không can thiệp vi mô gây áp lực.

### B. Visual Identity & Theme Tokens

- **Aesthetic Direction**: EdTech hiện đại, học thuật nghiêm cẩn nhưng thân thiện, tinh tế và tập trung cao độ (không dùng màu neon sặc sỡ, không dùng badge pill chồng chéo).
- **Color Discipline (60-30-10)**:
  - 60% Nền canvas trung tính thanh lịch: `#F8FAFC` (Slate 50) ở Light Mode, `#0F172A` (Slate 900) ở Dark Mode.
  - 30% Bề mặt cấu trúc: Thẻ trắng `#FFFFFF` / Slate 800 với viền hairline mỏng `border-slate-200 / border-slate-700/60`, đổ bóng tối giản.
  - 10% Điểm nhấn hành động: Xanh đại học Indigo/Oxford Blue `#4F46E5` (Primary), điểm xuyết ngọc lục bảo `#059669` (Thành công/Chính xác) và hổ phách `#D97706` (Cảnh báo/Cần ôn lại).
- **Typography**: Display & Body bằng `Plus Jakarta Sans` hiện đại; Công thức toán học và biến số hiển thị qua font serif KaTeX toán học và font monospace `tabular-nums` cho số liệu.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full-Stack Architecture với Server-side Express & Gemini SDK**:
  - *Chosen Approach*: Xây dựng backend server Express tích hợp `@google/genai` (model `gemini-3.8-flash`), toàn bộ API keys và logic prompt được bảo vệ tại máy chủ. Client giao tiếp qua các endpoint `/api/socratic`, `/api/extract-materials`, `/api/adaptive-planner`.
  - *Why*: Đảm bảo an toàn tuyệt đối, tuân thủ hướng dẫn kỹ thuật của AI Studio, hỗ trợ streaming và xử lý JSON Schema chặt chẽ.
- **Decision 2: Socratic Scaffolding Engine với Dynamic Hints**:
  - *Chosen Approach*: Chia bài toán thành 4 giai đoạn chuẩn với trạng thái tương tác từng bước. Học sinh có thể yêu cầu mở gợi ý cấp độ 1, gợi ý cấp độ 2 hoặc tự gõ câu trả lời dự đoán để AI thẩm định.
  - *Why*: Ngăn chặn việc học vẹt, kích thích vùng hồi hải mã ghi nhớ sâu thông qua nỗ lực tự truy xuất thông tin (productive struggle).
- **Decision 3: Highlight & Line-Selection Contextual Follow-up**:
  - *Chosen Approach*: Từng dòng và khối biến đổi trong lời giải đều được gắn `id` và sự kiện click/chọn. Khi người dùng click vào một bước giải, menu hành động xuất hiện với 3 phím tắt nhanh ("Giải thích nguyên nhân", "Mẹo bấm máy tính", "Đổi văn phong ẩn dụ") và ô chat tự do.
- **Decision 4: State Persistence & Adaptive Rescheduling**:
  - *Chosen Approach*: Lưu trữ tiến độ bài học, flashcards, lịch thi và kết quả quiz trong `localStorage` với cơ chế đồng bộ tức thì, kèm dữ liệu mẫu phong phú (Toán THPT, Vật lý đại cương, Tiếng Anh SAT) sẵn sàng để trải nghiệm ngay lập tức.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Frontend (React 19 + Tailwind CSS)              │
│                                                                        │
│  ┌───────────────────────┐  ┌────────────────────────────────────────┐ │
│  │     Top Navigation    │  │       Role Switcher (Student / Parent)  │ │
│  └───────────┬───────────┘  └───────────────────┬────────────────────┘ │
│              │                                  │                      │
│  ┌───────────▼──────────────────────────────────▼────────────────────┐ │
│  │                    Active Module Container                        │ │
│  │                                                                   │ │
│  │ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────────┐ │ │
│  │ │Socratic Tutor │ │Material Transf│ │Adaptive Plan  │ │Analytics│ │ │
│  │ │- 4-step solver│ │- Flashcards 3D│ │- Daily Tasks  │ │- Radar  │ │ │
│  │ │- Follow-up    │ │- Multi-Quiz   │ │- Re-balancing │ │- Parent │ │ │
│  │ │- Casio/Analogy│ │- Smart Summary│ │- Exam Target  │ │  View   │ │ │
│  │ └───────┬───────┘ └───────┬───────┘ └───────┬───────┘ └────┬────┘ │ │
│  └─────────┼─────────────────┼─────────────────┼──────────────┼──────┘ │
│            │                 │                 │              │        │
│  ┌─────────▼─────────────────▼─────────────────▼──────────────▼──────┐ │
│  │              Client State Manager & LocalStorage Sync             │ │
│  └───────────────────────────────┬───────────────────────────────────┘ │
└──────────────────────────────────┼─────────────────────────────────────┘
                                   │ HTTP POST (JSON / Multimodal)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Backend Server (Express + Node.js)                 │
│                                                                        │
│  ┌───────────────────────┐  ┌────────────────────────────────────────┐ │
│  │ /api/socratic/step    │  │ /api/materials/extract                 │ │
│  │ (Step-by-step & Hint) │  │ (Flashcards, Quizzes, Summaries)        │ │
│  ├───────────────────────┤  ├────────────────────────────────────────┤ │
│  │ /api/socratic/chat    │  │ /api/planner/rebalance                 │ │
│  │ (Follow-up & Analogy) │  │ (Dynamic load reallocation)            │ │
│  └───────────┬───────────┘  └───────────────────┬────────────────────┘ │
│              │                                  │                      │
│              └───────────────────┬──────────────┘                      │
│                                  │ GoogleGenAI SDK (gemini-3.8-flash)  │
│                                  ▼                                     │
│                     ┌─────────────────────────┐                        │
│                     │ Google Gemini AI Engine │                        │
│                     └─────────────────────────┘                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Models & State Entities

- **`SocraticProblem`**:
  ```ts
  interface SocraticProblem {
    id: string;
    title: string;
    subject: string;
    question: string;
    imageUrl?: string;
    steps: {
      id: string;
      title: string; // "1. Giả thiết & Điều kiện", "2. Chọn công thức"...
      explanation: string;
      questionPrompt: string; // Câu hỏi gợi ý cho học sinh
      hints: string[];
      mathFormula?: string;
      casioTip?: string;
      analogyExplanation?: string;
    }[];
  }
  ```

- **`Flashcard`**:
  ```ts
  interface Flashcard {
    id: string;
    term: string;
    definition: string;
    contextExample: string;
    masteryLevel: 'new' | 'learning' | 'mastered';
    lastReviewed?: string;
  }
  ```

- **`QuizQuestion`**:
  ```ts
  interface QuizQuestion {
    id: string;
    type: 'multiple-choice' | 'true-false' | 'fill-blank';
    question: string;
    options?: string[];
    correctAnswer: string | number;
    explanationCorrect: string;
    explanationWrong: { [optionIndex: string]: string };
  }
  ```

- **`ExamPlan & DailyTask`**:
  ```ts
  interface ExamPlan {
    examName: string;
    targetDate: string;
    dailyMinutes: number;
    totalWeeks: number;
    tasks: DailyTask[];
  }

  interface DailyTask {
    id: string;
    dayNumber: number;
    date: string;
    topic: string;
    type: 'theory' | 'practice' | 'review';
    durationMinutes: number;
    completed: boolean;
    missed: boolean;
    quizScore?: number;
  }
  ```

- **`AnalyticsState`**:
  - `streaks`: Chuỗi ngày học liên tục.
  - `focusTimeTotal`: Tổng số phút học tập tập trung.
  - `topicMastery`: Mức độ thành thạo theo từng chuyên đề ($0\%\text{--}100\%$).
  - `knowledgeGaps`: Danh sách các chủ đề có điểm kiểm tra thấp cần ưu tiên bù lấp.

---

## 5. Implementation Steps & Verification Plan

1. **Backend Server Setup (`server.ts`)**:
   - Khởi tạo Express server trên port 3000 với middleware xử lý JSON.
   - Thiết lập `@google/genai` với model `gemini-3.8-flash`.
   - Các API endpoints chuyên biệt:
     - `POST /api/socratic/solve`: Phân tích bài toán thành 4 bước Socratic kèm câu hỏi gợi ý.
     - `POST /api/socratic/followup`: Xử lý đào sâu dòng giải (tại sao bước A sang B, mẹo Casio, ẩn dụ đời thường).
     - `POST /api/materials/generate`: Trích xuất Flashcards, Quiz giải thích đa chiều và Smart Summary từ tài liệu/ảnh.
     - `POST /api/planner/generate`: Sinh lộ trình ôn thi và tự động tái cân bằng (re-balance) khi trễ hạn hoặc điểm thấp.
2. **Frontend Component Architecture**:
   - `Header`: 3-zone contract, thanh chuyển đổi tab điều hướng và nút chuyển chế độ Phụ huynh/Cố vấn.
   - `SocraticTutorView`: Giao diện 2 cột tương tác giải toán từng bước, nút mở gợi ý, ô nhập suy luận, và thanh công cụ follow-up khi click/chọn bước giải.
   - `DocumentConverterView`: Khu vực kéo thả tải file/ảnh, xem thẻ Flashcard 3D lật mặt, làm bài thi thử trắc nghiệm có phản hồi tức thì, và bảng tóm tắt so sánh kiến thức.
   - `ExamPlannerView`: Bộ tạo kế hoạch, danh sách nhiệm vụ hàng ngày (Daily Tasks), nút mô phỏng "Bỏ lỡ buổi học" / "Điểm quiz thấp" và tính năng tự động tái cấu trúc lịch trình.
   - `AnalyticsView & ParentDashboard`: Biểu đồ mạng nhện năng lực, radar chuyên đề, chuỗi streak, và chế độ báo cáo thân thiện cho phụ huynh.
3. **Verification**:
   - Kiểm tra `compile_applet` và `lint_applet` đảm bảo không có lỗi TypeScript hay cú pháp.
   - Xác thực đầy đủ các luồng người dùng với dữ liệu thực tế và hỗ trợ tải tài liệu.
