import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import VerifiedEmails "mo:caffeineai-email-verification/verifiedEmails";
import Types "../types/users";
import ReferralTypes "../types/referrals";
import Common "../types/common";
import UsersLib "../lib/users";

mixin (
  accessControlState : AccessControl.AccessControlState,
  profiles : Map.Map<Principal, Types.UserProfile>,
  emailIndex : Map.Map<Text, Principal>,
  mobileIndex : Map.Map<Text, Principal>,
  referralIndex : Map.Map<Text, Principal>,
  referrals : Map.Map<Common.Id, ReferralTypes.ReferralRecord>,
  referralNextId : { var value : Nat },
  verifiedEmails : VerifiedEmails.State,
  verifiedMobiles : Map.Map<Text, Bool>,
) {
  /// Whether the caller holds the admin role, without trapping for guests.
  func usersCallerIsAdmin(caller : Principal) : Bool {
    if (caller.isAnonymous()) { return false };
    switch (accessControlState.userRoles.get(caller)) {
      case (?#admin) { true };
      case (_) { false };
    };
  };

  /// Read the mobile verification flag for a stored mobile number.
  func isMobileVerified(mobile : Text) : Bool {
    switch (verifiedMobiles.get(mobile)) {
      case (?flag) { flag };
      case (null) { false };
    };
  };

  /// Register the caller's profile. Requires a signed-in caller.
  public shared ({ caller }) func registerUser(input : Types.RegistrationInput) : async Types.RegistrationResult {
    let now = Time.now();
    let code = input.referralCode ?? "";
    UsersLib.register(profiles, emailIndex, mobileIndex, referralIndex, referrals, referralNextId, caller, input, code, now);
  };

  /// Read the caller's own profile.
  public query ({ caller }) func getCallerProfile() : async ?Types.UserProfileView {
    switch (UsersLib.getOwn(profiles, caller)) {
      case (null) { null };
      case (?profile) {
        ?UsersLib.toView(profile, caller, VerifiedEmails.contains(verifiedEmails, profile.email), isMobileVerified(profile.mobile));
      };
    };
  };

  /// Update the caller's editable profile fields.
  public shared ({ caller }) func updateCallerProfile(update : Types.ProfileUpdate) : async ?Types.UserProfileView {
    switch (UsersLib.updateOwn(profiles, caller, update)) {
      case (null) { null };
      case (?profile) {
        ?UsersLib.toView(profile, caller, VerifiedEmails.contains(verifiedEmails, profile.email), isMobileVerified(profile.mobile));
      };
    };
  };

  /// Whether the caller's email is verified.
  public query ({ caller }) func isCallerEmailVerified() : async Bool {
    switch (UsersLib.getOwn(profiles, caller)) {
      case (null) { false };
      case (?profile) { VerifiedEmails.contains(verifiedEmails, profile.email) };
    };
  };

  /// Whether the caller's mobile is verified.
  public query ({ caller }) func isCallerMobileVerified() : async Bool {
    switch (UsersLib.getOwn(profiles, caller)) {
      case (null) { false };
      case (?profile) { isMobileVerified(profile.mobile) };
    };
  };

  /// Admin: list every registered user.
  public query ({ caller }) func adminListUsers() : async [Types.UserProfileView] {
    if (not usersCallerIsAdmin(caller)) { return [] };
    UsersLib.listAll(profiles).map(
      func(view) {
        { view with emailVerified = VerifiedEmails.contains(verifiedEmails, view.email); mobileVerified = isMobileVerified(view.mobile) };
      }
    );
  };

  /// Admin: search users by name, email or mobile.
  public query ({ caller }) func adminSearchUsers(term : Text) : async [Types.UserProfileView] {
    if (not usersCallerIsAdmin(caller)) { return [] };
    UsersLib.search(profiles, term).map(
      func(view) {
        { view with emailVerified = VerifiedEmails.contains(verifiedEmails, view.email); mobileVerified = isMobileVerified(view.mobile) };
      }
    );
  };

  /// Admin: read one user's profile.
  public query ({ caller }) func adminGetUser(user : Principal) : async ?Types.UserProfileView {
    if (not usersCallerIsAdmin(caller)) { return null };
    switch (UsersLib.getByPrincipal(profiles, user)) {
      case (null) { null };
      case (?profile) {
        ?UsersLib.toView(profile, user, VerifiedEmails.contains(verifiedEmails, profile.email), isMobileVerified(profile.mobile));
      };
    };
  };

  /// Admin: block or unblock a user.
  public shared ({ caller }) func adminSetUserBlocked(user : Principal, blocked : Bool) : async Bool {
    if (not usersCallerIsAdmin(caller)) { return false };
    UsersLib.setBlocked(profiles, user, blocked);
  };
};
