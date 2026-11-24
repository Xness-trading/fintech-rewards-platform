import Int "mo:core/Int";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "../types/notifications";
import Common "../types/common";

module {
  /// Create a notification for a user.
  public func create(
    notifications : Map.Map<Common.Id, Types.Notification>,
    nextId : { var value : Nat },
    user : Principal,
    kind : Common.NotificationKind,
    title : Text,
    body : Text,
    now : Common.Timestamp,
  ) : Common.Id {
    let id = nextId.value;
    nextId.value += 1;
    notifications.add(id, {
      id;
      user;
      kind;
      title;
      body;
      read = false;
      createdAt = now;
    });
    id;
  };

  /// List the caller's notifications, newest first.
  public func listOwn(
    notifications : Map.Map<Common.Id, Types.Notification>,
    caller : Principal,
  ) : [Types.NotificationView] {
    let own = notifications.values().filter(func n = n.user == caller).toArray();
    let sorted = own.sort(func (a, b) = Int.compare(b.createdAt, a.createdAt));
    sorted.map(func n = toView(n));
  };

  /// Count the caller's unread notifications.
  public func unreadCount(
    notifications : Map.Map<Common.Id, Types.Notification>,
    caller : Principal,
  ) : Nat {
    var count = 0;
    for (n in notifications.values()) {
      if (n.user == caller and not n.read) { count += 1 };
    };
    count;
  };

  /// Mark one notification read, scoped to the caller.
  public func markRead(
    notifications : Map.Map<Common.Id, Types.Notification>,
    caller : Principal,
    notificationId : Common.Id,
  ) : Bool {
    switch (notifications.get(notificationId)) {
      case (?n) {
        if (n.user != caller) { return false };
        notifications.add(notificationId, { n with read = true });
        true;
      };
      case null { false };
    };
  };

  /// Mark all of the caller's notifications read.
  public func markAllRead(
    notifications : Map.Map<Common.Id, Types.Notification>,
    caller : Principal,
  ) : () {
    let entries = notifications.entries().toArray();
    for ((id, n) in entries.values()) {
      if (n.user == caller and not n.read) {
        notifications.add(id, { n with read = true });
      };
    };
  };

  /// Convert a stored notification into its public view.
  public func toView(notification : Types.Notification) : Types.NotificationView {
    {
      id = notification.id;
      kind = notification.kind;
      title = notification.title;
      body = notification.body;
      read = notification.read;
      createdAt = notification.createdAt;
    };
  };
};
