import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/payments";
import PlanTypes "../types/plans";
import WalletTypes "../types/wallet";
import NotificationTypes "../types/notifications";
import ReferralTypes "../types/referrals";
import Common "../types/common";
import PaymentsLib "../lib/payments";
import PlansLib "../lib/plans";
import WalletLib "../lib/wallet";
import NotificationsLib "../lib/notifications";
import ReferralsLib "../lib/referrals";

mixin (
  accessControlState : AccessControl.AccessControlState,
  payments : Map.Map<Common.Id, Types.PaymentSubmission>,
  paymentNextId : { var value : Nat },
  plans : Map.Map<Common.Id, PlanTypes.MembershipPlan>,
  memberships : Map.Map<Principal, PlanTypes.Membership>,
  transactions : Map.Map<Common.Id, WalletTypes.WalletTransaction>,
  transactionNextId : { var value : Nat },
  activeMemberships : { var value : Nat },
  notifications : Map.Map<Common.Id, NotificationTypes.Notification>,
  notificationNextId : { var value : Nat },
  referrals : Map.Map<Common.Id, ReferralTypes.ReferralRecord>,
) {
  /// Whether the caller holds the admin role, without trapping for guests.
  func paymentsCallerIsAdmin(caller : Principal) : Bool {
    if (caller.isAnonymous()) { return false };
    switch (accessControlState.userRoles.get(caller)) {
      case (?#admin) { true };
      case (_) { false };
    };
  };

  /// Ensure the seven fixed plans exist in storage.
  func paymentsEnsureSeeded() {
    if (plans.size() == 0) {
      for (plan in PlansLib.seed().values()) {
        plans.add(plan.id, plan);
      };
    };
  };

  /// Submit a manual UPI payment for a plan.
  public shared ({ caller }) func submitPayment(input : Types.PaymentInput) : async Types.PaymentResult {
    paymentsEnsureSeeded();
    switch (PlansLib.get(plans, input.planId)) {
      case (null) { return #err("Unknown membership plan") };
      case (?plan) {
        let now = Time.now();
        let result = PaymentsLib.submit(payments, paymentNextId, caller, plan.id, plan.name, plan.price, input.utr, input.screenshot, now);
        switch (result) {
          case (#ok(view)) {
            ignore NotificationsLib.create(
              notifications,
              notificationNextId,
              caller,
              #paymentSubmitted,
              "Payment submitted",
              "Your payment of ₹" # view.amount.toText() # " for " # view.planName # " is pending verification.",
              now,
            );
            #ok(view);
          };
          case (#err(message)) { #err(message) };
        };
      };
    };
  };

  /// List the caller's own payment submissions.
  public query ({ caller }) func listMyPayments() : async [Types.PaymentView] {
    PaymentsLib.listOwn(payments, caller);
  };

  /// Admin: list every payment submission.
  public query ({ caller }) func adminListPayments() : async [Types.PaymentView] {
    if (not paymentsCallerIsAdmin(caller)) { return [] };
    PaymentsLib.listAll(payments);
  };

  /// Admin: approve a payment and activate the membership.
  public shared ({ caller }) func adminApprovePayment(paymentId : Common.Id) : async ?Types.PaymentView {
    if (not paymentsCallerIsAdmin(caller)) { return null };
    switch (PaymentsLib.get(payments, paymentId)) {
      case (null) { null };
      case (?payment) {
        if (payment.status != #pending) {
          return ?PaymentsLib.toView(payment);
        };
        let now = Time.now();
        let approved = PaymentsLib.approve(payments, paymentId, now) ?? payment;

        // Activate the membership for 30 days from activation.
        let plan = PlansLib.get(plans, approved.planId);
        let planName = switch (plan) { case (?p) { p.name }; case (null) { approved.planName } };
        let validityDays = switch (plan) { case (?p) { p.validityDays }; case (null) { 30 } };
        let membership : PlanTypes.Membership = {
          planId = approved.planId;
          planName;
          activatedAt = now;
          expiresAt = now + (validityDays.toInt() * 86_400_000_000_000);
        };
        let wasActive = switch (memberships.get(approved.user)) {
          case (?existing) { PlansLib.isActive(existing, now) };
          case (null) { false };
        };
        memberships.add(approved.user, membership);
        if (not wasActive) {
          activeMemberships.value += 1;
        };

        // Record the membership purchase in the wallet ledger.
        ignore WalletLib.debit(
          transactions,
          transactionNextId,
          approved.user,
          #payment,
          approved.amount,
          #completed,
          ?("Payment #" # approved.id.toText() # " · " # planName),
          now,
        );

        // Mark the buyer's pending referral eligible so the referrer's reward
        // can be approved by an admin.
        for (referral in referrals.values()) {
          if (referral.referred == approved.user and referral.status == #pending) {
            ignore ReferralsLib.markEligible(referrals, referral.id);
          };
        };

        ignore NotificationsLib.create(
          notifications,
          notificationNextId,
          approved.user,
          #paymentApproved,
          "Payment approved",
          "Your payment of ₹" # approved.amount.toText() # " was approved.",
          now,
        );
        ignore NotificationsLib.create(
          notifications,
          notificationNextId,
          approved.user,
          #membershipActivated,
          "Membership activated",
          planName # " is active until " # membership.expiresAt.toText() # ".",
          now,
        );

        ?PaymentsLib.toView(approved);
      };
    };
  };

  /// Admin: reject a payment with a reason.
  public shared ({ caller }) func adminRejectPayment(paymentId : Common.Id, reason : Text) : async ?Types.PaymentView {
    if (not paymentsCallerIsAdmin(caller)) { return null };
    switch (PaymentsLib.get(payments, paymentId)) {
      case (null) { null };
      case (?payment) {
        if (payment.status != #pending) {
          return ?PaymentsLib.toView(payment);
        };
        let now = Time.now();
        let rejected = PaymentsLib.reject(payments, paymentId, reason, now) ?? payment;
        ignore NotificationsLib.create(
          notifications,
          notificationNextId,
          rejected.user,
          #paymentRejected,
          "Payment rejected",
          "Your payment of ₹" # rejected.amount.toText() # " was rejected: " # reason,
          now,
        );
        ?PaymentsLib.toView(rejected);
      };
    };
  };
};
