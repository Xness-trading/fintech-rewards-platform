import Common "common";

module {
  /// A wallet ledger entry. Balances are derived from these, never set directly.
  public type WalletTransaction = {
    id : Common.Id;
    user : Principal;
    kind : Common.TransactionKind;
    txType : Common.TransactionType;
    amount : Nat;
    status : Common.TransactionStatus;
    reference : ?Text;
    createdAt : Common.Timestamp;
  };

  /// Public view of a wallet ledger entry.
  public type WalletTransactionView = {
    id : Common.Id;
    kind : Common.TransactionKind;
    txType : Common.TransactionType;
    amount : Nat;
    status : Common.TransactionStatus;
    reference : ?Text;
    createdAt : Common.Timestamp;
  };

  /// Aggregated wallet balances for the caller.
  public type WalletSummary = {
    availableBalance : Nat;
    withdrawableBalance : Nat;
    totalRewards : Nat;
    referralRewards : Nat;
    pendingRewards : Nat;
    totalWithdrawals : Nat;
  };
};
