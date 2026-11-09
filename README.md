# Wellsent: money well sent.

**Trusted money between Nigerian students and the people who support them.**
Built for the **Cleva × Tether Future of Payments Hackathon (UNIUYO Edition)**.

Family abroad fund an **Upkeep Vault** in USDT. It unlocks a weekly payday that
lands straight in the student's **Cleva** account, keeps school fees aside for
the school's official channel, and only accepts money requests from inside the
app. **Shield** checks every payment before money leaves.

> USDT carries the rules. Cleva is the student's bank.

![Student screens](docs/wellsent-student-screens.png)
![Sponsor screens](docs/wellsent-sponsor-screens.png)

## What it solves

| Problem | Wellsent |
|---|---|
| Allowance arrives as a lump sum, gone by week 2 | Weekly paydays + a daily pace |
| Naira loses value while money sits | Stays in dollars until the student converts in Cleva |
| "Mummy, it's me, new number" scams | Verified Asks: requests only come through the app |
| School-fee fraud | Fees go only to the school's official channel, with a receipt |
| Emergencies | Emergency pot the student unlocks instantly (sponsor told, not asked) |
| Lookalike addresses, wrong networks, sub-$10 Cleva deposits | Shield warns before sending |

## How it uses Cleva

1. Every student signs up on Cleva (code **UNIUYO**) and verifies identity.
2. The student saves their Cleva USDT deposit address once (TRC20 or ERC20).
3. Every payday is sent to that address; Cleva converts it 1:1 to USD.
4. The student changes it to naira, keeps dollars, or uses the Cleva dollar card.
5. Shield enforces Cleva's deposit rules: never under $10, always the saved network.

Proposed with a Cleva partnership: "Verified by Cleva" identity badges, sponsor
funding through Cleva's licensed inbound-transfer rails, and Fees Direct via Cleva
naira payouts.

## The app (`mobile/`)

React Native (Expo SDK 51). Brand: indigo `#3538CD`, ink `#10153A`, payday gold
`#F5B800` (money moments only), Plus Jakarta Sans. Green/orange/red are reserved
for Shield verdicts.

```bash
cd mobile
npm install
npm start          # Expo Go on your phone
npm run web        # in a browser
npm test           # Shield + plan-rule tests
```

The prototype runs fully on-device with demo data: one phone can play both the
student and the sponsor (**Me → Demo controls → Switch**), and **Run payday**
fast-forwards to Monday. On web, `?demo=student` or `?demo=sponsor` opens a plan
four weeks in, and `&screen=Name` opens a specific screen.

### Screens

- **Shared:** Welcome · Sign up · Connect Cleva · Pair (invite code) · Shield check
- **Student:** Home (next payday, daily pace, progress) · Plan invite (5 promises) ·
  Payday landed · Asks · New ask · Emergency · Pull forward · School fees ·
  Weekly check-in · Activity · Me
- **Sponsor:** Home ("Is this really Chidi?") · Create plan (4 steps) · Fund vault ·
  Asks · Ask detail · Scam check · Plan detail · Me

### Plan rules (`src/state/planMath.js`, tested)

- At most 26 weeks (one semester); the app computes the payday so nothing is stranded.
- Every payday is at least $10 (Cleva's minimum); small plans switch to fortnightly.
- Emergency pot (default 15%) unlocks once a month without approval.
- Pull forward up to 2 paydays a month; later paydays shrink but never below $10.
- Reductions/cancellation need 2 weeks' notice; leftovers go to the student.

### Shield (`src/shield/shield.js`, tested)

Pure rules: invalid address, wrong network, lookalike of a saved address,
community-reported address, under Cleva's $10 minimum, and a caution for large
first payments. Changing the payday address needs sponsor confirmation and a
48-hour wait. Note: address checks are format-only; production should also
verify address checksums.

## Status

- **Done:** full UI and demo flow for both roles, plan rules, Shield rules, tests.
- **Simulated in the demo:** the vault contract, real USDT transfers, Cleva
  deposits, and Fees Direct payment.
- **Next:** vault smart contract (Tron/Ethereum, the networks Cleva accepts),
  WDK wallets, a real $10+ USDT deposit into Cleva for the pitch, and a backend
  for plans/asks so two phones stay in sync.

`backend/` still holds the earlier Savi API (Node/Express/MongoDB) from before
the pivot; it is not used by the Wellsent app yet.
