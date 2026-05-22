import { useState } from "react";
import { Sidebar, Role } from "./components/Sidebar";
import { Topbar } from "./components/common";
import { TeacherLayout } from "./components/TeacherLayout";
import { TeacherStudentsPage } from "./components/TeacherStudentsPage";
import { TeacherStudentsPageNew } from "./components/TeacherStudentsPageNew";
import { TeacherStudentsTTTN } from "./components/TeacherStudentsTTTN";
import { TeacherStudentsDATN } from "./components/TeacherStudentsDATN";
import { TeacherCouncilGradingNew } from "./components/TeacherCouncilGradingNew";
import { StudentLayout } from "./components/StudentLayout";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboards";
import { StudentInternship } from "./components/StudentInternship";
import { AdminNotifications } from "./components/AdminNotifications";
import { AdminEligibility } from "./components/AdminEligibility";
import { AdminCompanies } from "./components/AdminCompanies";
import { TeacherGrading } from "./components/TeacherGrading";
import { AdminBatches } from "./components/AdminBatches";
import { AdminBatchesNew } from "./components/AdminBatchesNew";
import { AdminAssign } from "./components/AdminAssign";
import { AdminCouncils } from "./components/AdminCouncils";
import { BatchDetail } from "./components/BatchDetail";
import { StudentThesisWithInvite } from "./components/StudentThesisWithInvite";
import { StudentResultsNew } from "./components/StudentResultsNew";
import { StudentReportsNew } from "./components/StudentReportsNew";
import { StudentReportsTTTN } from "./components/StudentReportsTTTN";
import { StudentReportsDATN } from "./components/StudentReportsDATN";
import {
  AdminTopics,
  TeacherTopics,
  TeacherStudents,
  TeacherPostInfo,
  TeacherHome,
  StudentHome,
  StudentThesis,
  StudentReports,
  StudentResults,
  NotificationsList,
} from "./components/GenericPages";
import { AdminUsersNew } from "./components/AdminUsersNew";
import { AdminInternshipStudents } from "./components/AdminInternshipStudents";
import { AdminCouncilCreate } from "./components/AdminCouncilCreate";

const defaultActive: Record<Role, string> = {
  admin: "dashboard",
  teacher: "home",
  student: "home",
};

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState<Role>("admin");
  const [active, setActive] = useState("dashboard");
  const [batchDetailId, setBatchDetailId] = useState<string | null>(null);
  const [councilCreating, setCouncilCreating] = useState(false);

  const login = (r: Role) => {
    setRole(r);
    setActive(defaultActive[r]);
    setAuthed(true);
  };

  const logout = () => {
    setAuthed(false);
    setRole("admin");
    setActive("dashboard");
  };

  if (!authed) return <Login onLogin={login} />;

  const titles: Record<string, { t: string; s?: string }> = {
    dashboard: { t: "Dashboard", s: "Tổng quan hệ thống" },
    home: { t: "Trang chủ" },
    users: { t: "Quản lý người dùng" },
    batches: { t: "Quản lý đợt" },
    companies: { t: "Quản lý công ty" },
    "internship-students": { t: "Quản lý SV TTTN" },
    topics: { t: role === "admin" ? "Quản lý đề tài" : "Đề tài của tôi" },
    assign: { t: "Phân công hướng dẫn" },
    councils: { t: "Phân công hội đồng" },
    "council-create": { t: "Tạo hội đồng mới" },
    eligibility: { t: "Xét điều kiện ĐATN" },
    notifications: { t: "Thông báo" },
    students: { t: "Quản lý sinh viên" },
    "post-info": { t: "Đăng thông tin" },
    grading: { t: "Chấm điểm" },
    internship: { t: "Đăng ký thực tập" },
    thesis: { t: "Đề tài ĐATN" },
    reports: { t: "Báo cáo tiến độ" },
    results: { t: "Kết quả" },
  };

  const renderPage = () => {
    if (role === "admin") {
      if (active === "dashboard") return <Dashboard role={role} />;
      if (active === "users") return <AdminUsersNew />;
      if (active === "batches") {
        if (batchDetailId) return <BatchDetail id={batchDetailId} onBack={() => setBatchDetailId(null)} />;
        return <AdminBatchesNew />;
      }
      if (active === "companies") return <AdminCompanies />;
      if (active === "internship-students") return <AdminInternshipStudents />;
      if (active === "topics") return <AdminTopics />;
      if (active === "assign") return <AdminAssign />;
      if (active === "councils") {
        if (councilCreating) return <AdminCouncilCreate onBack={() => setCouncilCreating(false)} />;
        return <AdminCouncils onCreateCouncil={() => setCouncilCreating(true)} />;
      }
      if (active === "eligibility") return <AdminEligibility />;
      if (active === "post-info") return <TeacherPostInfo asAdmin />;
      if (active === "notifications") return <NotificationsList />;
      return <Dashboard role={role} />;
    }
    if (role === "teacher") {
      if (active === "home") return <TeacherHome />;
      if (active === "topics") return <TeacherTopics />;
      if (active === "students-tttn") return <TeacherStudentsTTTN />;
      if (active === "students-datn") return <TeacherStudentsDATN />;
      if (active === "grading-tttn") return <TeacherGrading />;
      if (active === "grading-datn") return <TeacherCouncilGradingNew />;
      return <TeacherHome />;
    }
    if (active === "home") return <StudentHome />;
    if (active === "internship") return <StudentInternship />;
    if (active === "thesis") return <StudentThesisWithInvite />;
    if (active === "reports-tttn") return <StudentReportsTTTN />;
    if (active === "reports-datn") return <StudentReportsDATN />;
    if (active === "results") return <StudentResultsNew />;
    if (active === "notifications") return <NotificationsList role="student" />;
    return <StudentHome />;
  };

  const meta = titles[active] || { t: "" };

  if (role === "teacher") {
    return (
      <TeacherLayout active={active} onNavigate={setActive} onLogout={logout}>
        {renderPage()}
      </TeacherLayout>
    );
  }

  if (role === "student") {
    return (
      <StudentLayout active={active} onNavigate={setActive} onLogout={logout}>
        {renderPage()}
      </StudentLayout>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-gray-50 text-gray-900">
      <Sidebar role={role} active={active} onNavigate={setActive} onLogout={logout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={meta.t} subtitle={meta.s} />
        <main className="flex-1 overflow-y-auto p-6">{renderPage()}</main>
      </div>
    </div>
  );
}
