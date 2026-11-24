import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Types "../types/admin";
import Payments "../types/payments";
import Withdrawals "../types/withdrawals";
import Referrals "../types/referrals";
import Users "../types/users";
import Common "../types/common";

module {
  let DAY_NS : Int = 86_400_000_000_000;
  let MONTH_NS : Int = 2_592_000_000_000_000;

  /// Compute the admin overview metrics.
  public func overview(
    profiles : Map.Map<Principal, Users.UserProfile>,
    payments : Map.Map<Common.Id, Payments.PaymentSubmission>,
    withdrawals : Map.Map<Common.Id, Withdrawals.WithdrawalRequest>,
    referrals : Map.Map<Common.Id, Referrals.ReferralRecord>,
    activeMemberships : Nat,
  ) : Types.AdminOverview {
    var verifiedPayments = 0;
    var totalPaymentAmount = 0;
    var pendingPayments = 0;
    for (payment in payments.values()) {
      switch (payment.status) {
        case (#approved) {
          verifiedPayments += 1;
          totalPaymentAmount += payment.amount;
        };
        case (#pending) { pendingPayments += 1 };
        case (#rejected) {};
      };
    };

    var totalWithdrawals = 0;
    var pendingWithdrawals = 0;
    for (withdrawal in withdrawals.values()) {
      totalWithdrawals += 1;
      if (withdrawal.status == #pending) { pendingWithdrawals += 1 };
    };

    var totalReferralRewards = 0;
    for (referral in referrals.values()) {
      if (referral.status == #rewarded) {
        totalReferralRewards += referral.rewardAmount;
      };
    };

    {
      totalUsers = profiles.size();
      activeMemberships;
      verifiedPayments;
      totalPaymentAmount;
      pendingPayments;
      totalWithdrawals;
      pendingWithdrawals;
      totalReferralRewards;
    };
  };

  /// Build daily report rows.
  public func dailyReport(
    payments : Map.Map<Common.Id, Payments.PaymentSubmission>,
    withdrawals : Map.Map<Common.Id, Withdrawals.WithdrawalRequest>,
    profiles : Map.Map<Principal, Users.UserProfile>,
  ) : [Types.ReportRow] {
    buildReport(payments, withdrawals, profiles, DAY_NS, "Day ");
  };

  /// Build monthly report rows.
  public func monthlyReport(
    payments : Map.Map<Common.Id, Payments.PaymentSubmission>,
    withdrawals : Map.Map<Common.Id, Withdrawals.WithdrawalRequest>,
    profiles : Map.Map<Principal, Users.UserProfile>,
  ) : [Types.ReportRow] {
    buildReport(payments, withdrawals, profiles, MONTH_NS, "Month ");
  };

  /// Render report rows as CSV.
  public func toCsv(rows : [Types.ReportRow]) : Text {
    let header = "period,payments,paymentAmount,withdrawals,withdrawalAmount,newUsers";
    let body = rows.map(
      func(row) {
        row.period.concat(",")
          .concat(row.payments.toText()).concat(",")
          .concat(row.paymentAmount.toText()).concat(",")
          .concat(row.withdrawals.toText()).concat(",")
          .concat(row.withdrawalAmount.toText()).concat(",")
          .concat(row.newUsers.toText());
      }
    );
    [header].concat(body).values().join("\n");
  };

  /// Bucket payments, withdrawals and registrations into report rows.
  func buildReport(
    payments : Map.Map<Common.Id, Payments.PaymentSubmission>,
    withdrawals : Map.Map<Common.Id, Withdrawals.WithdrawalRequest>,
    profiles : Map.Map<Principal, Users.UserProfile>,
    bucketNs : Int,
    labelPrefix : Text,
  ) : [Types.ReportRow] {
    let buckets = Map.empty<Int, { var payments : Nat; var paymentAmount : Nat; var withdrawals : Nat; var withdrawalAmount : Nat; var newUsers : Nat }>();

    func bucketFor(key : Int) : { var payments : Nat; var paymentAmount : Nat; var withdrawals : Nat; var withdrawalAmount : Nat; var newUsers : Nat } {
      switch (buckets.get(key)) {
        case (?b) { b };
        case (null) {
          let b = { var payments = 0; var paymentAmount = 0; var withdrawals = 0; var withdrawalAmount = 0; var newUsers = 0 };
          buckets.add(key, b);
          b;
        };
      };
    };

    for (payment in payments.values()) {
      if (payment.status == #approved) {
        let b = bucketFor(payment.submittedAt / bucketNs);
        b.payments += 1;
        b.paymentAmount += payment.amount;
      };
    };
    for (withdrawal in withdrawals.values()) {
      if (withdrawal.status == #completed) {
        let b = bucketFor(withdrawal.requestedAt / bucketNs);
        b.withdrawals += 1;
        b.withdrawalAmount += withdrawal.amount;
      };
    };
    for (profile in profiles.values()) {
      let b = bucketFor(profile.registeredAt / bucketNs);
      b.newUsers += 1;
    };

    buckets.entries().map(
      func((key, b)) {
        {
          period = labelPrefix.concat(key.toText());
          payments = b.payments;
          paymentAmount = b.paymentAmount;
          withdrawals = b.withdrawals;
          withdrawalAmount = b.withdrawalAmount;
          newUsers = b.newUsers;
        };
      }
    ).toArray().sort(
      func(a, b) {
        Text.compare(a.period, b.period);
      }
    );
  };
};
