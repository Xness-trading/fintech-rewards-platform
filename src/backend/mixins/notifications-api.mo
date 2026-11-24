import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/notifications";
import Common "../types/common";
import NotificationsLib "../lib/notifications";

mixin (
  accessControlState : AccessControl.AccessControlState,
  notifications : Map.Map<Common.Id, Types.Notification>,
  notificationNextId : { var value : Nat },
) {
  /// List the caller's notifications.
  public query ({ caller }) func listMyNotifications() : async [Types.NotificationView] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can view notifications");
    };
    NotificationsLib.listOwn(notifications, caller);
  };

  /// Count the caller's unread notifications.
  public query ({ caller }) func getUnreadNotificationCount() : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can view notifications");
    };
    NotificationsLib.unreadCount(notifications, caller);
  };

  /// Mark one of the caller's notifications read.
  public shared ({ caller }) func markNotificationRead(notificationId : Common.Id) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can update notifications");
    };
    NotificationsLib.markRead(notifications, caller, notificationId);
  };

  /// Mark all of the caller's notifications read.
  public shared ({ caller }) func markAllNotificationsRead() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can update notifications");
    };
    NotificationsLib.markAllRead(notifications, caller);
  };
};
