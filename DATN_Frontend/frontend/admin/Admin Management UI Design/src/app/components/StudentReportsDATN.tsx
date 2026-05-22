import { useState } from "react";
import { PageHeader, Card, Badge, Button, Field, Modal, inputCls } from "./common";
import { Plus, FileText, Upload, Github } from "lucide-react";

type MilestoneReport = { name: string; file: string; status: string; feedback: string; repo: string; topic: string; advisor: string };

export function StudentReportsDATN() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [viewingDetail, setViewingDetail] = useState<MilestoneReport | null>(null);

  const topic = "DT001 - Xây dựng hệ thống quản lý thư viện điện tử";
  const advisor = "TS. Nguyễn Văn X";

  const milestonesDATN: MilestoneReport[] = [
    { name: "Bản thảo Chương 1", file: "chuong1.pdf", status: "Đã duyệt", feedback: "Tốt", repo: "https://github.com/user/project", topic, advisor },
    { name: "Bản thảo Chương 2", file: "chuong2.pdf", status: "Đang chấm điểm", feedback: "—", repo: "https://github.com/user/project", topic, advisor },
    { name: "Báo cáo chính thức", file: "—", status: "Nháp", feedback: "—", repo: "", topic, advisor },
  ];

  const map: any = { "Đã duyệt": "success", "Đang chấm điểm": "warning", "Nháp": "disabled", "Từ chối": "danger" };

  const close = () => {
    setOpen(false);
    setFile(null);
  };

  const submit = () => {
    close();
    setToast("Đã nộp bản thảo mới");
    setTimeout(() => setToast(null), 3000);
  };

  const notify = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div>
      <PageHeader
        title="Báo cáo ĐATN"
        description="Nộp bản thảo đồ án theo giai đoạn"
        actions={
          <Button variant="primary" onClick={() => setOpen(true)}>
            <span className="inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nộp bản thảo
            </span>
          </Button>
        }
      />

      <Card>
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
          <div className="text-sm font-medium">Bản thảo đồ án theo giai đoạn</div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">Giai đoạn / Bản thảo</th>
              <th className="text-left px-4 py-3">File báo cáo</th>
              <th className="text-left px-4 py-3">Kho mã nguồn</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
              <th className="text-left px-4 py-3">Nhận xét GV</th>
              <th className="text-right px-4 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {milestonesDATN.map((m, idx) => (
              <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">{m.name}</td>
                <td className="px-4 py-3 text-[#2196F3]">
                  <span className="inline-flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    {m.file}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {m.repo ? (
                    <a
                      href={m.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#2196F3] hover:underline"
                    >
                      <Github className="w-3.5 h-3.5" />
                      GitHub
                    </a>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge type={map[m.status]}>{m.status}</Badge>
                </td>
                <td className="px-4 py-3 text-gray-600">{m.feedback}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="secondary"
                    className="text-xs"
                    onClick={() => setViewingDetail(m)}
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
        title="Nộp bản thảo đồ án"
        onClose={close}
        footer={
          <>
            <Button variant="secondary" onClick={close}>Hủy</Button>
            <Button variant="primary" onClick={submit}>Nộp bản thảo</Button>
          </>
        }
      >
        <Field label="Giai đoạn / Bản thảo" required>
          <select className={inputCls} defaultValue="chuong3">
            <option value="chuong1">Bản thảo Chương 1 - Giới thiệu</option>
            <option value="chuong2">Bản thảo Chương 2 - Cơ sở lý thuyết</option>
            <option value="chuong3">Bản thảo Chương 3 - Phân tích & Thiết kế</option>
            <option value="chuong4">Bản thảo Chương 4 - Thực hiện</option>
            <option value="chuong5">Bản thảo Chương 5 - Kết luận</option>
            <option value="final">Báo cáo chính thức</option>
          </select>
        </Field>

        <Field label="File báo cáo (.pdf/.docx)" required>
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
                <div className="text-xs text-gray-500">PDF hoặc DOCX (tối đa 50MB)</div>
              </>
            )}
          </div>
        </Field>

        <Field label="Liên kết kho mã nguồn (Ví dụ: GitHub, GitLab)" required>
          <div className="relative">
            <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className={`${inputCls} pl-10`}
              type="url"
              placeholder="https://github.com/username/repository"
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Link đến repository chứa mã nguồn đồ án của bạn
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
              <div className="text-sm font-medium mb-3">Thông tin đồ án</div>
              <div className="space-y-1 text-xs text-gray-700">
                <div>
                  <span className="text-gray-500">Tên đề tài: </span>
                  <span className="font-medium">{viewingDetail.topic}</span>
                </div>
                <div>
                  <span className="text-gray-500">Giảng viên hướng dẫn: </span>
                  <span className="font-medium">{viewingDetail.advisor}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
              <div className="text-sm font-medium mb-2">{viewingDetail.name}</div>
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
              {viewingDetail.repo && (
                <div className="mt-2">
                  <span className="text-xs text-gray-500 block mb-1">Kho mã nguồn:</span>
                  <a
                    href={viewingDetail.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[#2196F3] hover:underline"
                  >
                    <Github className="w-4 h-4" />
                    {viewingDetail.repo}
                  </a>
                </div>
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
                ⚠️ Báo cáo này chưa được nộp. Bạn có thể nộp bằng cách nhấn nút "Nộp bản thảo" ở trên.
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
