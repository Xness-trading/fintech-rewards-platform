import Map "mo:core/Map";
import Principal "mo:core/Principal";

import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import MixinEmailVerification "mo:caffeineai-email-verification/verificationMixin";
import VerificationTokens "mo:caffeineai-email-verification/verificationTokens";
import VerifiedEmails "mo:caffeineai-email-verification/verifiedEmails";

import OQL "mo:caffeineai-oql";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import TextValue "mo:caffeineai-oql/TextValue";
import NatValue "mo:caffeineai-oql/NatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import BoolValue "mo:caffeineai-oql/BoolValue";

import Common "types/common";
import Users "types/users";
import Plans "types/plans";
import Payments "types/payments";
import Wallet "types/wallet";
import Referrals "types/referrals";
import Withdrawals "types/withdrawals";
import Notifications "types/notifications";
import Support "types/support";
import Admin "types/admin";

import UsersApi "mixins/users-api";
import PlansApi "mixins/plans-api";
import PaymentsApi "mixins/payments-api";
import WalletApi "mixins/wallet-api";
import ReferralsApi "mixins/referrals-api";
import WithdrawalsApi "mixins/withdrawals-api";
import NotificationsApi "mixins/notifications-api";
import SupportApi "mixins/support-api";
import AdminApi "mixins/admin-api";
import ApiDocMixin "mixins/api-doc";

actor {
  // --- Shared authorization state ---
  let accessControlState : AccessControl.AccessControlState;

  // --- Email verification state ---
  let verifiedEmails : VerifiedEmails.State;
  let verificationTokens : VerificationTokens.State;

  // --- App state ---
  let profiles : Map.Map<Principal, Users.UserProfile>;
  let emailIndex : Map.Map<Text, Principal>;
  let mobileIndex : Map.Map<Text, Principal>;
  let referralIndex : Map.Map<Text, Principal>;
  let verifiedMobiles : Map.Map<Text, Bool>;

  let plans : Map.Map<Common.Id, Plans.MembershipPlan>;
  let memberships : Map.Map<Principal, Plans.Membership>;

  let payments : Map.Map<Common.Id, Payments.PaymentSubmission>;
  let paymentNextId : { var value : Nat };

  let transactions : Map.Map<Common.Id, Wallet.WalletTransaction>;
  let transactionNextId : { var value : Nat };

  let referrals : Map.Map<Common.Id, Referrals.ReferralRecord>;
  let referralNextId : { var value : Nat };

  let withdrawals : Map.Map<Common.Id, Withdrawals.WithdrawalRequest>;
  let withdrawalNextId : { var value : Nat };

  let notifications : Map.Map<Common.Id, Notifications.Notification>;
  let notificationNextId : { var value : Nat };

  let tickets : Map.Map<Common.Id, Support.SupportTicket>;
  let ticketNextId : { var value : Nat };

  let settings : { var value : Admin.AdminSettings };
  let activeMemberships : { var value : Nat };

  // Sample owner principal used only to seed OQL schema discovery.
  transient let anyPrincipal = Principal.fromText("aaaaa-aa");

  include MixinAuthorization(accessControlState, null);
  include MixinObjectStorage();
  include MixinEmailVerification(verifiedEmails, verificationTokens);

  include UsersApi(accessControlState, profiles, emailIndex, mobileIndex, referralIndex, referrals, referralNextId, verifiedEmails, verifiedMobiles);
  include PlansApi(accessControlState, plans);
  include PaymentsApi(accessControlState, payments, paymentNextId, plans, memberships, transactions, transactionNextId, activeMemberships, notifications, notificationNextId, referrals);
  include WalletApi(accessControlState, transactions, transactionNextId);
  include ReferralsApi(accessControlState, referrals, referralNextId, profiles, transactions, transactionNextId, notifications, notificationNextId);
  include WithdrawalsApi(accessControlState, withdrawals, withdrawalNextId, transactions, transactionNextId, notifications, notificationNextId, settings);
  include NotificationsApi(accessControlState, notifications, notificationNextId);
  include SupportApi(accessControlState, tickets, ticketNextId);
  include AdminApi(accessControlState, settings, profiles, payments, withdrawals, referrals, activeMemberships);

  include ApiDocMixin();

  include Expose({
    entities = [
      // Users — per-user rows; the owner principal is the map key, promoted to a column.
      OQL.Entity.manual<(Principal, Users.UserProfile)>("user", func () = profiles.entries(), "UserProfile", "principal")
        .sample((anyPrincipal, { fullName = ""; email = ""; mobile = ""; referralCode = ""; referredBy = null; registeredAt = 0; profilePicture = null; blocked = false }))
        .payload("principal", func ((p, _)) = p.toText())
        .payload("fullName", func ((_, u)) = u.fullName)
        .payload("email", func ((_, u)) = u.email)
        .payload("mobile", func ((_, u)) = u.mobile)
        .payload("referralCode", func ((_, u)) = u.referralCode)
        .payload("referredBy", func ((_, u)) = u.referredBy)
        .payload("registeredAt", func ((_, u)) = u.registeredAt)
        .payload("blocked", func ((_, u)) = u.blocked)
        .ownedBy("principal")
        .controllerOrScoped()
        .build(),

      // Plans — public catalogue.
      plans.toEntityManual("plan", "MembershipPlan", "id")
        .sample({ id = 0; name = ""; price = 0; validityDays = 0; benefits = []; rewardDetails = ""; popular = false })
        .payload("id", func p = p.id)
        .payload("name", func p = p.name)
        .payload("price", func p = p.price)
        .payload("validityDays", func p = p.validityDays)
        .payload("benefits", func p = p.benefits.values().join("; "))
        .payload("rewardDetails", func p = p.rewardDetails)
        .payload("popular", func p = p.popular)
        .public_()
        .build(),

      // Payments — per-user.
      payments.toEntityManual("payment", "PaymentSubmission", "id")
        .sample({ id = 0; user = anyPrincipal; planId = 0; planName = ""; amount = 0; utr = ""; screenshot = null; status = #pending; rejectionReason = null; submittedAt = 0; reviewedAt = null })
        .payload("id", func p = p.id)
        .payload("user", func p = p.user.toText())
        .payload("planId", func p = p.planId)
        .payload("planName", func p = p.planName)
        .payload("amount", func p = p.amount)
        .payload("utr", func p = p.utr)
        .payload("status", func p = switch (p.status) { case (#pending) "pending"; case (#approved) "approved"; case (#rejected) "rejected" })
        .payload("rejectionReason", func p = p.rejectionReason)
        .payload("submittedAt", func p = p.submittedAt)
        .payload("reviewedAt", func p = p.reviewedAt)
        .ownedBy("user")
        .controllerOrScoped()
        .build(),

      // Wallet ledger — per-user.
      transactions.toEntityManual("walletTransaction", "WalletTransaction", "id")
        .sample({ id = 0; user = anyPrincipal; kind = #credit; txType = #reward; amount = 0; status = #completed; reference = null; createdAt = 0 })
        .payload("id", func t = t.id)
        .payload("user", func t = t.user.toText())
        .payload("kind", func t = switch (t.kind) { case (#credit) "credit"; case (#debit) "debit" })
        .payload("txType", func t = switch (t.txType) { case (#payment) "payment"; case (#reward) "reward"; case (#referral) "referral"; case (#withdrawal) "withdrawal" })
        .payload("amount", func t = t.amount)
        .payload("status", func t = switch (t.status) { case (#pending) "pending"; case (#completed) "completed"; case (#failed) "failed" })
        .payload("reference", func t = t.reference)
        .payload("createdAt", func t = t.createdAt)
        .ownedBy("user")
        .controllerOrScoped()
        .build(),

      // Referrals — per-referrer.
      referrals.toEntityManual("referral", "ReferralRecord", "id")
        .sample({ id = 0; referrer = anyPrincipal; referred = anyPrincipal; status = #pending; rewardAmount = 0; createdAt = 0; rewardedAt = null })
        .payload("id", func r = r.id)
        .payload("referrer", func r = r.referrer.toText())
        .payload("referred", func r = r.referred.toText())
        .payload("status", func r = switch (r.status) { case (#pending) "pending"; case (#eligible) "eligible"; case (#rewarded) "rewarded"; case (#rejected) "rejected" })
        .payload("rewardAmount", func r = r.rewardAmount)
        .payload("createdAt", func r = r.createdAt)
        .payload("rewardedAt", func r = r.rewardedAt)
        .ownedBy("referrer")
        .controllerOrScoped()
        .build(),

      // Withdrawals — per-user.
      withdrawals.toEntityManual("withdrawal", "WithdrawalRequest", "id")
        .sample({ id = 0; user = anyPrincipal; method = #upi; upi = null; bank = null; amount = 0; status = #pending; rejectionReason = null; paymentReference = null; requestedAt = 0; reviewedAt = null })
        .payload("id", func w = w.id)
        .payload("user", func w = w.user.toText())
        .payload("method", func w = switch (w.method) { case (#upi) "upi"; case (#bank) "bank" })
        .payload("upiId", func w = switch (w.upi) { case (?u) ?u.upiId; case null null })
        .payload("bankName", func w = switch (w.bank) { case (?b) ?b.bankName; case null null })
        .payload("amount", func w = w.amount)
        .payload("status", func w = switch (w.status) { case (#pending) "pending"; case (#approved) "approved"; case (#rejected) "rejected"; case (#completed) "completed" })
        .payload("rejectionReason", func w = w.rejectionReason)
        .payload("paymentReference", func w = w.paymentReference)
        .payload("requestedAt", func w = w.requestedAt)
        .payload("reviewedAt", func w = w.reviewedAt)
        .ownedBy("user")
        .controllerOrScoped()
        .build(),

      // Notifications — per-user.
      notifications.toEntityManual("notification", "Notification", "id")
        .sample({ id = 0; user = anyPrincipal; kind = #registration; title = ""; body = ""; read = false; createdAt = 0 })
        .payload("id", func n = n.id)
        .payload("user", func n = n.user.toText())
        .payload("kind", func n = switch (n.kind) {
          case (#registration) "registration";
          case (#verification) "verification";
          case (#paymentSubmitted) "paymentSubmitted";
          case (#paymentApproved) "paymentApproved";
          case (#paymentRejected) "paymentRejected";
          case (#membershipActivated) "membershipActivated";
          case (#membershipExpiring) "membershipExpiring";
          case (#rewardCredited) "rewardCredited";
          case (#referralSuccessful) "referralSuccessful";
          case (#withdrawalApproved) "withdrawalApproved";
          case (#withdrawalRejected) "withdrawalRejected";
          case (#withdrawalCompleted) "withdrawalCompleted";
        })
        .payload("title", func n = n.title)
        .payload("body", func n = n.body)
        .payload("read", func n = n.read)
        .payload("createdAt", func n = n.createdAt)
        .ownedBy("user")
        .controllerOrScoped()
        .build(),

      // Support tickets — per-user.
      tickets.toEntityManual("supportTicket", "SupportTicket", "id")
        .sample({ id = 0; user = anyPrincipal; subject = ""; message = ""; status = #open; createdAt = 0; updatedAt = 0 })
        .payload("id", func t = t.id)
        .payload("user", func t = t.user.toText())
        .payload("subject", func t = t.subject)
        .payload("message", func t = t.message)
        .payload("status", func t = switch (t.status) { case (#open) "open"; case (#inProgress) "inProgress"; case (#resolved) "resolved"; case (#closed) "closed" })
        .payload("createdAt", func t = t.createdAt)
        .payload("updatedAt", func t = t.updatedAt)
        .ownedBy("user")
        .controllerOrScoped()
        .build(),
    ];
  });
};
