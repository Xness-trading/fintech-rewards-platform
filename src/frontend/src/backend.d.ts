import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AdminOverview {
    pendingPayments: bigint;
    totalPaymentAmount: bigint;
    pendingWithdrawals: bigint;
    verifiedPayments: bigint;
    totalReferralRewards: bigint;
    totalUsers: bigint;
    totalWithdrawals: bigint;
    activeMemberships: bigint;
}
export interface AdminSettings {
    paymentQrImage?: FileRef;
    minWithdrawalAmount: bigint;
    companyUpiId: string;
}
export interface AdminSettingsUpdate {
    paymentQrImage?: FileRef;
    minWithdrawalAmount: bigint;
    companyUpiId: string;
}
export interface BankDetails {
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
}
export interface BankWithdrawalInput {
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    amount: bigint;
}
export interface Cell {
    value: Value;
    name: string;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export type FileRef = Uint8Array;
export type Id = bigint;
export interface MembershipPlan {
    id: Id;
    name: string;
    popular: boolean;
    validityDays: bigint;
    rewardDetails: string;
    benefits: Array<string>;
    price: bigint;
}
export interface NotificationView {
    id: Id;
    title: string;
    body: string;
    kind: NotificationKind;
    createdAt: Timestamp;
    read: boolean;
}
export interface PaymentInput {
    utr: string;
    planId: Id;
    screenshot?: FileRef;
}
export type PaymentResult = {
    __kind__: "ok";
    ok: PaymentView;
} | {
    __kind__: "err";
    err: string;
};
export interface PaymentView {
    id: Id;
    utr: string;
    status: PaymentStatus;
    planId: Id;
    user: Principal;
    rejectionReason?: string;
    submittedAt: Timestamp;
    reviewedAt?: Timestamp;
    amount: bigint;
    screenshot?: FileRef;
    planName: string;
}
export interface PlanUpdate {
    validityDays: bigint;
    rewardDetails: string;
    benefits: Array<string>;
}
export interface ProfileUpdate {
    fullName: string;
    profilePicture?: FileRef;
}
export interface ReferralSummary {
    totalRewardEarned: bigint;
    referralCode: string;
    referralLink: string;
    successfulReferrals: bigint;
    totalReferrals: bigint;
    pendingReferrals: bigint;
}
export interface ReferralView {
    id: Id;
    status: ReferralStatus;
    referred: Principal;
    referrer: Principal;
    rewardAmount: bigint;
    createdAt: Timestamp;
    rewardedAt?: Timestamp;
}
export interface RegistrationInput {
    referralCode?: string;
    fullName: string;
    email: string;
    mobile: string;
}
export type RegistrationResult = {
    __kind__: "ok";
    ok: UserProfileView;
} | {
    __kind__: "err";
    err: string;
};
export interface ReportRow {
    payments: bigint;
    period: string;
    withdrawalAmount: bigint;
    withdrawals: bigint;
    newUsers: bigint;
    paymentAmount: bigint;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface SupportTicketView {
    id: Id;
    status: TicketStatus;
    subject: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    message: string;
}
export interface TicketInput {
    subject: string;
    message: string;
}
export type Timestamp = bigint;
export interface UpiDetails {
    accountHolderName: string;
    upiId: string;
}
export interface UpiWithdrawalInput {
    accountHolderName: string;
    upiId: string;
    amount: bigint;
}
export interface UserProfileView {
    principal: Principal;
    referralCode: string;
    emailVerified: boolean;
    blocked: boolean;
    fullName: string;
    mobileVerified: boolean;
    email: string;
    referredBy?: string;
    mobile: string;
    profilePicture?: FileRef;
    registeredAt: Timestamp;
}
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export interface WalletSummary {
    availableBalance: bigint;
    pendingRewards: bigint;
    totalRewards: bigint;
    referralRewards: bigint;
    totalWithdrawals: bigint;
    withdrawableBalance: bigint;
}
export interface WalletTransactionView {
    id: Id;
    status: TransactionStatus;
    kind: TransactionKind;
    createdAt: Timestamp;
    reference?: string;
    txType: TransactionType;
    amount: bigint;
}
export type WithdrawalResult = {
    __kind__: "ok";
    ok: WithdrawalView;
} | {
    __kind__: "err";
    err: string;
};
export interface WithdrawalView {
    id: Id;
    upi?: UpiDetails;
    status: WithdrawalStatus;
    method: WithdrawalMethod;
    bank?: BankDetails;
    rejectionReason?: string;
    reviewedAt?: Timestamp;
    paymentReference?: string;
    amount: bigint;
    requestedAt: Timestamp;
}
export enum NotificationKind {
    withdrawalApproved = "withdrawalApproved",
    registration = "registration",
    withdrawalRejected = "withdrawalRejected",
    rewardCredited = "rewardCredited",
    paymentApproved = "paymentApproved",
    paymentRejected = "paymentRejected",
    paymentSubmitted = "paymentSubmitted",
    membershipActivated = "membershipActivated",
    membershipExpiring = "membershipExpiring",
    referralSuccessful = "referralSuccessful",
    verification = "verification",
    withdrawalCompleted = "withdrawalCompleted"
}
export enum PaymentStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum ReferralStatus {
    pending = "pending",
    rewarded = "rewarded",
    eligible = "eligible",
    rejected = "rejected"
}
export enum TicketStatus {
    resolved = "resolved",
    closed = "closed",
    open = "open",
    inProgress = "inProgress"
}
export enum TransactionKind {
    credit = "credit",
    debit = "debit"
}
export enum TransactionStatus {
    pending = "pending",
    completed = "completed",
    failed = "failed"
}
export enum TransactionType {
    reward = "reward",
    referral = "referral",
    withdrawal = "withdrawal",
    payment = "payment"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum WithdrawalMethod {
    upi = "upi",
    bank = "bank"
}
export enum WithdrawalStatus {
    pending = "pending",
    completed = "completed",
    approved = "approved",
    rejected = "rejected"
}
export interface backendInterface {
    /**
     * / Admin: approve a payment and activate the membership.
     */
    adminApprovePayment(paymentId: Id): Promise<PaymentView | null>;
    /**
     * / Admin: approve and credit a referral reward.
     */
    adminApproveReferralReward(referralId: Id): Promise<ReferralView | null>;
    /**
     * / Admin: approve a withdrawal request.
     */
    adminApproveWithdrawal(withdrawalId: Id): Promise<WithdrawalView | null>;
    /**
     * / Admin: daily report rows.
     */
    adminDailyReport(): Promise<Array<ReportRow>>;
    /**
     * / Admin: export report rows as CSV.
     */
    adminExportReportCsv(): Promise<string>;
    /**
     * / Admin: read the overview metrics.
     */
    adminGetOverview(): Promise<AdminOverview>;
    /**
     * / Admin: read one user's profile.
     */
    adminGetUser(user: Principal): Promise<UserProfileView | null>;
    /**
     * / Admin: list every payment submission.
     */
    adminListPayments(): Promise<Array<PaymentView>>;
    /**
     * / Admin: list every referral record.
     */
    adminListReferrals(): Promise<Array<ReferralView>>;
    /**
     * / Admin: list every support ticket.
     */
    adminListSupportTickets(): Promise<Array<SupportTicketView>>;
    /**
     * / Admin: list every registered user.
     */
    adminListUsers(): Promise<Array<UserProfileView>>;
    /**
     * / Admin: list every withdrawal request.
     */
    adminListWithdrawals(): Promise<Array<WithdrawalView>>;
    /**
     * / Admin: mark a referral eligible.
     */
    adminMarkReferralEligible(referralId: Id): Promise<ReferralView | null>;
    /**
     * / Admin: mark an approved withdrawal as paid.
     */
    adminMarkWithdrawalPaid(withdrawalId: Id, reference: string): Promise<WithdrawalView | null>;
    /**
     * / Admin: monthly report rows.
     */
    adminMonthlyReport(): Promise<Array<ReportRow>>;
    /**
     * / Admin: reject a payment with a reason.
     */
    adminRejectPayment(paymentId: Id, reason: string): Promise<PaymentView | null>;
    /**
     * / Admin: reject a referral record.
     */
    adminRejectReferral(referralId: Id): Promise<ReferralView | null>;
    /**
     * / Admin: reject a withdrawal request with a reason.
     */
    adminRejectWithdrawal(withdrawalId: Id, reason: string): Promise<WithdrawalView | null>;
    /**
     * / Admin: search users by name, email or mobile.
     */
    adminSearchUsers(term: string): Promise<Array<UserProfileView>>;
    /**
     * / Admin: update a support ticket's status.
     */
    adminSetTicketStatus(ticketId: Id, status: TicketStatus): Promise<SupportTicketView | null>;
    /**
     * / Admin: block or unblock a user.
     */
    adminSetUserBlocked(user: Principal, blocked: boolean): Promise<boolean>;
    /**
     * / Admin: edit a plan's benefits, reward details and validity.
     */
    adminUpdatePlan(planId: Id, update: PlanUpdate): Promise<MembershipPlan | null>;
    /**
     * / Admin: update the platform settings.
     */
    adminUpdateSettings(update: AdminSettingsUpdate): Promise<AdminSettings>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    execute(qJson: string): Promise<Result>;
    /**
     * / Read the platform settings (company UPI id, QR image, minimum withdrawal).
     */
    getAdminSettings(): Promise<AdminSettings>;
    getApiDoc(): Promise<string>;
    /**
     * / Read the caller's own profile.
     */
    getCallerProfile(): Promise<UserProfileView | null>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Read one plan by id.
     */
    getPlan(planId: Id): Promise<MembershipPlan | null>;
    /**
     * / Read the caller's referral summary.
     */
    getReferralSummary(): Promise<ReferralSummary>;
    /**
     * / Count the caller's unread notifications.
     */
    getUnreadNotificationCount(): Promise<bigint>;
    /**
     * / Read the caller's wallet balances.
     */
    getWalletSummary(): Promise<WalletSummary>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Whether the caller's email is verified.
     */
    isCallerEmailVerified(): Promise<boolean>;
    /**
     * / Whether the caller's mobile is verified.
     */
    isCallerMobileVerified(): Promise<boolean>;
    /**
     * / List the caller's notifications.
     */
    listMyNotifications(): Promise<Array<NotificationView>>;
    /**
     * / List the caller's own payment submissions.
     */
    listMyPayments(): Promise<Array<PaymentView>>;
    /**
     * / List the caller's referral records.
     */
    listMyReferrals(): Promise<Array<ReferralView>>;
    /**
     * / List the caller's own support tickets.
     */
    listMySupportTickets(): Promise<Array<SupportTicketView>>;
    /**
     * / List the caller's wallet ledger entries.
     */
    listMyTransactions(): Promise<Array<WalletTransactionView>>;
    /**
     * / List the caller's own withdrawal requests.
     */
    listMyWithdrawals(): Promise<Array<WithdrawalView>>;
    /**
     * / List the seven fixed membership plans.
     */
    listPlans(): Promise<Array<MembershipPlan>>;
    /**
     * / Mark all of the caller's notifications read.
     */
    markAllNotificationsRead(): Promise<void>;
    /**
     * / Mark one of the caller's notifications read.
     */
    markNotificationRead(notificationId: Id): Promise<boolean>;
    /**
     * / Register the caller's profile. Requires a signed-in caller.
     */
    registerUser(input: RegistrationInput): Promise<RegistrationResult>;
    /**
     * / Request a bank withdrawal.
     */
    requestBankWithdrawal(input: BankWithdrawalInput): Promise<WithdrawalResult>;
    /**
     * / Request a UPI withdrawal.
     */
    requestUpiWithdrawal(input: UpiWithdrawalInput): Promise<WithdrawalResult>;
    schema(): Promise<string>;
    /**
     * / Submit a manual UPI payment for a plan.
     */
    submitPayment(input: PaymentInput): Promise<PaymentResult>;
    /**
     * / Submit a support ticket.
     */
    submitSupportTicket(input: TicketInput): Promise<SupportTicketView>;
    /**
     * / Update the caller's editable profile fields.
     */
    updateCallerProfile(update: ProfileUpdate): Promise<UserProfileView | null>;
}
