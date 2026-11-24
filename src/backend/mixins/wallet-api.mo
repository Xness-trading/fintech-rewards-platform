import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/wallet";
import Common "../types/common";
import WalletLib "../lib/wallet";

mixin (
  accessControlState : AccessControl.AccessControlState,
  transactions : Map.Map<Common.Id, Types.WalletTransaction>,
  transactionNextId : { var value : Nat },
) {
  /// Read the caller's wallet balances.
  public query ({ caller }) func getWalletSummary() : async Types.WalletSummary {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can access the wallet");
    };
    WalletLib.summary(transactions, caller);
  };

  /// List the caller's wallet ledger entries.
  public query ({ caller }) func listMyTransactions() : async [Types.WalletTransactionView] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can access the wallet");
    };
    WalletLib.listOwn(transactions, caller);
  };
};
