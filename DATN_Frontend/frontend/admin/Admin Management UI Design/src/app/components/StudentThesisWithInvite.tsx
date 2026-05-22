import { useState } from "react";
import { PageHeader, Card, Badge, Button } from "./common";
import { thesisStore, useThesisStore, TOPICS } from "./thesisStore";
import { UserPlus, CheckCircle, XCircle } from "lucide-react";

const CURRENT_STUDENT = {
  id: "20520001",
  name: "Nguyễn Văn A",
  class: "KTPM2020",
};

type GroupInvite = {
  from: { id: string; name: string };
  topic: { code: string; name: string };
};

export function StudentThesisWithInvite() {
  useThesisStore();
  const myReg = thesisStore.getByStudent(CURRENT_STUDENT.id);
  const [toast, setToast] = useState<string | null>(null);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [partnerIds, setPartnerIds] = useState<{ [key: string]: string[] }>({});

  // Mock data - lời mời nhóm
  const [invite, setInvite] = useState<GroupInvite | null>({
    from: { id: "20520002", name: "Nguyễn Văn B" },
    topic: { code: "DT001", name: "Xây dựng hệ thống quản lý thư viện điện tử" },
  });

  const notify = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 3000);
  };

  const register = (topic: typeof TOPICS[number]) => {
    if (topic.maxSlots > 1) {
      // Hiển thị form mời thành viên
      setExpandedTopic(expandedTopic === topic.code ? null : topic.code);
    } else {
      // Đăng ký trực tiếp cho đề tài 1 thành viên
      thesisStore.register({
        studentId: CURRENT_STUDENT.id,
        studentName: CURRENT_STUDENT.name,
        studentClass: CURRENT_STUDENT.class,
        topicCode: topic.code,
        topicName: topic.name,
        teacher: topic.teacher,
        registeredAt: new Date().toLocaleDateString("vi-VN"),
      });
      notify(`Đã đăng ký đề tài ${topic.code}. GVHD: ${topic.teacher}`);
    }
  };

  const confirmRegisterWithTeam = (topic: typeof TOPICS[number]) => {
    thesisStore.register({
      studentId: CURRENT_STUDENT.id,
      studentName: CURRENT_STUDENT.name,
      studentClass: CURRENT_STUDENT.class,
      topicCode: topic.code,
      topicName: topic.name,
      teacher: topic.teacher,
      registeredAt: new Date().toLocaleDateString("vi-VN"),
    });
    const partners = partnerIds[topic.code] || [];
    const partnerCount = partners.filter(p => p.trim()).length;
    notify(`Đã đăng ký đề tài ${topic.code}${partnerCount > 0 ? ` và gửi lời mời tới ${partnerCount} thành viên` : ''}. GVHD: ${topic.teacher}`);
    setExpandedTopic(null);
    setPartnerIds(prev => ({ ...prev, [topic.code]: [] }));
  };

  const addPartnerField = (topicCode: string) => {
    setPartnerIds(prev => ({
      ...prev,
      [topicCode]: [...(prev[topicCode] || []), ""],
    }));
  };

  const updatePartner = (topicCode: string, index: number, value: string) => {
    setPartnerIds(prev => {
      const newPartners = [...(prev[topicCode] || [])];
      newPartners[index] = value;
      return { ...prev, [topicCode]: newPartners };
    });
  };

  const removePartner = (topicCode: string, index: number) => {
    setPartnerIds(prev => ({
      ...prev,
      [topicCode]: (prev[topicCode] || []).filter((_, i) => i !== index),
    }));
  };

  const cancel = () => {
    thesisStore.cancel(CURRENT_STUDENT.id);
    notify("Đã hủy đăng ký đề tài");
  };

  const acceptInvite = () => {
    if (invite) {
      // Logic đồng ý lời mời
      const topic = TOPICS.find(t => t.code === invite.topic.code);
      if (topic) {
        register(topic);
      }
      notify(`Đã đồng ý tham gia nhóm của ${invite.from.name}`);
      setInvite(null);
    }
  };

  const rejectInvite = () => {
    if (invite) {
      notify(`Đã từ chối lời mời từ ${invite.from.name}`);
      setInvite(null);
    }
  };

  return (
    <div>
      <PageHeader title="Đề tài ĐATN" description="Chọn đề tài và lập nhóm làm đồ án tốt nghiệp" />

      {/* Card Thông báo lời mời */}
      {invite && (
        <Card className="p-5 mb-5 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <UserPlus className="w-5 h-5 text-[#2196F3]" />
                <h3 className="text-base font-medium text-[#2196F3]">
                  Bạn có 1 lời mời tham gia nhóm Đồ án tốt nghiệp
                </h3>
              </div>
              <div className="text-sm text-gray-700 mb-1">
                <span className="font-medium">Sinh viên:</span> {invite.from.name} - MSSV: {invite.from.id}
              </div>
              <div className="text-sm text-gray-700">
                mời bạn cùng thực hiện đề tài: <span className="font-medium text-[#2196F3]">"{invite.topic.name}"</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="inline-flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50"
                onClick={rejectInvite}
              >
                <XCircle className="w-4 h-4" />
                Từ chối
              </Button>
              <Button
                variant="primary"
                className="inline-flex items-center gap-2 bg-[#4CAF50] hover:bg-[#45a049]"
                onClick={acceptInvite}
              >
                <CheckCircle className="w-4 h-4" />
                Đồng ý
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Card trạng thái đăng ký */}
      {myReg ? (
        <Card className="p-5 mb-5 bg-green-50 border-green-200">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge type="success">Đã đăng ký</Badge>
                <span className="text-[#2196F3] text-sm">{myReg.topicCode}</span>
              </div>
              <div className="text-base">{myReg.topicName}</div>
              <div className="text-sm text-gray-600 mt-1">
                GVHD: <b>{myReg.teacher}</b> • Đăng ký ngày {myReg.registeredAt}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                GV đã tự động nhận bạn vào danh sách quản lý SV đồ án.
              </div>
            </div>
            <Button variant="secondary" onClick={cancel}>Hủy đăng ký</Button>
          </div>
        </Card>
      ) : (
        <Card className="p-5 mb-5 bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <Badge type="success">Đủ điều kiện</Badge>
            <div className="text-sm">Bạn đã đủ điều kiện đăng ký đề tài ĐATN (Điểm TTTN: 8.5)</div>
          </div>
        </Card>
      )}

      {/* Danh sách đề tài - làm mờ khi có lời mời */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity ${invite ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
        {TOPICS.map((t) => {
          const used = thesisStore.slotsUsed(t.code);
          const full = used >= t.maxSlots;
          const isMine = myReg?.topicCode === t.code;
          return (
            <Card key={t.code} className={`p-5 hover:shadow-md transition ${isMine ? "ring-2 ring-[#4CAF50]" : ""}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="text-[#2196F3] text-sm">{t.code}</div>
                {isMine ? (
                  <Badge type="success">Đề tài của bạn</Badge>
                ) : (
                  <Badge type={full ? "danger" : "success"}>{full ? "Hết slot" : "Còn slot"}</Badge>
                )}
              </div>
              <div className="text-base mb-2">{t.name}</div>
              <div className="text-xs text-gray-500 mb-4">GV: {t.teacher} • Số thành viên tối đa: {t.maxSlots}</div>
              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1">Xem chi tiết</Button>
                {isMine ? (
                  <Button variant="danger" className="flex-1" onClick={cancel}>Hủy đăng ký</Button>
                ) : (
                  <Button
                    variant="primary"
                    className="flex-1"
                    disabled={full || !!myReg}
                    onClick={() => register(t)}
                  >
                    {myReg ? "Đã đăng ký đề tài khác" : "Đăng ký"}
                  </Button>
                )}
              </div>

              {/* Form mời thành viên nhóm */}
              {expandedTopic === t.code && t.maxSlots > 1 && (
                <div className="mt-4 pt-4 border-t border-gray-200 bg-blue-50 -mx-5 -mb-5 p-4 rounded-b-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Mời thành viên nhóm</h4>
                  <div className="space-y-3">
                    {(partnerIds[t.code] || []).map((partnerId, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Nhập Mã số sinh viên bạn đồng hành"
                            value={partnerId}
                            onChange={(e) => updatePartner(t.code, idx, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <Badge type="warning">Chờ xác nhận</Badge>
                        <button
                          onClick={() => removePartner(t.code, idx)}
                          className="text-red-600 hover:text-red-700 text-xs"
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                    {(partnerIds[t.code] || []).length < t.maxSlots - 1 && (
                      <button
                        onClick={() => addPartnerField(t.code)}
                        className="text-sm text-[#2196F3] hover:text-blue-700 font-medium"
                      >
                        + Thêm thành viên
                      </button>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="primary"
                        className="flex-1"
                        onClick={() => confirmRegisterWithTeam(t)}
                      >
                        Xác nhận đăng ký
                      </Button>
                      <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={() => setExpandedTopic(null)}
                      >
                        Hủy
                      </Button>
                    </div>
                  </div>
                </div>
              )}
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
