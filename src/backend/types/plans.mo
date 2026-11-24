import Common "common";

module {
  /// A fixed membership plan. Exactly seven exist.
  public type MembershipPlan = {
    id : Common.Id;
    name : Text;
    price : Nat;
    validityDays : Nat;
    benefits : [Text];
    rewardDetails : Text;
    popular : Bool;
  };

  /// Admin-editable subset of a plan.
  public type PlanUpdate = {
    benefits : [Text];
    rewardDetails : Text;
    validityDays : Nat;
  };

  /// A user's active membership.
  public type Membership = {
    planId : Common.Id;
    planName : Text;
    activatedAt : Common.Timestamp;
    expiresAt : Common.Timestamp;
  };

  /// Public view of a membership.
  public type MembershipView = {
    planId : Common.Id;
    planName : Text;
    activatedAt : Common.Timestamp;
    expiresAt : Common.Timestamp;
    active : Bool;
  };
};
