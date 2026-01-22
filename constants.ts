
import { UserRole, User, Store, ShiftType } from './types';

export const INITIAL_USERS: User[] = [
  { id: 'admin-1', name: 'ຜູ້ດູແລລະບົບ', username: 'admin', password: 'password123', role: UserRole.ADMIN },
  { id: 'staff-1', name: 'ນາງແອ', username: 'ae', password: '123', role: UserRole.STAFF },
  { id: 'staff-2', name: 'ນາງ ເດືອນ', username: 'duan', password: '123', role: UserRole.STAFF },
  { id: 'staff-3', name: 'ນາງ ນ້ອຍ', username: 'noy', password: '123', role: UserRole.STAFF },
  { id: 'staff-4', name: 'ນາງມີ້', username: 'mee', password: '123', role: UserRole.STAFF },
  { id: 'staff-5', name: 'ປ້າໝັ້ນ', username: 'man', password: '123', role: UserRole.STAFF },
  { id: 'staff-6', name: 'ນ້າແອ໋', username: 'aeh', password: '123', role: UserRole.STAFF },
];

export const INITIAL_STORES: Store[] = [
  { id: 'store-1', name: 'ຮ້ານລ້ອງປໍ' },
  { id: 'store-2', name: 'ຮ້ານນາເລົາ' },
];

export const INITIAL_SHIFT_TYPES: ShiftType[] = [
  { id: 'shift-1', name: 'ກະເຊົ້າ' },
  { id: 'shift-2', name: 'ກະຄ່ຳ' },
];

export const TRANSLATIONS = {
  appName: 'ລະບົບບັນທຶກການເງິນ',
  home: 'ໜ້າຫຼັກ',
  record: 'ບັນທຶກຂໍ້ມູນ',
  login: 'ເຂົ້າສູ່ລະບົບ',
  username: 'ຊື່ຜູ້ໃຊ້',
  password: 'ລະຫັດຜ່ານ',
  logout: 'ອອກຈາກລະບົບ',
  save: 'ບັນທຶກ',
  cancel: 'ຍົກເລີກ',
  add: 'ເພີ່ມ',
  delete: 'ລຶບ',
  edit: 'ແກ້ໄຂ',
  date: 'ວັນທີ',
  store: 'ຮ້ານຄ້າ',
  staff: 'ພະນັກງານ',
  shift: 'ປະເພດກະ',
  totalRevenue: 'ລາຍໄດ້ລວມໃນລະບົບ',
  transferAmount: 'ຍອດເງິນທີ່ໂອນ',
  expectedCash: 'ເງິນສົດຈິງ (ຕາມລະບົບ)',
  actualCashInDrawer: 'ຈຳນວນເງິນສົດໃນລິ້ນຊັກ',
  difference: 'ສ່ວນຕ່າງ',
  expenses: 'ຄ່າໃຊ້ຈ່າຍ',
  finalBalance: 'ຍອດຄົງເຫຼືອຈິງ',
  adminPanel: 'ຈັດການລະບົບ',
  reports: 'ລາຍງານ',
  dashboard: 'ໜ້າຫຼັກ',
  profile: 'ຂໍ້ມູນສ່ວນຕົວ',
  changePassword: 'ປ່ຽນລະຫັດຜ່ານ',
  currency: 'ກີບ',
  newExpense: 'ເພີ່ມຄ່າໃຊ້ຈ່າຍໃໝ່',
  expenseDescription: 'ລາຍລະອຽດຄ່າໃຊ້ຈ່າຍ',
  expenseAmount: 'ຈຳນວນເງິນ',
  attachImage: 'ແນບຮູບຫຼັກຖານ',
  confirmDelete: 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບ?',
  summary: 'ສະຫຼຸບລາຍງານ',
  startDate: 'ວັນທີເລີ່ມຕົ້ນ',
  endDate: 'ວັນທີສິ້ນສຸດ',
  filter: 'ກັ່ນຕອງ',
  total: 'ລວມທັງໝົດ',
  netProfit: 'ກຳໄລສຸດທິ',
  overallSummary: 'ສະຫຼຸບຜົນລວມທັງໝົດ',
  recentEntries: 'ລາຍການຫຼ້າສຸດ',
  performanceByStore: 'ຜົນງານແຍກຕາມຮ້ານ',
  verification: 'ກວດສອບຂໍ້ມູນ',
  status: 'ສະຖານະ',
  pending: 'ລໍຖ້າກວດສອບ',
  verified: 'ກວດສອບແລ້ວ',
  approve: 'ຢືນຢັນຄວາມຖືກຕ້ອງ',
  waitReview: 'ລໍຖ້າ Admin ກວດສອບ'
};
