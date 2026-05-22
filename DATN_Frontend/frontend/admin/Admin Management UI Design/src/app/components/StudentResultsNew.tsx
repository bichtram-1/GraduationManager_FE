import { useState } from "react";
import { PageHeader, Card, Badge } from "./common";
import { GraduationCap } from "lucide-react";

type ResultType = "tttn" | "datn";

export function StudentResultsNew() {
  const [resultType, setResultType] = useState<ResultType>("tttn");

  // Mock data TTTN
  const tttnScores = {
    advisorScore: 8.5,
    status: "Hoàn thành"
  };

  // Mock data DATN
  const datnScores = {
    reportScore: 7.8, // Trung bình GVHD & GVPB
    defenseScore: 8.2, // Trung bình 5 thành viên hội đồng
    finalScore: 8.12, // (7.8 * 0.2) + (8.2 * 0.8)
    passed: true,
    topic: "DT001 - Xây dựng hệ thống quản lý thư viện điện tử"
  };

  return (
    <div>
      <PageHeader
        title="Kết quả"
        description="Tra cứu điểm sau khi Admin công bố"
      />

      {/* Tab chọn loại kết quả */}
      <div className="mb-5 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setResultType("tttn")}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition ${
            resultType === "tttn"
              ? "border-[#2196F3] text-[#2196F3]"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Điểm Thực tập (TTTN)
        </button>
        <button
          onClick={() => setResultType("datn")}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition ${
            resultType === "datn"
              ? "border-[#2196F3] text-[#2196F3]"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Điểm Đồ án (DATN)
        </button>
      </div>

      {resultType === "tttn" ? (
        <div>
          {/* Card điểm GVHD */}
          <Card className="p-5 mb-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2196F3] flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Điểm thực tập</div>
                <div className="text-sm font-medium">Điểm Giảng viên hướng dẫn</div>
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-xs text-gray-500">Giảng viên chấm</div>
              <div className="text-3xl font-medium text-[#2196F3]">{tttnScores.advisorScore.toFixed(1)}</div>
            </div>
          </Card>

          {/* Card kết quả lớn */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Điểm tổng kết TTTN</div>
                <div className="text-xs text-gray-500">Điểm do Giảng viên hướng dẫn chấm</div>
              </div>
              <Badge type="success">{tttnScores.status}</Badge>
            </div>
            <div className="flex items-center justify-end">
              <div className="text-4xl font-medium text-[#4CAF50]">
                {tttnScores.advisorScore.toFixed(1)}
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div>
          {/* Bảng 2 cột điểm */}
          <Card className="mb-5">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
              <div className="text-sm font-medium">Chi tiết điểm đồ án</div>
              <div className="text-xs text-gray-500 mt-0.5">{datnScores.topic}</div>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-5 py-3 w-1/2">Điểm chấm cuốn báo cáo</th>
                  <th className="text-left px-5 py-3 w-1/2">Điểm bảo vệ cá nhân</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-100">
                  <td className="px-5 py-4 align-top">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                        <span className="text-xs text-gray-500">Tỷ trọng</span>
                        <span className="text-sm font-medium text-[#2196F3]">20%</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Trung bình cộng:
                        <div className="mt-1 space-y-1">
                          <div className="flex justify-between">
                            <span>• Điểm GVHD</span>
                            <span>7.5</span>
                          </div>
                          <div className="flex justify-between">
                            <span>• Điểm GVPB</span>
                            <span>8.1</span>
                          </div>
                        </div>
                      </div>
                      <div className="pt-2 flex justify-between items-center">
                        <span className="text-xs text-gray-500">Điểm trung bình</span>
                        <span className="text-xl font-medium text-[#2196F3]">{datnScores.reportScore.toFixed(1)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top border-l border-gray-100">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                        <span className="text-xs text-gray-500">Tỷ trọng</span>
                        <span className="text-sm font-medium text-[#4CAF50]">80%</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Trung bình cộng 5 thành viên Hội đồng:
                        <div className="mt-1 space-y-1">
                          <div className="flex justify-between">
                            <span>• Chủ tịch HĐ</span>
                            <span>8.0</span>
                          </div>
                          <div className="flex justify-between">
                            <span>• Phản biện 1</span>
                            <span>8.5</span>
                          </div>
                          <div className="flex justify-between">
                            <span>• Phản biện 2</span>
                            <span>8.0</span>
                          </div>
                          <div className="flex justify-between">
                            <span>• Ủy viên 1</span>
                            <span>8.3</span>
                          </div>
                          <div className="flex justify-between">
                            <span>• Ủy viên 2</span>
                            <span>8.2</span>
                          </div>
                        </div>
                      </div>
                      <div className="pt-2 flex justify-between items-center">
                        <span className="text-xs text-gray-500">Điểm trung bình</span>
                        <span className="text-xl font-medium text-[#4CAF50]">{datnScores.defenseScore.toFixed(1)}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>

          {/* Card kết quả lớn với badge Đạt/Trượt */}
          <Card className={`p-6 bg-gradient-to-br ${datnScores.passed ? 'from-green-50 to-white border-green-200' : 'from-red-50 to-white border-red-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Điểm Đồ án tổng kết</div>
                <div className="text-xs text-gray-500">
                  = (Điểm báo cáo × 0.2) + (Điểm bảo vệ × 0.8)
                </div>
              </div>
              <Badge type={datnScores.passed ? "success" : "danger"}>
                {datnScores.passed ? "ĐẠT" : "TRƯỢT"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                = ({datnScores.reportScore.toFixed(1)} × 0.2) + ({datnScores.defenseScore.toFixed(1)} × 0.8)
              </div>
              <div className={`text-4xl font-medium ${datnScores.passed ? 'text-[#4CAF50]' : 'text-[#F44336]'}`}>
                {datnScores.finalScore.toFixed(2)}
              </div>
            </div>
            {datnScores.passed && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <div className="text-xs text-gray-600 text-center">
                  🎉 Chúc mừng bạn đã hoàn thành Đồ án tốt nghiệp!
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
