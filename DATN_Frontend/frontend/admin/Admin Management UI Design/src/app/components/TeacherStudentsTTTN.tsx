import { useState } from "react";
import { Card, Badge, Button, PageHeader, Modal, inputCls } from "./common";
import { Eye, Phone, Mail, Building2, FileText, MessageSquare, Star, X } from "lucide-react";

type TTTNStudent = {
  id: string;
  name: string;
  company: string;
  mentorName: string;
  mentorPhone: string;
  mentorEmail: string;
  latestReport: string;
  reportStatus: string;
  reportDate: string;
  reportFile?: string;
};

const tttnStudents: TTTNStudent[] = [
  {
    id: "20520001",
    name: "Nguyễn Văn A",
    company: "FPT Software",
    mentorName: "Nguyễn Văn X",
    mentorPhone: "0901234567",
    mentorEmail: "xnv@fpt.com",
    latestReport: "Tuần 3",
    reportStatus: "Đã nộp",
    reportDate: "15/05/2026",
    reportFile: "week3.pdf"
  },
  {
    id: "20520002",
    name: "Trần Thị B",
    company: "VNG Corp",
    mentorName: "Lê Thị Y",
    mentorPhone: "0909111222",
    mentorEmail: "ylt@vng.com",
    latestReport: "Tuần 2",
    reportStatus: "Trễ hạn",
    reportDate: "08/05/2026",
    reportFile: "week2.pdf"
  },
  {
    id: "20520003",
    name: "Phạm Văn C",
    company: "TMA Solutions",
    mentorName: "Trần Văn Z",
    mentorPhone: "0933444555",
    mentorEmail: "ztv@tma.com",
    latestReport: "Tuần 3",
    reportStatus: "Đã nộp",
    reportDate: "16/05/2026",
    reportFile: "week3.pdf"
  },
];

export function TeacherStudentsTTTN() {
  const [selectedStudent, setSelectedStudent] = useState<TTTNStudent | null>(null);
  const [viewingReport, setViewingReport] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [studentRating, setStudentRating] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000); };

  const statusMap: any = {
    "Đã nộp": "success",
    "Trễ hạn": "danger",
    "Đang chấm điểm": "warning"
  };

  const submitFeedback = () => {
    notify(`Đã lưu nhận xét cho ${selectedStudent?.name}`);
    setFeedback("");
    setViewingReport(false);
    setSelectedStudent(null);
  };

  const submitStudentRating = () => {
    notify(`Đã lưu đánh giá sinh viên cho ${selectedStudent?.name}`);
    setStudentRating("");
    setSelectedStudent(null);
  };

  return (
    <div>
      <PageHeader
        title="Hướng dẫn SV Thực tập (TTTN)"
        description="Theo dõi tiến độ báo cáo hàng tuần của SV TTTN bạn hướng dẫn"
      />

      <Card>
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
          <div className="text-sm font-medium">Danh sách sinh viên thực tập</div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">Mã SV</th>
              <th className="text-left px-4 py-3">Họ tên</th>
              <th className="text-left px-4 py-3">Công ty thực tập</th>
              <th className="text-left px-4 py-3">Liên hệ Mentor</th>
              <th className="text-left px-4 py-3">Báo cáo tuần mới nhất</th>
              <th className="text-right px-4 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {tttnStudents.map((s) => (
              <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-[#2196F3]">{s.id}</td>
                <td className="px-4 py-3">{s.name}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    <span>{s.company}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs space-y-1">
                    <div className="font-medium text-gray-900">{s.mentorName}</div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Phone className="w-3 h-3" />
                      {s.mentorPhone}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Mail className="w-3 h-3" />
                      {s.mentorEmail}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-600">{s.latestReport}</div>
                    <Badge type={statusMap[s.reportStatus]}>{s.reportStatus}</Badge>
                    <div className="text-xs text-gray-500">{s.reportDate}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="secondary"
                      className="text-xs"
                      onClick={() => {
                        setSelectedStudent(s);
                        setViewingReport(true);
                      }}
                    >
                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        Xem báo cáo
                      </span>
                    </Button>
                    <Button
                      variant="primary"
                      className="text-xs"
                      onClick={() => setSelectedStudent(s)}
                    >
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-3.5 h-3.5" />
                        Đánh giá SV
                      </span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Modal xem báo cáo & nhận xét */}
      <Modal
        open={viewingReport && !!selectedStudent}
        title={`Xem báo cáo - ${selectedStudent?.name}`}
        onClose={() => {
          setViewingReport(false);
          setSelectedStudent(null);
          setFeedback("");
        }}
        footer={
          <>
            <Button variant="secondary" onClick={() => {
              setViewingReport(false);
              setSelectedStudent(null);
              setFeedback("");
            }}>
              Đóng
            </Button>
            <Button variant="primary" onClick={submitFeedback}>
              Lưu nhận xét
            </Button>
          </>
        }
      >
        {selectedStudent && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-[#2196F3]" />
                <span className="text-sm font-medium">Báo cáo {selectedStudent.latestReport}</span>
              </div>
              <div className="text-xs text-gray-600 mb-1">
                Ngày nộp: {selectedStudent.reportDate}
              </div>
              <div className="mt-2">
                <Badge type={statusMap[selectedStudent.reportStatus]}>
                  {selectedStudent.reportStatus}
                </Badge>
              </div>
            </div>

            {selectedStudent.reportFile && (
              <div>
                <label className="block text-sm mb-1.5 text-gray-700">File báo cáo</label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 text-sm text-[#2196F3] hover:underline"
                    onClick={(e) => { e.preventDefault(); notify("Tải file báo cáo"); }}
                  >
                    <FileText className="w-4 h-4" />
                    {selectedStudent.reportFile}
                  </a>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm mb-1.5 text-gray-700">Nội dung báo cáo</label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700 max-h-60 overflow-y-auto">
                <p className="mb-2"><strong>Tuần {selectedStudent.latestReport.replace("Tuần ", "")}</strong></p>
                <p className="mb-2"><strong>Công việc đã thực hiện:</strong></p>
                <ul className="list-disc list-inside mb-2 text-xs space-y-1">
                  <li>Tìm hiểu và làm quen với môi trường làm việc tại công ty</li>
                  <li>Nghiên cứu tài liệu về công nghệ React và Node.js</li>
                  <li>Tham gia meeting với team và nhận task đầu tiên</li>
                </ul>
                <p className="mb-2"><strong>Kết quả đạt được:</strong></p>
                <p className="text-xs mb-2">Đã nắm được quy trình làm việc của công ty và chuẩn bị tốt cho các task tiếp theo.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1.5 text-gray-700">
                Nhận xét báo cáo <span className="text-xs text-gray-500">(không bắt buộc)</span>
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className={`${inputCls} resize-none`}
                rows={4}
                placeholder="Nhập nhận xét về báo cáo của sinh viên..."
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Modal đánh giá sinh viên */}
      <Modal
        open={!viewingReport && !!selectedStudent}
        title={`Đánh giá sinh viên - ${selectedStudent?.name}`}
        onClose={() => {
          setSelectedStudent(null);
          setStudentRating("");
        }}
        footer={
          <>
            <Button variant="secondary" onClick={() => {
              setSelectedStudent(null);
              setStudentRating("");
            }}>
              Hủy
            </Button>
            <Button variant="primary" onClick={submitStudentRating}>
              Lưu đánh giá
            </Button>
          </>
        }
      >
        {selectedStudent && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="text-sm font-medium mb-1">Thông tin sinh viên</div>
              <div className="text-xs text-gray-600">MSSV: {selectedStudent.id}</div>
              <div className="text-xs text-gray-600">Công ty: {selectedStudent.company}</div>
            </div>

            <div>
              <label className="block text-sm mb-1.5 text-gray-700 font-medium">
                Đánh giá tổng thể sinh viên <span className="text-[#F44336]">*</span>
              </label>
              <select
                value={studentRating}
                onChange={(e) => setStudentRating(e.target.value)}
                className={inputCls}
              >
                <option value="">-- Chọn kết quả đánh giá --</option>
                <option value="Đạt">Đạt</option>
                <option value="Không đạt">Không đạt</option>
              </select>
              <div className="text-xs text-gray-500 mt-1">
                Đánh giá tổng thể về thái độ, năng lực và kết quả thực tập của sinh viên
              </div>
            </div>
          </div>
        )}
      </Modal>

      {toast && (
        <div className="fixed top-20 right-6 bg-[#4CAF50] text-white px-4 py-3 rounded-md shadow-lg text-sm z-50">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
