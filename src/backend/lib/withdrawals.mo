import Int "mo:core/Int";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "../types/withdrawals";
import Common "../types/common";

module {
  /// Create a UPI withdrawal request in Pending state.
  public func requestUpi(
    withdrawals : Map.Map<Common.Id, Types.WithdrawalRequest>,
    nextId : { var value : Nat },
    caller : Principal,
    input : Types.UpiWithdrawalInput,
    minAmount : Nat,
    withdrawable : Nat,
    now : Common.Timestamp,
  ) : Types.WithdrawalResult {
    if (input.upiId == "" or input.accountHolderName == "") {
      return #err("UPI ID and account holder name are required");
    };
    if (input.amount == 0) {
      return #err("Withdrawal amount must be greater than zero");
    };
    if (input.amount < minAmount) {
      return #err("Amount is below the minimum withdrawal amount");
    };
    if (input.amount > withdrawable) {
      return #err("Amount exceeds your withdrawable balance");
    };
    let id = nextId.value;
    nextId.value += 1;
    let request : Types.WithdrawalRequest = {
      id;
      user = caller;
      method = #upi;
      upi = ?{ upiId = input.upiId; accountHolderName = input.accountHolderName };
      bank = null;
      amount = input.amount;
      status = #pending;
      rejectionReason = null;
      paymentReference = null;
      requestedAt = now;
      reviewedAt = null;
    };
    withdrawals.add(id, request);
    #ok(toView(request));
  };

  /// Create a bank withdrawal request in Pending state.
  public func requestBank(
    withdrawals : Map.Map<Common.Id, Types.WithdrawalRequest>,
    nextId : { var value : Nat },
    caller : Principal,
    input : Types.BankWithdrawalInput,
    minAmount : Nat,
    withdrawable : Nat,
    now : Common.Timestamp,
  ) : Types.WithdrawalResult {
    if (input.accountHolderName == "" or input.bankName == "" or input.accountNumber == "" or input.ifscCode == "") {
      return #err("Account holder name, bank name, account number and IFSC code are required");
    };
    if (input.amount == 0) {
      return #err("Withdrawal amount must be greater than zero");
    };
    if (input.amount < minAmount) {
      return #err("Amount is below the minimum withdrawal amount");
    };
    if (input.amount > withdrawable) {
      return #err("Amount exceeds your withdrawable balance");
    };
    let id = nextId.value;
    nextId.value += 1;
    let request : Types.WithdrawalRequest = {
      id;
      user = caller;
      method = #bank;
      upi = null;
      bank = ?{
        accountHolderName = input.accountHolderName;
        bankName = input.bankName;
        accountNumber = input.accountNumber;
        ifscCode = input.ifscCode;
      };
      amount = input.amount;
      status = #pending;
      rejectionReason = null;
      paymentReference = null;
      requestedAt = now;
      reviewedAt = null;
    };
    withdrawals.add(id, request);
    #ok(toView(request));
  };

  /// List the caller's own withdrawal requests, newest first.
  public func listOwn(
    withdrawals : Map.Map<Common.Id, Types.WithdrawalRequest>,
    caller : Principal,
  ) : [Types.WithdrawalView] {
    let own = withdrawals.values().filter(func w = w.user == caller).toArray();
    let sorted = own.sort(func (a, b) = Int.compare(b.requestedAt, a.requestedAt));
    sorted.map(func w = toView(w));
  };

  /// List every withdrawal request (admin), newest first.
  public func listAll(
    withdrawals : Map.Map<Common.Id, Types.WithdrawalRequest>,
  ) : [Types.WithdrawalView] {
    let all = withdrawals.values().toArray();
    let sorted = all.sort(func (a, b) = Int.compare(b.requestedAt, a.requestedAt));
    sorted.map(func w = toView(w));
  };

  /// Read a withdrawal request by id.
  public func get(
    withdrawals : Map.Map<Common.Id, Types.WithdrawalRequest>,
    withdrawalId : Common.Id,
  ) : ?Types.WithdrawalRequest {
    withdrawals.get(withdrawalId);
  };

  /// Approve a withdrawal request.
  public func approve(
    withdrawals : Map.Map<Common.Id, Types.WithdrawalRequest>,
    withdrawalId : Common.Id,
    now : Common.Timestamp,
  ) : ?Types.WithdrawalRequest {
    switch (withdrawals.get(withdrawalId)) {
      case (?w) {
        let updated = { w with status = #approved; reviewedAt = ?now };
        withdrawals.add(withdrawalId, updated);
        ?updated;
      };
      case null { null };
    };
  };

  /// Reject a withdrawal request with a reason.
  public func reject(
    withdrawals : Map.Map<Common.Id, Types.WithdrawalRequest>,
    withdrawalId : Common.Id,
    reason : Text,
    now : Common.Timestamp,
  ) : ?Types.WithdrawalRequest {
    switch (withdrawals.get(withdrawalId)) {
      case (?w) {
        let updated = { w with status = #rejected; rejectionReason = ?reason; reviewedAt = ?now };
        withdrawals.add(withdrawalId, updated);
        ?updated;
      };
      case null { null };
    };
  };

  /// Mark an approved withdrawal as paid with a reference number.
  public func markPaid(
    withdrawals : Map.Map<Common.Id, Types.WithdrawalRequest>,
    withdrawalId : Common.Id,
    reference : Text,
    now : Common.Timestamp,
  ) : ?Types.WithdrawalRequest {
    switch (withdrawals.get(withdrawalId)) {
      case (?w) {
        let updated = { w with status = #completed; paymentReference = ?reference; reviewedAt = ?now };
        withdrawals.add(withdrawalId, updated);
        ?updated;
      };
      case null { null };
    };
  };

  /// Convert a stored withdrawal into its public view.
  public func toView(request : Types.WithdrawalRequest) : Types.WithdrawalView {
    {
      id = request.id;
      method = request.method;
      upi = request.upi;
      bank = request.bank;
      amount = request.amount;
      status = request.status;
      rejectionReason = request.rejectionReason;
      paymentReference = request.paymentReference;
      requestedAt = request.requestedAt;
      reviewedAt = request.reviewedAt;
    };
  };
};
