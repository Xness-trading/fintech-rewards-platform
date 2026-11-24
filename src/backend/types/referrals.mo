import Common "common";

module {
  /// A referral relationship between two users.
  public type ReferralRecord = {
    id : Common.Id;
    referrer : Principal;
    referred : Principal;
    status : Common.ReferralStatus;
    rewardAmount : Nat;
    createdAt : Common.Timestamp;
    rewardedAt : ?Common.Timestamp;
  };

  /// Public view of a referral record.
  public type ReferralView = {
    id : Common.Id;
    referrer : Principal;
    referred : Principal;
    status : Common.ReferralStatus;
    rewardAmount : Nat;
    createdAt : Common.Timestamp;
    rewardedAt : ?Common.Timestamp;
  };

  /// Aggregated referral statistics for the caller.
  public type ReferralSummary = {
    referralCode : Text;
    referralLink : Text;
    totalReferrals : Nat;
    successfulReferrals : Nat;
    pendingReferrals : Nat;
    totalRewardEarned : Nat;
  };
};
