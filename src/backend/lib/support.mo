import Int "mo:core/Int";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "../types/support";
import Common "../types/common";

module {
  /// Create a support ticket for the caller.
  public func create(
    tickets : Map.Map<Common.Id, Types.SupportTicket>,
    nextId : { var value : Nat },
    caller : Principal,
    input : Types.TicketInput,
    now : Common.Timestamp,
  ) : Types.SupportTicketView {
    let id = nextId.value;
    nextId.value += 1;
    let ticket : Types.SupportTicket = {
      id;
      user = caller;
      subject = input.subject;
      message = input.message;
      status = #open;
      createdAt = now;
      updatedAt = now;
    };
    tickets.add(id, ticket);
    toView(ticket);
  };

  /// List the caller's own support tickets, newest first.
  public func listOwn(
    tickets : Map.Map<Common.Id, Types.SupportTicket>,
    caller : Principal,
  ) : [Types.SupportTicketView] {
    let own = tickets.values().filter(func t = t.user == caller).toArray();
    let sorted = own.sort(func (a, b) = Int.compare(b.createdAt, a.createdAt));
    sorted.map(func t = toView(t));
  };

  /// List every support ticket (admin), newest first.
  public func listAll(
    tickets : Map.Map<Common.Id, Types.SupportTicket>,
  ) : [Types.SupportTicketView] {
    let all = tickets.values().toArray();
    let sorted = all.sort(func (a, b) = Int.compare(b.createdAt, a.createdAt));
    sorted.map(func t = toView(t));
  };

  /// Update a ticket's status (admin).
  public func setStatus(
    tickets : Map.Map<Common.Id, Types.SupportTicket>,
    ticketId : Common.Id,
    status : Common.TicketStatus,
    now : Common.Timestamp,
  ) : ?Types.SupportTicketView {
    switch (tickets.get(ticketId)) {
      case (?t) {
        let updated = { t with status; updatedAt = now };
        tickets.add(ticketId, updated);
        ?toView(updated);
      };
      case null { null };
    };
  };

  /// Convert a stored ticket into its public view.
  public func toView(ticket : Types.SupportTicket) : Types.SupportTicketView {
    {
      id = ticket.id;
      subject = ticket.subject;
      message = ticket.message;
      status = ticket.status;
      createdAt = ticket.createdAt;
      updatedAt = ticket.updatedAt;
    };
  };
};
