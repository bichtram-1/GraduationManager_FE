import React, { useState, useMemo } from "react";
import { Badge, Button, Card, Field, Modal, PageHeader, inputCls } from "./common";
import { Plus, ChevronDown, ChevronRight, X, Users, Pencil, Trash2, Clock, PlayCircle, CheckCircle2, AlertTriangle } from "lucide-react";

const teachers = [
  { id: "GV01", name: "TS. Nguyễn Văn X" },
  { id: "GV02", name: "TS. Trần Văn Y" },
  { id: "GV03", name: "ThS. Lê Thị Z" },
  { id: "GV04", name: "TS. Phạm Văn K" },
  { id: "GV05", name: "ThS. Vũ Thị L" },
  { id: "GV06", name: "PGS. Đặng Hữu M" },
];

const groupsAvail = [
  { id: "DA001", name: "Hệ thống IoT giám sát nông nghiệp", advisor: "GV01", members: ["Nguyễn A", "Trần B"] },
  { id: "DA002", name: "Ứng dụng AI nhận diện hình ảnh", advisor: "GV02", members: ["Phạm D"] },
  { id: "DA003", name: "Nền tảng e-commerce", advisor: "GV03", members: ["Lê C", "Hoàng E"] },
  { id: "DA004", name: "Chatbot hỗ trợ học tập", advisor: "GV04", members: ["Vũ F"] },
];

type CouncilStatus = "pending" | "ongoing" | "done";

type Council = {
  id: string;
  name: string;
  date: string;
  time: string;
  room: string;
  chair: string;
  secretary: string;
  reviewers: string[];
  groups: string[];
  status: CouncilStatus;
};

const initialCouncils: Council[] = [
  {
    id: "HD01",
    name: "Hội đồng 1 - ĐATN HK2/2025-2026",
    date: "15/12/2026",
    time: "08:00",
    room: "A1.401",
    chair: "GV06",
    secretary: "GV03",
    reviewers: ["GV04", "GV05"],
    groups: ["DA001", "DA002"],
    status: "pending",
  },
];

type ReviewRow = { topic: string; topicName: string; advisor: string; members: string[]; reviewer: string | null };

const initialReviewRows: ReviewRow[] = groupsAvail.map((g) => ({
  topic: g.id,
  topicName: g.name,
  advisor: g.advisor,
  members: g.members,
  reviewer: null,
}));

const teacherName = (id: string) => teachers.find((t) => t.id === id)?.name ?? id;

export function AdminCouncils({ onCreateCouncil }: { onCreateCouncil?: () => void }) {
  const [tab, setTab] = useState<"list" | "review">("review");
  const [councils, setCouncils] = useState<Council[]>(initialCouncils);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [reviewRows, setReviewRows] = useState<ReviewRow[]>(initialReviewRows);
  const [reviewFilter, setReviewFilter] = useState<"all" | "unassigned" | "assigned">("all");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000); };

  const [form, setForm] = useState({
    name: "",
    date: "",
    time: "",
    room: "",
    batch: "ĐATN HK2/2025-2026",
    chair: "",
    secretary: "",
    reviewers: [] as string[],
    groups: [] as string[],
  });

  const reset = () => setForm({ name: "", date: "", time: "", room: "", batch: "ĐATN HK2/2025-2026", chair: "", secretary: "", reviewers: [], groups: [] });

  const conflicts = useMemo(() => {
    const list: { reviewer: string; group: string }[] = [];
    form.reviewers.forEach((r) => {
      form.groups.forEach((gid) => {
        const g = groupsAvail.find((x) => x.id === gid);
        if (g && g.advisor === r) list.push({ reviewer: r, group: gid });
      });
    });
    return list;
  }, [form.reviewers, form.groups]);

  const create = () => {
    setCouncils((c) => [
      ...c,
      {
        id: `HD${String(c.length + 1).padStart(2, "0")}`,
        name: form.name || "Hội đồng mới",
        date: form.date || "—",
        time: form.time || "—",
        room: form.room || "—",
        chair: form.chair,
        secretary: form.secretary,
        reviewers: form.reviewers,
        groups: form.groups,
        status: "pending",
      },
    ]);
    setOpen(false);
    reset();
    notify("Đã tạo hội đồng mới");
  };

  const toggleArr = (field: "reviewers" | "groups", v: string) =>
    setForm((f) => ({ ...f, [field]: f[field].includes(v) ? f[field].filter((x) => x !== v) : [...f[field], v] }));

  const reviewerLoad = useMemo(() => {
    const m: Record<string, number> = {};
    reviewRows.forEach((r) => { if (r.reviewer) m[r.reviewer] = (m[r.reviewer] ?? 0) + 1; });
    return m;
  }, [reviewRows]);

  const filteredReview = reviewRows.filter((r) =>
    reviewFilter === "all" ? true : reviewFilter === "assigned" ? !!r.reviewer : !r.reviewer
  );
  const assignedCount = reviewRows.filter((r) => r.reviewer).length;

  const deleteCouncil = (id: string) => {
    setCouncils((c) => c.filter((x) => x.id !== id));
    setConfirmDelete(null);
    notify("Đã xóa hội đồng");
  };

  return (
    <div>
      <PageHeader
        title="Phân công hội đồng"
        description="Tạo hội đồng bảo vệ và phân công giảng viên phản biện cho ĐATN"
        actions={
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-sm text-gray-700">Công bố phân công</span>
              <button
                onClick={() => {
                  setPublished(!published);
                  notify(published ? "Đã chuyển về bản nháp" : "Đã công bố phân công hội đồng");
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  published ? "bg-[#4CAF50]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    published ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </label>
            <Badge type={published ? "success" : "disabled"}>
              {published ? "Đã công bố" : "Bản nháp (Ẩn)"}
            </Badge>
          </div>
        }
      />

      <div className="flex gap-2 mb-5 border-b border-gray-200">
        {[
          { k: "review", l: "Phân công phản biện" },
          { k: "list", l: "Quản lý hội đồng bảo vệ" },
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

      {tab === "review" ? (
        <Card className="pb-20">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between flex-wrap gap-2">
            <div className="text-sm text-gray-600">
              Mỗi đề tài chọn 1 GV phản biện (loại GVHD của đề tài đó)
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs">
              {[
                { k: "all", l: `Tất cả (${reviewRows.length})` },
                { k: "unassigned", l: `Chưa phân (${reviewRows.length - assignedCount})` },
                { k: "assigned", l: `Đã phân (${assignedCount})` },
              ].map((f) => (
                <button
                  key={f.k}
                  onClick={() => setReviewFilter(f.k as any)}
                  className={`px-3 py-1.5 rounded-full ${
                    reviewFilter === f.k
                      ? "bg-[#2563EB] text-white"
                      : "bg-[#F1F5F9] text-[#64748B] hover:bg-gray-200"
                  }`}
                >
                  {f.l}
                </button>
              ))}
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">Đề tài</th>
                <th className="text-left px-4 py-3">GVHD</th>
                <th className="text-left px-4 py-3">Nhóm SV</th>
                <th className="text-left px-4 py-3">GV phản biện</th>
                <th className="text-left px-4 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredReview.map((r) => {
                const idx = reviewRows.findIndex((x) => x.topic === r.topic);
                const candidates = teachers.filter((t) => t.id !== r.advisor);
                return (
                  <tr key={r.topic} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-[#2196F3] text-xs">{r.topic}</div>
                      <div>{r.topicName}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{teacherName(r.advisor)}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{r.members.join(", ")}</td>
                    <td className="px-4 py-3">
                      <select
                        value={r.reviewer ?? ""}
                        onChange={(e) =>
                          setReviewRows((rs) => rs.map((row, i) => (i === idx ? { ...row, reviewer: e.target.value || null } : row)))
                        }
                        className={`${inputCls} w-64`}
                      >
                        <option value="">— Chọn —</option>
                        {candidates.map((t) => {
                          const load = reviewerLoad[t.id] ?? 0;
                          return (
                            <option key={t.id} value={t.id}>
                              {t.name} {load > 0 ? `(đang PB ${load} nhóm)` : ""}
                            </option>
                          );
                        })}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {r.reviewer ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-[#D1FAE5] text-[#065F46]">
                          <CheckCircle2 className="w-3 h-3" />
                          Đã phân
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-gray-100 text-gray-500">
                          Chưa phân
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredReview.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-500">
                    Không có đề tài phù hợp với bộ lọc
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between shadow-[0_-2px_8px_rgba(0,0,0,0.04)] z-30">
            <div className="text-sm">
              <span className="text-[#2563EB]">{assignedCount}</span>
              <span className="text-gray-500"> / {reviewRows.length} đề tài đã được phân GV phản biện</span>
            </div>
            <Button variant="primary" onClick={() => notify("Đã lưu phân công phản biện")}>
              Lưu tất cả →
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="text-sm">Hội đồng đã tạo ({councils.length})</div>
            <Button variant="primary" onClick={() => onCreateCouncil?.()}>
              <span className="inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Tạo hội đồng mới
              </span>
            </Button>
          </div>
          {councils.length === 0 ? (
            <div className="px-4 py-16 text-center text-gray-500">
              <Users className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              Chưa có hội đồng nào. Nhấn "Tạo hội đồng mới" để bắt đầu.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 w-8"></th>
                  <th className="text-left px-4 py-3">STT</th>
                  <th className="text-left px-4 py-3">Tên hội đồng</th>
                  <th className="text-left px-4 py-3">Chủ tịch</th>
                  <th className="text-left px-4 py-3">Số TV</th>
                  <th className="text-left px-4 py-3">Số nhóm</th>
                  <th className="text-left px-4 py-3">Ngày giờ cụ thể</th>
                  <th className="text-left px-4 py-3">Trạng thái</th>
                  <th className="text-right px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {councils.map((c, i) => {
                  const isOpen = !!expanded[c.id];
                  const totalMembers = 2 + c.reviewers.length;
                  return (
                    <React.Fragment key={c.id}>
                      <tr className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setExpanded((e) => ({ ...e, [c.id]: !e[c.id] }))}
                            className="p-1 rounded hover:bg-gray-100"
                          >
                            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="px-4 py-3">{i + 1}</td>
                        <td className="px-4 py-3">{c.name}</td>
                        <td className="px-4 py-3">{teacherName(c.chair)}</td>
                        <td className="px-4 py-3">{totalMembers}</td>
                        <td className="px-4 py-3">{c.groups.length}</td>
                        <td className="px-4 py-3 text-gray-600">
                          <div>{c.date}</div>
                          <div className="text-xs text-gray-500">{c.time} • {c.room}</div>
                        </td>
                        <td className="px-4 py-3"><StatusPill status={c.status} /></td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => notify("Mở chỉnh sửa hội đồng")}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-[#2196F3] hover:bg-blue-50"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Chỉnh sửa
                            </button>
                            <button
                              onClick={() => setConfirmDelete(c.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-[#F44336] hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="bg-blue-50/40">
                          <td></td>
                          <td colSpan={8} className="px-4 py-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Thành viên hội đồng</div>
                                <div className="flex flex-wrap gap-1.5">
                                  <Tag role="Chủ tịch">{teacherName(c.chair)}</Tag>
                                  <Tag role="Thư ký">{teacherName(c.secretary)}</Tag>
                                  {c.reviewers.map((r) => (
                                    <Tag key={r} role="Phản biện">{teacherName(r)}</Tag>
                                  ))}
                                </div>
                                <div className="text-xs text-gray-500 mt-2">Phòng: {c.room} • {c.date} {c.time}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Nhóm bảo vệ ({c.groups.length})</div>
                                <ul className="text-xs space-y-0.5">
                                  {c.groups.map((gid) => {
                                    const g = groupsAvail.find((x) => x.id === gid);
                                    return g ? (
                                      <li key={gid}>
                                        <span className="text-[#2196F3]">{g.id}</span> — {g.name} <span className="text-gray-500">({g.members.join(", ")})</span>
                                      </li>
                                    ) : null;
                                  })}
                                </ul>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>
      )}

      <Modal
        open={open}
        title="Tạo hội đồng bảo vệ"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Hủy</Button>
            <Button
              variant="primary"
              onClick={create}
              disabled={!form.name || !form.chair || !form.secretary || conflicts.length > 0}
            >
              Tạo hội đồng
            </Button>
          </>
        }
      >
        {conflicts.length > 0 && (
          <div className="mb-4 p-3 rounded-md text-sm flex items-start gap-2" style={{ background: "#FEF3C7", border: "1px solid #F59E0B", color: "#92400E" }}>
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#D97706" }} />
            <div className="space-y-0.5">
              <div>Phát hiện xung đột GVHD - phản biện:</div>
              {conflicts.map((c, i) => (
                <div key={i} className="text-xs">
                  ⚠ {teacherName(c.reviewer)} là GVHD của {c.group} — không thể làm phản biện nhóm này
                </div>
              ))}
            </div>
          </div>
        )}

        <Field label="Tên hội đồng" required>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="VD: Hội đồng 2 - ĐATN HK2/2025-2026"
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-2 gap-x-5">
          <Field label="Đợt ĐATN">
            <select value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} className={inputCls}>
              <option>ĐATN HK2/2025-2026</option>
              <option>ĐATN HK1/2025-2026</option>
            </select>
          </Field>
          <Field label="Phòng"><input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="VD: A1.401" className={inputCls} /></Field>
          <Field label="Ngày bảo vệ"><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputCls} /></Field>
          <Field label="Giờ bắt đầu"><input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className={inputCls} /></Field>
        </div>

        <div className="grid grid-cols-2 gap-x-5">
          <Field label="Chủ tịch HĐ" required>
            <select value={form.chair} onChange={(e) => setForm({ ...form, chair: e.target.value })} className={inputCls}>
              <option value="">— Chọn —</option>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </Field>
          <Field label="Thư ký" required>
            <select value={form.secretary} onChange={(e) => setForm({ ...form, secretary: e.target.value })} className={inputCls}>
              <option value="">— Chọn —</option>
              {teachers.filter((t) => t.id !== form.chair).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Giảng viên phản biện" hint="Chọn nhiều GV; mỗi GV phản biện 1-3 nhóm">
          <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto space-y-1.5">
            {teachers
              .filter((t) => t.id !== form.chair && t.id !== form.secretary)
              .map((t) => {
                const isConflict = conflicts.some((c) => c.reviewer === t.id);
                return (
                  <label key={t.id} className={`flex items-center gap-2 text-sm cursor-pointer ${isConflict ? "text-yellow-700" : ""}`}>
                    <input
                      type="checkbox"
                      checked={form.reviewers.includes(t.id)}
                      onChange={() => toggleArr("reviewers", t.id)}
                      className="accent-[#2196F3]"
                    />
                    <span className="flex-1">{t.name}</span>
                    {isConflict && <AlertTriangle className="w-3.5 h-3.5 text-yellow-600" />}
                  </label>
                );
              })}
          </div>
        </Field>

        {(form.chair || form.secretary || form.reviewers.length > 0) && (
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-1.5">GV đã chọn</div>
            <div className="flex flex-wrap gap-1.5">
              {form.chair && <Tag role="Chủ tịch" onRemove={() => setForm({ ...form, chair: "" })}>{teacherName(form.chair)}</Tag>}
              {form.secretary && <Tag role="Thư ký" onRemove={() => setForm({ ...form, secretary: "" })}>{teacherName(form.secretary)}</Tag>}
              {form.reviewers.map((r) => (
                <Tag key={r} role="Phản biện" onRemove={() => toggleArr("reviewers", r)}>{teacherName(r)}</Tag>
              ))}
            </div>
          </div>
        )}

        <Field label="Nhóm bảo vệ">
          <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto space-y-1.5">
            {groupsAvail.map((g) => {
              const conflict = form.reviewers.includes(g.advisor) && form.groups.includes(g.id);
              return (
                <label key={g.id} className={`flex items-center gap-2 text-sm cursor-pointer ${conflict ? "text-yellow-700" : ""}`}>
                  <input
                    type="checkbox"
                    checked={form.groups.includes(g.id)}
                    onChange={() => toggleArr("groups", g.id)}
                    className="accent-[#2196F3]"
                  />
                  <span className="text-[#2196F3] text-xs">{g.id}</span>
                  <span className="flex-1">{g.name}</span>
                  {conflict && <span className="text-xs">⚠ GVHD trùng phản biện</span>}
                </label>
              );
            })}
          </div>
        </Field>
      </Modal>

      <Modal
        open={!!confirmDelete}
        title="Xác nhận xóa"
        onClose={() => setConfirmDelete(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Hủy</Button>
            <Button variant="danger" onClick={() => confirmDelete && deleteCouncil(confirmDelete)}>Xóa</Button>
          </>
        }
      >
        <div className="text-sm text-gray-700">
          Bạn có chắc muốn xóa hội đồng <span className="text-[#2196F3]">{confirmDelete}</span>? Hành động này không thể hoàn tác.
        </div>
      </Modal>

      {toast && (
        <div className="fixed top-20 right-6 bg-[#4CAF50] text-white px-4 py-3 rounded-md shadow-lg text-sm z-50">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: CouncilStatus }) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-gray-100 text-gray-600">
        <Clock className="w-3 h-3" /> Chưa bảo vệ
      </span>
    );
  }
  if (status === "ongoing") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-[#DBEAFE] text-[#1D4ED8]">
        <PlayCircle className="w-3 h-3" /> Đang bảo vệ
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-[#D1FAE5] text-[#065F46]">
      <CheckCircle2 className="w-3 h-3" /> Hoàn thành
    </span>
  );
}

function Tag({ role, children, onRemove }: { role: "Chủ tịch" | "Thư ký" | "Phản biện"; children: React.ReactNode; onRemove?: () => void }) {
  const colors: Record<string, string> = {
    "Chủ tịch": "bg-purple-50 text-purple-700 border-purple-200",
    "Thư ký": "bg-blue-50 text-[#1D4ED8] border-blue-200",
    "Phản biện": "bg-orange-50 text-[#C2410C] border-orange-200",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs ${colors[role]}`}>
      <span className="opacity-75">[{role}]</span>
      {children}
      {onRemove && (
        <button onClick={onRemove} className="hover:opacity-70">
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
