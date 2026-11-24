import Common "common";

module {
  /// Stored user profile. Keyed by the caller principal.
  public type UserProfile = {
    fullName : Text;
    email : Text;
    mobile : Text;
    referralCode : Text;
    referredBy : ?Text;
    registeredAt : Common.Timestamp;
    profilePicture : ?Common.FileRef;
    blocked : Bool;
  };

  /// Public view of a user profile returned to the client.
  public type UserProfileView = {
    principal : Principal;
    fullName : Text;
    email : Text;
    mobile : Text;
    referralCode : Text;
    referredBy : ?Text;
    registeredAt : Common.Timestamp;
    profilePicture : ?Common.FileRef;
    blocked : Bool;
    emailVerified : Bool;
    mobileVerified : Bool;
  };

  /// Editable subset of a profile.
  public type ProfileUpdate = {
    fullName : Text;
    profilePicture : ?Common.FileRef;
  };

  /// Registration input supplied by the client.
  public type RegistrationInput = {
    fullName : Text;
    email : Text;
    mobile : Text;
    referralCode : ?Text;
  };

  /// Result of a registration attempt.
  public type RegistrationResult = {
    #ok : UserProfileView;
    #err : Text;
  };
};
