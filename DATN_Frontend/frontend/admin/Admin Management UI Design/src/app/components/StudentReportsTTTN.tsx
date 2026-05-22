import { useState } from "react";
import { PageHeader, Card, Badge, Button, Field, Modal, inputCls } from "./common";
import { Plus, FileText, Upload } from "lucide-react";

type WeekReport = { w: number; title: string; file: string; status: string; feedback: string; company: string; position: string };

export function StudentReportsTTTN() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [viewingDetail, setViewingDetail] = useState<WeekReport | null>(null);

  const company = "FPT Software";
  const position = "Backend Developer Intern";

  const weeksTTTN: WeekReport[] = [
    { w: 1, title: "Làm quen môi trường công ty", file: "week1.pdf", status: "Đã duyệt", feedback: "Tốt", company, position },
    { w: 2, title: "Nghiên cứu công nghệ", file: "week2.pdf", status: "Đã duyệt", feedback: "OK", company, position },
    { w: 3, title: "Phát triển tính năng A", file: "—", status: "Nháp", feedback: "—", company, position },
  ];

  const map: any = { "Đã duyệt": "success", "Đang chấm điểm": "warning", "Nháp": "disabled", "Từ chối": "danger" };

  const close = () => {
    setOpen(false);
    setFile(null);
  };

  const submit = () => {
    close();
    setToast("Đã nộp nhật ký tuần mới");
    setTimeout(() => setToast(null), 3000);
  };

  const notify = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div>
      <PageHeader
        title="Báo cáo TTTN"
        description="Nộp nhật ký thực tập hàng tuần"
        actions={
          <Button variant="primary" onClick={() => setOpen(true)}>
            <span className="inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nộp nhật ký tuần
            </span>
          </Button>
        }
      />

      <Card>
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
          <div className="text-sm font-medium">Nhật ký thực tập theo tuần</div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3 w-16">Tuần</th>
              <th className="text-left px-4 py-3">Nội dung công việc</th>
              <th className="text-left px-4 py-3">File</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
              <th className="text-left px-4 py-3">Nhận xét GV</th>
              <th className="text-right px-4 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {weeksTTTN.map((w) => (
              <tr key={w.w} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">W{w.w}</td>
                <td className="px-4 py-3">{w.title}</td>
                <td className="px-4 py-3 text-[#2196F3]">
                  <span className="inline-flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    {w.file}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge type={map[w.status]}>{w.status}</Badge>
                </td>
                <td className="px-4 py-3 text-gray-600">{w.feedback}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="secondary"
                    className="text-xs"
                    onClick={() => setViewingDetail(w)}
                  >
                    Chi tiết
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Modal nộp báo cáo */}
      <Modal
        open={open}
        title="Nộp nhật ký tuần mới"
        onClose={close}
        footer={
          <>
            <Button variant="secondary" onClick={close}>Hủy</Button>
            <Button variant="primary" onClick={submit}>Nộp nhật ký</Button>
          </>
        }
      >
        <Field label="Tuần số" required>
          <select className={inputCls} defaultValue="3">
            {Array.from({ length: 8 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                Tuần {i + 1}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Tóm tắt công việc trong tuần tại Công ty" required>
          <textarea
            className={`${inputCls} resize-none`}
            rows={5}
            placeholder="Mô tả chi tiết công việc bạn đã làm trong tuần này..."
          />
        </Field>

        <Field label="File Nhật ký thực tập (.pdf/.docx)" required>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
              dragOver ? "border-[#2196F3] bg-blue-50" : "border-gray-300 hover:border-[#2196F3]"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); setFile(e.dataTransfer.files[0]); }}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            {file ? (
              <div className="text-sm text-[#2196F3]">{file.name}</div>
            ) : (
              <>
                <div className="text-sm text-gray-600 mb-1">
                  <label className="text-[#2196F3] hover:underline cursor-pointer">
                    Nhấn để chọn file
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </label>{" "}
                  hoặc kéo thả vào đây
                </div>
                <div className="text-xs text-gray-500">PDF hoặc DOCX (tối đa 10MB)</div>
              </>
            )}
          </div>
        </Field>
      </Modal>

      {/* Modal chi tiết báo cáo */}
      <Modal
        open={!!viewingDetail}
        title="Chi tiết báo cáo"
        onClose={() => setViewingDetail(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setViewingDetail(null)}>
              Đóng
            </Button>
            {viewingDetail && viewingDetail.file !== "—" && (
              <Button
                variant="danger"
                onClick={() => {
                  notify("Đã hủy nộp báo cáo. Bạn có thể nộp lại.");
                  setViewingDetail(null);
                }}
              >
                Hủy nộp & nộp lại
              </Button>
            )}
          </>
        }
      >
        {viewingDetail && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="text-sm font-medium mb-3">Thông tin thực tập</div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                <div>
                  <span className="text-gray-500">Tên công ty: </span>
                  <span className="font-medium">{viewingDetail.company}</span>
                </div>
                <div>
                  <span className="text-gray-500">Vị trí thực tập: </span>
                  <span className="font-medium">{viewingDetail.position}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
              <div className="text-sm font-medium mb-2">Tuần {viewingDetail.w} — {viewingDetail.title}</div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-500">Trạng thái:</span>
                <Badge type={map[viewingDetail.status]}>{viewingDetail.status}</Badge>
              </div>
              {viewingDetail.file !== "—" ? (
                <div className="mt-2">
                  <span className="text-xs text-gray-500 block mb-1">File đính kèm:</span>
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 text-sm text-[#2196F3] hover:underline"
                    onClick={(e) => { e.preventDefault(); notify(`Tải file ${viewingDetail.file}`); }}
                  >
                    <FileText className="w-4 h-4" />
                    {viewingDetail.file}
                  </a>
                </div>
              ) : (
                <div className="text-xs text-gray-400 mt-1">Chưa đính kèm file</div>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1.5 text-gray-700">Nhận xét của giảng viên</label>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
                {viewingDetail.feedback !== "—" ? viewingDetail.feedback : "Chưa có nhận xét"}
              </div>
            </div>

            {viewingDetail.file === "—" && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
                ⚠️ Báo cáo này chưa được nộp. Bạn có thể nộp bằng cách nhấn nút "Nộp nhật ký tuần" ở trên.
              </div>
            )}

            {viewingDetail.status === "Đã duyệt" && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm">
                ✓ Báo cáo đã được duyệt. Nếu muốn nộp lại, nhấn "Hủy nộp & nộp lại".
              </div>
            )}
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
