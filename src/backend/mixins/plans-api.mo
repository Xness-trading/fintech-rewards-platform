import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/plans";
import Common "../types/common";
import PlansLib "../lib/plans";

mixin (
  accessControlState : AccessControl.AccessControlState,
  plans : Map.Map<Common.Id, Types.MembershipPlan>,
) {
  /// Whether the caller holds the admin role, without trapping for guests.
  func plansCallerIsAdmin(caller : Principal) : Bool {
    if (caller.isAnonymous()) { return false };
    switch (accessControlState.userRoles.get(caller)) {
      case (?#admin) { true };
      case (_) { false };
    };
  };

  /// Ensure the seven fixed plans exist in storage.
  func plansEnsureSeeded() {
    if (plans.size() == 0) {
      for (plan in PlansLib.seed().values()) {
        plans.add(plan.id, plan);
      };
    };
  };

  /// List the seven fixed membership plans.
  public query func listPlans() : async [Types.MembershipPlan] {
    if (plans.size() == 0) {
      PlansLib.seed();
    } else {
      PlansLib.listAll(plans);
    };
  };

  /// Read one plan by id.
  public query func getPlan(planId : Common.Id) : async ?Types.MembershipPlan {
    if (plans.size() == 0) {
      PlansLib.seed().find(func(plan) { plan.id == planId });
    } else {
      PlansLib.get(plans, planId);
    };
  };

  /// Admin: edit a plan's benefits, reward details and validity.
  public shared ({ caller }) func adminUpdatePlan(planId : Common.Id, update : Types.PlanUpdate) : async ?Types.MembershipPlan {
    if (not plansCallerIsAdmin(caller)) { return null };
    plansEnsureSeeded();
    PlansLib.update(plans, planId, update);
  };
};
