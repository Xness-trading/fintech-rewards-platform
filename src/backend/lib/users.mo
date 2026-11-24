import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Char "mo:core/Char";
import Types "../types/users";
import ReferralTypes "../types/referrals";
import Common "../types/common";
import ReferralsLib "referrals";

module {
  /// Reward credited to a referrer when a referred user's purchase is verified.
  let referralRewardAmount : Nat = 199;

  /// Register a new user profile for the caller.
  public func register(
    profiles : Map.Map<Principal, Types.UserProfile>,
    emailIndex : Map.Map<Text, Principal>,
    mobileIndex : Map.Map<Text, Principal>,
    referralIndex : Map.Map<Text, Principal>,
    referrals : Map.Map<Common.Id, ReferralTypes.ReferralRecord>,
    referralNextId : { var value : Nat },
    caller : Principal,
    input : Types.RegistrationInput,
    referralCode : Text,
    now : Common.Timestamp,
  ) : Types.RegistrationResult {
    if (caller.isAnonymous()) {
      return #err("Sign in required to register");
    };
    if (profiles.containsKey(caller)) {
      return #err("An account already exists for this caller");
    };

    let email = normalizeEmail(input.email);
    let mobile = normalizeMobile(input.mobile);
    if (email == "") {
      return #err("Email address is required");
    };
    if (mobile == "") {
      return #err("A valid 10-digit mobile number is required");
    };
    if (input.fullName == "") {
      return #err("Full name is required");
    };

    switch (emailIndex.get(email)) {
      case (?_) { return #err("This email address is already registered") };
      case (null) {};
    };
    switch (mobileIndex.get(mobile)) {
      case (?_) { return #err("This mobile number is already registered") };
      case (null) {};
    };

    // Resolve the referrer from the supplied code, blocking self-referral.
    var referredBy : ?Text = null;
    var referrer : ?Principal = null;
    if (referralCode != "") {
      switch (referralIndex.get(referralCode)) {
        case (?found) {
          if (Principal.equal(found, caller)) {
            return #err("You cannot refer yourself");
          };
          referredBy := ?referralCode;
          referrer := ?found;
        };
        case (null) {
          return #err("Invalid referral code");
        };
      };
    };

    let code = generateReferralCode(referralIndex, caller.toText());
    let profile : Types.UserProfile = {
      fullName = input.fullName;
      email;
      mobile;
      referralCode = code;
      referredBy;
      registeredAt = now;
      profilePicture = null;
      blocked = false;
    };
    profiles.add(caller, profile);
    emailIndex.add(email, caller);
    mobileIndex.add(mobile, caller);
    referralIndex.add(code, caller);

    // Persist the referral relationship so the reward flow can find it.
    switch (referrer) {
      case (?referrerPrincipal) {
        ignore ReferralsLib.create(referrals, referralNextId, referrerPrincipal, caller, referralRewardAmount, now);
      };
      case (null) {};
    };

    #ok(toView(profile, caller, false, false));
  };

  /// Read the caller's own profile.
  public func getOwn(
    profiles : Map.Map<Principal, Types.UserProfile>,
    caller : Principal,
  ) : ?Types.UserProfile {
    profiles.get(caller);
  };

  /// Update the caller's editable profile fields.
  public func updateOwn(
    profiles : Map.Map<Principal, Types.UserProfile>,
    caller : Principal,
    update : Types.ProfileUpdate,
  ) : ?Types.UserProfile {
    switch (profiles.get(caller)) {
      case (null) { null };
      case (?profile) {
        let updated : Types.UserProfile = {
          profile with
          fullName = if (update.fullName == "") { profile.fullName } else { update.fullName };
          profilePicture = update.profilePicture;
        };
        profiles.add(caller, updated);
        ?updated;
      };
    };
  };

  /// Convert a stored profile into its public view.
  public func toView(
    profile : Types.UserProfile,
    principal : Principal,
    emailVerified : Bool,
    mobileVerified : Bool,
  ) : Types.UserProfileView {
    {
      principal;
      fullName = profile.fullName;
      email = profile.email;
      mobile = profile.mobile;
      referralCode = profile.referralCode;
      referredBy = profile.referredBy;
      registeredAt = profile.registeredAt;
      profilePicture = profile.profilePicture;
      blocked = profile.blocked;
      emailVerified;
      mobileVerified;
    };
  };

  /// Look up a profile by principal.
  public func getByPrincipal(
    profiles : Map.Map<Principal, Types.UserProfile>,
    user : Principal,
  ) : ?Types.UserProfile {
    profiles.get(user);
  };

  /// Search profiles by name, email or mobile substring.
  public func search(
    profiles : Map.Map<Principal, Types.UserProfile>,
    term : Text,
  ) : [Types.UserProfileView] {
    let needle = term.toLower();
    let matches = profiles.entries().filter(
      func((principal, profile)) {
        profile.fullName.toLower().contains(#text needle)
        or profile.email.toLower().contains(#text needle)
        or profile.mobile.contains(#text needle)
        or principal.toText().contains(#text needle);
      }
    );
    matches.map(
      func((principal, profile)) {
        toView(profile, principal, false, false);
      }
    ).toArray();
  };

  /// List every profile.
  public func listAll(
    profiles : Map.Map<Principal, Types.UserProfile>,
  ) : [Types.UserProfileView] {
    profiles.entries().map(
      func((principal, profile)) {
        toView(profile, principal, false, false);
      }
    ).toArray();
  };

  /// Set the blocked flag on a user.
  public func setBlocked(
    profiles : Map.Map<Principal, Types.UserProfile>,
    user : Principal,
    blocked : Bool,
  ) : Bool {
    switch (profiles.get(user)) {
      case (null) { false };
      case (?profile) {
        profiles.add(user, { profile with blocked });
        true;
      };
    };
  };

  /// Generate a unique referral code.
  public func generateReferralCode(
    referralIndex : Map.Map<Text, Principal>,
    seed : Text,
  ) : Text {
    let alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let chars = alphabet.toArray();
    let size = chars.size();
    var counter = 0;
    var candidate = "";
    label attempt loop {
      let digest = seed.concat(counter.toText());
      var acc : Nat = 0;
      for (c in digest.toArray().values()) {
        acc := (acc * 131 + c.toNat32().toNat()) % 1_000_000_007;
      };
      var code = "";
      var value = acc;
      var i = 0;
      while (i < 8) {
        let idx = value % size;
        code := code.concat(chars[idx].toText());
        value := value / size + 7;
        i += 1;
      };
      if (not referralIndex.containsKey(code)) {
        candidate := code;
        break attempt;
      };
      counter += 1;
    };
    candidate;
  };

  /// Lowercase and trim an email address.
  func normalizeEmail(email : Text) : Text {
    email.trim(#predicate(func(c) { c == ' ' })).toLower();
  };

  /// Keep only digits from a mobile number.
  func normalizeMobile(mobile : Text) : Text {
    let digits = mobile.toArray().filter(func(c) { c.isDigit() });
    if (digits.size() == 10) {
      digits.values().map(func(c) { c.toText() }).join("");
    } else {
      "";
    };
  };
};
