import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "../types/payments";
import Common "../types/common";

module {
  /// Record a new payment submission in Pending state.
  public func submit(
    payments : Map.Map<Common.Id, Types.PaymentSubmission>,
    nextId : { var value : Nat },
    caller : Principal,
    planId : Common.Id,
    planName : Text,
    amount : Nat,
    utr : Text,
    screenshot : ?Common.FileRef,
    now : Common.Timestamp,
  ) : Types.PaymentResult {
    if (caller.isAnonymous()) {
      return #err("Sign in required to submit a payment");
    };
    let reference = utr.trim(#predicate(func(c) { c == ' ' }));
    if (reference == "") {
      return #err("UTR / Transaction ID is required");
    };
    if (amount == 0) {
      return #err("Payment amount must be greater than zero");
    };
    // Reject a duplicate UTR across all submissions.
    let duplicate = payments.values().any(
      func(p) { p.utr == reference }
    );
    if (duplicate) {
      return #err("This UTR / Transaction ID has already been submitted");
    };

    let id = nextId.value;
    nextId.value := id + 1;
    let submission : Types.PaymentSubmission = {
      id;
      user = caller;
      planId;
      planName;
      amount;
      utr = reference;
      screenshot;
      status = #pending;
      rejectionReason = null;
      submittedAt = now;
      reviewedAt = null;
    };
    payments.add(id, submission);
    #ok(toView(submission));
  };

  /// List the caller's own payment submissions.
  public func listOwn(
    payments : Map.Map<Common.Id, Types.PaymentSubmission>,
    caller : Principal,
  ) : [Types.PaymentView] {
    payments.values().toArray()
      .filter(func(p) { Principal.equal(p.user, caller) })
      .sort(func(a, b) { if (a.id > b.id) { #less } else if (a.id < b.id) { #greater } else { #equal } })
      .map(func(p) { toView(p) });
  };

  /// List every payment submission (admin).
  public func listAll(
    payments : Map.Map<Common.Id, Types.PaymentSubmission>,
  ) : [Types.PaymentView] {
    payments.values().toArray()
      .sort(func(a, b) { if (a.id > b.id) { #less } else if (a.id < b.id) { #greater } else { #equal } })
      .map(func(p) { toView(p) });
  };

  /// Read a payment submission by id.
  public func get(
    payments : Map.Map<Common.Id, Types.PaymentSubmission>,
    paymentId : Common.Id,
  ) : ?Types.PaymentSubmission {
    payments.get(paymentId);
  };

  /// Mark a payment approved.
  public func approve(
    payments : Map.Map<Common.Id, Types.PaymentSubmission>,
    paymentId : Common.Id,
    now : Common.Timestamp,
  ) : ?Types.PaymentSubmission {
    switch (payments.get(paymentId)) {
      case (null) { null };
      case (?payment) {
        if (payment.status != #pending) {
          return ?payment;
        };
        let updated : Types.PaymentSubmission = {
          payment with
          status = #approved;
          rejectionReason = null;
          reviewedAt = ?now;
        };
        payments.add(paymentId, updated);
        ?updated;
      };
    };
  };

  /// Mark a payment rejected with a reason.
  public func reject(
    payments : Map.Map<Common.Id, Types.PaymentSubmission>,
    paymentId : Common.Id,
    reason : Text,
    now : Common.Timestamp,
  ) : ?Types.PaymentSubmission {
    switch (payments.get(paymentId)) {
      case (null) { null };
      case (?payment) {
        if (payment.status != #pending) {
          return ?payment;
        };
        let updated : Types.PaymentSubmission = {
          payment with
          status = #rejected;
          rejectionReason = ?reason;
          reviewedAt = ?now;
        };
        payments.add(paymentId, updated);
        ?updated;
      };
    };
  };

  /// Convert a stored payment into its public view.
  public func toView(payment : Types.PaymentSubmission) : Types.PaymentView {
    {
      id = payment.id;
      user = payment.user;
      planId = payment.planId;
      planName = payment.planName;
      amount = payment.amount;
      utr = payment.utr;
      screenshot = payment.screenshot;
      status = payment.status;
      rejectionReason = payment.rejectionReason;
      submittedAt = payment.submittedAt;
      reviewedAt = payment.reviewedAt;
    };
  };
};
