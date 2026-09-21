export interface User {
  id: number
  email: string
  roleId: number
  roleName: string
  permissions: string[]
  fullName: string | null
  tenantId: number
  tenantName: string
  hasLogo?: boolean
  isPlatformManager?: boolean
}

export interface UserListItem {
  id: number
  email: string
  roleId: number
  roleName: string
  fullName: string | null
  isActive: boolean
  createdAt: string
}

export interface Role {
  id: number
  name: string
  isSystem: boolean
  permissions: string[]
}

export interface PermissionItem {
  key: string
  name: string
  group: string
}

export interface PermissionGroup {
  group: string
  permissions: PermissionItem[]
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Client {
  id: number
  name: string
  cnic: string | null
  phone: string | null
  address: string | null
  fatherHusband: string | null
  caste: string | null
  notes: string | null
  hasPicture: boolean
  createdAt: string
}

export interface ClientRequest {
  name: string
  cnic?: string | null
  phone?: string | null
  address?: string | null
  fatherHusband?: string | null
  caste?: string | null
  notes?: string | null
}

export interface Property {
  id: number
  propertyNumber: string
  propertyType: string
  marla: number | null
  lengthFeet: number | null
  widthFeet: number | null
  totalPrice: number
  bookingDate: string | null
  status: string
  clientId: number | null
  notes: string | null
  createdAt: string
  client?: Client | null
}

export interface PropertyRequest {
  propertyNumber: string
  propertyType: string
  marla?: number | null
  lengthFeet?: number | null
  widthFeet?: number | null
  totalPrice: number
  bookingDate?: string | null
  status: string
  clientId?: number | null
  notes?: string | null
}

export interface Payment {
  id: number
  receiptNo: string | null
  clientId: number | null
  propertyId: number | null
  amount: number
  paymentDate: string
  notes: string | null
  createdAt: string
  client?: Client | null
  property?: Property | null
}

export interface PaymentRequest {
  receiptNo?: string | null
  clientId?: number | null
  propertyId?: number | null
  amount: number
  paymentDate: string
  notes?: string | null
  paymentMethod?: 'full' | 'installment'
  installmentSchedule?: InstallmentScheduleItem[]
  installmentDueId?: number | null
  planFrequency?: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | null
}

export interface InstallmentScheduleItem {
  dueDate: string
  amount: number
}

export interface PaymentLedgerRow {
  id: number
  rowType: 'payment' | 'installment'
  status: 'received' | 'pending' | 'overdue'
  receiptNo: string | null
  clientId: number | null
  propertyId: number | null
  amount: number
  date: string
  notes: string | null
  paymentId: number | null
  planFrequency: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | null
  client?: Client | null
  property?: Property | null
}

export interface PaymentClientSummary {
  clientId: number
  client: Client
  propertyNumbers: string[]
  totalPlotAmount: number
  totalReceived: number
  pendingAmount: number
  lastPaymentDate: string
}

export interface PendingInstallment {
  id: number
  date: string | null
  propertyId: number | null
  property: Property | null
  amount: number
  status: 'pending' | 'overdue'
}

export interface PaymentClientDetail {
  client: Client
  payments: Payment[]
  pendingInstallments: PendingInstallment[]
  totalAmount: number
  totalReceived: number
  totalPending: number
  planFrequencies: ('monthly' | 'quarterly' | 'half-yearly' | 'yearly')[]
}

export interface Expense {
  id: number
  description: string
  amount: number
  paidTo: string | null
  expenseDate: string
  notes: string | null
  createdAt: string
}

export interface ExpenseRequest {
  description: string
  amount: number
  paidTo?: string | null
  expenseDate: string
  notes?: string | null
}

export interface DashboardStats {
  totalPlots: number
  totalShops: number
  totalSales: number
  totalReceived: number
  totalExpenses: number
  totalProperties: number
  totalPropertyValue: number
  totalOutstanding: number
}

export interface RegisterRequest {
  tenantName: string
  email: string
  password: string
  fullName?: string
  phone?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface CreateUserRequest {
  email: string
  password: string
  roleId: number
  fullName?: string
}

export interface SocietyOverview {
  id: number
  name: string
  phone: string | null
  createdAt: string
  userCount: number
  isActive: boolean
  adminUserId: number | null
  adminEmail: string | null
}

export interface SocietiesOverview {
  totalCount: number
  societies: SocietyOverview[]
}
