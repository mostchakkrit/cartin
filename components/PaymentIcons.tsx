export const BANKS = [
  { id: "kbank",  name: "กสิกรไทย (KBank)",       color: "#138f2d", text: "KBANK" },
  { id: "scb",    name: "ไทยพาณิชย์ (SCB)",        color: "#4e2d8e", text: "SCB"   },
  { id: "bbl",    name: "กรุงเทพ (BBL)",           color: "#1e3a8a", text: "BBL"   },
  { id: "ktb",    name: "กรุงไทย (KTB)",           color: "#0284c7", text: "KTB"   },
  { id: "bay",    name: "กรุงศรี (BAY)",           color: "#d97706", text: "BAY"   },
  { id: "ttb",    name: "ทหารไทยธนชาต (TTB)",      color: "#0f766e", text: "TTB"   },
  { id: "gsb",    name: "ออมสิน (GSB)",            color: "#db2777", text: "GSB"   },
  { id: "baac",   name: "ธ.ก.ส. (BAAC)",          color: "#15803d", text: "BAAC"  },
];

export function BankIcon({ bankId, size = 32 }: { bankId: string; size?: number }) {
  const bank = BANKS.find((b) => b.id === bankId);
  if (!bank) return null;
  return (
    <span
      style={{ background: bank.color, width: size, height: size, fontSize: size * 0.28 }}
      className="inline-flex items-center justify-center rounded-lg text-white font-bold flex-shrink-0"
    >
      {bank.text}
    </span>
  );
}

export function VisaIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size * 1.6} height={size} viewBox="0 0 50 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="50" height="32" rx="4" fill="#1A1F71" />
      <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fill="white" fontFamily="Arial" fontWeight="bold" fontSize="14" letterSpacing="1">VISA</text>
    </svg>
  );
}

export function MastercardIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size * 1.6} height={size} viewBox="0 0 50 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="50" height="32" rx="4" fill="#252525" />
      <circle cx="19" cy="16" r="9" fill="#EB001B" />
      <circle cx="31" cy="16" r="9" fill="#F79E1B" />
      <path d="M25 9.2a9 9 0 0 1 0 13.6A9 9 0 0 1 25 9.2z" fill="#FF5F00" />
    </svg>
  );
}

export function CodIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#16a34a" />
      <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial">COD</text>
    </svg>
  );
}
