import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import VerificationTokens "mo:caffeineai-email-verification/verificationTokens";
import VerifiedEmails "mo:caffeineai-email-verification/verifiedEmails";

module {
  // --- Inlined app types (migrations must be self-contained) ---
  type Timestamp = Int;
  type Id = Nat;

  type UserProfile = {
    fullName : Text;
    email : Text;
    mobile : Text;
    referralCode : Text;
    referredBy : ?Text;
    registeredAt : Timestamp;
    profilePicture : ?Blob;
    blocked : Bool;
  };

  type MembershipPlan = {
    id : Id;
    name : Text;
    price : Nat;
    validityDays : Nat;
    benefits : [Text];
    rewardDetails : Text;
    popular : Bool;
  };

  type Membership = {
    planId : Id;
    planName : Text;
    activatedAt : Timestamp;
    expiresAt : Timestamp;
  };

  type PaymentStatus = { #pending; #approved; #rejected };

  type PaymentSubmission = {
    id : Id;
    user : Principal;
    planId : Id;
    planName : Text;
    amount : Nat;
    utr : Text;
    screenshot : ?Blob;
    status : PaymentStatus;
    rejectionReason : ?Text;
    submittedAt : Timestamp;
    reviewedAt : ?Timestamp;
  };

  type TransactionKind = { #credit; #debit };
  type TransactionType = { #payment; #reward; #referral; #withdrawal };
  type TransactionStatus = { #pending; #completed; #failed };

  type WalletTransaction = {
    id : Id;
    user : Principal;
    kind : TransactionKind;
    txType : TransactionType;
    amount : Nat;
    status : TransactionStatus;
    reference : ?Text;
    createdAt : Timestamp;
  };

  type ReferralStatus = { #pending; #eligible; #rewarded; #rejected };

  type ReferralRecord = {
    id : Id;
    referrer : Principal;
    referred : Principal;
    status : ReferralStatus;
    rewardAmount : Nat;
    createdAt : Timestamp;
    rewardedAt : ?Timestamp;
  };

  type WithdrawalStatus = { #pending; #approved; #rejected; #completed };
  type WithdrawalMethod = { #upi; #bank };

  type UpiDetails = {
    upiId : Text;
    accountHolderName : Text;
  };

  type BankDetails = {
    accountHolderName : Text;
    bankName : Text;
    accountNumber : Text;
    ifscCode : Text;
  };

  type WithdrawalRequest = {
    id : Id;
    user : Principal;
    method : WithdrawalMethod;
    upi : ?UpiDetails;
    bank : ?BankDetails;
    amount : Nat;
    status : WithdrawalStatus;
    rejectionReason : ?Text;
    paymentReference : ?Text;
    requestedAt : Timestamp;
    reviewedAt : ?Timestamp;
  };

  type NotificationKind = {
    #registration;
    #verification;
    #paymentSubmitted;
    #paymentApproved;
    #paymentRejected;
    #membershipActivated;
    #membershipExpiring;
    #rewardCredited;
    #referralSuccessful;
    #withdrawalApproved;
    #withdrawalRejected;
    #withdrawalCompleted;
  };

  type Notification = {
    id : Id;
    user : Principal;
    kind : NotificationKind;
    title : Text;
    body : Text;
    read : Bool;
    createdAt : Timestamp;
  };

  type TicketStatus = { #open; #inProgress; #resolved; #closed };

  type SupportTicket = {
    id : Id;
    user : Principal;
    subject : Text;
    message : Text;
    status : TicketStatus;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  type AdminSettings = {
    companyUpiId : Text;
    paymentQrImage : ?Blob;
    minWithdrawalAmount : Nat;
  };

  public type OldActor = {};

  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    verifiedEmails : VerifiedEmails.State;
    verificationTokens : VerificationTokens.State;
    profiles : Map.Map<Principal, UserProfile>;
    emailIndex : Map.Map<Text, Principal>;
    mobileIndex : Map.Map<Text, Principal>;
    referralIndex : Map.Map<Text, Principal>;
    verifiedMobiles : Map.Map<Text, Bool>;
    plans : Map.Map<Id, MembershipPlan>;
    memberships : Map.Map<Principal, Membership>;
    payments : Map.Map<Id, PaymentSubmission>;
    paymentNextId : { var value : Nat };
    transactions : Map.Map<Id, WalletTransaction>;
    transactionNextId : { var value : Nat };
    referrals : Map.Map<Id, ReferralRecord>;
    referralNextId : { var value : Nat };
    withdrawals : Map.Map<Id, WithdrawalRequest>;
    withdrawalNextId : { var value : Nat };
    notifications : Map.Map<Id, Notification>;
    notificationNextId : { var value : Nat };
    tickets : Map.Map<Id, SupportTicket>;
    ticketNextId : { var value : Nat };
    settings : { var value : AdminSettings };
    activeMemberships : { var value : Nat };
  };

  public func migration(old : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      verifiedEmails = VerifiedEmails.new();
      verificationTokens = VerificationTokens.new();
      profiles = Map.empty();
      emailIndex = Map.empty();
      mobileIndex = Map.empty();
      referralIndex = Map.empty();
      verifiedMobiles = Map.empty();
      plans = Map.empty();
      memberships = Map.empty();
      payments = Map.empty();
      paymentNextId = { var value = 0 };
      transactions = Map.empty();
      transactionNextId = { var value = 0 };
      referrals = Map.empty();
      referralNextId = { var value = 0 };
      withdrawals = Map.empty();
      withdrawalNextId = { var value = 0 };
      notifications = Map.empty();
      notificationNextId = { var value = 0 };
      tickets = Map.empty();
      ticketNextId = { var value = 0 };
      settings = { var value = { companyUpiId = ""; paymentQrImage = null; minWithdrawalAmount = 0 } };
      activeMemberships = { var value = 0 };
    };
  };
};
