import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '30mb' }));

// Shared Gemini SDK client instance
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// ==========================================
// 1. Socratic Solver API (/api/socratic/solve)
// ==========================================
app.post('/api/socratic/solve', async (req: Request, res: Response) => {
  try {
    const { problemText, subject = 'Toán học', imageBase64, mimeType } = req.body;

    if (!problemText && !imageBase64) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đề bài hoặc ảnh bài tập.' });
    }

    if (!ai) {
      return res.json({
        success: true,
        data: getFallbackSocraticProblem(problemText, subject),
        source: 'local_engine',
      });
    }

    const systemInstruction = `Bạn là một gia sư sư phạm bậc thầy áp dụng phương pháp Socratic (gợi mở tư duy).
Nhiệm vụ của bạn là nhận vào một bài toán/bài tập học thuật (Toán, Lý, Hóa, Sinh, Kinh tế lượng, Logic...) và chia nhỏ bài toán thành ĐÚNG 4 giai đoạn logic sư phạm:
1. Xác định giả thiết, điều kiện & mục tiêu cần tìm (Given conditions & Scope)
2. Lựa chọn công thức, định lý & nguyên lý cốt lõi áp dụng (Key Principles & Theorems)
3. Biến đổi trung gian & các bước logic đại số (Step-by-step Transformation)
4. Kết luận, kiểm tra nghiệm ngoại lai & ý nghĩa thực tiễn (Synthesis & Verification)

QUY TẮC SOCRATIC CỐT LÕI:
- Mỗi bước KHÔNG ĐƯỢC chỉ ném ra kết quả thô!
- Phải có 'guidanceQuestion': Một câu hỏi gợi ý kích thích người học tự trả lời bước tiếp theo.
- Phải có 2 'hints' (gợi ý cấp 1 nhẹ nhàng và gợi ý cấp 2 rõ hơn một chút).
- 'detailedExplanation': Lời giải chi tiết cặn kẽ và mạch lạc để đối chiếu.
- 'formula': Công thức biểu diễn bằng LaTeX đẹp mắt (nếu có).
- 'casioTip': Hướng dẫn mẹo bấm máy tính cầm tay Casio (ví dụ fx-580VNX, Shift-Solve, bảng Table, Vector, Hệ phương trình...) nếu áp dụng được.
- 'analogy': Ẩn dụ đời thường trực quan giúp người học dễ hình dung bản chất.
Ngôn ngữ: Tiếng Việt chuẩn mực, tôn trọng, truyền cảm hứng học tập.`;

    const contents: any[] = [];
    if (imageBase64) {
      contents.push({
        inlineData: {
          data: imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, ''),
          mimeType: mimeType || 'image/jpeg',
        },
      });
    }
    contents.push({
      text: `Môn học: ${subject}\nĐề bài: ${problemText || 'Phân tích bài toán trong ảnh'}\nHãy giải theo phương pháp Socratic 4 bước theo JSON schema.`,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Tiêu đề ngắn gọn mô tả bài toán' },
            subject: { type: Type.STRING, description: 'Môn học' },
            summary: { type: Type.STRING, description: 'Tóm lược hướng tiếp cận sư phạm' },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  stageNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING, description: 'Tên giai đoạn' },
                  concept: { type: Type.STRING, description: 'Khái niệm hoặc định lý trọng tâm' },
                  guidanceQuestion: { type: Type.STRING, description: 'Câu hỏi gợi mở Socratic' },
                  hints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '2 gợi ý cấp độ tăng dần',
                  },
                  detailedExplanation: { type: Type.STRING, description: 'Phân tích chi tiết từng bước biến đổi' },
                  formula: { type: Type.STRING, description: 'Công thức LaTeX cốt lõi' },
                  casioTip: { type: Type.STRING, description: 'Mẹo Casio fx-580VNX nếu có' },
                  analogy: { type: Type.STRING, description: 'Ẩn dụ đời thường dễ nhớ' },
                },
                required: ['id', 'stageNumber', 'title', 'guidanceQuestion', 'hints', 'detailedExplanation'],
              },
            },
          },
          required: ['title', 'subject', 'summary', 'steps'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json({ success: true, data: result, source: 'gemini' });
  } catch (error: any) {
    console.error('Error in /api/socratic/solve, falling back gracefully:', error?.message);
    res.json({
      success: true,
      data: getFallbackSocraticProblem(req.body.problemText, req.body.subject),
      source: 'local_engine_fallback',
    });
  }
});

// ==========================================
// 2. Socratic Follow-up Chat (/api/socratic/followup)
// ==========================================
app.post('/api/socratic/followup', async (req: Request, res: Response) => {
  try {
    const { problemContext, stepTitle, selectedText, userQuestion, mode = 'explain_step' } = req.body;

    if (!ai) {
      return res.json({
        success: true,
        answer: getFallbackFollowupAnswer(stepTitle, selectedText, userQuestion, mode),
        source: 'local_engine',
      });
    }

    let modePrompt = '';
    if (mode === 'casio') {
      modePrompt = 'Tập trung hướng dẫn cách dùng máy tính cầm tay Casio fx-580VNX/880BTG chi tiết (phím bấm cụ thể, cú pháp, mẹo giải nhanh trắc nghiệm).';
    } else if (mode === 'analogy') {
      modePrompt = 'Giải thích hoàn toàn bằng ẩn dụ đời thường sinh động, gần gũi với cuộc sống hàng ngày để người mất gốc cũng hiểu ngay.';
    } else if (mode === 'step_breakdown') {
      modePrompt = 'Giải thích cực kỳ chi tiết vì sao từ bước trước lại biến đổi ra được dòng này, chỉ rõ từng công thức bắc cầu và điều kiện đi kèm.';
    }

    const prompt = `Bạn là một gia sư Socratic kiên nhẫn và sâu sắc.
Bối cảnh bài toán: ${problemContext || 'Bài toán đang giải'}
Bước giải đang được học sinh chú ý: "${stepTitle || 'Bước giải'}"
Đoạn văn bản/công thức học sinh vừa bôi đen hoặc click chọn: "${selectedText || ''}"
Câu hỏi / Thắc mắc của học sinh: "${userQuestion || 'Tại sao lại có bước biến đổi này?'}"
Yêu cầu phong cách: ${modePrompt}

Hãy trả lời khúc chiết, mạch lạc, dùng công thức KaTeX ($...$ hoặc $$...$$) khi có toán học. Nếu thấy học sinh còn nhầm lẫn, hãy đặt lại 1 câu hỏi gợi mở nhẹ ở cuối câu trả lời để kiểm tra xem bạn ấy đã thông suốt chưa.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ success: true, answer: response.text, source: 'gemini' });
  } catch (error: any) {
    console.error('Error in /api/socratic/followup:', error);
    res.json({
      success: true,
      answer: getFallbackFollowupAnswer(req.body.stepTitle, req.body.selectedText, req.body.userQuestion, req.body.mode),
      source: 'local_engine',
    });
  }
});

// ==========================================
// 3. Materials Generator API (/api/materials/generate)
// ==========================================
app.post('/api/materials/generate', async (req: Request, res: Response) => {
  try {
    const { contentText, imageBase64, mimeType, title = 'Tài liệu học tập' } = req.body;

    if (!contentText && !imageBase64) {
      return res.status(400).json({ error: 'Vui lòng cung cấp nội dung tài liệu hoặc ảnh.' });
    }

    if (!ai) {
      return res.json({
        success: true,
        data: getFallbackMaterials(contentText, title),
        source: 'local_engine',
      });
    }

    const systemInstruction = `Bạn là chuyên gia thiết kế tài liệu học tập và sư phạm đại học.
Nhiệm vụ của bạn là quét sâu nội dung tài liệu (slide, giáo trình, ảnh sách) và tự động tạo ra một bộ công cụ học tập hoàn chỉnh gồm 3 phần:

1. Flashcards (Bộ thẻ ghi nhớ 2 mặt):
   - 'term': Thuật ngữ then chốt, định lý, công thức hoặc khái niệm cốt lõi (Mặt trước).
   - 'definition': Giải nghĩa chuẩn xác, xúc tích, không thừa chữ (Mặt sau).
   - 'contextExample': Ví dụ ngữ cảnh thực tiễn hoặc câu hỏi áp dụng trực tiếp kèm công thức nếu có.
   - 'category': Phân loại chủ đề.

2. Quiz trắc nghiệm đa định dạng (Multiple-choice, True/False, Fill-blank):
   - Tạo ít nhất 4-6 câu hỏi kiểm tra độ hiểu sâu (tránh hỏi vẹt).
   - 'explanationCorrect': Giải thích rõ vì sao phương án này ĐÚNG, liên hệ nguyên lý bài học.
   - 'explanationWrong': Phân tích chi tiết vì sao các phương án khác lại SAI (vạch trần bẫy tư duy thường gặp).

3. Smart Summary (Tóm tắt thông minh & Bảng đối chiếu):
   - 'keyTakeaways': 4-6 gạch đầu dòng then chốt nhất của bài.
   - 'conceptHierarchy': Cây khái niệm phân cấp.
   - 'comparisonTable': Bảng ma trận so sánh các khái niệm dễ nhầm lẫn trong bài (gồm title, headers, và các rows đối chiếu).`;

    const contents: any[] = [];
    if (imageBase64) {
      contents.push({
        inlineData: {
          data: imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, ''),
          mimeType: mimeType || 'image/jpeg',
        },
      });
    }
    contents.push({
      text: `Tiêu đề tài liệu: ${title}\nNội dung cần trích xuất:\n${contentText || 'Phân tích tài liệu trong ảnh'}\nHãy tạo bộ Flashcard, Quiz trắc nghiệm và Smart Summary chi tiết theo JSON schema.`,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            overview: { type: Type.STRING },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                  contextExample: { type: Type.STRING },
                  category: { type: Type.STRING },
                },
                required: ['id', 'term', 'definition', 'contextExample', 'category'],
              },
            },
            quizzes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['multiple-choice', 'true-false', 'fill-blank'] },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswer: { type: Type.STRING },
                  explanationCorrect: { type: Type.STRING },
                  explanationWrong: {
                    type: Type.OBJECT,
                    description: 'Giải thích vì sao từng phương án sai lại là bẫy',
                    properties: {
                      A: { type: Type.STRING },
                      B: { type: Type.STRING },
                      C: { type: Type.STRING },
                      D: { type: Type.STRING },
                    },
                  },
                },
                required: ['id', 'type', 'question', 'correctAnswer', 'explanationCorrect'],
              },
            },
            summary: {
              type: Type.OBJECT,
              properties: {
                keyTakeaways: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                comparisonTable: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    headers: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    rows: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                  },
                  required: ['title', 'headers', 'rows'],
                },
              },
              required: ['keyTakeaways', 'comparisonTable'],
            },
          },
          required: ['title', 'overview', 'flashcards', 'quizzes', 'summary'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json({ success: true, data: result, source: 'gemini' });
  } catch (error: any) {
    console.error('Error in /api/materials/generate, falling back gracefully:', error?.message);
    res.json({
      success: true,
      data: getFallbackMaterials(req.body.contentText, req.body.title),
      source: 'local_engine_fallback',
    });
  }
});

// ==========================================
// 4. Adaptive Exam Planner API (/api/planner/generate & /api/planner/rebalance)
// ==========================================
app.post('/api/planner/generate', async (req: Request, res: Response) => {
  try {
    const { examName, targetDate, dailyMinutes = 45, totalWeeks = 3, topics = [] } = req.body;

    if (!examName) {
      return res.status(400).json({ error: 'Vui lòng cung cấp tên kỳ thi.' });
    }

    if (!ai) {
      return res.json({
        success: true,
        data: getFallbackPlan(examName, targetDate, dailyMinutes, totalWeeks),
        source: 'local_engine',
      });
    }

    const prompt = `Bạn là chuyên gia tư vấn chiến lược luyện thi hàng đầu.
Người học đang chuẩn bị cho kỳ thi: "${examName}"
Ngày thi: ${targetDate || 'Sau 3 tuần'}
Quỹ thời gian học: ${dailyMinutes} phút/ngày
Số tuần ôn tập: ${totalWeeks} tuần (tổng cộng khoảng ${totalWeeks * 7} ngày)
Chủ đề trọng tâm: ${topics.length > 0 ? topics.join(', ') : 'Toàn diện theo đề cương chuẩn'}

Yêu cầu phân bổ tải trọng học tập (Pacing Strategy):
- Cân đối khoa học giữa Lý thuyết mới (40%), Bài tập vận dụng (50%), và Ngày đệm ôn tập lặp lại ngắt quãng (Spaced Review 10%).
- Mỗi ngày có 1-2 nhiệm vụ rõ ràng, khả thi trong ${dailyMinutes} phút.
- Đặt các mốc thi thử định kỳ (Mock Checkpoints) vào cuối mỗi tuần.

Hãy trả về JSON cấu trúc:
{
  "examName": "${examName}",
  "targetDate": "${targetDate}",
  "dailyMinutes": ${dailyMinutes},
  "strategyNote": "Chiến lược phân bổ tải trọng...",
  "dailyTasks": [
    {
      "id": "task_1",
      "dayNumber": 1,
      "dateOffsetDays": 0,
      "topic": "Chủ đề cụ thể",
      "taskName": "Tên nhiệm vụ hành động",
      "type": "theory" | "practice" | "review" | "mock_test",
      "estimatedMinutes": ${dailyMinutes},
      "priority": "high" | "medium",
      "actionDetails": "Các bài tập hoặc phần lý thuyết cần hoàn thành"
    }
    ... tạo đủ các ngày cho kế hoạch
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json({ success: true, data: result, source: 'gemini' });
  } catch (error: any) {
    console.error('Error in /api/planner/generate:', error);
    res.json({
      success: true,
      data: getFallbackPlan(req.body.examName, req.body.targetDate, req.body.dailyMinutes, req.body.totalWeeks),
      source: 'local_engine',
    });
  }
});

app.post('/api/planner/rebalance', async (req: Request, res: Response) => {
  try {
    const { currentTasks = [], missedTaskIds = [], lowScoreTopics = [], dailyMinutes = 45 } = req.body;

    if (!ai) {
      return res.json({
        success: true,
        data: rebalanceTasksLocally(currentTasks, missedTaskIds, lowScoreTopics, dailyMinutes),
        source: 'local_engine',
      });
    }

    const prompt = `Hệ thống lập lịch học thích ứng tự động (Adaptive Re-balancing Algorithm):
Học sinh vừa gặp biến động tiến độ:
- Các nhiệm vụ bị bỏ lỡ / trễ hạn: ${JSON.stringify(missedTaskIds)}
- Các chuyên đề bị điểm kém khi làm bài kiểm tra thử: ${JSON.stringify(lowScoreTopics)}
- Quỹ thời gian quy định: ${dailyMinutes} phút/ngày
- Danh sách nhiệm vụ hiện tại còn lại: ${JSON.stringify(currentTasks.slice(0, 15))}

Hãy tái cấu trúc danh sách nhiệm vụ từ ngày hôm nay trở đi:
1. Dồn hoặc chia nhỏ các nhiệm vụ bị bỏ lỡ vào các ngày kế tiếp một cách hài hòa (không được gây quá tải vượt quá ${dailyMinutes + 15} phút/ngày).
2. Tự động chèn thêm "Nhiệm vụ củng cố lỗ hổng kiến thức" cho các chuyên đề có điểm yếu (<60%).
3. Giữ nguyên mốc thi thử cuối cùng.

Trả về mảng JSON các nhiệm vụ sau khi tái cân bằng:
{
  "adjustmentReason": "Giải thích vì sao và lịch trình đã được điều chỉnh như thế nào...",
  "rescheduledTasks": [ ... danh sách các dailyTasks cập nhật ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json({ success: true, data: result, source: 'gemini' });
  } catch (error: any) {
    console.error('Error in /api/planner/rebalance:', error);
    res.json({
      success: true,
      data: rebalanceTasksLocally(req.body.currentTasks, req.body.missedTaskIds, req.body.lowScoreTopics, req.body.dailyMinutes),
      source: 'local_engine',
    });
  }
});

// ==========================================
// Fallback & Offline Engine Helpers
// ==========================================
function getFallbackSocraticProblem(problemText?: string, subject = 'Toán học') {
  return {
    title: 'Giải phương trình lượng giác: $2\\sin^2(x) + 3\\cos(x) - 3 = 0$',
    subject: subject || 'Toán học',
    summary: 'Bài toán yêu cầu đưa phương trình về cùng một hàm lượng giác cơ bản qua công thức biến đổi nhân bản $\\sin^2(x) = 1 - \\cos^2(x)$, sau đó giải phương trình bậc hai đối với $\\cos(x)$.',
    steps: [
      {
        id: 'step_1',
        stageNumber: 1,
        title: 'Bước 1: Xác định giả thiết & Điều kiện xác định',
        concept: 'Tập xác định & Phạm vi biến số của hàm tuần hoàn',
        guidanceQuestion: 'Hàm số $\\sin(x)$ và $\\cos(x)$ có điều kiện xác định gì đặc biệt không, và giá trị của $\\cos(x)$ luôn nằm trong khoảng nào?',
        hints: [
          'Hàm lượng giác sin và cos xác định trên toàn bộ trục số thực $\\mathbb{R}$.',
          'Lưu ý quan trọng: điều kiện chặn nghiệm đối với ẩn phụ $t = \\cos(x)$ là $-1 \\le t \\le 1$.',
        ],
        detailedExplanation: 'Phương trình chứa $\\sin(x)$ và $\\cos(x)$ không có mẫu số hay căn thức, nên tập xác định là $D = \\mathbb{R}$. Khi đặt ẩn phụ $t = \\cos(x)$, ta bắt buộc phải có điều kiện $|t| \\le 1$.',
        formula: 'D = \\mathbb{R}, \\quad -1 \\le \\cos(x) \\le 1',
        casioTip: 'Bấm [MODE] 7 hoặc [MENU] 8 (Table) để quét nhanh nghiệm trong khoảng $[0, 2\\pi]$ với Step $\\pi/12$.',
        analogy: 'Giống như biên độ của con lắc đồng hồ: nó không thể dao động vượt quá giới hạn tối đa bên trái hay bên phải.',
      },
      {
        id: 'step_2',
        stageNumber: 2,
        title: 'Bước 2: Chọn công thức & Đưa về cùng một hàm lượng giác',
        concept: 'Hệ thức Pythagore lượng giác $\\sin^2(x) + \\cos^2(x) = 1$',
        guidanceQuestion: 'Trong phương trình có cả $\\sin^2(x)$ và $\\cos(x)$ bậc nhất. Bạn có thể thay thế $\\sin^2(x)$ bằng biểu thức nào chứa $\\cos(x)$?',
        hints: [
          'Sử dụng hệ thức cơ bản $\\sin^2(x) = 1 - \\cos^2(x)$.',
          'Thay $2\\sin^2(x)$ thành $2(1 - \\cos^2(x))$ rồi phá ngoặc.',
        ],
        detailedExplanation: 'Ta có $\\sin^2(x) = 1 - \\cos^2(x)$. Thay vào phương trình ban đầu:\n$$2(1 - \\cos^2(x)) + 3\\cos(x) - 3 = 0$$\nKhai triển:\n$$2 - 2\\cos^2(x) + 3\\cos(x) - 3 = 0 \\iff -2\\cos^2(x) + 3\\cos(x) - 1 = 0$$',
        formula: '\\sin^2(x) + \\cos^2(x) = 1 \\implies 2\\cos^2(x) - 3\\cos(x) + 1 = 0',
        casioTip: 'Nhập trực tiếp biểu thức vào máy: $2(\\sin(X))^2 + 3\\cos(X) - 3$ rồi ấn [CALC] thử giá trị.',
        analogy: 'Quy đổi tiền tệ về cùng một đơn vị (VNĐ) để dễ dàng cộng trừ so sánh thay vì vừa giữ USD vừa giữ EUR.',
      },
      {
        id: 'step_3',
        stageNumber: 3,
        title: 'Bước 3: Biến đổi đại số & Giải phương trình bậc hai',
        concept: 'Giải phương trình bậc hai $2t^2 - 3t + 1 = 0$ bằng nhẩm nghiệm $a + b + c = 0$',
        guidanceQuestion: 'Đặt $t = \\cos(x)$, phương trình trở thành $2t^2 - 3t + 1 = 0$. Nhận xét tổng các hệ số $a + b + c$ để tìm nhanh hai nghiệm $t$?',
        hints: [
          'Ta có $a = 2, b = -3, c = 1$. Tổng $a + b + c = 2 - 3 + 1 = 0$.',
          'Vậy phương trình có 2 nghiệm: $t_1 = 1$ và $t_2 = c/a = 1/2$. Cả hai nghiệm đều thỏa mãn điều kiện $[-1, 1]$.',
        ],
        detailedExplanation: 'Đặt $t = \\cos(x)$ với $-1 \\le t \\le 1$.\nPhương trình trở thành:\n$$2t^2 - 3t + 1 = 0$$\nDo $a + b + c = 2 + (-3) + 1 = 0$, ta có ngay hai nghiệm:\n$$t = 1 \\quad \\text{hoặc} \\quad t = \\frac{1}{2}$$\nCả hai giá trị đều nằm trong đoạn $[-1, 1]$ nên đều thỏa mãn điều kiện.',
        formula: '2t^2 - 3t + 1 = 0 \\iff \\begin{cases} t = 1 \\\\ t = \\frac{1}{2} \\end{cases}',
        casioTip: 'Bấm [MENU] 9 -> 2 -> 2 (hoặc [MODE] 5 -> 3) nhập 2, -3, 1 -> Ra ngay $x_1 = 1$, $x_2 = 1/2$.',
        analogy: 'Tách bài toán phức tạp thành việc mở hai cánh cửa độc lập, mỗi cánh cửa dẫn tới một hướng giải rõ ràng.',
      },
      {
        id: 'step_4',
        stageNumber: 4,
        title: 'Bước 4: Kết luận nghiệm & Kiểm tra nghiệm ngoại lai',
        concept: 'Nghiệm phương trình lượng giác cơ bản trên đường tròn',
        guidanceQuestion: 'Với $\\cos(x) = 1$ và $\\cos(x) = 1/2$, các góc lượng giác $x$ tương ứng là những góc nào trên đường tròn lượng giác?',
        hints: [
          '$\\cos(x) = 1 \\iff x = k2\\pi$ với $k \\in \\mathbb{Z}$.',
          '$\\cos(x) = 1/2 = \\cos(\\pi/3) \\iff x = \\pm \\frac{\\pi}{3} + k2\\pi$.',
        ],
        detailedExplanation: 'Giải hai trường hợp:\n1. $\\cos(x) = 1 \\iff x = k2\\pi, \\quad k \\in \\mathbb{Z}$.\n2. $\\cos(x) = \\frac{1}{2} = \\cos\\left(\\frac{\\pi}{3}\\right) \\iff x = \\pm \\frac{\\pi}{3} + k2\\pi, \\quad k \\in \\mathbb{Z}$.\n\nKết luận: Tập nghiệm của phương trình là:\n$$S = \\left\\{ k2\\pi, \\pm \\frac{\\pi}{3} + k2\\pi \\;\\middle|\\; k \\in \\mathbb{Z} \\right\\}$$',
        formula: 'x = k2\\pi \\quad \\text{hoặc} \\quad x = \\pm \\frac{\\pi}{3} + k2\\pi, \\quad k \\in \\mathbb{Z}',
        casioTip: 'Bấm Shift-Solve với Start = 0 để tìm nghiệm đầu tiên (x = 0), rồi Shift-Solve với Start = 1 để tìm nghiệm thứ 2 (x = 1.04719 ~ $\\pi/3$).',
        analogy: 'Giống như kim phút của đồng hồ quay đúng các vị trí 12 giờ và 2 giờ/10 giờ lặp lại tuần hoàn sau mỗi chu kỳ.',
      },
    ],
  };
}

function getFallbackFollowupAnswer(stepTitle = '', selectedText = '', userQuestion = '', mode = 'explain_step') {
  if (mode === 'casio') {
    return `### Hướng dẫn bấm máy tính Casio fx-580VNX / 880BTG:
1. **Tìm nghiệm nhanh (Shift-Solve)**:
   - Chuyển máy về chế độ Radian: bấm **[SHIFT] [MENU] 2 (Angle Unit) -> 2 (Radian)**.
   - Nhập biểu thức phương trình: \`2(sin(x))^2 + 3cos(x) - 3\`. Bấm phím **[ALPHA] [CALC]** để gõ dấu \`=\`, rồi gõ \`0\`.
   - Bấm **[SHIFT] [CALC] (SOLVE)**, máy hỏi \`x?\`, nhập giá trị khởi tạo \`1\`, bấm \`=\`.
   - Máy hiển thị ngay: \`x = 1.047197551\` chính là $\\frac{\\pi}{3}$!
2. **Kiểm tra nghiệm bằng Table**:
   - Bấm **[MENU] 8 (Table)**, nhập $f(x) = 2\\sin^2(x) + 3\\cos(x) - 3$.
   - Start: 0, End: $2\\pi$, Step: $\\frac{\\pi}{12}$. Nhìn cột $f(x) = 0$ tại vị trí nào thì đó là nghiệm!`;
  }

  if (mode === 'analogy') {
    return `### Giải thích bằng Ẩn dụ đời thường:
Hãy tưởng tượng bài toán này như việc bạn đang chuẩn bị nguyên liệu làm bánh pizza.
- Trong công thức ban đầu, bạn vừa có phô mai dạng sợi ($\\\\sin^2(x)$) vừa có phô mai lát ($\\\\cos(x)$). Khi làm bánh, thợ làm bánh chuyên nghiệp sẽ chuyển hết về một dạng duy nhất (dùng hệ thức Pythagore) để dễ dàng căn chỉnh tỷ lệ nhiệt độ.
- Khi đã đưa về cùng loại phô mai lát ($t = \\\\cos(x)$), việc giải phương trình bậc hai giống như việc bạn chỉ cần chia thành 2 mẻ bánh vừa vặn.
- Giới hạn $[-1, 1]$ của $\\\\cos(x)$ chính là sức chứa của khay nướng: bạn không thể nướng chiếc bánh to hơn kích thước tối đa của lò nướng được!`;
  }

  return `### Phân tích chi tiết bước giải: "${stepTitle || 'Biến đổi'}"
${selectedText ? `> **Đoạn được chọn:** "${selectedText}"\n\n` : ''}
1. **Nguyên nhân biến đổi**:
   Từ bước trước chuyển sang bước này dựa trên nguyên tắc **đồng nhất hóa biến số**. Trong giải tích và lượng giác, phương trình chứa 2 hàm lượng giác khác nhau ($\\\\sin$ và $\\\\cos$) rất khó phân tích nhân tử trực tiếp nếu không quy về cùng một hàm bậc hai.
2. **Hệ thức bắc cầu**:
   Sử dụng đẳng thức cơ bản $\\\\sin^2(x) + \\\\cos^2(x) = 1 \\iff \\\\sin^2(x) = 1 - \\\\cos^2(x)$.
   Khi nhân hệ số 2 vào: $2(1 - \\\\cos^2(x)) = 2 - 2\\\\cos^2(x)$.
3. **Câu hỏi kiểm tra nhanh**:
   Nếu phương trình có dạng $3\\\\cos^2(x) + 2\\\\sin(x) - 3 = 0$, bạn sẽ biến đổi như thế nào để đưa về cùng một hàm lượng giác?`;
}

function getFallbackMaterials(contentText = '', title = 'Di truyền học & Đột biến Gen') {
  return {
    title: title || 'Tài liệu Ôn tập Di truyền học & Đột biến',
    overview: 'Tài liệu cô đọng các quy luật di truyền phân tử, cơ chế đột biến gen và cấu trúc DNA/RNA chuẩn chương trình THPT và Đại học.',
    flashcards: [
      {
        id: 'fc_1',
        term: 'Đột biến gen (Gene Mutation)',
        definition: 'Những biến đổi trong cấu trúc của gen, liên quan đến một hoặc một số cặp nucleotide, xảy ra tại một điểm nào đó trên phân tử DNA.',
        contextExample: 'Ví dụ bệnh thiếu máu hồng cầu hình liềm do đột biến thay thế cặp A-T thành T-A ở bộ ba thứ 6 của chuỗi beta-hemoglobin (GAG thành GUG).',
        category: 'Di truyền học phân tử',
      },
      {
        id: 'fc_2',
        term: 'Mã di truyền có tính thoái hóa (Degeneracy)',
        definition: 'Hiện tượng nhiều bộ ba mã hóa khác nhau (codon) cùng mã hóa cho một loại amino acid, ngoại trừ AUG (Met) và UGG (Trp).',
        contextExample: 'Có tới 6 bộ ba khác nhau cùng mã hóa cho Leucine (UUA, UUG, CUU, CUC, CUA, CUG), giúp sinh vật chống chịu đột biến thay thế nucleotide trung tính.',
        category: 'Cơ chế di truyền',
      },
      {
        id: 'fc_3',
        term: 'Đột biến dịch khung (Frameshift Mutation)',
        definition: 'Đột biến thêm hoặc mất một hoặc một số cặp nucleotide không phải là bội số của 3, làm thay đổi toàn bộ khung đọc mã từ điểm đột biến đến cuối gen.',
        contextExample: 'Mất 1 cặp nucleotide C-G ở đầu đoạn mã làm toàn bộ chuỗi polypeptide phía sau bị sai khác hoàn toàn hoặc gặp mã kết thúc sớm.',
        category: 'Hậu quả đột biến',
      },
      {
        id: 'fc_4',
        term: 'Định luật Hardy-Weinberg',
        definition: 'Trong quần thể ngẫu phối lý tưởng không có chọn lọc và đột biến, tần số alen và thành phần kiểu gen duy trì ổn định qua các thế hệ theo đẳng thức $p^2 + 2pq + q^2 = 1$.',
        contextExample: 'Quần thể có tần số alen $A = 0.7, a = 0.3$ sẽ có cấu trúc cân bằng $0.49 AA + 0.42 Aa + 0.09 aa = 1$.',
        category: 'Di truyền học quần thể',
      },
      {
        id: 'fc_5',
        term: 'Operon Lac',
        definition: 'Cụm các gen cấu trúc có liên quan về chức năng (Z, Y, A) cùng chung một cơ chế điều hòa biểu hiện bởi một vùng vận hành (O) và một promoter (P).',
        contextExample: 'Khi có đường Lactose trong môi trường của E. coli, phân tử allolactose liên kết với protein ức chế làm nó biến đổi cấu hình, giải phóng vùng vận hành để RNA polymerase phiên mã.',
        category: 'Điều hòa biểu hiện gen',
      },
    ],
    quizzes: [
      {
        id: 'qz_1',
        type: 'multiple-choice',
        question: 'Dạng đột biến điểm nào sau đây KHÔNG làm thay đổi số lượng liên kết hydro của gen?',
        options: [
          'A. Thay thế một cặp A-T bằng một cặp T-A',
          'B. Thay thế một cặp A-T bằng một cặp G-C',
          'C. Mất một cặp A-T',
          'D. Thêm một cặp G-C',
        ],
        correctAnswer: 'A',
        explanationCorrect: 'Đúng! Cặp A-T có 2 liên kết hydro, khi thay thế bằng cặp T-A (cũng có 2 liên kết hydro) thì tổng số liên kết hydro của gen hoàn toàn không đổi.',
        explanationWrong: {
          B: 'Sai vì thay A-T (2 liên kết H) bằng G-C (3 liên kết H) làm tăng 1 liên kết hydro.',
          C: 'Sai vì mất một cặp A-T làm giảm 2 liên kết hydro của gen.',
          D: 'Sai vì thêm một cặp G-C làm tăng 3 liên kết hydro của gen.',
        },
      },
      {
        id: 'qz_2',
        type: 'true-false',
        question: 'Tất cả các đột biến gen xảy ra trong tế bào sinh dưỡng (tế bào soma) đều di truyền được cho thế hệ sau qua sinh sản hữu tính.',
        options: ['Đúng', 'Sai'],
        correctAnswer: 'Sai',
        explanationCorrect: 'Chính xác! Đột biến ở tế bào soma không đi vào giao tử (trứng/tinh trùng) nên không di truyền qua sinh sản hữu tính, chỉ có thể nhân lên qua nguyên phân hoặc sinh sản vô tính.',
        explanationWrong: {
          Đúng: 'Sai lầm vì chỉ có đột biến ở tế bào sinh dục (giao tử) mới có thể truyền sang đời con qua thụ tinh.',
        },
      },
      {
        id: 'qz_3',
        type: 'multiple-choice',
        question: 'Hiện tượng thoái hóa của mã di truyền mang lại ý nghĩa thích nghi quan trọng nào cho sinh vật?',
        options: [
          'A. Giúp giảm thiểu tác hại của đột biến thay thế nucleotide ở vị trí thứ ba trong bộ ba',
          'B. Giúp tăng tốc độ dịch mã lên gấp nhiều lần',
          'C. Làm cho một phân tử mRNA có thể tổng hợp được nhiều loại protein khác nhau',
          'D. Ngăn cản hoàn toàn sự phát sinh đột biến gen',
        ],
        correctAnswer: 'A',
        explanationCorrect: 'Rất chính xác! Tính thoái hóa (nhiều bộ ba cùng mã hóa 1 amino acid) giúp đột biến thay thế nucleotide thứ ba của codon thường không làm thay đổi acid amin tương ứng (đột biến đồng nghĩa/câm).',
        explanationWrong: {
          B: 'Sai vì tốc độ dịch mã phụ thuộc vào ribosome và nồng độ tRNA, không phụ thuộc vào tính thoái hóa.',
          C: 'Sai vì một codon chỉ mã hóa 1 acid amin (tính đặc hiệu).',
          D: 'Sai vì tính thoái hóa không ngăn cản phát sinh đột biến, nó chỉ làm giảm hậu quả kiểu hình của đột biến.',
        },
      },
    ],
    summary: {
      keyTakeaways: [
        'Đột biến gen là nguồn nguyên liệu sơ cấp chủ yếu cho quá trình tiến hóa và chọn giống.',
        'Đột biến thay thế 1 cặp nucleotide thường ít gây hậu quả nghiêm trọng hơn so với đột biến thêm hoặc mất cặp (dịch khung).',
        'Cơ chế sửa sai của DNA polymerase giúp duy trì tần số đột biến tự nhiên ở mức rất thấp (khoảng $10^{-6}$ đến $10^{-4}$/gen/thế hệ).',
        'Mã di truyền có 4 đặc điểm cốt lõi: đọc liên tục không gối, tính phổ biến, tính đặc hiệu và tính thoái hóa.',
      ],
      comparisonTable: {
        title: 'Bảng Đối Chiếu So Sánh: Đột Biến Gen vs Đột Biến Cấu Trúc NST',
        headers: ['Tiêu chí so sánh', 'Đột biến Gen (Đột biến điểm)', 'Đột biến Cấu trúc Nhiễm Sắc Thể'],
        rows: [
          ['Quy mô biến đổi', 'Cấp độ phân tử (1 hoặc vài cặp nucleotide trên DNA)', 'Cấp độ tế bào (đoạn lớn NST gồm hàng trăm đến hàng nghìn gen)'],
          ['Phương pháp phát hiện', 'Giải trình tự gen, PCR, điện di phân tử', 'Nhuộm băng NST, quan sát dưới kính hiển vi quang học'],
          ['Các dạng cơ bản', 'Thay thế, thêm, mất 1 cặp nucleotide', 'Mất đoạn, lặp đoạn, đảo đoạn, chuyển đoạn'],
          ['Mức độ ảnh hưởng sức sống', 'Thường ít nghiêm trọng hơn, nhiều đột biến trung tính', 'Thường làm giảm sức sống, gây mất cân bằng gen nghiêm trọng hoặc bất thụ'],
        ],
      },
    },
  };
}

function getFallbackPlan(examName = 'Kỳ thi Tốt nghiệp THPT & Đánh giá năng lực', targetDate = '', dailyMinutes = 45, totalWeeks = 3) {
  const daysCount = totalWeeks * 7;
  const tasks = [];
  const topicsList = [
    { name: 'Đại số: Hàm số & Khảo sát đồ thị', type: 'theory' },
    { name: 'Đại số: Bài tập cực trị & Tiệm cận hàm số', type: 'practice' },
    { name: 'Hình học: Thể tích khối đa diện & Góc/Khoảng cách', type: 'theory' },
    { name: 'Hình học: Luyện đề trắc nghiệm khối tròn xoay', type: 'practice' },
    { name: 'Giải tích: Nguyên hàm & Tích phân từng phần', type: 'theory' },
    { name: 'Giải tích: Ứng dụng hình học của tích phân', type: 'practice' },
    { name: 'Mốc thi thử Tuần 1: Bài kiểm tra 50 câu (90 phút)', type: 'mock_test' },
    { name: 'Số phức & Phương pháp tọa độ Oxyz trong không gian', type: 'theory' },
    { name: 'Bài tập vận dụng cao: Cực trị Oxyz', type: 'practice' },
    { name: 'Vật lý / Hóa học: Chuyên đề dao động cơ & Điện xoay chiều', type: 'theory' },
    { name: 'Luyện đề trắc nghiệm tổ hợp Khoa học tự nhiên', type: 'practice' },
    { name: 'Tiếng Anh: Ngữ pháp trọng tâm & Collocations', type: 'theory' },
    { name: 'Đọc hiểu & Điền từ đoạn văn tiếng Anh', type: 'practice' },
    { name: 'Mốc thi thử Tuần 2: Thi thử tổ hợp chuẩn cấu trúc', type: 'mock_test' },
    { name: 'Tổng ôn: Lấp lỗ hổng kiến thức từ kết quả thi thử', type: 'review' },
    { name: 'Luyện đề thi chính thức năm trước có bấm giờ', type: 'practice' },
    { name: 'Chiến thuật làm bài: Bẫy sai lầm & Phân bổ thời gian', type: 'theory' },
    { name: 'Rà soát toàn bộ công thức và sơ đồ tư duy', type: 'review' },
    { name: 'Nghỉ ngơi điều độ & Tinh thần sẵn sàng trước ngày thi', type: 'review' },
    { name: 'Thi thử chung kết (Final Simulation)', type: 'mock_test' },
    { name: 'Ngày thi chính thức - Tự tin chiến thắng!', type: 'review' },
  ];

  for (let i = 0; i < Math.min(daysCount, topicsList.length); i++) {
    const item = topicsList[i];
    tasks.push({
      id: `task_${i + 1}`,
      dayNumber: i + 1,
      dateOffsetDays: i,
      topic: item.name,
      taskName: `Ngày ${i + 1}: ${item.name}`,
      type: item.type,
      estimatedMinutes: dailyMinutes,
      priority: i % 7 === 6 ? 'high' : 'medium',
      actionDetails: `Dành ${dailyMinutes} phút để tập trung giải quyết trọn vẹn chủ đề này theo mục tiêu.`,
      completed: i < 2, // Đã hoàn thành 2 ngày đầu làm mẫu
      missed: false,
    });
  }

  return {
    examName,
    targetDate: targetDate || 'Trong 3 tuần tới',
    dailyMinutes,
    strategyNote: 'Lịch trình tuân thủ nguyên tắc Spaced Repetition (Lặp lại ngắt quãng) và cân đối 40% lý thuyết / 60% bài tập vận dụng.',
    dailyTasks: tasks,
  };
}

function rebalanceTasksLocally(currentTasks: any[], missedTaskIds: string[], lowScoreTopics: any[], dailyMinutes = 45) {
  const updated = currentTasks.map((t) => {
    if (missedTaskIds.includes(t.id)) {
      return { ...t, missed: true, completed: false };
    }
    return t;
  });

  // Chèn thêm nhiệm vụ củng cố
  const reinforcementTasks: any[] = [];
  if (lowScoreTopics && lowScoreTopics.length > 0) {
    lowScoreTopics.forEach((topicObj: any, idx: number) => {
      reinforcementTasks.push({
        id: `reinforce_${Date.now()}_${idx}`,
        dayNumber: updated.length + idx + 1,
        dateOffsetDays: updated.length + idx,
        topic: `[Củng cố lỗ hổng] ${topicObj.topic || 'Chuyên đề điểm yếu'}`,
        taskName: `Luyện tăng cường: ${topicObj.topic} (Điểm hiện tại: ${topicObj.score}%)`,
        type: 'review',
        estimatedMinutes: dailyMinutes,
        priority: 'high',
        actionDetails: 'Làm lại các câu hỏi sai, xem lại các thẻ Flashcard và giải thích Socratic liên quan.',
        completed: false,
        missed: false,
      });
    });
  }

  return {
    adjustmentReason: `Đã tự động tái phân bổ: Phát hiện ${missedTaskIds.length} buổi học trễ hạn và ${lowScoreTopics.length} chuyên đề cần tăng cường. Thuật toán đã chèn thêm các nhiệm vụ củng cố mà không làm vượt quá ${dailyMinutes} phút/ngày.`,
    rescheduledTasks: [...updated, ...reinforcementTasks],
  };
}

// ==========================================
// Serve Vite frontend in dev & production
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SocratesAI Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
