import { createActor } from "@/backend";
import type {
  AdminSettingsUpdate,
  BankWithdrawalInput,
  Id,
  PaymentInput,
  PlanUpdate,
  ProfileUpdate,
  RegistrationInput,
  TicketInput,
  TicketStatus,
  UpiWithdrawalInput,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/* ------------------------------------------------------------------ */
/* Query keys                                                          */
/* ------------------------------------------------------------------ */

export const queryKeys = {
  profile: ["profile"] as const,
  role: ["role"] as const,
  plans: ["plans"] as const,
  plan: (id: Id) => ["plan", id.toString()] as const,
  myPayments: ["payments", "mine"] as const,
  wallet: ["wallet"] as const,
  transactions: ["transactions"] as const,
  referralSummary: ["referral", "summary"] as const,
  myReferrals: ["referral", "mine"] as const,
  myWithdrawals: ["withdrawals", "mine"] as const,
  notifications: ["notifications"] as const,
  unreadCount: ["notifications", "unread"] as const,
  myTickets: ["support", "mine"] as const,
  adminSettings: ["admin", "settings"] as const,
  adminOverview: ["admin", "overview"] as const,
  adminUsers: ["admin", "users"] as const,
  adminPayments: ["admin", "payments"] as const,
  adminReferrals: ["admin", "referrals"] as const,
  adminWithdrawals: ["admin", "withdrawals"] as const,
  adminTickets: ["admin", "tickets"] as const,
  adminDaily: ["admin", "report", "daily"] as const,
  adminMonthly: ["admin", "report", "monthly"] as const,
};

/* ------------------------------------------------------------------ */
/* Profile & role                                                      */
/* ------------------------------------------------------------------ */

export function useCallerProfile() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerRole() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.role,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterUser() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RegistrationInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.registerUser(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

export function useUpdateProfile() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (update: ProfileUpdate) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateCallerProfile(update);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Plans                                                               */
/* ------------------------------------------------------------------ */

export function usePlans() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.plans,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPlans();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlan(id: Id | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.plan(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      return actor.getPlan(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

/* ------------------------------------------------------------------ */
/* Payments                                                            */
/* ------------------------------------------------------------------ */

export function useMyPayments() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.myPayments,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMyPayments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitPayment() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: PaymentInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.submitPayment(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myPayments });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      void queryClient.invalidateQueries({ queryKey: queryKeys.unreadCount });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Wallet & transactions                                               */
/* ------------------------------------------------------------------ */

export function useWalletSummary() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.wallet,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getWalletSummary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyTransactions() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.transactions,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMyTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

/* ------------------------------------------------------------------ */
/* Referrals                                                           */
/* ------------------------------------------------------------------ */

export function useReferralSummary() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.referralSummary,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getReferralSummary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyReferrals() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.myReferrals,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMyReferrals();
    },
    enabled: !!actor && !isFetching,
  });
}

/* ------------------------------------------------------------------ */
/* Withdrawals                                                         */
/* ------------------------------------------------------------------ */

export function useMyWithdrawals() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.myWithdrawals,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMyWithdrawals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRequestUpiWithdrawal() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpiWithdrawalInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.requestUpiWithdrawal(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myWithdrawals });
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallet });
      void queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    },
  });
}

export function useRequestBankWithdrawal() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: BankWithdrawalInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.requestBankWithdrawal(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myWithdrawals });
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallet });
      void queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export function useMyNotifications() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMyNotifications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUnreadNotificationCount() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.unreadCount,
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.getUnreadNotificationCount();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMarkNotificationRead() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: Id) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.markNotificationRead(notificationId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      void queryClient.invalidateQueries({ queryKey: queryKeys.unreadCount });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.markAllNotificationsRead();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      void queryClient.invalidateQueries({ queryKey: queryKeys.unreadCount });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Support                                                             */
/* ------------------------------------------------------------------ */

export function useMySupportTickets() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.myTickets,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMySupportTickets();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitSupportTicket() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: TicketInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.submitSupportTicket(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myTickets });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

export function useAdminSettings() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.adminSettings,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAdminSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminUpdateSettings() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (update: AdminSettingsUpdate) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.adminUpdateSettings(update);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminSettings });
    },
  });
}

export function useAdminOverview() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.adminOverview,
    queryFn: async () => {
      if (!actor) return null;
      return actor.adminGetOverview();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminUsers() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.adminUsers,
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminSearchUsers(term: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: [...queryKeys.adminUsers, "search", term] as const,
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminSearchUsers(term);
    },
    enabled: !!actor && !isFetching && term.trim().length > 0,
  });
}

export function useAdminSetUserBlocked() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { user: Principal; blocked: boolean }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.adminSetUserBlocked(vars.user, vars.blocked);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
    },
  });
}

export function useAdminPayments() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.adminPayments,
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListPayments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminApprovePayment() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (paymentId: Id) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.adminApprovePayment(paymentId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminPayments });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminOverview });
    },
  });
}

export function useAdminRejectPayment() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { paymentId: Id; reason: string }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.adminRejectPayment(vars.paymentId, vars.reason);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminPayments });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminOverview });
    },
  });
}

export function useAdminReferrals() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.adminReferrals,
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListReferrals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminMarkReferralEligible() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (referralId: Id) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.adminMarkReferralEligible(referralId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.adminReferrals,
      });
    },
  });
}

export function useAdminApproveReferralReward() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (referralId: Id) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.adminApproveReferralReward(referralId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.adminReferrals,
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminOverview });
    },
  });
}

export function useAdminRejectReferral() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (referralId: Id) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.adminRejectReferral(referralId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.adminReferrals,
      });
    },
  });
}

export function useAdminWithdrawals() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.adminWithdrawals,
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListWithdrawals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminApproveWithdrawal() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (withdrawalId: Id) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.adminApproveWithdrawal(withdrawalId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.adminWithdrawals,
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminOverview });
    },
  });
}

export function useAdminRejectWithdrawal() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { withdrawalId: Id; reason: string }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.adminRejectWithdrawal(vars.withdrawalId, vars.reason);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.adminWithdrawals,
      });
    },
  });
}

export function useAdminMarkWithdrawalPaid() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { withdrawalId: Id; reference: string }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.adminMarkWithdrawalPaid(vars.withdrawalId, vars.reference);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.adminWithdrawals,
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminOverview });
    },
  });
}

export function useAdminTickets() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.adminTickets,
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListSupportTickets();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminSetTicketStatus() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { ticketId: Id; status: TicketStatus }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.adminSetTicketStatus(vars.ticketId, vars.status);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminTickets });
    },
  });
}

export function useAdminUpdatePlan() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { planId: Id; update: PlanUpdate }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.adminUpdatePlan(vars.planId, vars.update);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.plans });
    },
  });
}

export function useAdminDailyReport() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.adminDaily,
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminDailyReport();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminMonthlyReport() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.adminMonthly,
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminMonthlyReport();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminExportReportCsv() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.adminExportReportCsv();
    },
  });
}
