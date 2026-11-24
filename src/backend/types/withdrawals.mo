import Common "common";

module {
  /// UPI withdrawal destination details.
  public type UpiDetails = {
    upiId : Text;
    accountHolderName : Text;
  };

  /// Bank withdrawal destination details.
  public type BankDetails = {
    accountHolderName : Text;
    bankName : Text;
    accountNumber : Text;
    ifscCode : Text;
  };

  /// A withdrawal request awaiting admin review.
  public type WithdrawalRequest = {
    id : Common.Id;
    user : Principal;
    method : Common.WithdrawalMethod;
    upi : ?UpiDetails;
    bank : ?BankDetails;
    amount : Nat;
    status : Common.WithdrawalStatus;
    rejectionReason : ?Text;
    paymentReference : ?Text;
    requestedAt : Common.Timestamp;
    reviewedAt : ?Common.Timestamp;
  };

  /// Public view of a withdrawal request.
  public type WithdrawalView = {
    id : Common.Id;
    method : Common.WithdrawalMethod;
    upi : ?UpiDetails;
    bank : ?BankDetails;
    amount : Nat;
    status : Common.WithdrawalStatus;
    rejectionReason : ?Text;
    paymentReference : ?Text;
    requestedAt : Common.Timestamp;
    reviewedAt : ?Common.Timestamp;
  };

  /// Input for a UPI withdrawal request.
  public type UpiWithdrawalInput = {
    upiId : Text;
    accountHolderName : Text;
    amount : Nat;
  };

  /// Input for a bank withdrawal request.
  public type BankWithdrawalInput = {
    accountHolderName : Text;
    bankName : Text;
    accountNumber : Text;
    ifscCode : Text;
    amount : Nat;
  };

  /// Result of a withdrawal request.
  public type WithdrawalResult = {
    #ok : WithdrawalView;
    #err : Text;
  };
};
