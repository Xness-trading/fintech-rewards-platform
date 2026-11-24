import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/referrals";
import Users "../types/users";
import WalletTypes "../types/wallet";
import NotificationTypes "../types/notifications";
import Common "../types/common";
import ReferralsLib "../lib/referrals";
import WalletLib "../lib/wallet";
import NotificationsLib "../lib/notifications";

mixin (
  accessControlState : AccessControl.AccessControlState,
  referrals : Map.Map<Common.Id, Types.ReferralRecord>,
  referralNextId : { var value : Nat },
  profiles : Map.Map<Principal, Users.UserProfile>,
  transactions : Map.Map<Common.Id, WalletTypes.WalletTransaction>,
  transactionNextId : { var value : Nat },
  notifications : Map.Map<Common.Id, NotificationTypes.Notification>,
  notificationNextId : { var value : Nat },
) {
  transient let referralBaseUrl = "https://app.caffeine.ai/register?ref=";

  /// Read the caller's referral summary.
  public query ({ caller }) func getReferralSummary() : async Types.ReferralSummary {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can view referrals");
    };
    let code = switch (profiles.get(caller)) {
      case (?p) { p.referralCode };
      case null { "" };
    };
    ReferralsLib.summary(referrals, code, referralBaseUrl # code, caller);
  };

  /// List the caller's referral records.
  public query ({ caller }) func listMyReferrals() : async [Types.ReferralView] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can view referrals");
    };
    ReferralsLib.listByReferrer(referrals, caller);
  };

  /// Admin: list every referral record.
  public query ({ caller }) func adminListReferrals() : async [Types.ReferralView] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can list referrals");
    };
    ReferralsLib.listAll(referrals);
  };

  /// Admin: mark a referral eligible.
  public shared ({ caller }) func adminMarkReferralEligible(referralId : Common.Id) : async ?Types.ReferralView {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can mark referrals eligible");
    };
    switch (ReferralsLib.markEligible(referrals, referralId)) {
      case (?record) { ?ReferralsLib.toView(record) };
      case null { null };
    };
  };

  /// Admin: approve and credit a referral reward.
  public shared ({ caller }) func adminApproveReferralReward(referralId : Common.Id) : async ?Types.ReferralView {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can approve referral rewards");
    };
    switch (referrals.get(referralId)) {
      case (?record) {
        if (record.status != #eligible) {
          return null;
        };
        let now = Time.now();
        switch (ReferralsLib.markRewarded(referrals, referralId, now)) {
          case (?rewarded) {
            ignore WalletLib.credit(
              transactions,
              transactionNextId,
              rewarded.referrer,
              #referral,
              rewarded.rewardAmount,
              #completed,
              ?("Referral reward for " # rewarded.referred.toText()),
              now,
            );
            ignore NotificationsLib.create(
              notifications,
              notificationNextId,
              rewarded.referrer,
              #rewardCredited,
              "Referral reward credited",
              "A referral reward of the eligible amount has been credited to your wallet.",
              now,
            );
            ?ReferralsLib.toView(rewarded);
          };
          case null { null };
        };
      };
      case null { null };
    };
  };

  /// Admin: reject a referral record.
  public shared ({ caller }) func adminRejectReferral(referralId : Common.Id) : async ?Types.ReferralView {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can reject referrals");
    };
    switch (ReferralsLib.reject(referrals, referralId)) {
      case (?record) { ?ReferralsLib.toView(record) };
      case null { null };
    };
  };
};
