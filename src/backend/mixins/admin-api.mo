import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/admin";
import Payments "../types/payments";
import Withdrawals "../types/withdrawals";
import Referrals "../types/referrals";
import Users "../types/users";
import Common "../types/common";
import AdminLib "../lib/admin";

mixin (
  accessControlState : AccessControl.AccessControlState,
  settings : { var value : Types.AdminSettings },
  profiles : Map.Map<Principal, Users.UserProfile>,
  payments : Map.Map<Common.Id, Payments.PaymentSubmission>,
  withdrawals : Map.Map<Common.Id, Withdrawals.WithdrawalRequest>,
  referrals : Map.Map<Common.Id, Referrals.ReferralRecord>,
  activeMemberships : { var value : Nat },
) {
  /// Whether the caller holds the admin role, without trapping for guests.
  func adminCallerIsAdmin(caller : Principal) : Bool {
    if (caller.isAnonymous()) { return false };
    switch (accessControlState.userRoles.get(caller)) {
      case (?#admin) { true };
      case (_) { false };
    };
  };

  /// Read the platform settings (company UPI id, QR image, minimum withdrawal).
  public query func getAdminSettings() : async Types.AdminSettings {
    settings.value;
  };

  /// Admin: update the platform settings.
  public shared ({ caller }) func adminUpdateSettings(update : Types.AdminSettingsUpdate) : async Types.AdminSettings {
    if (not adminCallerIsAdmin(caller)) { return settings.value };
    settings.value := {
      companyUpiId = update.companyUpiId;
      paymentQrImage = update.paymentQrImage;
      minWithdrawalAmount = update.minWithdrawalAmount;
    };
    settings.value;
  };

  /// Admin: read the overview metrics.
  public query ({ caller }) func adminGetOverview() : async Types.AdminOverview {
    if (not adminCallerIsAdmin(caller)) {
      return {
        totalUsers = 0;
        activeMemberships = 0;
        verifiedPayments = 0;
        totalPaymentAmount = 0;
        pendingPayments = 0;
        totalWithdrawals = 0;
        pendingWithdrawals = 0;
        totalReferralRewards = 0;
      };
    };
    AdminLib.overview(profiles, payments, withdrawals, referrals, activeMemberships.value);
  };

  /// Admin: daily report rows.
  public query ({ caller }) func adminDailyReport() : async [Types.ReportRow] {
    if (not adminCallerIsAdmin(caller)) { return [] };
    AdminLib.dailyReport(payments, withdrawals, profiles);
  };

  /// Admin: monthly report rows.
  public query ({ caller }) func adminMonthlyReport() : async [Types.ReportRow] {
    if (not adminCallerIsAdmin(caller)) { return [] };
    AdminLib.monthlyReport(payments, withdrawals, profiles);
  };

  /// Admin: export report rows as CSV.
  public query ({ caller }) func adminExportReportCsv() : async Text {
    if (not adminCallerIsAdmin(caller)) { return "" };
    AdminLib.toCsv(AdminLib.dailyReport(payments, withdrawals, profiles));
  };
};
