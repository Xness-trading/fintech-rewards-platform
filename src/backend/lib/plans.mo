import Map "mo:core/Map";
import Types "../types/plans";
import Common "../types/common";

module {
  /// Nanoseconds in one day.
  let DAY_NS : Int = 86_400_000_000_000;

  /// The seven fixed membership plans.
  public func seed() : [Types.MembershipPlan] {
    [
      {
        id = 1;
        name = "Starter Plan";
        price = 150;
        validityDays = 30;
        benefits = ["Welcome reward eligibility", "Referral code activation", "Access to wallet dashboard"];
        rewardDetails = "Eligible for a one-time welcome reward credited after admin verification of your first membership purchase.";
        popular = false;
      },
      {
        id = 2;
        name = "Basic Plan";
        price = 300;
        validityDays = 30;
        benefits = ["All Starter benefits", "Higher referral reward eligibility", "Priority support"];
        rewardDetails = "Eligible for referral rewards of ₹199 per verified referred membership purchase.";
        popular = false;
      },
      {
        id = 3;
        name = "Popular Plan";
        price = 500;
        validityDays = 30;
        benefits = ["All Basic benefits", "Boosted reward eligibility", "Faster withdrawal review"];
        rewardDetails = "Eligible for referral rewards of ₹199 per verified referred membership purchase plus a boosted membership reward.";
        popular = true;
      },
      {
        id = 4;
        name = "Silver Plan";
        price = 999;
        validityDays = 30;
        benefits = ["All Popular benefits", "Silver member badge", "Dedicated support channel"];
        rewardDetails = "Eligible for referral rewards of ₹199 per verified referred membership purchase and a Silver-tier membership reward.";
        popular = false;
      },
      {
        id = 5;
        name = "Gold Plan";
        price = 1999;
        validityDays = 30;
        benefits = ["All Silver benefits", "Gold member badge", "Priority withdrawal processing"];
        rewardDetails = "Eligible for referral rewards of ₹199 per verified referred membership purchase and a Gold-tier membership reward.";
        popular = false;
      },
      {
        id = 6;
        name = "Premium Plan";
        price = 4999;
        validityDays = 30;
        benefits = ["All Gold benefits", "Premium member badge", "Personal account manager"];
        rewardDetails = "Eligible for referral rewards of ₹199 per verified referred membership purchase and a Premium-tier membership reward.";
        popular = false;
      },
      {
        id = 7;
        name = "VIP Plan";
        price = 9999;
        validityDays = 30;
        benefits = ["All Premium benefits", "VIP member badge", "Highest reward eligibility"];
        rewardDetails = "Eligible for referral rewards of ₹199 per verified referred membership purchase and the highest VIP-tier membership reward.";
        popular = false;
      },
    ];
  };

  /// Read a plan by id.
  public func get(
    plans : Map.Map<Common.Id, Types.MembershipPlan>,
    planId : Common.Id,
  ) : ?Types.MembershipPlan {
    plans.get(planId);
  };

  /// List all plans in id order.
  public func listAll(
    plans : Map.Map<Common.Id, Types.MembershipPlan>,
  ) : [Types.MembershipPlan] {
    plans.values().toArray().sort(
      func(a, b) {
        if (a.id < b.id) { #less } else if (a.id > b.id) { #greater } else { #equal };
      }
    );
  };

  /// Apply an admin edit to a plan's benefits, reward details and validity.
  public func update(
    plans : Map.Map<Common.Id, Types.MembershipPlan>,
    planId : Common.Id,
    update : Types.PlanUpdate,
  ) : ?Types.MembershipPlan {
    switch (plans.get(planId)) {
      case (null) { null };
      case (?plan) {
        let updated : Types.MembershipPlan = {
          plan with
          benefits = update.benefits;
          rewardDetails = update.rewardDetails;
          validityDays = if (update.validityDays == 0) { plan.validityDays } else { update.validityDays };
        };
        plans.add(planId, updated);
        ?updated;
      };
    };
  };

  /// Compute the expiry timestamp for a plan activated at `now`.
  public func expiryFor(plan : Types.MembershipPlan, now : Common.Timestamp) : Common.Timestamp {
    now + (plan.validityDays.toInt() * DAY_NS);
  };

  /// Whether a membership is still active at `now`.
  public func isActive(membership : Types.Membership, now : Common.Timestamp) : Bool {
    now < membership.expiresAt;
  };
};
