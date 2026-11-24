import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/withdrawals";
import Admin "../types/admin";
import WalletTypes "../types/wallet";
import NotificationTypes "../types/notifications";
import Common "../types/common";
import WithdrawalsLib "../lib/withdrawals";
import WalletLib "../lib/wallet";
import NotificationsLib "../lib/notifications";

mixin (
  accessControlState : AccessControl.AccessControlState,
  withdrawals : Map.Map<Common.Id, Types.WithdrawalRequest>,
  withdrawalNextId : { var value : Nat },
  transactions : Map.Map<Common.Id, WalletTypes.WalletTransaction>,
  transactionNextId : { var value : Nat },
  notifications : Map.Map<Common.Id, NotificationTypes.Notification>,
  notificationNextId : { var value : Nat },
  settings : { var value : Admin.AdminSettings },
) {
  /// Ledger reference that ties a withdrawal request to its reserved debit.
  func withdrawalReference(withdrawalId : Common.Id) : Text {
    "withdrawal:" # withdrawalId.toText();
  };

  /// Request a UPI withdrawal.
  public shared ({ caller }) func requestUpiWithdrawal(input : Types.UpiWithdrawalInput) : async Types.WithdrawalResult {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can request withdrawals");
    };
    let withdrawable = WalletLib.summary(transactions, caller).withdrawableBalance;
    let result = WithdrawalsLib.requestUpi(
      withdrawals,
      withdrawalNextId,
      caller,
      input,
      settings.value.minWithdrawalAmount,
      withdrawable,
      Time.now(),
    );
    switch (result) {
      case (#ok(view)) {
        ignore WalletLib.debit(
          transactions,
          transactionNextId,
          caller,
          #withdrawal,
          view.amount,
          #pending,
          ?withdrawalReference(view.id),
          Time.now(),
        );
      };
      case (#err(_)) {};
    };
    result;
  };

  /// Request a bank withdrawal.
  public shared ({ caller }) func requestBankWithdrawal(input : Types.BankWithdrawalInput) : async Types.WithdrawalResult {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can request withdrawals");
    };
    let withdrawable = WalletLib.summary(transactions, caller).withdrawableBalance;
    let result = WithdrawalsLib.requestBank(
      withdrawals,
      withdrawalNextId,
      caller,
      input,
      settings.value.minWithdrawalAmount,
      withdrawable,
      Time.now(),
    );
    switch (result) {
      case (#ok(view)) {
        ignore WalletLib.debit(
          transactions,
          transactionNextId,
          caller,
          #withdrawal,
          view.amount,
          #pending,
          ?withdrawalReference(view.id),
          Time.now(),
        );
      };
      case (#err(_)) {};
    };
    result;
  };

  /// List the caller's own withdrawal requests.
  public query ({ caller }) func listMyWithdrawals() : async [Types.WithdrawalView] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can view withdrawals");
    };
    WithdrawalsLib.listOwn(withdrawals, caller);
  };

  /// Admin: list every withdrawal request.
  public query ({ caller }) func adminListWithdrawals() : async [Types.WithdrawalView] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can list withdrawals");
    };
    WithdrawalsLib.listAll(withdrawals);
  };

  /// Admin: approve a withdrawal request.
  public shared ({ caller }) func adminApproveWithdrawal(withdrawalId : Common.Id) : async ?Types.WithdrawalView {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can approve withdrawals");
    };
    switch (WithdrawalsLib.approve(withdrawals, withdrawalId, Time.now())) {
      case (?request) {
        ignore NotificationsLib.create(
          notifications,
          notificationNextId,
          request.user,
          #withdrawalApproved,
          "Withdrawal approved",
          "Your withdrawal request has been approved and is being processed.",
          Time.now(),
        );
        ?WithdrawalsLib.toView(request);
      };
      case null { null };
    };
  };

  /// Admin: reject a withdrawal request with a reason.
  public shared ({ caller }) func adminRejectWithdrawal(withdrawalId : Common.Id, reason : Text) : async ?Types.WithdrawalView {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can reject withdrawals");
    };
    switch (WithdrawalsLib.reject(withdrawals, withdrawalId, reason, Time.now())) {
      case (?request) {
        WalletLib.setStatusByReference(transactions, withdrawalReference(withdrawalId), #failed);
        ignore NotificationsLib.create(
          notifications,
          notificationNextId,
          request.user,
          #withdrawalRejected,
          "Withdrawal rejected",
          "Your withdrawal request was rejected: " # reason,
          Time.now(),
        );
        ?WithdrawalsLib.toView(request);
      };
      case null { null };
    };
  };

  /// Admin: mark an approved withdrawal as paid.
  public shared ({ caller }) func adminMarkWithdrawalPaid(withdrawalId : Common.Id, reference : Text) : async ?Types.WithdrawalView {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can mark withdrawals paid");
    };
    switch (WithdrawalsLib.markPaid(withdrawals, withdrawalId, reference, Time.now())) {
      case (?request) {
        WalletLib.setStatusByReference(transactions, withdrawalReference(withdrawalId), #completed);
        ignore NotificationsLib.create(
          notifications,
          notificationNextId,
          request.user,
          #withdrawalCompleted,
          "Withdrawal completed",
          "Your withdrawal has been paid. Reference: " # reference,
          Time.now(),
        );
        ?WithdrawalsLib.toView(request);
      };
      case null { null };
    };
  };
};
