import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useMySupportTickets,
  useSubmitSupportTicket,
} from "@/hooks/useQueries";
import { formatDateTime, humanize } from "@/lib/format";
import { ticketTone } from "@/lib/status";
import {
  CheckCircle2,
  Clock,
  LifeBuoy,
  Mail,
  MessageCircle,
  Phone,
  Send,
  Ticket,
} from "lucide-react";
import { useState } from "react";

const SUPPORT_EMAIL = "support@kuberx.in";
const SUPPORT_PHONE = "+91 90000 12345";
const WHATSAPP_NUMBER = "919000012345";
const WHATSAPP_MESSAGE = "Hi KuberX Support, I need help with my account.";

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How do I activate my membership plan?",
    answer:
      "Choose a plan from the Plans page, complete the payment, and submit the payment reference. Once our team verifies the payment, your membership is activated automatically and you receive an alert.",
  },
  {
    question: "When are referral rewards credited?",
    answer:
      "A referral becomes eligible once the person you invited activates a paid membership. Rewards are reviewed by our team and credited to your wallet, where you can track them under Referrals.",
  },
  {
    question: "How long do withdrawals take?",
    answer:
      "Withdrawal requests are reviewed within 24–48 working hours. Approved amounts are transferred to your UPI ID or bank account, and you can follow the status on the Withdraw page.",
  },
  {
    question: "Why is my payment still pending?",
    answer:
      "Payments are manually verified to keep the platform secure. If your payment stays pending for more than 48 hours, raise a complaint below with your payment reference and we will resolve it quickly.",
  },
  {
    question: "How do I update my profile details?",
    answer:
      "Open the Profile page to update your name, email, mobile number and profile picture. Keep your contact details current so we can reach you about payments and rewards.",
  },
];

const POLICIES: { value: string; title: string; body: string[] }[] = [
  {
    value: "terms",
    title: "Terms and Conditions",
    body: [
      "By creating an account on KuberX you agree to provide accurate personal information and to keep your login credentials secure. You are responsible for all activity performed through your account.",
      "Membership plans are offered for the durations shown on the Plans page. Plan benefits, referral rewards and payout rates may be revised by KuberX with prior notice on this page.",
      "Referral rewards are credited only for genuine, verified memberships. Self-referrals, duplicate accounts, automated sign-ups and any attempt to manipulate rewards will result in forfeiture of earnings and suspension of the account.",
      "KuberX may suspend or terminate accounts that violate these terms, engage in fraudulent activity, or misuse the platform. Continued use of the platform constitutes acceptance of the current terms.",
    ],
  },
  {
    value: "privacy",
    title: "Privacy Policy",
    body: [
      "We collect only the information required to operate your account: your name, email, mobile number, payment references and withdrawal details. This data is used to verify payments, credit rewards and process payouts.",
      "Your personal information is never sold to third parties. It is shared only with payment and banking partners strictly to the extent needed to complete a transaction you have requested.",
      "Account data is stored securely and access is limited to authorised personnel. You may request a copy or deletion of your personal data by contacting support, subject to records we are legally required to retain.",
      "By using KuberX you consent to this policy. Any material change to how we handle your data will be communicated through an in-app alert before it takes effect.",
    ],
  },
  {
    value: "refund",
    title: "Refund Policy",
    body: [
      "Membership fees are charged for access to plan benefits and are generally non-refundable once a plan has been activated.",
      "If a payment was deducted but your membership was not activated, contact support with the payment reference. Verified failed or duplicate transactions are refunded to the original payment method within 5–7 working days.",
      "Refund requests must be raised within 7 days of the transaction. Requests made after this window may not be eligible, except where required by applicable law.",
      "Approved refunds are processed to the source account used for the payment. KuberX does not issue refunds in cash or to a different account.",
    ],
  },
];

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const ticketsQuery = useMySupportTickets();
  const submitTicket = useSubmitSupportTicket();

  const tickets = ticketsQuery.data ?? [];
  const canSubmit = subject.trim().length > 0 && message.trim().length > 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || submitTicket.isPending) return;

    const payload = { subject: subject.trim(), message: message.trim() };
    setSubject("");
    setMessage("");
    setSubmitted(false);

    submitTicket.mutate(payload, {
      onSuccess: () => setSubmitted(true),
      onError: () => {
        setSubject((current) => (current === "" ? payload.subject : current));
        setMessage((current) => (current === "" ? payload.message : current));
      },
    });
  }

  return (
    <div data-ocid="support.page" className="space-y-8">
      <PageHeader
        title="Support"
        description="Reach our team, raise a complaint and track your tickets."
      />

      {/* Contact channels */}
      <section
        data-ocid="support.contact.section"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <Card className="glass rounded-lg border-border/60 shadow-none">
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Mail className="size-5" aria-hidden="true" />
            </div>
            <CardTitle className="font-display text-base">Email us</CardTitle>
            <CardDescription>
              We reply to every email within one working day.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              data-ocid="support.email.link"
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-sm font-medium text-primary transition-smooth hover:text-accent"
            >
              {SUPPORT_EMAIL}
            </a>
          </CardContent>
        </Card>

        <Card className="glass rounded-lg border-border/60 shadow-none">
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-full bg-accent/15 text-accent">
              <Phone className="size-5" aria-hidden="true" />
            </div>
            <CardTitle className="font-display text-base">Call us</CardTitle>
            <CardDescription>Mon–Sat, 10:00 am to 7:00 pm IST.</CardDescription>
          </CardHeader>
          <CardContent>
            <a
              data-ocid="support.phone.link"
              href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`}
              className="text-sm font-medium text-primary transition-smooth hover:text-accent"
            >
              {SUPPORT_PHONE}
            </a>
          </CardContent>
        </Card>

        <Card className="glass rounded-lg border-border/60 shadow-none sm:col-span-2 lg:col-span-1">
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-full bg-success/15 text-success">
              <MessageCircle className="size-5" aria-hidden="true" />
            </div>
            <CardTitle className="font-display text-base">
              WhatsApp support
            </CardTitle>
            <CardDescription>
              Chat with us for quick help on payments and payouts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              data-ocid="support.whatsapp.button"
              className="w-full rounded-full bg-gradient-primary text-primary-foreground transition-smooth hover:opacity-90"
            >
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  WHATSAPP_MESSAGE,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                Chat on WhatsApp
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Complaint form */}
        <Card
          data-ocid="support.form.card"
          className="glass-strong rounded-lg border-border/60 shadow-none"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <LifeBuoy className="size-5 text-primary" aria-hidden="true" />
              Submit a complaint
            </CardTitle>
            <CardDescription>
              Describe your issue and our team will get back to you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              data-ocid="support.form"
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="support-subject">Subject</Label>
                <Input
                  id="support-subject"
                  data-ocid="support.subject.input"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="e.g. Payment not credited"
                  maxLength={120}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="support-message">Message</Label>
                <Textarea
                  id="support-message"
                  data-ocid="support.message.textarea"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Share the details of your issue, including any payment reference."
                  rows={5}
                  maxLength={2000}
                  required
                />
              </div>

              {submitTicket.isError && (
                <p
                  data-ocid="support.form.error_state"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  We could not submit your complaint. Please try again.
                </p>
              )}

              {submitted && (
                <output
                  data-ocid="support.form.success_state"
                  className="flex items-center gap-2 text-sm text-success"
                >
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  Complaint submitted. We will respond shortly.
                </output>
              )}

              <Button
                type="submit"
                data-ocid="support.submit_button"
                disabled={!canSubmit || submitTicket.isPending}
                className="w-full rounded-full bg-gradient-primary text-primary-foreground transition-smooth hover:opacity-90"
              >
                <Send className="size-4" aria-hidden="true" />
                {submitTicket.isPending ? "Submitting…" : "Submit complaint"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* My tickets */}
        <Card
          data-ocid="support.tickets.card"
          className="glass rounded-lg border-border/60 shadow-none"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <Ticket className="size-5 text-accent" aria-hidden="true" />
              My tickets
            </CardTitle>
            <CardDescription>
              Track the status of complaints you have raised.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ticketsQuery.isLoading ? (
              <div
                data-ocid="support.tickets.loading_state"
                className="space-y-3"
              >
                {Array.from(
                  { length: 3 },
                  (_, i) => `ticket-skeleton-${i}`,
                ).map((id) => (
                  <Skeleton key={id} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            ) : tickets.length === 0 ? (
              <div
                data-ocid="support.tickets.empty_state"
                className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/60 px-6 py-10 text-center"
              >
                <Ticket
                  className="size-8 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="text-sm font-medium">No tickets yet</p>
                <p className="text-sm text-muted-foreground">
                  Complaints you submit will appear here with their status.
                </p>
              </div>
            ) : (
              <ul data-ocid="support.tickets.list" className="space-y-3">
                {tickets.map((ticket, index) => (
                  <li
                    key={ticket.id.toString()}
                    data-ocid={`support.ticket.item.${index + 1}`}
                    className="rounded-lg border border-border/60 bg-card/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 break-words font-medium">
                        {ticket.subject}
                      </p>
                      <StatusBadge
                        label={humanize(ticket.status)}
                        tone={ticketTone(ticket.status)}
                      />
                    </div>
                    <p className="mt-1 line-clamp-2 break-words text-sm text-muted-foreground">
                      {ticket.message}
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="size-3.5" aria-hidden="true" />
                      {formatDateTime(ticket.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <section data-ocid="support.faq.section" className="space-y-4">
        <h2 className="font-display text-xl font-bold tracking-tight">
          Frequently asked questions
        </h2>
        <Card className="glass rounded-lg border-border/60 shadow-none">
          <CardContent className="pt-2">
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((faq, index) => (
                <AccordionItem
                  key={faq.question}
                  value={`faq-${index}`}
                  data-ocid={`support.faq.item.${index + 1}`}
                >
                  <AccordionTrigger className="text-left font-medium hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </section>

      {/* Policies */}
      <section data-ocid="support.policies.section" className="space-y-4">
        <h2 className="font-display text-xl font-bold tracking-tight">
          Policies
        </h2>
        <Card className="glass rounded-lg border-border/60 shadow-none">
          <CardContent className="pt-2">
            <Accordion type="single" collapsible className="w-full">
              {POLICIES.map((policy, index) => (
                <AccordionItem
                  key={policy.value}
                  value={policy.value}
                  data-ocid={`support.policy.item.${index + 1}`}
                >
                  <AccordionTrigger className="text-left font-medium hover:no-underline">
                    {policy.title}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-muted-foreground">
                      {policy.body.map((paragraph) => (
                        <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
