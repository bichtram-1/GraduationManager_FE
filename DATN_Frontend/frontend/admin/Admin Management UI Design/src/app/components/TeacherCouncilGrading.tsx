import { useState } from "react";
import { Card, PageHeader, Badge, Button, inputCls } from "./common";
import { Save, Lock, CheckCircle2 } from "lucide-react";

// Vai trò hội đồng
type CouncilRole = "chair" | "secretary" | "reviewer1" | "reviewer2" | "member";

type CouncilMember = {
  role: CouncilRole;
  roleLabel: string;
  teacherId: string;
  teacherName: string;
  score: string;
  isCurrentUser: boolean;
};

type DefenseGroup = {
  groupCode: string;
  topic: string;
  students: string[];
  members: CouncilMember[];
};

// Giả định giảng viên đang đăng nhập là GV03 với vai trò Phản biện 1
const CURRENT_TEACHER_ID = "GV03";
const CURRENT_TEACHER_ROLE: CouncilRole = "reviewer1";

export function TeacherCouncilGrading() {
  const [groups, setGroups] = useState<DefenseGroup[]>([
    {
      groupCode: "G01",
      topic: "DT001 - Xây dựng hệ thống quản lý thư viện điện tử",
      students: ["Nguyễn Văn A - 20520001", "Trần Thị B - 20520002"],
      members: [
        { role: "chair", roleLabel: "Chủ tịch HĐ", teacherId: "GV01", teacherName: "PGS. Đặng Hữu M", score: "8.5", isCurrentUser: false },
        { role: "secretary", roleLabel: "Thư ký", teacherId: "GV02", teacherName: "TS. Nguyễn Văn X", score: "8.0", isCurrentUser: false },
        { role: "reviewer1", roleLabel: "Phản biện 1", teacherId: "GV03", teacherName: "ThS. Lê Thị Z", score: "", isCurrentUser: true },
        { role: "reviewer2", roleLabel: "Phản biện 2", teacherId: "GV04", teacherName: "TS. Phạm Văn K", score: "7.5", isCurrentUser: false },
        { role: "member", roleLabel: "Ủy viên", teacherId: "GV05", teacherName: "ThS. Vũ Thị L", score: "8.2", isCurrentUser: false },
      ]
    },
    {
      groupCode: "G02",
      topic: "DT002 - Ứng dụng AI nhận diện hình ảnh",
      students: ["Phạm Văn C - 20520003", "Lê Thị D - 20520004", "Hoàng Văn E - 20520005"],
      members: [
        { role: "chair", roleLabel: "Chủ tịch HĐ", teacherId: "GV01", teacherName: "PGS. Đặng Hữu M", score: "", isCurrentUser: false },
        { role: "secretary", roleLabel: "Thư ký", teacherId: "GV02", teacherName: "TS. Nguyễn Văn X", score: "", isCurrentUser: false },
        { role: "reviewer1", roleLabel: "Phản biện 1", teacherId: "GV03", teacherName: "ThS. Lê Thị Z", score: "", isCurrentUser: true },
        { role: "reviewer2", roleLabel: "Phản biện 2", teacherId: "GV04", teacherName: "TS. Phạm Văn K", score: "", isCurrentUser: false },
        { role: "member", roleLabel: "Ủy viên", teacherId: "GV05", teacherName: "ThS. Vũ Thị L", score: "", isCurrentUser: false },
      ]
    },
  ]);

  const [toast, setToast] = useState<string | null>(null);
  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000); };

  const updateScore = (groupIndex: number, memberRole: CouncilRole, value: string) => {
    // Chỉ cho phép sửa nếu là người dùng hiện tại
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;

    setGroups(groups.map((g, gi) => {
      if (gi !== groupIndex) return g;
      return {
        ...g,
        members: g.members.map(m =>
          m.role === memberRole && m.isCurrentUser
            ? { ...m, score: value }
            : m
        )
      };
    }));
  };

  const isValid = (v: string) => {
    if (v === "") return false;
    const n = parseFloat(v);
    return !isNaN(n) && n >= 0 && n <= 10;
  };

  const calculateAverage = (members: CouncilMember[]) => {
    const validScores = members.filter(m => isValid(m.score));
    if (validScores.length === 0) return "—";
    const sum = validScores.reduce((acc, m) => acc + parseFloat(m.score), 0);
    return (sum / validScores.length).toFixed(2);
  };

  const hasEditableScores = groups.some(g =>
    g.members.some(m => m.isCurrentUser && isValid(m.score))
  );

  const save = () => {
    notify("Đã lưu điểm chấm hội đồng");
  };

  return (
    <div>
      <PageHeader
        title="Chấm điểm Hội đồng bảo vệ ĐATN"
        description="Nhập điểm bảo vệ cho các nhóm đồ án. Bạn chỉ có thể nhập điểm cho vai trò của mình."
        actions={
          <Button variant="primary" disabled={!hasEditableScores} onClick={save}>
            <span className="inline-flex items-center gap-2">
              <Save className="w-4 h-4" />
              Lưu điểm
            </span>
          </Button>
        }
      />

      <Card className="mb-5 p-5 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#2196F3] text-white flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900 mb-1">
              Vai trò của bạn: <span className="text-[#2196F3]">Phản biện 1</span>
            </div>
            <div className="text-xs text-gray-600">
              Bạn chỉ có thể nhập điểm cho dòng "Phản biện 1". Các dòng khác được khóa để bảo mật.
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        {groups.map((group, groupIndex) => (
          <Card key={group.groupCode}>
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge type="info">{group.groupCode}</Badge>
                    <span className="text-sm font-medium">{group.topic}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    Sinh viên: {group.students.join(", ")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Điểm trung bình HĐ</div>
                  <div className="text-xl font-medium text-[#4CAF50]">{calculateAverage(group.members)}</div>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="text-sm font-medium mb-3">Ma trận chấm điểm Hội đồng</div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3 w-48">Chức danh</th>
                    <th className="text-left px-4 py-3">Giảng viên</th>
                    <th className="text-left px-4 py-3 w-64">Điểm chấm (0-10)</th>
                    <th className="text-left px-4 py-3 w-28">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {group.members.map((member) => {
                    const scoreOk = member.score === "" || isValid(member.score);
                    const isEditable = member.isCurrentUser;

                    return (
                      <tr
                        key={member.role}
                        className={`border-t border-gray-100 ${
                          isEditable
                            ? "bg-green-50/50"
                            : "bg-gray-50/50 opacity-60"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {!isEditable && <Lock className="w-3.5 h-3.5 text-gray-400" />}
                            <span className={isEditable ? "font-medium text-[#2196F3]" : "text-gray-600"}>
                              {member.roleLabel}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          {member.teacherName}
                        </td>
                        <td className="px-4 py-3">
                          {isEditable ? (
                            <div className="relative">
                              <input
                                value={member.score}
                                onChange={(e) => updateScore(groupIndex, member.role, e.target.value)}
                                placeholder="0.0 - 10.0"
                                className={`${inputCls} w-32 ${!scoreOk ? "border-[#F44336]" : "border-[#2196F3]"}`}
                              />
                              <div className="absolute -top-5 left-0 text-[10px] text-[#2196F3] font-medium">
                                Điểm chấm của bạn ↓
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className={`${isValid(member.score) ? "text-gray-900" : "text-gray-400"}`}>
                                {isValid(member.score) ? member.score : "—"}
                              </span>
                              {!isEditable && (
                                <Lock className="w-3 h-3 text-gray-400" title="Chỉ xem, không chỉnh sửa" />
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isEditable ? (
                            <Badge type={isValid(member.score) ? "success" : "warning"}>
                              {isValid(member.score) ? "Đã nhập" : "Chưa nhập"}
                            </Badge>
                          ) : (
                            <Badge type={isValid(member.score) ? "success" : "disabled"}>
                              {isValid(member.score) ? "Đã nhập" : "Chưa nhập"}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>

      {toast && (
        <div className="fixed top-20 right-6 bg-[#4CAF50] text-white px-4 py-3 rounded-md shadow-lg text-sm z-50">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
