export interface User {
  id: string
  email: string
  roleId: string
  roleName: string
  permissions: string[]
  fullName: string | null
  tenantId: string
  tenantName: string
  hasLogo?: boolean
  isPlatformManager?: boolean
}

export interface UserListItem {
  id: string
  email: string
  roleId: string
  roleName: string
  fullName: string | null
  isActive: boolean
  createdAt: string
}

export interface Role {
  id: string
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
  id: string
  name: string
  cnic: string | null
  phone: string | null
  address: string | null
  fatherHusband: string | null
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
  notes?: string | null
}

export interface Property {
  id: string
  propertyNumber: string
  propertyType: string
  marla: number | null
  totalPrice: number
  bookingDate: string | null
  status: string
  clientId: string | null
  notes: string | null
  createdAt: string
  client?: Client | null
}

export interface PropertyRequest {
  propertyNumber: string
  propertyType: string
  marla?: number | null
  totalPrice: number
  bookingDate?: string | null
  status: string
  clientId?: string | null
  notes?: string | null
}

export interface Payment {
  id: string
  receiptNo: string | null
  clientId: string | null
  propertyId: string | null
  amount: number
  paymentDate: string
  notes: string | null
  createdAt: string
  client?: Client | null
  property?: Property | null
  amountLocked?: boolean
}

export interface PaymentRequest {
  receiptNo?: string | null
  clientId?: string | null
  propertyId?: string | null
  amount: number
  paymentDate: string
  notes?: string | null
  paymentMethod?: 'full' | 'installment'
  installmentSchedule?: InstallmentScheduleItem[]
  installmentDueId?: string | null
  planFrequency?: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | null
}

export interface InstallmentScheduleItem {
  dueDate: string
  amount: number
}

export interface PaymentLedgerRow {
  id: string
  rowType: 'payment' | 'installment'
  status: 'received' | 'pending' | 'overdue'
  receiptNo: string | null
  clientId: string | null
  propertyId: string | null
  amount: number
  date: string
  notes: string | null
  paymentId: string | null
  planFrequency: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | null
  client?: Client | null
  property?: Property | null
}

export interface Expense {
  id: string
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
  roleId: string
  fullName?: string
}

export interface SocietyOverview {
  id: string
  name: string
  phone: string | null
  createdAt: string
  userCount: number
}

export interface SocietiesOverview {
  totalCount: number
  societies: SocietyOverview[]
}
