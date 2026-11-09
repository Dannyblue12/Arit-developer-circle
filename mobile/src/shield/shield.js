// Shield: checks a payment before any money leaves. It only warns — it never
// moves or blocks funds by itself. Pure functions so the same rules can run
// on the phone, on the server, or behind a public API later.

const TRON_RE = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;
const EVM_RE = /^0x[0-9a-fA-F]{40}$/;

export const NETWORKS = {
  TRC20: { key: "TRC20", label: "Tron (TRC20)", re: TRON_RE },
  ERC20: { key: "ERC20", label: "Ethereum (ERC20)", re: EVM_RE },
};

export const CLEVA_MIN_DEPOSIT = 10;

// Seeded community reports for the demo. In production this list grows
// from user reports.
export const FLAGGED = [
  { address: "TXq9Dm4G7pRVnE1kS8yZc2LwBfHu6aJ3Nt", reports: 5 },
];

export function detectNetwork(address) {
  const a = (address || "").trim();
  if (TRON_RE.test(a)) return "TRC20";
  if (EVM_RE.test(a)) return "ERC20";
  return null;
}

// Same first 4 and last 4 characters, different middle: the classic
// address-poisoning pattern.
export function isLookalike(a, b) {
  if (!a || !b || a === b || a.length !== b.length) return false;
  const lo = (s) => s.toLowerCase();
  return lo(a.slice(0, 4)) === lo(b.slice(0, 4)) && lo(a.slice(-4)) === lo(b.slice(-4));
}

const item = (level, title, detail) => ({ level, title, detail });

// address, network: what the user is about to use
// amount: dollars (optional)
// contacts: [{ label, address, network }] the user has saved before
// destination: "cleva" when the address is a Cleva deposit address
export function checkSend({ address, network, amount, contacts = [], flagged = FLAGGED, destination }) {
  const addr = (address || "").trim();
  if (!addr) return { level: "idle", reasons: [] };

  const reasons = [];
  const detected = detectNetwork(addr);

  if (!detected) {
    reasons.push(
      item("danger", "Not a valid address", "This isn't a Tron or Ethereum address. Check that you copied all of it.")
    );
  } else if (network && detected !== network) {
    reasons.push(
      item(
        "danger",
        "Wrong network",
        `This address is on ${NETWORKS[detected].label}, but you picked ${NETWORKS[network].label}. Money sent on the wrong network is lost.`
      )
    );
  }

  const exact = contacts.find((c) => c.address === addr);
  const look = !exact && contacts.find((c) => isLookalike(c.address, addr));
  if (look) {
    reasons.push(
      item(
        "danger",
        "Lookalike address",
        `It starts and ends like “${look.label}”, but the middle is different. Scammers plant addresses like this in your history.`
      )
    );
  }

  const flag = flagged.find((f) => f.address === addr);
  if (flag) {
    reasons.push(item("danger", "Reported for scams", `${flag.reports} Wellsent users reported this address.`));
  }

  if (destination === "cleva" && amount != null && Number(amount) < CLEVA_MIN_DEPOSIT) {
    reasons.push(
      item(
        "danger",
        "Below Cleva's $10 minimum",
        "Cleva says stablecoin deposits under $10 are lost. Send $10 or more."
      )
    );
  }

  if (!exact && !look && !flag && detected && Number(amount) >= 100) {
    reasons.push(
      item("caution", "First payment to this address", "You've never sent here before. Confirm it with the owner on a call.")
    );
  }

  const level = reasons.some((r) => r.level === "danger")
    ? "danger"
    : reasons.some((r) => r.level === "caution")
    ? "caution"
    : "safe";

  if (level === "safe") {
    reasons.push(
      exact
        ? item("safe", `Matches “${exact.label}”`, `Saved ${NETWORKS[exact.network]?.label || "address"}. Network and amount look right.`)
        : item("safe", "No problems found", `Valid ${NETWORKS[detected].label} address, not reported by anyone.`)
    );
  }

  return { level, reasons, network: detected };
}
