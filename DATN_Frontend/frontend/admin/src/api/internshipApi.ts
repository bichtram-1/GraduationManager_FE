import type { BaseListParams } from '@shared/types/GeneralType';
import type { ConfirmationStatus, IConfirmationRequest, ICreateConfirmationRequest, ICreateNoCompanyStudent, INoCompanyStudent, IUpdateConfirmationRequest, IUpdateNoCompanyStudent, NoCompanyStatus } from '../type/InternshipType';

type ConfirmationRow = IConfirmationRequest;
type NoCompanyRow = INoCompanyStudent;

const MOCK_CONFIRMATIONS: ConfirmationRow[] = [
  { id: 'CR001', studentId: '20520001', studentName: 'Nguyễn Văn A', className: 'KTPM2020', companyName: 'FPT Software', taxId: '0123456789', mentor: 'Trần Văn Mentor', regDate: '15/04/2026', status: 'pending' },
  { id: 'CR002', studentId: '20520002', studentName: 'Trần Thị B', className: 'CNPM2020', companyName: 'VNG Corp', taxId: '0987654321', mentor: 'Nguyễn Thị Guide', regDate: '16/04/2026', status: 'approved' },
  { id: 'CR003', studentId: '20520003', studentName: 'Lê Văn C', className: 'KTPM2020', companyName: 'TMA Solutions', taxId: '0112233445', mentor: 'Phạm Văn Hướng', regDate: '17/04/2026', status: 'pending' },
  { id: 'CR004', studentId: '20520004', studentName: 'Phạm Thị D', className: 'HTTT2020', companyName: 'Shopee VN', taxId: '0556677889', mentor: 'Võ Thị Lead', regDate: '18/04/2026', status: 'rejected' },
];

const MOCK_NO_COMPANY: NoCompanyRow[] = [
  { id: 'NC001', studentId: '20520010', studentName: 'Đinh Thị H', className: 'KTPM2020', phone: '0912000111', status: 'not_registered' },
  { id: 'NC002', studentId: '20520011', studentName: 'Phan Văn I', className: 'CNPM2020', phone: '0912000222', status: 'searching' },
  { id: 'NC003', studentId: '20520012', studentName: 'Trương Thị J', className: 'KTPM2020', phone: '0912000333', status: 'not_registered' },
  { id: 'NC004', studentId: '20520013', studentName: 'Ngô Văn K', className: 'HTTT2020', phone: '0912000444', status: 'searching' },
  { id: 'NC005', studentId: '20520014', studentName: 'Đặng Thị L', className: 'CNPM2020', phone: '0912000555', status: 'not_registered' },
  { id: 'NC006', studentId: '20520015', studentName: 'Võ Văn M', className: 'KTPM2020', phone: '0912000666', status: 'searching' },
  { id: 'NC007', studentId: '20520016', studentName: 'Hoàng Thị N', className: 'HTTT2020', phone: '0912000777', status: 'not_registered' },
];

let confirmationStore = [...MOCK_CONFIRMATIONS];
let noCompanyStore = [...MOCK_NO_COMPANY];

export const internshipApi = {
  getListConfirmationRequest: async () => ({ rows: confirmationStore, total: confirmationStore.length }),

  getConfirmationRequestDetail: async (id: string) => confirmationStore.find((row) => row.id === id),

  createConfirmationRequest: async ({ body }: { body: ICreateConfirmationRequest; params: BaseListParams }) => {
    const nextId = `CR${String(confirmationStore.length + 1).padStart(3, '0')}`;
    const newRow: ConfirmationRow = { id: nextId, ...body };
    confirmationStore = [newRow, ...confirmationStore];
    return newRow;
  },

  updateConfirmationRequest: async ({ id, body }: { id: string; body: IUpdateConfirmationRequest; index: number; params: BaseListParams }) => {
    confirmationStore = confirmationStore.map((row) => (row.id === id ? { ...row, ...body, id } : row));
    return confirmationStore.find((row) => row.id === id);
  },

  deleteConfirmationRequest: async ({ id }: { id: string; params: BaseListParams }) => {
    confirmationStore = confirmationStore.filter((row) => row.id !== id);
    return { success: true, id };
  },

  getListNoCompanyStudent: async () => ({ rows: noCompanyStore, total: noCompanyStore.length }),

  getNoCompanyStudentDetail: async (id: string) => noCompanyStore.find((row) => row.id === id),

  createNoCompanyStudent: async ({ body }: { body: ICreateNoCompanyStudent; params: BaseListParams }) => {
    const nextId = `NC${String(noCompanyStore.length + 1).padStart(3, '0')}`;
    const newRow: NoCompanyRow = { id: nextId, ...body };
    noCompanyStore = [newRow, ...noCompanyStore];
    return newRow;
  },

  updateNoCompanyStudent: async ({ id, body }: { id: string; body: IUpdateNoCompanyStudent; index: number; params: BaseListParams }) => {
    noCompanyStore = noCompanyStore.map((row) => (row.id === id ? { ...row, ...body, id } : row));
    return noCompanyStore.find((row) => row.id === id);
  },

  deleteNoCompanyStudent: async ({ id }: { id: string; params: BaseListParams }) => {
    noCompanyStore = noCompanyStore.filter((row) => row.id !== id);
    return { success: true, id };
  },
};
