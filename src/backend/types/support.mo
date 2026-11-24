import Common "common";

module {
  /// A support ticket submitted by a user.
  public type SupportTicket = {
    id : Common.Id;
    user : Principal;
    subject : Text;
    message : Text;
    status : Common.TicketStatus;
    createdAt : Common.Timestamp;
    updatedAt : Common.Timestamp;
  };

  /// Public view of a support ticket.
  public type SupportTicketView = {
    id : Common.Id;
    subject : Text;
    message : Text;
    status : Common.TicketStatus;
    createdAt : Common.Timestamp;
    updatedAt : Common.Timestamp;
  };

  /// Input for submitting a support ticket.
  public type TicketInput = {
    subject : Text;
    message : Text;
  };
};
