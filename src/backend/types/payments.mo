import Common "common";

module {
  /// A manual UPI payment submission awaiting admin verification.
  public type PaymentSubmission = {
    id : Common.Id;
    user : Principal;
    planId : Common.Id;
    planName : Text;
    amount : Nat;
    utr : Text;
    screenshot : ?Common.FileRef;
    status : Common.PaymentStatus;
    rejectionReason : ?Text;
    submittedAt : Common.Timestamp;
    reviewedAt : ?Common.Timestamp;
  };

  /// Public view of a payment submission.
  public type PaymentView = {
    id : Common.Id;
    user : Principal;
    planId : Common.Id;
    planName : Text;
    amount : Nat;
    utr : Text;
    screenshot : ?Common.FileRef;
    status : Common.PaymentStatus;
    rejectionReason : ?Text;
    submittedAt : Common.Timestamp;
    reviewedAt : ?Common.Timestamp;
  };

  /// Input for submitting a payment.
  public type PaymentInput = {
    planId : Common.Id;
    utr : Text;
    screenshot : ?Common.FileRef;
  };

  /// Result of a payment submission.
  public type PaymentResult = {
    #ok : PaymentView;
    #err : Text;
  };
};
