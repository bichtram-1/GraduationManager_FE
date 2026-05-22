import { useSyncExternalStore } from "react";

export type ThesisRegistration = {
  studentId: string;
  studentName: string;
  studentClass: string;
  topicCode: string;
  topicName: string;
  teacher: string;
  registeredAt: string;
};

export const TOPICS = [
  { code: "DA001", name: "Hệ thống IoT giám sát nông nghiệp", teacher: "TS. Nguyễn Văn X", maxSlots: 4 },
  { code: "DA002", name: "Ứng dụng AI nhận diện hình ảnh", teacher: "TS. Trần Văn Y", maxSlots: 3 },
  { code: "DA004", name: "Chatbot hỗ trợ sinh viên", teacher: "ThS. Lê Thị Z", maxSlots: 4 },
  { code: "DA005", name: "App di động theo dõi sức khỏe", teacher: "TS. Phạm Văn K", maxSlots: 4 },
];

export const CURRENT_TEACHER = "TS. Nguyễn Văn X";

const seed: ThesisRegistration[] = [
  { studentId: "20520010", studentName: "Lý Văn H", studentClass: "KTPM2020", topicCode: "DA001", topicName: "Hệ thống IoT giám sát nông nghiệp", teacher: "TS. Nguyễn Văn X", registeredAt: "10/04/2026" },
  { studentId: "20520020", studentName: "Mai Thị K", studentClass: "KTPM2020", topicCode: "DA001", topicName: "Hệ thống IoT giám sát nông nghiệp", teacher: "TS. Nguyễn Văn X", registeredAt: "12/04/2026" },
];

let registrations: ThesisRegistration[] = [...seed];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export const thesisStore = {
  getAll: () => registrations,
  getByTeacher: (teacher: string) => registrations.filter((r) => r.teacher === teacher),
  getByStudent: (studentId: string) => registrations.find((r) => r.studentId === studentId),
  getByTopic: (code: string) => registrations.filter((r) => r.topicCode === code),
  slotsUsed: (code: string) => registrations.filter((r) => r.topicCode === code).length,
  register: (r: ThesisRegistration) => {
    registrations = [...registrations.filter((x) => x.studentId !== r.studentId), r];
    emit();
  },
  cancel: (studentId: string) => {
    registrations = registrations.filter((r) => r.studentId !== studentId);
    emit();
  },
  subscribe: (cb: () => void) => {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  },
};

export function useThesisStore() {
  return useSyncExternalStore(thesisStore.subscribe, thesisStore.getAll, thesisStore.getAll);
}
