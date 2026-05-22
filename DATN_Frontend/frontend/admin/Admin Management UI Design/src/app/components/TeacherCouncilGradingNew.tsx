import { useState } from "react";
import { Card, Badge, Button, PageHeader, inputCls } from "./common";
import { ArrowLeft, Users, Calendar, MapPin, Award, CheckCircle2, Clock } from "lucide-react";

type Role = "Chủ tịch" | "Thư ký" | "Ủy viên" | "GVHD" | "GVPB";

type Student = {
  id: string;
  name: string;
  chairScore?: string;
  secretaryScore?: string;
  memberScore?: string;
  advisorScore?: string;
  reviewerScore?: string;
};

type DefenseGroup = {
  groupCode: string;
  topicCode: string;
  topicName: string;
  advisor: string;
  members: Student[];
};

type Council = {
  id: string;
  name: string;
  batch: string;
  date: string;
  room: string;
  myRole: Role;
  groups: DefenseGroup[];
};

const councils: Council[] = [
  {
    id: "HD01",
    name: "Hội đồng 1 - ĐATN HK2/2025-2026",
    batch: "Đợt ĐATN HK2/2025-2026",
    date: "20/06/2026 • 08:00",
    room: "Phòng A.102",
    myRole: "Ủy viên",
    groups: [
      {
        groupCode: "G01",
        topicCode: "DT001",
        topicName: "Hệ thống IoT giám sát nông nghiệp",
        advisor: "TS. Nguyễn Văn X",
        members: [
          { id: "20520001", name: "Nguyễn Văn A" },
          { id: "20520002", name: "Trần Thị B" },
        ],
      },
      {
        groupCode: "G02",
        topicCode: "DT002",
        topicName: "Ứng dụng AI nhận diện hình ảnh",
        advisor: "TS. Trần Văn Y",
        members: [
          { id: "20520003", name: "Phạm Văn C" },
        ],
      },
    ],
  },
  {
    id: "HD02",
    name: "Hội đồng 2 - ĐATN HK2/2025-2026",
    batch: "Đợt ĐATN HK2/2025-2026",
    date: "22/06/2026 • 13:00",
    room: "Phòng B.201",
    myRole: "GVPB",
    groups: [
      {
        groupCode: "G05",
        topicCode: "DT005",
        topicName: "Hệ thống quản lý bán hàng trực tuyến",
        advisor: "TS. Lê Thị Z",
        members: [
          { id: "20520010", name: "Võ Văn K" },
          { id: "20520011", name: "Ngô Thị L" },
        ],
      },
    ],
  },
];

export function TeacherCouncilGradingNew() {
  const [selectedCouncil, setSelectedCouncil] = useState<Council | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<DefenseGroup | null>(null);
  const [scores, setScores] = useState<Student[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [gradedGroups, setGradedGroups] = useState<Set<string>>(new Set(["HD01-G01"]));

  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000); };

  const groupKey = (councilId: string, groupCode: string) => `${councilId}-${groupCode}`;
  const isGraded = (councilId: string, groupCode: string) => gradedGroups.has(groupKey(councilId, groupCode));
  const councilDoneCount = (council: Council) => council.groups.filter(g => isGraded(council.id, g.groupCode)).length;
  const councilAllDone = (council: Council) => councilDoneCount(council) === council.groups.length;

  const handleGradeGroup = (council: Council, group: DefenseGroup) => {
    setSelectedCouncil(council);
    setSelectedGroup(group);
    setScores(group.members.map(m => ({ ...m })));
  };

  const handleBack = () => {
    setSelectedCouncil(null);
    setSelectedGroup(null);
    setScores([]);
  };

  const updateScore = (studentId: string, field: keyof Student, value: string) => {
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    setScores(scores.map(s => s.id === studentId ? { ...s, [field]: value } : s));
  };

  const isValid = (v: string | undefined) => {
    if (!v || v === "") return false;
    const n = parseFloat(v);
    return !isNaN(n) && n >= 0 && n <= 10;
  };

  const handleSave = () => {
    if (selectedCouncil && selectedGroup) {
      setGradedGroups(prev => new Set(prev).add(groupKey(selectedCouncil.id, selectedGroup.groupCode)));
    }
    notify("Đã lưu điểm chấm hội đồng");
    setTimeout(() => handleBack(), 1500);
  };

  const roleMap: Record<Role, string> = {
    "Chủ tịch": "success",
    "Thư ký": "info",
    "Ủy viên": "warning",
    "GVHD": "info",
    "GVPB": "warning",
  };

  if (selectedCouncil && selectedGroup) {
    const canEditChair = selectedCouncil.myRole === "Chủ tịch";
    const canEditSecretary = selectedCouncil.myRole === "Thư ký";
    const canEditMember = selectedCouncil.myRole === "Ủy viên";
    const canEditAdvisor = selectedCouncil.myRole === "GVHD";
    const canEditReviewer = selectedCouncil.myRole === "GVPB";

    return (
      <div>
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 rounded-md hover:bg-gray-100 transition"
            title="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-medium text-gray-900">Chấm điểm Nhóm {selectedGroup.groupCode}</h1>
            <p className="text-sm text-gray-600 mt-0.5">
              {selectedGroup.topicCode} - {selectedGroup.topicName}
            </p>
          </div>
        </div>

        <Card>
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{selectedCouncil.name}</div>
              <div className="text-xs text-gray-600 mt-0.5">
                Vai trò của bạn: <Badge type={roleMap[selectedCouncil.myRole]}>{selectedCouncil.myRole}</Badge>
              </div>
            </div>
            <div className="text-xs text-gray-600">
              Giảng viên hướng dẫn: {selectedGroup.advisor}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3">MSSV</th>
                  <th className="text-left px-4 py-3">Họ tên</th>
                  {canEditChair && <th className="text-left px-4 py-3 w-32">Điểm Chủ tịch</th>}
                  {canEditSecretary && <th className="text-left px-4 py-3 w-32">Điểm Thư ký</th>}
                  {canEditMember && <th className="text-left px-4 py-3 w-32">Điểm Ủy viên</th>}
                  {canEditAdvisor && <th className="text-left px-4 py-3 w-32">Điểm GVHD</th>}
                  {canEditReviewer && <th className="text-left px-4 py-3 w-32">Điểm GVPB</th>}
                </tr>
              </thead>
              <tbody>
                {scores.map((student) => (
                  <tr key={student.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-[#2196F3]">{student.id}</td>
                    <td className="px-4 py-3">{student.name}</td>
                    {canEditChair && (
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={student.chairScore ?? ""}
                          onChange={(e) => updateScore(student.id, "chairScore", e.target.value)}
                          placeholder="0.0 - 10.0"
                          className={`${inputCls} w-24 ${
                            student.chairScore && !isValid(student.chairScore) ? "border-[#F44336]" : ""
                          }`}
                        />
                      </td>
                    )}
                    {canEditSecretary && (
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={student.secretaryScore ?? ""}
                          onChange={(e) => updateScore(student.id, "secretaryScore", e.target.value)}
                          placeholder="0.0 - 10.0"
                          className={`${inputCls} w-24 ${
                            student.secretaryScore && !isValid(student.secretaryScore) ? "border-[#F44336]" : ""
                          }`}
                        />
                      </td>
                    )}
                    {canEditMember && (
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={student.memberScore ?? ""}
                          onChange={(e) => updateScore(student.id, "memberScore", e.target.value)}
                          placeholder="0.0 - 10.0"
                          className={`${inputCls} w-24 ${
                            student.memberScore && !isValid(student.memberScore) ? "border-[#F44336]" : ""
                          }`}
                        />
                      </td>
                    )}
                    {canEditAdvisor && (
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={student.advisorScore ?? ""}
                          onChange={(e) => updateScore(student.id, "advisorScore", e.target.value)}
                          placeholder="0.0 - 10.0"
                          className={`${inputCls} w-24 ${
                            student.advisorScore && !isValid(student.advisorScore) ? "border-[#F44336]" : ""
                          }`}
                        />
                      </td>
                    )}
                    {canEditReviewer && (
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={student.reviewerScore ?? ""}
                          onChange={(e) => updateScore(student.id, "reviewerScore", e.target.value)}
                          placeholder="0.0 - 10.0"
                          className={`${inputCls} w-24 ${
                            student.reviewerScore && !isValid(student.reviewerScore) ? "border-[#F44336]" : ""
                          }`}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={handleBack}>
            Hủy bỏ
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Lưu điểm
          </Button>
        </div>

        {toast && (
          <div className="fixed top-20 right-6 bg-[#4CAF50] text-white px-4 py-3 rounded-md shadow-lg text-sm z-50">
            ✓ {toast}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Chấm điểm Hội đồng ĐATN"
        description="Danh sách hội đồng bảo vệ và nhóm đồ án cần chấm điểm"
      />

      <div className="space-y-5">
        {councils.map((council) => {
          const doneCount = councilDoneCount(council);
          const allDone = councilAllDone(council);
          return (
          <Card key={council.id}>
            <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-gray-50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-base font-medium text-gray-900">{council.name}</div>
                    {allDone ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Hoàn thành
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        {doneCount}/{council.groups.length} nhóm đã chấm
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {council.date}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {council.room}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {council.groups.length} nhóm
                    </span>
                  </div>
                </div>
                <Badge type={roleMap[council.myRole]}>Vai trò: {council.myRole}</Badge>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3 w-24">Mã nhóm</th>
                    <th className="text-left px-4 py-3">Tên đề tài</th>
                    <th className="text-left px-4 py-3">Thành viên nhóm</th>
                    <th className="text-left px-4 py-3">GVHD</th>
                    <th className="text-left px-4 py-3 w-32">Trạng thái</th>
                    <th className="text-right px-4 py-3">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {council.groups.map((group) => {
                    const graded = isGraded(council.id, group.groupCode);
                    return (
                    <tr key={group.groupCode} className={`border-t border-gray-100 hover:bg-gray-50 ${graded ? "bg-green-50/40" : ""}`}>
                      <td className="px-4 py-3">
                        <Badge type="info">{group.groupCode}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[#2196F3] text-xs">{group.topicCode}</div>
                        <div>{group.topicName}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {group.members.map(m => `${m.id} - ${m.name}`).join(", ")}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{group.advisor}</td>
                      <td className="px-4 py-3">
                        {graded ? (
                          <span className="inline-flex items-center gap-1 text-green-700 text-xs">
                            <CheckCircle2 className="w-4 h-4" />
                            Đã chấm
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-orange-500 text-xs">
                            <Clock className="w-4 h-4" />
                            Chưa chấm
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant={graded ? "secondary" : "primary"}
                          className="text-xs"
                          onClick={() => handleGradeGroup(council, group)}
                        >
                          <span className="inline-flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" />
                            {graded ? "Chấm lại" : "Vào chấm điểm"}
                          </span>
                        </Button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          );
        })}
      </div>

      {toast && (
        <div className="fixed top-20 right-6 bg-[#4CAF50] text-white px-4 py-3 rounded-md shadow-lg text-sm z-50">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
