import { useState } from "react";
import { Card, Badge, Button, PageHeader, Modal, inputCls, Field } from "./common";
import { Eye, Github, Users, FileText, Star, MessageSquare, CheckCircle, X, Pencil, Search } from "lucide-react";

type DATNGroup = {
  groupCode: string;
  topicCode: string;
  topicName: string;
  members: { id: string; name: string }[];
  latestReport: string;
  reportStatus: string;
  reportDate: string;
  githubRepo: string;
  isReviewer?: boolean;
  isPending?: boolean;
  status?: string;
};

const datnGroups: DATNGroup[] = [
  {
    groupCode: "G01",
    topicCode: "DT001",
    topicName: "Xây dựng hệ thống quản lý thư viện điện tử",
    members: [
      { id: "20520004", name: "Nguyễn Văn D" },
      { id: "20520005", name: "Trần Thị E" },
    ],
    latestReport: "Bản thảo Chương 2",
    reportStatus: "Đã nộp",
    reportDate: "12/05/2026",
    githubRepo: "https://github.com/user/library-system",
    isReviewer: false,
    isPending: false
  },
  {
    groupCode: "G02",
    topicCode: "DT002",
    topicName: "Ứng dụng AI nhận diện hình ảnh",
    members: [
      { id: "20520006", name: "Lê Văn F" },
      { id: "20520007", name: "Phạm Thị G" },
      { id: "20520008", name: "Hoàng Văn H" },
    ],
    latestReport: "Bản thảo Chương 1",
    reportStatus: "Đang chấm điểm",
    reportDate: "10/05/2026",
    githubRepo: "https://github.com/user/ai-image-recognition",
    isReviewer: true,
    isPending: false
  },
  {
    groupCode: "G05",
    topicCode: "DT005",
    topicName: "Hệ thống quản lý bán hàng trực tuyến",
    members: [
      { id: "20520011", name: "Võ Văn K" },
      { id: "20520012", name: "Ngô Thị L" },
    ],
    latestReport: "Bản thảo Chương 3",
    reportStatus: "Đã nộp",
    reportDate: "15/05/2026",
    githubRepo: "https://github.com/user/ecommerce-system",
    isReviewer: false,
    isPending: false
  },
  {
    groupCode: "G10",
    topicCode: "DT010",
    topicName: "Ứng dụng chatbot hỗ trợ học tập",
    members: [
      { id: "20520020", name: "Đỗ Văn M" },
      { id: "20520021", name: "Mai Thị N" },
    ],
    latestReport: "—",
    reportStatus: "Chờ duyệt",
    reportDate: "—",
    githubRepo: "",
    isReviewer: false,
    isPending: true,
    status: "Chờ duyệt"
  },
  {
    groupCode: "G11",
    topicCode: "DT011",
    topicName: "Hệ thống quản lý tài sản trường học",
    members: [
      { id: "20520022", name: "Bùi Văn O" },
    ],
    latestReport: "—",
    reportStatus: "Đã duyệt",
    reportDate: "—",
    githubRepo: "",
    isReviewer: false,
    isPending: true,
    status: "Đã duyệt"
  },
];

export function TeacherStudentsDATN() {
  const [mode, setMode] = useState<"pending" | "reports">("pending");
  const [tab, setTab] = useState<"advisor" | "reviewer">("advisor");
  const [selectedGroup, setSelectedGroup] = useState<DATNGroup | null>(null);
  const [viewingReport, setViewingReport] = useState(false);
  const [viewingDetail, setViewingDetail] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [groupRating, setGroupRating] = useState("");
  const [reviewerRating, setReviewerRating] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000); };

  const statusMap: any = {
    "Đã nộp": "success",
    "Đang chấm điểm": "warning",
    "Trễ hạn": "danger",
    "Chờ duyệt": "warning",
    "Đã duyệt": "success",
    "Từ chối": "danger"
  };

  const submitFeedback = () => {
    notify(`Đã lưu nhận xét cho nhóm ${selectedGroup?.groupCode}`);
    setFeedback("");
    setViewingReport(false);
    setSelectedGroup(null);
  };

  const submitGroupRating = () => {
    notify(`Đã lưu đánh giá nhóm ${selectedGroup?.groupCode}`);
    setGroupRating("");
    setSelectedGroup(null);
  };

  const submitReviewerRating = () => {
    notify(`Đã lưu đánh giá phản biện cho nhóm ${selectedGroup?.groupCode}`);
    setReviewerRating("");
    setSelectedGroup(null);
  };

  const pendingGroups = datnGroups
    .filter(g => g.isPending && !g.isReviewer)
    .filter(g => statusFilter === "all" || g.status === statusFilter);
  const filteredGroups = tab === "advisor"
    ? datnGroups.filter(g => !g.isReviewer && !g.isPending)
    : datnGroups.filter(g => g.isReviewer && !g.isPending);

  const approveGroup = (groupCode: string) => {
    notify(`Đã phê duyệt nhóm ${groupCode}`);
  };

  const rejectGroup = (groupCode: string) => {
    notify(`Đã từ chối đăng ký nhóm ${groupCode}`);
  };

  return (
    <div>
      <PageHeader
        title="Quản lý SV đồ án"
        description="Duyệt đăng ký nhóm, theo dõi tiến độ và đánh giá sinh viên ĐATN"
      />

      <Card className="mb-6">
        <div className="px-5 py-4">
          <Field label="Chọn nghiệp vụ quản lý">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as "pending" | "reports")}
              className={`${inputCls} w-80`}
            >
              <option value="pending">Duyệt nhóm sinh viên đăng ký</option>
              <option value="reports">Quản lý báo cáo & Đánh giá</option>
            </select>
          </Field>
        </div>
      </Card>

      {mode === "pending" ? (
        <Card>
          <div className="px-5 py-4 border-b border-gray-200 bg-orange-50">
            <div className="text-sm font-medium">Nhóm sinh viên chờ phê duyệt</div>
            <div className="text-xs text-gray-600 mt-1">
              Các nhóm đã đăng ký đề tài của bạn và đang chờ xác nhận
            </div>
          </div>

          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`${inputCls} w-48`}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Chờ duyệt">Chờ duyệt</option>
              <option value="Đã duyệt">Đã duyệt</option>
              <option value="Từ chối">Từ chối</option>
            </select>
          </div>

          {pendingGroups.length === 0 ? (
            <div className="px-5 py-16 text-center text-gray-500">
              <Users className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <div className="text-sm">Không có nhóm nào phù hợp</div>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3">Mã nhóm</th>
                  <th className="text-left px-4 py-3">Tên đề tài</th>
                  <th className="text-left px-4 py-3">Danh sách thành viên</th>
                  <th className="text-left px-4 py-3 w-32">Trạng thái</th>
                  <th className="text-right px-4 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {pendingGroups.map((group) => (
                  <tr key={group.groupCode} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Badge type="warning">{group.groupCode}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[#2196F3] text-xs">{group.topicCode}</div>
                      <div>{group.topicName}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {group.members.map(m => `${m.id} - ${m.name}`).join(", ")}
                    </td>
                    <td className="px-4 py-3">
                      {group.status && <Badge type={statusMap[group.status]}>{group.status}</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="secondary"
                          className="text-xs"
                          onClick={() => { setSelectedGroup(group); setViewingDetail(true); }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="success"
                          className="text-xs"
                          onClick={() => approveGroup(group.groupCode)}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="danger"
                          className="text-xs"
                          onClick={() => rejectGroup(group.groupCode)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      ) : (
        <>
          <div className="mb-6 flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setTab("advisor")}
              className={`px-5 py-3 text-sm border-b-2 transition whitespace-nowrap ${
                tab === "advisor"
                  ? "border-[#2196F3] text-[#2196F3] font-medium"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Hướng dẫn SV (ĐATN)
            </button>
            <button
              onClick={() => setTab("reviewer")}
              className={`px-5 py-3 text-sm border-b-2 transition whitespace-nowrap ${
                tab === "reviewer"
                  ? "border-[#2196F3] text-[#2196F3] font-medium"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Phản biện SV (ĐATN)
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredGroups.map((group) => (
          <Card key={group.groupCode} className="p-5 hover:shadow-md transition">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge type="info">{group.groupCode}</Badge>
                  <span className="text-xs text-gray-500">Mã nhóm</span>
                  {group.isReviewer && (
                    <Badge type="warning">Vai trò: GVPB</Badge>
                  )}
                </div>
                <div className="text-base mb-2">
                  <span className="text-[#2196F3] font-medium">{group.topicCode}</span>
                  {" - "}
                  {group.topicName}
                </div>

                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-600">Thành viên ({group.members.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-6">
                    {group.members.map((member) => (
                      <div key={member.id} className="text-xs bg-gray-50 px-2 py-1 rounded">
                        {member.id} - {member.name}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-gray-500">Báo cáo giai đoạn: </span>
                    <span className="font-medium">{group.latestReport}</span>
                  </div>
                  <Badge type={statusMap[group.reportStatus]}>{group.reportStatus}</Badge>
                  <span className="text-gray-500">{group.reportDate}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 items-end">
                {group.githubRepo && (
                  <a
                    href={group.githubRepo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 transition text-xs"
                    title="Xem kho mã nguồn"
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                  </a>
                )}
                <Button
                  variant="secondary"
                  className="text-xs"
                  onClick={() => {
                    setSelectedGroup(group);
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
                  onClick={() => {
                    setSelectedGroup(group);
                    setViewingReport(false);
                  }}
                >
                  <span className="inline-flex items-center gap-1">
                    <Star className="w-3.5 h-3.5" />
                    Đánh giá nhóm
                  </span>
                </Button>
              </div>
            </div>
          </Card>
            ))}
          </div>
        </>
      )}

      {/* Modal xem chi tiết nhóm chờ duyệt */}
      <Modal
        open={viewingDetail}
        title="Chi tiết nhóm"
        onClose={() => { setViewingDetail(false); setSelectedGroup(null); }}
        footer={
          <>
            <Button variant="secondary" onClick={() => { setViewingDetail(false); setSelectedGroup(null); }}>
              Đóng
            </Button>
            <Button variant="primary" onClick={() => { notify("Đã cập nhật thông tin nhóm"); setViewingDetail(false); setSelectedGroup(null); }}>
              Cập nhật
            </Button>
          </>
        }
      >
        {selectedGroup && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="text-sm font-medium mb-2">Thông tin nhóm</div>
              <div className="text-xs text-gray-600 mb-1">Mã nhóm: {selectedGroup.groupCode}</div>
              <div className="text-xs text-gray-600 mb-1">Đề tài: {selectedGroup.topicCode} - {selectedGroup.topicName}</div>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700 font-medium">Danh sách thành viên</label>
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="text-left px-3 py-2">MSSV</th>
                      <th className="text-left px-3 py-2">Họ tên</th>
                      <th className="text-right px-3 py-2">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedGroup.members.map((member) => (
                      <tr key={member.id} className="border-t border-gray-100">
                        <td className="px-3 py-2 text-[#2196F3]">{member.id}</td>
                        <td className="px-3 py-2">{member.name}</td>
                        <td className="px-3 py-2">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => notify(`Chỉnh sửa ${member.name}`)}
                              className="p-1.5 rounded hover:bg-blue-50 text-[#2196F3]"
                              title="Sửa"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => notify(`Xóa ${member.name} khỏi nhóm`)}
                              className="p-1.5 rounded hover:bg-red-50 text-[#F44336]"
                              title="Xóa"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal xem báo cáo & nhận xét */}
      <Modal
        open={viewingReport && !!selectedGroup}
        title={`Xem báo cáo - ${selectedGroup?.groupCode}`}
        onClose={() => {
          setViewingReport(false);
          setSelectedGroup(null);
          setFeedback("");
        }}
        footer={
          <>
            <Button variant="secondary" onClick={() => {
              setViewingReport(false);
              setSelectedGroup(null);
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
        {selectedGroup && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-[#2196F3]" />
                <span className="text-sm font-medium">Báo cáo {selectedGroup.latestReport}</span>
              </div>
              <div className="text-xs text-gray-600 mb-1">
                Đề tài: {selectedGroup.topicCode} - {selectedGroup.topicName}
              </div>
              <div className="text-xs text-gray-600 mb-1">
                Ngày nộp: {selectedGroup.reportDate}
              </div>
              <div className="mt-2">
                <Badge type={statusMap[selectedGroup.reportStatus]}>
                  {selectedGroup.reportStatus}
                </Badge>
              </div>
            </div>

            {selectedGroup.githubRepo && (
              <div>
                <label className="block text-sm mb-1.5 text-gray-700">GitHub Repository</label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <a
                    href={selectedGroup.githubRepo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[#2196F3] hover:underline"
                  >
                    <Github className="w-4 h-4" />
                    {selectedGroup.githubRepo}
                  </a>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm mb-1.5 text-gray-700">File báo cáo</label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 text-sm text-[#2196F3] hover:underline"
                  onClick={(e) => { e.preventDefault(); notify("Tải file báo cáo"); }}
                >
                  <FileText className="w-4 h-4" />
                  bao_cao_{selectedGroup.latestReport.toLowerCase().replace(/\s+/g, '_')}.pdf
                </a>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1.5 text-gray-700">Nội dung báo cáo</label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700 max-h-60 overflow-y-auto">
                <p className="mb-2"><strong>{selectedGroup.latestReport}</strong></p>
                <p className="mb-2"><strong>Công việc đã thực hiện:</strong></p>
                <ul className="list-disc list-inside mb-2 text-xs space-y-1">
                  <li>Hoàn thành phân tích và thiết kế hệ thống</li>
                  <li>Xây dựng cơ sở dữ liệu và các API backend</li>
                  <li>Phát triển giao diện người dùng cho module chính</li>
                </ul>
                <p className="mb-2"><strong>Kết quả đạt được:</strong></p>
                <p className="text-xs mb-2">Hoàn thành 70% tính năng theo kế hoạch. Hệ thống đang chạy ổn định trên môi trường test.</p>
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
                placeholder="Nhập nhận xét về báo cáo của nhóm..."
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Modal đánh giá nhóm */}
      <Modal
        open={!viewingReport && !viewingDetail && !!selectedGroup}
        title={`Đánh giá nhóm - ${selectedGroup?.groupCode}`}
        onClose={() => {
          setSelectedGroup(null);
          setGroupRating("");
          setReviewerRating("");
        }}
        footer={
          <>
            <Button variant="secondary" onClick={() => {
              setSelectedGroup(null);
              setGroupRating("");
              setReviewerRating("");
            }}>
              Hủy
            </Button>
            <Button variant="primary" onClick={selectedGroup?.isReviewer ? submitReviewerRating : submitGroupRating}>
              Lưu đánh giá
            </Button>
          </>
        }
      >
        {selectedGroup && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="text-sm font-medium mb-1">Thông tin nhóm</div>
              <div className="text-xs text-gray-600">Mã nhóm: {selectedGroup.groupCode}</div>
              <div className="text-xs text-gray-600">Đề tài: {selectedGroup.topicCode}</div>
              <div className="text-xs text-gray-600 mt-1">
                Thành viên: {selectedGroup.members.map(m => m.name).join(", ")}
              </div>
              {selectedGroup.isReviewer && (
                <div className="mt-2">
                  <Badge type="warning">Bạn là GVPB của nhóm này</Badge>
                </div>
              )}
            </div>

            {selectedGroup.isReviewer ? (
              <div>
                <label className="block text-sm mb-1.5 text-gray-700 font-medium">
                  Đánh giá tổng thể nhóm (vai trò GVPB) <span className="text-[#F44336]">*</span>
                </label>
                <select
                  value={reviewerRating}
                  onChange={(e) => setReviewerRating(e.target.value)}
                  className={inputCls}
                >
                  <option value="">-- Chọn kết quả đánh giá --</option>
                  <option value="Đạt">Đạt</option>
                  <option value="Không đạt">Không đạt</option>
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  Đánh giá của bạn với vai trò Giảng viên Phản biện (GVPB)
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm mb-1.5 text-gray-700 font-medium">
                  Đánh giá tổng thể nhóm theo đề tài <span className="text-[#F44336]">*</span>
                </label>
                <select
                  value={groupRating}
                  onChange={(e) => setGroupRating(e.target.value)}
                  className={inputCls}
                >
                  <option value="">-- Chọn kết quả đánh giá --</option>
                  <option value="Đạt">Đạt</option>
                  <option value="Không đạt">Không đạt</option>
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  Đánh giá tổng thể về kết quả thực hiện đề tài của nhóm
                </div>
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
