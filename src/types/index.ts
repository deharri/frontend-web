// ── Auth ──────────────────────────────────────────────────────────────
export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  token: string;
}

export interface JwtPayload {
  sub: string;
  userId: string;
  roles: string[];
  iat: number;
  exp: number;
}

// ── Agency ────────────────────────────────────────────────────────────
export type AgencySubscriptionStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';

export interface AgencyProfile {
  agencyId: string;
  agencyName: string;
  description: string | null;
  contactNumber: string | null;
  contactEmail: string | null;
  city: string;
  address: string | null;
  serviceCities: string[];
  licenseNumber: string | null;
  licensePath: string | null;
  verificationStatus: string;
  subscriptionStatus: AgencySubscriptionStatus;
  subscriptionStartedAt: string | null;
  subscriptionExpiresAt: string | null;
  subscriptionActive: boolean;
  averageRating: number;
  totalJobsCompleted: number;
  totalWorkers: number;
}

// ── Subscription payment ──────────────────────────────────────────────
export interface PayAgencySubscriptionRequest {
  agencyId: string;
  paymentMethod: 'MOCK_CARD' | 'MOCK_BANK' | 'MOCK_WALLET';
  maskedDetails: string;
}

// ── App-wide ──────────────────────────────────────────────────────────
export interface ResponseMessage {
  message: string;
}

// ── Worker (list view) ────────────────────────────────────────────────
export interface WorkerListItem {
  workerId: string;
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string | null;
  workerType: string;
  workerTypeDisplayName: string;
  experienceYears: number;
  hourlyRate: number;
  city: string;
  cityDisplayName: string;
  area: string | null;
  averageRating: number;
  totalJobsCompleted: number;
  isVerified: boolean;
  agencyName: string | null;
  availabilityStatus: string;
}

// ── Agency update ─────────────────────────────────────────────────────
export interface UpdateAgency {
  agencyName?: string;
  description?: string;
  contactNumber?: string;
  contactEmail?: string;
  city?: string;
  address?: string;
  serviceCities?: string[];
  licenseNumber?: string;
}

// ── Membership history ────────────────────────────────────────────────
export type AgencyMembershipStatus = 'ACTIVE' | 'LEFT' | 'REMOVED';

export interface AgencyMembershipHistoryItem {
  memberId: string;
  userId: string;
  workerId: string | null;
  username: string;
  firstName: string;
  lastName: string;
  workerType: string | null;
  membershipStatus: AgencyMembershipStatus;
  joinedAt: string;
  leftAt: string | null;
}

// ── Agency outgoing invitations ──────────────────────────────────────
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface AgencySentInvitation {
  invitationId: string;
  workerId: string;
  workerUserId: string;
  workerUsername: string;
  workerFirstName: string;
  workerLastName: string;
  workerType: string | null;
  status: InvitationStatus;
  createdAt: string;
  respondedAt: string | null;
}

// ── Disputes ──────────────────────────────────────────────────────────
export type DisputeCategory = 'PAYMENT' | 'NO_SHOW' | 'QUALITY' | 'BEHAVIOR' | 'OTHER';
export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
export type DisputeRaisedByRole = 'CONSUMER' | 'WORKER';

export interface Dispute {
  disputeId: string;
  jobId: string;
  raisedBy: string;
  raisedByRole: DisputeRaisedByRole;
  category: DisputeCategory;
  subject: string;
  description: string;
  status: DisputeStatus;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Jobs ──────────────────────────────────────────────────────────────
export type JobStatus = 'DRAFT' | 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
export type BudgetType = 'FIXED' | 'HOURLY' | 'DAILY' | 'NEGOTIABLE';
export type UrgencyLevel = 'EMERGENCY' | 'URGENT' | 'NORMAL' | 'FLEXIBLE';

export interface JobListingSummaryResponse {
  jobId: string;
  title: string;
  workerType: string;
  workerTypeDisplayName: string;
  city: string;
  cityDisplayName: string;
  area: string | null;
  budgetMin: number;
  budgetMax: number;
  budgetType: BudgetType;
  urgency: UrgencyLevel;
  status: JobStatus;
  bidCount: number;
  consumerUsername: string;
  createdAt: string;
  expiresAt: string | null;
}

export interface JobListingResponse {
  jobId: string;
  consumerId: string;
  consumerUsername: string;
  consumerFirstName: string;
  consumerLastName: string;
  title: string;
  description: string;
  workerType: string;
  workerTypeDisplayName: string;
  budgetMin: number;
  budgetMax: number;
  budgetType: BudgetType;
  city: string;
  cityDisplayName: string;
  area: string | null;
  latitude: number | null;
  longitude: number | null;
  urgency: UrgencyLevel;
  status: JobStatus;
  bidCount: number;
  assignedBidId: string | null;
  assignedAt: string | null;
  assignedWorkerId: string | null;
  assignedWorkerUsername: string | null;
  assignedAgencyId: string | null;
  assignedAgencyName: string | null;
  dispatchedWorkerId: string | null;
  dispatchedWorkerUsername: string | null;
  startedAt: string | null;
  completedAt: string | null;
  consumerConfirmedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
}

export interface JobListingListResponse {
  listings: JobListingSummaryResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// ── Bids ──────────────────────────────────────────────────────────────
export type BidStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export interface BidResponse {
  bidId: string;
  jobId: string;
  workerId: string | null;
  workerUsername: string | null;
  workerFirstName: string | null;
  workerLastName: string | null;
  workerWorkerType: string | null;
  workerExperienceYears: number | null;
  workerRating: number | null;
  agencyId: string | null;
  agencyName: string | null;
  proposedAmount: number;
  proposedRateType: BudgetType;
  coverMessage: string;
  estimatedDays: number;
  proposedStartDate: string | null;
  status: BidStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BidListResponse {
  bids: BidResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// ── Payments (per-job transactions) ──────────────────────────────────
export type PaymentMethod = 'MOCK_CARD' | 'MOCK_BANK' | 'MOCK_WALLET';
export type TransactionStatus = 'PENDING' | 'HELD' | 'RELEASED' | 'REFUNDED' | 'FAILED' | 'CANCELLED';

export interface PaymentTransaction {
  transactionId: string;
  jobId: string;
  consumerId: string;
  workerId: string | null;
  agencyId: string | null;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  failureReason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Analytics ─────────────────────────────────────────────────────────
export type Granularity = 'day' | 'week' | 'month';

export interface JobStatusCount {
  status: JobStatus;
  count: number;
}

export interface TimeSeriesBucket {
  bucket: string; // ISO timestamp
  count: number;
}

export interface RevenueOverTimePoint {
  bucket: string;
  total: number;
}

export interface JobsByCityRow {
  city: string;
  count: number;
}

export interface JobsByWorkerTypeRow {
  workerType: string;
  count: number;
}

export interface JobsPerWorkerRow {
  workerUserId: string;
  workerUsername: string;
  count: number;
}

export interface JobsFunnel {
  bidsPlaced: number;
  bidsAccepted: number;
  dispatched: number;
  inProgress: number;
  completed: number;
}

export interface BidWinRate {
  won: number;
  pending: number;
  rejected: number;
  withdrawn: number;
  total: number;
  winRatePct: number;
}

export interface RevenueTotals {
  thisRange: number;
  prevRange: number;
  heldNow: number;
  growthPct: number;
}

// ── Notifications ─────────────────────────────────────────────────────
export type NotificationKind =
  | 'BID_PLACED'
  | 'DISPUTE_OPENED'
  | 'JOB_DISPATCHED'
  | 'JOB_CONFIRMED'
  | 'JOB_CANCELLED'
  | 'PAYMENT_RELEASED'
  | 'PAYMENT_REFUNDED';

export interface AgencyNotification {
  notificationId: string;
  agencyId: string;
  kind: NotificationKind;
  jobId: string | null;
  title: string;
  body: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface UnreadSummary {
  unread: number;
}

export interface PageResponse<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
