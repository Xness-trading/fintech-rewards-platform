import Common "common";

module {
  /// Platform-wide settings editable by an admin.
  public type AdminSettings = {
    companyUpiId : Text;
    paymentQrImage : ?Common.FileRef;
    minWithdrawalAmount : Nat;
  };

  /// Editable subset of admin settings.
  public type AdminSettingsUpdate = {
    companyUpiId : Text;
    paymentQrImage : ?Common.FileRef;
    minWithdrawalAmount : Nat;
  };

  /// Aggregate metrics for the admin overview.
  public type AdminOverview = {
    totalUsers : Nat;
    activeMemberships : Nat;
    verifiedPayments : Nat;
    totalPaymentAmount : Nat;
    pendingPayments : Nat;
    totalWithdrawals : Nat;
    pendingWithdrawals : Nat;
    totalReferralRewards : Nat;
  };

  /// A daily or monthly report row.
  public type ReportRow = {
    period : Text;
    payments : Nat;
    paymentAmount : Nat;
    withdrawals : Nat;
    withdrawalAmount : Nat;
    newUsers : Nat;
  };
};
