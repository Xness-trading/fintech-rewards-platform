import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/support";
import Common "../types/common";
import SupportLib "../lib/support";

mixin (
  accessControlState : AccessControl.AccessControlState,
  tickets : Map.Map<Common.Id, Types.SupportTicket>,
  ticketNextId : { var value : Nat },
) {
  /// Submit a support ticket.
  public shared ({ caller }) func submitSupportTicket(input : Types.TicketInput) : async Types.SupportTicketView {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can submit support tickets");
    };
    SupportLib.create(tickets, ticketNextId, caller, input, Time.now());
  };

  /// List the caller's own support tickets.
  public query ({ caller }) func listMySupportTickets() : async [Types.SupportTicketView] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can view support tickets");
    };
    SupportLib.listOwn(tickets, caller);
  };

  /// Admin: list every support ticket.
  public query ({ caller }) func adminListSupportTickets() : async [Types.SupportTicketView] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can list support tickets");
    };
    SupportLib.listAll(tickets);
  };

  /// Admin: update a support ticket's status.
  public shared ({ caller }) func adminSetTicketStatus(ticketId : Common.Id, status : Common.TicketStatus) : async ?Types.SupportTicketView {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update support tickets");
    };
    SupportLib.setStatus(tickets, ticketId, status, Time.now());
  };
};
