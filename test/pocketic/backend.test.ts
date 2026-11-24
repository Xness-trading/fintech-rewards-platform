import { PocketIc, createIdentity } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";
import { registerCaller } from "./test-utils";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];
let admin: Actor<_SERVICE>;

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ canisterId } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
  }));
  // The first initialized caller becomes the administrator, so claim it before
  // any other test registers a caller on this shared canister.
  admin = pic.createActor<_SERVICE>(idlFactory, canisterId);
  await registerCaller(admin, createIdentity("admin"));
});

afterAll(async () => {
  await pic?.tearDown();
});

/** A fresh actor for a distinct caller, registered through the public flow. */
async function registeredActor(
  seed: string,
  fullName: string,
  email: string,
  mobile: string,
): Promise<Actor<_SERVICE>> {
  const identity = createIdentity(seed);
  const actor = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  await registerCaller(actor, identity);
  const result = await actor.registerUser({
    fullName,
    email,
    mobile,
    referralCode: [],
  });
  expect(result).toHaveProperty("ok");
  return actor;
}

describe("backend canister", () => {
  it("seeds exactly seven plans with the ₹500 plan popular and 30-day validity", async () => {
    const actor = pic!.createActor<_SERVICE>(idlFactory, canisterId);
    const plans = await actor.listPlans();

    expect(plans).toHaveLength(7);
    const prices = plans.map((plan) => plan.price).sort((a, b) => Number(a - b));
    expect(prices).toEqual([150n, 300n, 500n, 999n, 1999n, 4999n, 9999n]);
    expect(plans.every((plan) => plan.validityDays === 30n)).toBe(true);

    const popular = plans.filter((plan) => plan.popular);
    expect(popular).toHaveLength(1);
    expect(popular[0].price).toBe(500n);
  });

  it("rejects a duplicate email or mobile registration", async () => {
    const first = pic!.createActor<_SERVICE>(idlFactory, canisterId);
    await registerCaller(first, createIdentity("dup-first"));
    const firstResult = await first.registerUser({
      fullName: "Aarav Sharma",
      email: "aarav@example.com",
      mobile: "9876543210",
      referralCode: [],
    });
    expect(firstResult).toHaveProperty("ok");

    const second = pic!.createActor<_SERVICE>(idlFactory, canisterId);
    await registerCaller(second, createIdentity("dup-second"));
    const duplicateEmail = await second.registerUser({
      fullName: "Rohan Verma",
      email: "aarav@example.com",
      mobile: "9123456780",
      referralCode: [],
    });
    expect(duplicateEmail).toHaveProperty("err");

    const third = pic!.createActor<_SERVICE>(idlFactory, canisterId);
    await registerCaller(third, createIdentity("dup-third"));
    const duplicateMobile = await third.registerUser({
      fullName: "Rohan Verma",
      email: "rohan@example.com",
      mobile: "9876543210",
      referralCode: [],
    });
    expect(duplicateMobile).toHaveProperty("err");
  });

  it("rejects a duplicate UTR and keeps the payment pending without activating membership", async () => {
    const actor = await registeredActor(
      "utr-user",
      "Aarav Sharma",
      "utr@example.com",
      "9000000010",
    );

    const first = await actor.submitPayment({
      utr: "402312345678",
      planId: 3n,
      screenshot: [],
    });
    expect(first).toHaveProperty("ok");
    if ("ok" in first) {
      expect(first.ok.status).toEqual({ pending: null });
    }

    const duplicate = await actor.submitPayment({
      utr: "402312345678",
      planId: 3n,
      screenshot: [],
    });
    expect(duplicate).toHaveProperty("err");

    const payments = await actor.listMyPayments();
    expect(payments).toHaveLength(1);
    expect(payments[0].status).toEqual({ pending: null });

    const wallet = await actor.getWalletSummary();
    expect(wallet.availableBalance).toBe(0n);
  });

  it("isolates each user's payments, wallet and withdrawals", async () => {
    const alice = await registeredActor(
      "iso-alice",
      "Alice Rao",
      "alice@example.com",
      "9000000001",
    );
    const bob = await registeredActor(
      "iso-bob",
      "Bob Nair",
      "bob@example.com",
      "9000000002",
    );

    const submitted = await alice.submitPayment({
      utr: "111122223333",
      planId: 3n,
      screenshot: [],
    });
    expect(submitted).toHaveProperty("ok");

    expect(await alice.listMyPayments()).toHaveLength(1);
    expect(await bob.listMyPayments()).toHaveLength(0);
    expect(await bob.listMyWithdrawals()).toHaveLength(0);
  });

  it("rejects a withdrawal above the withdrawable balance", async () => {
    const actor = await registeredActor(
      "wd-user",
      "Aarav Sharma",
      "wd@example.com",
      "9000000011",
    );

    const result = await actor.requestUpiWithdrawal({
      accountHolderName: "Aarav Sharma",
      upiId: "aarav@bank",
      amount: 500n,
    });
    expect(result).toHaveProperty("err");
    expect(await actor.listMyWithdrawals()).toHaveLength(0);
  });

  it("activates membership only after an admin approves the payment", async () => {
    expect(await admin.getCallerUserRole()).toEqual({ admin: null });

    const user = await registeredActor(
      "approve-user",
      "Aarav Sharma",
      "approve@example.com",
      "9000000012",
    );
    const submitted = await user.submitPayment({
      utr: "999988887777",
      planId: 3n,
      screenshot: [],
    });
    expect(submitted).toHaveProperty("ok");

    const pending = await admin.adminListPayments();
    const mine = pending.filter((payment) => payment.utr === "999988887777");
    expect(mine).toHaveLength(1);
    expect(mine[0].status).toEqual({ pending: null });

    const approved = await admin.adminApprovePayment(mine[0].id);
    expect(approved).toHaveLength(1);
    expect(approved[0].status).toEqual({ approved: null });

    const refreshed = await user.listMyPayments();
    expect(refreshed[0].status).toEqual({ approved: null });

    const transactions = await user.listMyTransactions();
    expect(transactions.length).toBeGreaterThan(0);
  });
});
