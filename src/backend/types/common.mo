import Storage "mo:caffeineai-object-storage/Storage";

module {
  /// Signed nanosecond timestamp (Time.now()).
  public type Timestamp = Int;

  /// Monotonic identifier for records created by the app.
  public type Id = Nat;

  /// A user's principal — the only identity the backend trusts.
  public type UserId = Principal;

  /// External file reference (profile picture, payment screenshot).
  public type FileRef = Storage.ExternalBlob;

  /// Lifecycle of a manual UPI payment submission.
  public type PaymentStatus = {
    #pending;
    #approved;
    #rejected;
  };

  /// Lifecycle of a withdrawal request.
  public type WithdrawalStatus = {
    #pending;
    #approved;
    #rejected;
    #completed;
  };

  /// Direction of a wallet ledger entry.
  public type TransactionKind = {
    #credit;
    #debit;
  };

  /// Category of a wallet ledger entry.
  public type TransactionType = {
    #payment;
    #reward;
    #referral;
    #withdrawal;
  };

  /// Lifecycle of a wallet ledger entry.
  public type TransactionStatus = {
    #pending;
    #completed;
    #failed;
  };

  /// Lifecycle of a referral record.
  public type ReferralStatus = {
    #pending;
    #eligible;
    #rewarded;
    #rejected;
  };

  /// Withdrawal destination method.
  public type WithdrawalMethod = {
    #upi;
    #bank;
  };

  /// Category of a user notification.
  public type NotificationKind = {
    #registration;
    #verification;
    #paymentSubmitted;
    #paymentApproved;
    #paymentRejected;
    #membershipActivated;
    #membershipExpiring;
    #rewardCredited;
    #referralSuccessful;
    #withdrawalApproved;
    #withdrawalRejected;
    #withdrawalCompleted;
  };

  /// Lifecycle of a support ticket.
  public type TicketStatus = {
    #open;
    #inProgress;
    #resolved;
    #closed;
  };
};
