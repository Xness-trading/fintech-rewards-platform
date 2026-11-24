import Common "common";

module {
  /// A user-facing notification.
  public type Notification = {
    id : Common.Id;
    user : Principal;
    kind : Common.NotificationKind;
    title : Text;
    body : Text;
    read : Bool;
    createdAt : Common.Timestamp;
  };

  /// Public view of a notification.
  public type NotificationView = {
    id : Common.Id;
    kind : Common.NotificationKind;
    title : Text;
    body : Text;
    read : Bool;
    createdAt : Common.Timestamp;
  };
};
