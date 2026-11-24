import Int "mo:core/Int";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "../types/wallet";
import Common "../types/common";

module {
  /// Saturating subtraction: never traps when `b > a`.
  func subSat(a : Nat, b : Nat) : Nat {
    if (a >= b) { a - b } else { 0 };
  };

  /// Append a credit ledger entry and return its id.
  public func credit(
    transactions : Map.Map<Common.Id, Types.WalletTransaction>,
    nextId : { var value : Nat },
    user : Principal,
    txType : Common.TransactionType,
    amount : Nat,
    status : Common.TransactionStatus,
    reference : ?Text,
    now : Common.Timestamp,
  ) : Common.Id {
    let id = nextId.value;
    nextId.value += 1;
    transactions.add(id, {
      id;
      user;
      kind = #credit;
      txType;
      amount;
      status;
      reference;
      createdAt = now;
    });
    id;
  };

  /// Append a debit ledger entry and return its id.
  public func debit(
    transactions : Map.Map<Common.Id, Types.WalletTransaction>,
    nextId : { var value : Nat },
    user : Principal,
    txType : Common.TransactionType,
    amount : Nat,
    status : Common.TransactionStatus,
    reference : ?Text,
    now : Common.Timestamp,
  ) : Common.Id {
    let id = nextId.value;
    nextId.value += 1;
    transactions.add(id, {
      id;
      user;
      kind = #debit;
      txType;
      amount;
      status;
      reference;
      createdAt = now;
    });
    id;
  };

  /// Update the status of every ledger entry carrying `reference`.
  public func setStatusByReference(
    transactions : Map.Map<Common.Id, Types.WalletTransaction>,
    reference : Text,
    status : Common.TransactionStatus,
  ) : () {
    let entries = transactions.entries().toArray();
    for ((id, tx) in entries.values()) {
      switch (tx.reference) {
        case (?r) {
          if (r == reference) {
            transactions.add(id, { tx with status });
          };
        };
        case null {};
      };
    };
  };

  /// List the caller's ledger entries, newest first.
  public func listOwn(
    transactions : Map.Map<Common.Id, Types.WalletTransaction>,
    caller : Principal,
  ) : [Types.WalletTransactionView] {
    let own = transactions.values().filter(func tx = tx.user == caller).toArray();
    let sorted = own.sort(func (a, b) = Int.compare(b.createdAt, a.createdAt));
    sorted.map(func tx = toView(tx));
  };

  /// Compute the caller's wallet summary from ledger entries.
  public func summary(
    transactions : Map.Map<Common.Id, Types.WalletTransaction>,
    caller : Principal,
  ) : Types.WalletSummary {
    var completedCredits = 0;
    var completedDebits = 0;
    var completedRewardCredits = 0;
    var referralCredits = 0;
    var pendingRewards = 0;
    var completedWithdrawals = 0;
    var pendingWithdrawals = 0;
    for (tx in transactions.values()) {
      if (tx.user == caller) {
        let isReward = tx.txType == #reward or tx.txType == #referral;
        switch (tx.kind) {
          case (#credit) {
            switch (tx.status) {
              case (#completed) {
                completedCredits += tx.amount;
                if (isReward) { completedRewardCredits += tx.amount };
                if (tx.txType == #referral) { referralCredits += tx.amount };
              };
              case (#pending) {
                if (isReward) { pendingRewards += tx.amount };
              };
              case (#failed) {};
            };
          };
          case (#debit) {
            switch (tx.status) {
              case (#completed) {
                completedDebits += tx.amount;
                if (tx.txType == #withdrawal) { completedWithdrawals += tx.amount };
              };
              case (#pending) {
                if (tx.txType == #withdrawal) { pendingWithdrawals += tx.amount };
              };
              case (#failed) {};
            };
          };
        };
      };
    };
    {
      availableBalance = subSat(completedCredits, completedDebits);
      withdrawableBalance = subSat(completedRewardCredits, completedWithdrawals + pendingWithdrawals);
      totalRewards = completedRewardCredits;
      referralRewards = referralCredits;
      pendingRewards;
      totalWithdrawals = completedWithdrawals;
    };
  };

  /// Convert a stored ledger entry into its public view.
  public func toView(tx : Types.WalletTransaction) : Types.WalletTransactionView {
    {
      id = tx.id;
      kind = tx.kind;
      txType = tx.txType;
      amount = tx.amount;
      status = tx.status;
      reference = tx.reference;
      createdAt = tx.createdAt;
    };
  };
};
