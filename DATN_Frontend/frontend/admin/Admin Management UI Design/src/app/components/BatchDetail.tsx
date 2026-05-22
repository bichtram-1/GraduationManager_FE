import { useState } from "react";
import { Badge, Button, Card, Field, Modal, PageHeader, inputCls } from "./common";
import { ArrowLeft, Users, BookOpen, GraduationCap, Trophy, Upload, Download, Trash2, FileText, Plus } from "lucide-react";
import { BATCHES } from "./AdminBatches";

type DocAudience = "all" | "teacher" | "student";
export type BatchDoc = { id: string; name: string; desc: string; audience: DocAudience; date: string };

export const SAMPLE_BATCH_DOCS: BatchDoc[] = [
  { id: "D1", name: "Mẫu nhật ký thực tập.docx", desc: "Mẫu nhật ký SV ghi hằng tuần", audience: "all", date: "01/05/2026" },
  { id: "D2", name: "Quy định chấm điểm TTTN.pdf", desc: "Quy định và barem chấm điểm", audience: "teacher", date: "01/05/2026" },
  { id: "D3", name: "Biểu mẫu đánh giá doanh nghiệp.xlsx", desc: "DN nhận xét sinh viên", audience: "student", date: "01/05/2026" },
];

const audienceLabel: Record<DocAudience, string> = { all: "Tất cả", teacher: "Giảng viên", student: "Sinh viên" };
const audienceCls: Record<DocAudience, string> = {
  all: "bg-gray-100 text-gray-700",
  teacher: "bg-[#DBEAFE] text-[#1D4ED8]",
  student: "bg-[#D1FAE5] text-[#065F46]",
};

const advisorRows = [
  { gv: "TS. Nguyễn Văn X", topic: "Hệ thống IoT giám sát nông nghiệp", group: "Nhóm 1", members: 2 },
  { gv: "TS. Trần Văn Y", topic: "Ứng dụng AI nhận diện hình ảnh", group: "Nhóm 2", members: 1 },
  { gv: "ThS. Lê Thị Z", topic: "Nền tảng e-commerce", group: "Nhóm 3", members: 2 },
  { gv: "TS. Phạm Văn K", topic: "Chatbot hỗ trợ học tập", group: "Nhóm 4", members: 1 },
];

const scoreRows = [
  { group: "Nhóm 1", topic: "Hệ thống IoT giám sát nông nghiệp", advisor: 8.5, review: 8.0, council: 8.7, status: "Đã chấm" },
  { group: "Nhóm 2", topic: "Ứng dụng AI nhận diện hình ảnh", advisor: 9.0, review: 8.8, council: 9.2, status: "Đã chấm" },
  { group: "Nhóm 3", topic: "Nền tảng e-commerce", advisor: null, review: null, council: null, status: "Chưa chấm" },
  { group: "Nhóm 4", topic: "Chatbot hỗ trợ học tập", advisor: 7.5, review: null, council: null, status: "Đang chấm" },
];

export function BatchDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const batch = BATCHES.find((b) => b.id === id) ?? BATCHES[0];
  const [tab, setTab] = useState<"overview" | "advisors" | "scores" | "docs">("overview");
  const [docs, setDocs] = useState<BatchDoc[]>(SAMPLE_BATCH_DOCS);
  const [openUpload, setOpenUpload] = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [docForm, setDocForm] = useState<{ name: string; desc: string; audience: DocAudience }>({ name: "", desc: "", audience: "all" });

  const uploadDoc = () => {
    setDocs((d) => [
      ...d,
      { id: `D${d.length + 1}`, name: docForm.name || "Tài liệu mới.pdf", desc: docForm.desc, audience: docForm.audience, date: new Date().toLocaleDateString("vi-VN") },
    ]);
    setOpenUpload(false);
    setDocForm({ name: "", desc: "", audience: "all" });
  };

  const w = { advisor: 0.4, review: 0.3, council: 0.3 };

  return (
    <div>
      <button onClick={onBack} className="inline-flex items-center gap-1 text-sm text-[#2196F3] hover:underline mb-3">
        <ArrowLeft className="w-4 h-4" />
        Quay lại danh sách đợt
      </button>

      <PageHeader
        title={batch.name}
        description={`${batch.type} • ${batch.start} → ${batch.end}`}
        actions={
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs ${
              batch.type === "TTTN" ? "bg-[#DBEAFE] text-[#1D4ED8]" : "bg-[#D1FAE5] text-[#065F46]"
            }`}
          >
            {batch.type}
          </span>
        }
      />

      <div className="flex gap-2 mb-5 border-b border-gray-200">
        {[
          { k: "overview", l: "Tổng quan" },
          { k: "advisors", l: "Danh sách GVHD & Nhóm" },
          { k: "scores", l: "Bảng điểm" },
          { k: "docs", l: "Tài liệu" },
        ].map((t) => {
          const active = tab === t.k;
          return (
            <button
              key={t.k}
              onClick={() => setTab(t.k as any)}
              className={`px-4 py-2.5 text-sm border-b-2 -mb-px transition ${
                active ? "border-[#2196F3] text-[#2196F3]" : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {t.l}
            </button>
          );
        })}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Metric icon={Users} label="Sinh viên" value={batch.students} color="text-[#2196F3]" bg="bg-blue-50" />
          <Metric icon={GraduationCap} label="Giảng viên" value={batch.teachers} color="text-[#4CAF50]" bg="bg-green-50" />
          <Metric icon={BookOpen} label="Đề tài" value={advisorRows.length} color="text-[#FFC107]" bg="bg-orange-50" />
          <Metric icon={Trophy} label="Đã chấm" value={`${scoreRows.filter((r) => r.status === "Đã chấm").length}/${scoreRows.length}`} color="text-purple-600" bg="bg-purple-50" />
        </div>
      )}

      {tab === "advisors" && (
        <Card>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">Giảng viên</th>
                <th className="text-left px-4 py-3">Đề tài hướng dẫn</th>
                <th className="text-left px-4 py-3">Nhóm SV</th>
                <th className="text-left px-4 py-3">Số thành viên</th>
              </tr>
            </thead>
            <tbody>
              {advisorRows.map((r, i) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">{r.gv}</td>
                  <td className="px-4 py-3">{r.topic}</td>
                  <td className="px-4 py-3">{r.group}</td>
                  <td className="px-4 py-3">{r.members}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "scores" && (
        <Card>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">Nhóm</th>
                <th className="text-left px-4 py-3">Đề tài</th>
                <th className="text-left px-4 py-3">GVHD</th>
                <th className="text-left px-4 py-3">PB</th>
                <th className="text-left px-4 py-3">HĐ</th>
                <th className="text-left px-4 py-3">Tổng</th>
                <th className="text-left px-4 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {scoreRows.map((r, i) => {
                const total =
                  r.advisor != null && r.review != null && r.council != null
                    ? (r.advisor * w.advisor + r.review * w.review + r.council * w.council).toFixed(2)
                    : "—";
                const map: any = { "Đã chấm": "success", "Đang chấm": "warning", "Chưa chấm": "disabled" };
                return (
                  <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">{r.group}</td>
                    <td className="px-4 py-3">{r.topic}</td>
                    <td className="px-4 py-3">{r.advisor ?? "—"}</td>
                    <td className="px-4 py-3">{r.review ?? "—"}</td>
                    <td className="px-4 py-3">{r.council ?? "—"}</td>
                    <td className="px-4 py-3">{total}</td>
                    <td className="px-4 py-3"><Badge type={map[r.status]}>{r.status}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
      {tab === "docs" && (
        <Card>
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="text-sm">Tài liệu đợt ({docs.length})</div>
            <Button variant="primary" onClick={() => setOpenUpload(true)}>
              <span className="inline-flex items-center gap-2"><Plus className="w-4 h-4" />Tải lên tài liệu</span>
            </Button>
          </div>
          {docs.length === 0 ? (
            <div className="px-4 py-16 text-center text-gray-500">
              <Upload className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <div className="text-sm text-gray-700">Chưa có tài liệu nào</div>
              <div className="text-xs text-gray-500 mt-1">Tải lên tài liệu để GV và SV có thể tải về.</div>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3">Tên tài liệu</th>
                  <th className="text-left px-4 py-3">Mô tả</th>
                  <th className="text-left px-4 py-3">Đối tượng</th>
                  <th className="text-left px-4 py-3">Ngày tải</th>
                  <th className="text-right px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2"><FileText className="w-4 h-4 text-gray-400" />{d.name}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{d.desc || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs ${audienceCls[d.audience]}`}>{audienceLabel[d.audience]}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{d.date}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button title="Tải về" className="p-1.5 rounded hover:bg-blue-50 text-[#2563EB]"><Download className="w-4 h-4" /></button>
                        <button title="Xóa" onClick={() => setConfirmDel(d.id)} className="p-1.5 rounded hover:bg-red-50 text-[#F44336]"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      <Modal
        open={openUpload}
        title="Tải lên tài liệu"
        onClose={() => setOpenUpload(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpenUpload(false)}>Hủy</Button>
            <Button variant="primary" onClick={uploadDoc} disabled={!docForm.name}>Tải lên</Button>
          </>
        }
      >
        <Field label="Tên tài liệu" required>
          <input value={docForm.name} onChange={(e) => setDocForm({ ...docForm, name: e.target.value })} placeholder="VD: Mẫu nhật ký thực tập.docx" className={inputCls} />
        </Field>
        <Field label="Mô tả ngắn">
          <input value={docForm.desc} onChange={(e) => setDocForm({ ...docForm, desc: e.target.value })} placeholder="Mô tả nội dung tài liệu" className={inputCls} />
        </Field>
        <Field label="Đối tượng" required>
          <div className="space-y-1.5">
            {[
              { v: "all", l: "Tất cả người dùng" },
              { v: "teacher", l: "Chỉ Giảng viên" },
              { v: "student", l: "Chỉ Sinh viên" },
            ].map((o) => (
              <label key={o.v} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  checked={docForm.audience === o.v}
                  onChange={() => setDocForm({ ...docForm, audience: o.v as DocAudience })}
                  className="accent-[#2563EB]"
                />
                {o.l}
              </label>
            ))}
          </div>
        </Field>
        <div className="border-2 border-dashed border-[#CBD5E1] rounded-lg p-8 text-center">
          <Upload className="w-10 h-10 mx-auto text-gray-300 mb-2" />
          <div className="text-sm text-gray-700">Kéo thả file vào đây</div>
          <div className="text-xs text-gray-500 mt-1">.pdf · .docx · .xlsx · tối đa 20MB</div>
          <button className="mt-3 px-4 py-1.5 rounded-md border border-[#2563EB] text-[#2563EB] text-sm hover:bg-blue-50">
            Chọn file
          </button>
        </div>
      </Modal>

      <Modal
        open={!!confirmDel}
        title="Xác nhận xóa"
        onClose={() => setConfirmDel(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDel(null)}>Hủy</Button>
            <Button variant="danger" onClick={() => { setDocs((d) => d.filter((x) => x.id !== confirmDel)); setConfirmDel(null); }}>Xóa</Button>
          </>
        }
      >
        <div className="text-sm text-gray-700">Xóa tài liệu này? Hành động không thể hoàn tác.</div>
      </Modal>
    </div>
  );
}

function Metric({ icon: Icon, label, value, color, bg }: any) {
  return (
    <Card className="p-4 flex items-center gap-3">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${bg}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-2xl">{value}</div>
      </div>
    </Card>
  );
}
