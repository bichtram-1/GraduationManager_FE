import { useState } from "react";
import { Button, Card, Modal, PageHeader, inputCls, Badge } from "./common";
import { Search, ArrowRight, Hand, ListChecks, CheckCircle2, UserCheck, ChevronRight, Download, X, Pencil, Megaphone } from "lucide-react";

type SV = { id: string; name: string; class: string; cohort: string };
type GV = { id: string; name: string; title: string; specialty: string; taken: number; max: number };

const studentsPool: SV[] = [
  { id: "20520001", name: "Nguyễn Văn A", class: "KTPM2020", cohort: "K2020" },
  { id: "20520005", name: "Hoàng Văn E", class: "CNPM2020", cohort: "K2020" },
  { id: "20520008", name: "Lê Văn H", class: "HTTT2020", cohort: "K2020" },
  { id: "20520012", name: "Trương Thị J", class: "KTPM2020", cohort: "K2020" },
  { id: "20520015", name: "Đỗ Thị M", class: "CNPM2020", cohort: "K2020" },
  { id: "20520018", name: "Bùi Văn N", class: "KTPM2020", cohort: "K2020" },
];

const teachersPool: GV[] = [
  { id: "GV01", name: "Nguyễn Văn X", title: "TS.", specialty: "Công nghệ phần mềm", taken: 3, max: 5 },
  { id: "GV02", name: "Trần Văn Y", title: "TS.", specialty: "Trí tuệ nhân tạo", taken: 5, max: 5 },
  { id: "GV03", name: "Lê Thị Z", title: "ThS.", specialty: "Hệ thống thông tin", taken: 2, max: 4 },
  { id: "GV04", name: "Phạm Văn K", title: "TS.", specialty: "An ninh mạng", taken: 4, max: 6 },
  { id: "GV05", name: "Vũ Thị L", title: "ThS.", specialty: "Khoa học dữ liệu", taken: 1, max: 4 },
];

type Assignment = { svId: string; svName: string; class: string; gvId: string; gvName: string; date: string };

const initialAssignments: Assignment[] = [
  { svId: "20520002", svName: "Trần Thị B", class: "KTPM2020", gvId: "GV01", gvName: "TS. Nguyễn Văn X", date: "10/04/2026" },
  { svId: "20520007", svName: "Đỗ Văn G", class: "CNPM2020", gvId: "GV03", gvName: "ThS. Lê Thị Z", date: "11/04/2026" },
];

export function AdminAssign() {
  const [tab, setTab] = useState<"manual" | "list">("manual");
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [pool, setPool] = useState<SV[]>(studentsPool);
  const [teachers, setTeachers] = useState<GV[]>(teachersPool);
  const [published, setPublished] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000); };

  const onAssign = (svIds: string[], gvId: string) => {
    const gv = teachers.find((t) => t.id === gvId)!;
    const newAssignments = svIds.map((id) => {
      const s = pool.find((x) => x.id === id)!;
      return {
        svId: s.id,
        svName: s.name,
        class: s.class,
        gvId,
        gvName: `${gv.title} ${gv.name}`,
        date: new Date().toLocaleDateString("vi-VN"),
      };
    });
    setAssignments((a) => [...a, ...newAssignments]);
    setPool((p) => p.filter((s) => !svIds.includes(s.id)));
    setTeachers((ts) => ts.map((t) => (t.id === gvId ? { ...t, taken: t.taken + svIds.length } : t)));
    notify(`Đã phân công ${svIds.length} sinh viên cho ${gv.title} ${gv.name}`);
  };

  const onUnassign = (svId: string) => {
    const a = assignments.find((x) => x.svId === svId);
    if (!a) return;
    setAssignments((arr) => arr.filter((x) => x.svId !== svId));
    setTeachers((ts) => ts.map((t) => (t.id === a.gvId ? { ...t, taken: Math.max(0, t.taken - 1) } : t)));
    setPool((p) => [...p, { id: a.svId, name: a.svName, class: a.class, cohort: "K2020" }]);
    notify(`Đã hủy phân công ${a.svName}`);
  };

  const onChangeGv = (svId: string, newGvId: string) => {
    const a = assignments.find((x) => x.svId === svId);
    const newGv = teachers.find((t) => t.id === newGvId);
    if (!a || !newGv) return;
    setTeachers((ts) =>
      ts.map((t) => {
        if (t.id === a.gvId) return { ...t, taken: Math.max(0, t.taken - 1) };
        if (t.id === newGvId) return { ...t, taken: t.taken + 1 };
        return t;
      })
    );
    setAssignments((arr) =>
      arr.map((x) => (x.svId === svId ? { ...x, gvId: newGvId, gvName: `${newGv.title} ${newGv.name}` } : x))
    );
    notify(`Đã đổi GVHD cho ${a.svName}`);
  };

  return (
    <div>
      <PageHeader
        title="Phân công hướng dẫn"
        description="Phân công GV hướng dẫn cho sinh viên thực tập (TTTN)"
      />

      <div className="flex gap-2 mb-5 border-b border-gray-200">
        {[
          { k: "manual", l: "Phân công thủ công", icon: Hand },
          { k: "list", l: "Danh sách đã phân công", icon: ListChecks },
        ].map((t) => {
          const Icon = t.icon as any;
          const active = tab === t.k;
          return (
            <button
              key={t.k}
              onClick={() => setTab(t.k as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 -mb-px transition ${
                active ? "border-[#2196F3] text-[#2196F3]" : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.l}
              {t.k === "list" && <span className="inline-flex items-center px-1.5 rounded-full bg-gray-100 text-gray-600 text-[10px]">{assignments.length}</span>}
            </button>
          );
        })}
      </div>

      {tab === "manual" ? (
        <ManualAssign pool={pool} teachers={teachers} onAssign={onAssign} />
      ) : (
        <AssignedList assignments={assignments} teachers={teachers} onChange={onChangeGv} onRemove={onUnassign} onNotify={notify} />
      )}

      {toast && (
        <div className="fixed top-20 right-6 bg-[#4CAF50] text-white px-4 py-3 rounded-md shadow-lg text-sm z-50">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "Chọn sinh viên" },
    { n: 2, label: "Chọn giảng viên" },
    { n: 3, label: "Xác nhận" },
  ];
  return (
    <div className="flex items-center gap-2 mb-5 bg-white border border-gray-200 rounded-lg p-3">
      {steps.map((s, i) => {
        const active = step === s.n;
        const done = step > s.n;
        return (
          <div key={s.n} className="flex items-center gap-2 flex-1">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm flex-1 ${
                active
                  ? "bg-[#2563EB] text-white"
                  : done
                  ? "bg-blue-50 text-[#2563EB]"
                  : "bg-gray-50 text-gray-400"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  active ? "bg-white/20" : done ? "bg-[#2563EB] text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {done ? <CheckCircle2 className="w-4 h-4" /> : s.n}
              </span>
              <span>{s.label}</span>
            </div>
            {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300" />}
          </div>
        );
      })}
    </div>
  );
}

function ManualAssign({
  pool,
  teachers,
  onAssign,
}: {
  pool: SV[];
  teachers: GV[];
  onAssign: (svIds: string[], gvId: string) => void;
}) {
  const [sQuery, setSQuery] = useState("");
  const [classFilter, setClassFilter] = useState("Tất cả");
  const [tQuery, setTQuery] = useState("");
  const [selectedSv, setSelectedSv] = useState<Record<string, boolean>>({});
  const [selectedGv, setSelectedGv] = useState<string | null>(null);

  const filteredSv = pool.filter(
    (s) =>
      (classFilter === "Tất cả" || s.class === classFilter) &&
      (!sQuery || s.id.toLowerCase().includes(sQuery.toLowerCase()) || s.name.toLowerCase().includes(sQuery.toLowerCase()))
  );
  const filteredGv = teachers.filter((g) => !tQuery || g.name.toLowerCase().includes(tQuery.toLowerCase()));
  const svIds = Object.keys(selectedSv).filter((k) => selectedSv[k]);
  const svCount = svIds.length;
  const canAssign = svCount > 0 && !!selectedGv;
  const gvObj = teachers.find((t) => t.id === selectedGv);
  const remainingSlots = gvObj ? gvObj.max - gvObj.taken : 0;

  const step: 1 | 2 | 3 = svCount === 0 ? 1 : !selectedGv ? 2 : 3;

  const allChecked = filteredSv.length > 0 && filteredSv.every((s) => selectedSv[s.id]);
  const toggleAll = () => {
    if (allChecked) setSelectedSv({});
    else setSelectedSv(Object.fromEntries(filteredSv.map((s) => [s.id, true])));
  };

  const handleAssign = () => {
    if (!selectedGv) return;
    onAssign(svIds, selectedGv);
    setSelectedSv({});
    setSelectedGv(null);
  };

  return (
    <>
      <StepIndicator step={step} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-24">
        {/* SV PANEL */}
        <Card>
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm">
                <span className="text-[#2563EB]">Bước 1:</span> Chọn sinh viên cần phân công
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-[#1D4ED8] text-xs">
                {pool.length} chưa có GVHD
              </span>
            </div>
            <div className="flex gap-2 mt-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={sQuery}
                  onChange={(e) => setSQuery(e.target.value)}
                  placeholder="MSSV / họ tên..."
                  className="pl-9 pr-3 py-2 w-full rounded-md border border-gray-200 bg-white text-sm outline-none focus:border-[#2196F3]"
                />
              </div>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className={`${inputCls} w-36`}
              >
                <option>Tất cả</option>
                <option>KTPM2020</option>
                <option>CNPM2020</option>
                <option>HTTT2020</option>
              </select>
            </div>
          </div>

          {pool.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-green-50 flex items-center justify-center">
                <UserCheck className="w-7 h-7 text-[#4CAF50]" />
              </div>
              <div className="text-sm text-gray-700">Tất cả sinh viên đã có GVHD trong đợt này</div>
              <div className="text-xs text-gray-500 mt-1">
                Bạn có thể điều chỉnh phân công trong tab "Danh sách đã phân công"
              </div>
            </div>
          ) : filteredSv.length === 0 ? (
            <div className="px-4 py-12 text-center text-gray-500 text-sm">Không có sinh viên khớp điều kiện</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-3 w-8">
                    <input type="checkbox" checked={allChecked} onChange={toggleAll} className="accent-[#2563EB]" />
                  </th>
                  <th className="text-left px-3 py-3">
                    <button onClick={toggleAll} className="text-xs text-[#2563EB] hover:underline">
                      {allChecked ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                    </button>
                  </th>
                  <th className="text-left px-3 py-3">Họ tên</th>
                  <th className="text-left px-3 py-3">Lớp</th>
                  <th className="text-left px-3 py-3">Khóa</th>
                </tr>
              </thead>
              <tbody>
                {filteredSv.map((s) => {
                  const checked = !!selectedSv[s.id];
                  return (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedSv((p) => ({ ...p, [s.id]: !p[s.id] }))}
                      className={`border-t border-gray-100 cursor-pointer transition ${
                        checked ? "bg-[#EFF6FF] border-l-[3px] border-l-[#2563EB]" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => setSelectedSv((p) => ({ ...p, [s.id]: !p[s.id] }))}
                          onClick={(e) => e.stopPropagation()}
                          className="accent-[#2563EB]"
                        />
                      </td>
                      <td className="px-3 py-2 text-[#2563EB]">{s.id}</td>
                      <td className="px-3 py-2">{s.name}</td>
                      <td className="px-3 py-2 text-gray-600">{s.class}</td>
                      <td className="px-3 py-2 text-gray-600">{s.cohort}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <div
            className={`px-4 py-3 border-t border-gray-200 text-xs ${
              svCount > 0 ? "text-[#1D4ED8]" : "text-gray-500"
            }`}
          >
            Đã chọn <strong>{svCount}</strong> / {pool.length} sinh viên
          </div>
        </Card>

        {/* GV PANEL */}
        <Card>
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="text-sm mb-2">
              <span className="text-[#2563EB]">Bước 2:</span> Chọn giảng viên hướng dẫn
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={tQuery}
                onChange={(e) => setTQuery(e.target.value)}
                placeholder="Tìm tên GV..."
                className="pl-9 pr-3 py-2 w-full rounded-md border border-gray-200 bg-white text-sm outline-none focus:border-[#2196F3]"
              />
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-3 w-8"></th>
                <th className="text-left px-3 py-3">Họ tên</th>
                <th className="text-left px-3 py-3">Học vị</th>
                <th className="text-left px-3 py-3">Chuyên môn</th>
                <th className="text-left px-3 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredGv.map((g) => {
                const full = g.taken >= g.max;
                const isActive = selectedGv === g.id;
                return (
                  <tr
                    key={g.id}
                    onClick={() => !full && setSelectedGv(g.id)}
                    className={`border-t border-gray-100 transition ${
                      full
                        ? "opacity-50 cursor-not-allowed"
                        : isActive
                        ? "bg-[#EFF6FF] border-l-[3px] border-l-[#2563EB] cursor-pointer"
                        : "cursor-pointer hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-3 py-2">
                      {isActive ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                      ) : (
                        <span className="block w-4 h-4 rounded-full border-2 border-gray-300" />
                      )}
                    </td>
                    <td className="px-3 py-2">{g.name}</td>
                    <td className="px-3 py-2 text-gray-600">{g.title}</td>
                    <td className="px-3 py-2 text-gray-600">{g.specialty}</td>
                    <td className="px-3 py-2">
                      {full ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-[#FEE2E2] text-[#991B1B]">
                          Đầy
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-[#D1FAE5] text-[#065F46]">
                          Còn chỗ
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>

      {/* FLOATING ACTION BAR */}
      {(svCount > 0 || selectedGv) && (
        <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 shadow-lg px-6 py-4 z-40">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-gray-600 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-[#1D4ED8]">
                <CheckCircle2 className="w-4 h-4" />
                Đã chọn: <strong>{svCount}</strong> SV
              </span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              {gvObj ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-[#065F46]">
                  GV: <strong>{gvObj.title} {gvObj.name}</strong>
                  <span className="text-xs opacity-75">(còn {remainingSlots} chỗ)</span>
                </span>
              ) : (
                <span className="text-gray-500 italic">Chưa chọn giảng viên</span>
              )}
            </div>
            <Button
              variant="primary"
              disabled={!canAssign}
              onClick={handleAssign}
              className={!canAssign ? "" : ""}
            >
              <span
                className="inline-flex items-center gap-2"
                title={!canAssign ? "Vui lòng chọn sinh viên và giảng viên" : ""}
              >
                Phân công ngay
                <ArrowRight className="w-4 h-4" />
              </span>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function AssignedList({
  assignments,
  teachers,
  onChange,
  onRemove,
  onNotify,
}: {
  assignments: Assignment[];
  teachers: GV[];
  onChange: (svId: string, gvId: string) => void;
  onRemove: (svId: string) => void;
  onNotify: (m: string) => void;
}) {
  const [gvFilter, setGvFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [published, setPublished] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [includeDocs, setIncludeDocs] = useState(false);

  const filtered = assignments.filter(
    (a) =>
      (!gvFilter || a.gvId === gvFilter) &&
      (!classFilter || a.class === classFilter) &&
      (!query || a.svId.includes(query) || a.svName.toLowerCase().includes(query.toLowerCase()))
  );

  const teacherCount = new Set(assignments.map((a) => a.gvId)).size;

  return (
    <Card>
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-end gap-2 mb-3">
          <Button variant="secondary" onClick={() => onNotify("Đã xuất file phan_cong.xlsx")}>
            <span className="inline-flex items-center gap-2">
              <Download className="w-4 h-4" />
              Xuất Excel
            </span>
          </Button>
          {published ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#D1FAE5] text-[#065F46] text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Đã công bố
            </span>
          ) : (
            <Button variant="primary" onClick={() => setConfirm(true)} disabled={assignments.length === 0}>
              <span className="inline-flex items-center gap-2">
                <Megaphone className="w-4 h-4" />
                Công bố phân công
              </span>
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className={`${inputCls} w-48`}>
            <option value="">Tất cả lớp</option>
            <option value="KTPM2020">KTPM2020</option>
            <option value="CNPM2020">CNPM2020</option>
            <option value="HTTT2020">HTTT2020</option>
          </select>
          <select value={gvFilter} onChange={(e) => setGvFilter(e.target.value)} className={`${inputCls} w-48`}>
            <option value="">Tất cả GV</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.title} {t.name}</option>
            ))}
          </select>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="MSSV / tên SV..."
              className="pl-9 pr-3 py-2 w-56 rounded-md border border-gray-200 bg-white text-sm outline-none focus:border-[#2196F3]"
            />
          </div>
        </div>
      </div>

      <Modal
        open={confirm}
        title="Công bố kết quả phân công?"
        onClose={() => setConfirm(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(false)}>Hủy</Button>
            <Button variant="primary" onClick={() => { setPublished(true); setConfirm(false); onNotify("Đã công bố phân công và gửi thông báo"); }}>
              Công bố ngay →
            </Button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-2">
            <Megaphone className="w-6 h-6 text-[#2563EB]" />
          </div>
        </div>
        <div className="text-sm text-gray-700 mb-2">Hệ thống sẽ gửi thông báo tự động đến:</div>
        <ul className="text-sm text-gray-700 space-y-1 mb-3 pl-2">
          <li>• <strong>{assignments.length}</strong> sinh viên — thông báo tên GVHD</li>
          <li>• <strong>{teacherCount}</strong> giảng viên — thông báo danh sách SV hướng dẫn</li>
        </ul>
        <div className="text-xs text-gray-500 mb-3">
          Sau khi công bố, sinh viên và giảng viên có thể xem và tải tài liệu đợt.
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={includeDocs} onChange={(e) => setIncludeDocs(e.target.checked)} className="accent-[#2563EB]" />
          Gửi kèm link tài liệu đợt trong thông báo
        </label>
      </Modal>

      {filtered.length === 0 ? (
        <div className="px-4 py-16 text-center text-gray-500 text-sm">Chưa có dữ liệu phân công</div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">MSSV</th>
              <th className="text-left px-4 py-3">Họ tên</th>
              <th className="text-left px-4 py-3">Lớp</th>
              <th className="text-left px-4 py-3">GVHD</th>
              <th className="text-left px-4 py-3">Ngày phân</th>
              <th className="text-right px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.svId} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-[#2563EB]">{a.svId}</td>
                <td className="px-4 py-3">{a.svName}</td>
                <td className="px-4 py-3 text-gray-600">{a.class}</td>
                <td className="px-4 py-3">
                  {editing === a.svId ? (
                    <select
                      autoFocus
                      defaultValue={a.gvId}
                      onBlur={() => setEditing(null)}
                      onChange={(e) => { onChange(a.svId, e.target.value); setEditing(null); }}
                      className={`${inputCls} w-56`}
                    >
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id} disabled={t.id !== a.gvId && t.taken >= t.max}>
                          {t.title} {t.name} ({t.taken}/{t.max})
                        </option>
                      ))}
                    </select>
                  ) : (
                    a.gvName
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">{a.date}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-1">
                    <button
                      onClick={() => setEditing(a.svId)}
                      title="Đổi GVHD"
                      className="p-1.5 rounded hover:bg-blue-50 text-[#2563EB]"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRemove(a.svId)}
                      title="Hủy phân công"
                      className="p-1.5 rounded hover:bg-red-50 text-[#F44336]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
