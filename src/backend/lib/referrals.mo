import Int "mo:core/Int";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "../types/referrals";
import Common "../types/common";

module {
  /// Create a pending referral record linking referrer to referred user.
  public func create(
    referrals : Map.Map<Common.Id, Types.ReferralRecord>,
    nextId : { var value : Nat },
    referrer : Principal,
    referred : Principal,
    rewardAmount : Nat,
    now : Common.Timestamp,
  ) : Common.Id {
    let id = nextId.value;
    nextId.value += 1;
    referrals.add(id, {
      id;
      referrer;
      referred;
      status = #pending;
      rewardAmount;
      createdAt = now;
      rewardedAt = null;
    });
    id;
  };

  /// List referrals where the caller is the referrer, newest first.
  public func listByReferrer(
    referrals : Map.Map<Common.Id, Types.ReferralRecord>,
    referrer : Principal,
  ) : [Types.ReferralView] {
    let own = referrals.values().filter(func r = r.referrer == referrer).toArray();
    let sorted = own.sort(func (a, b) = Int.compare(b.createdAt, a.createdAt));
    sorted.map(func r = toView(r));
  };

  /// List every referral record (admin), newest first.
  public func listAll(
    referrals : Map.Map<Common.Id, Types.ReferralRecord>,
  ) : [Types.ReferralView] {
    let all = referrals.values().toArray();
    let sorted = all.sort(func (a, b) = Int.compare(b.createdAt, a.createdAt));
    sorted.map(func r = toView(r));
  };

  /// Mark a referral eligible after a verified purchase.
  public func markEligible(
    referrals : Map.Map<Common.Id, Types.ReferralRecord>,
    referralId : Common.Id,
  ) : ?Types.ReferralRecord {
    switch (referrals.get(referralId)) {
      case (?r) {
        let updated = { r with status = #eligible };
        referrals.add(referralId, updated);
        ?updated;
      };
      case null { null };
    };
  };

  /// Mark a referral rewarded.
  public func markRewarded(
    referrals : Map.Map<Common.Id, Types.ReferralRecord>,
    referralId : Common.Id,
    now : Common.Timestamp,
  ) : ?Types.ReferralRecord {
    switch (referrals.get(referralId)) {
      case (?r) {
        let updated = { r with status = #rewarded; rewardedAt = ?now };
        referrals.add(referralId, updated);
        ?updated;
      };
      case null { null };
    };
  };

  /// Reject a referral record.
  public func reject(
    referrals : Map.Map<Common.Id, Types.ReferralRecord>,
    referralId : Common.Id,
  ) : ?Types.ReferralRecord {
    switch (referrals.get(referralId)) {
      case (?r) {
        let updated = { r with status = #rejected };
        referrals.add(referralId, updated);
        ?updated;
      };
      case null { null };
    };
  };

  /// Compute the caller's referral summary.
  public func summary(
    referrals : Map.Map<Common.Id, Types.ReferralRecord>,
    referralCode : Text,
    referralLink : Text,
    caller : Principal,
  ) : Types.ReferralSummary {
    var total = 0;
    var successful = 0;
    var pending = 0;
    var rewardEarned = 0;
    for (r in referrals.values()) {
      if (r.referrer == caller) {
        total += 1;
        switch (r.status) {
          case (#rewarded) {
            successful += 1;
            rewardEarned += r.rewardAmount;
          };
          case (#eligible) { successful += 1 };
          case (#pending) { pending += 1 };
          case (#rejected) {};
        };
      };
    };
    {
      referralCode;
      referralLink;
      totalReferrals = total;
      successfulReferrals = successful;
      pendingReferrals = pending;
      totalRewardEarned = rewardEarned;
    };
  };

  /// Convert a stored referral into its public view.
  public func toView(record : Types.ReferralRecord) : Types.ReferralView {
    {
      id = record.id;
      referrer = record.referrer;
      referred = record.referred;
      status = record.status;
      rewardAmount = record.rewardAmount;
      createdAt = record.createdAt;
      rewardedAt = record.rewardedAt;
    };
  };
};
