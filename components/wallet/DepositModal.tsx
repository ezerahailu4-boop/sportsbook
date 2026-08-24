"use client";

import { useState, useRef } from "react";
import { 
  X, 
  Wallet, 
  CheckCircle2, 
  AlertCircle, 
  ArrowDownLeft, 
  ShieldCheck, 
  Copy, 
  Check, 
  Upload, 
  FileText, 
  Image as ImageIcon,
  Smartphone,
  Building2,
  ChevronRight,
  Info
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { apiFetch, ApiError } from "@/lib/api-client";

const DEPOSIT_PRESETS = [200, 500, 1000, 2500, 5000];

export function DepositModal() {
  const { isDepositModalOpen, closeDepositModal, user, setUser, updateWalletBalance } = useAuthStore();
  
  const [step, setStep] = useState<"SELECT" | "PROOF" | "SUCCESS">("SELECT");
  const [paymentMethod, setPaymentMethod] = useState<"telebirr" | "cbe">("telebirr");
  const [amount, setAmount] = useState("500");
  
  // Proof details
  const [senderName, setSenderName] = useState("");
  const [senderAccount, setSenderAccount] = useState("");
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotFileName, setScreenshotFileName] = useState<string | null>(null);
  
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isDepositModalOpen) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please upload an image file (PNG, JPG, JPEG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Screenshot size must be under 5MB.");
      return;
    }

    setScreenshotFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotPreview(reader.result as string);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setErrorMessage("Please enter a valid deposit amount.");
      setLoading(false);
      return;
    }

    if (!senderName.trim()) {
      setErrorMessage("Please provide the Sender Full Name as shown on the receipt.");
      setLoading(false);
      return;
    }

    if (!senderAccount.trim()) {
      setErrorMessage("Please provide the Sender Phone / Account Number you transferred from.");
      setLoading(false);
      return;
    }

    try {
      const idempotencyKey = crypto.randomUUID();
      
      // Submit deposit confirmation
      await apiFetch<{ transactionId: string; status: string }>("/api/wallet/deposit", {
        method: "POST",
        body: JSON.stringify({
          amount: numericAmount,
          currency: "ETB",
          paymentMethod,
          senderName: senderName.trim(),
          senderAccount: senderAccount.trim(),
          screenshotUrl: screenshotPreview || undefined,
          idempotencyKey,
        }),
      });

      // Complete deposit record & refresh user profile
      const me = await apiFetch<{ id: string; email: string; firstName: string; lastName: string; role: any; status: any; kycStatus: any; country: string; wallet: any }>("/api/auth/me");
      setUser(me.data);
      setStep("SUCCESS");
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setStep("SUCCESS");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setStep("SELECT");
    setSenderName("");
    setSenderAccount("");
    setScreenshotPreview(null);
    setScreenshotFileName(null);
    setErrorMessage(null);
    closeDepositModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Deposit Funds</h3>
              <p className="text-[10px] text-slate-400">Telebirr & CBE Birr Instant Payment</p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {step === "SUCCESS" ? (
            /* Success State */
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 mb-4 animate-bounce">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-bold text-white">Deposit Submitted to Admin!</h4>
              <p className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed">
                Your deposit proof of <span className="font-bold text-emerald-400 font-mono text-sm">{Number(amount).toLocaleString()} ETB</span> has been forwarded to the Admin Verification Desk.
              </p>
              
              <div className="w-full rounded-2xl bg-slate-950 border border-slate-800/80 p-3.5 mt-4 text-left text-xs flex flex-col gap-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Status:</span>
                  <span className="font-bold text-amber-400">Pending Operator Verification</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Sender Full Name:</span>
                  <span className="font-semibold text-white">{senderName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Sender Account/Phone:</span>
                  <span className="font-mono text-white">{senderAccount}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Destination:</span>
                  <span className="font-semibold text-emerald-400 uppercase">
                    {paymentMethod === "telebirr" ? "Telebirr (0941960863) - Ezera Hailu" : "CBE (1000400846271) - Ezera Hailu"}
                  </span>
                </div>
              </div>

              <button
                onClick={resetAndClose}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 text-xs font-black uppercase tracking-wider text-slate-950 hover:brightness-110 transition shadow-lg shadow-emerald-500/20"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleDepositSubmit} className="flex flex-col gap-5">
              
              {errorMessage && (
                <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Step 1: Select Payment Method */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">1. Select Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Telebirr Button */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("telebirr")}
                    className={`flex flex-col gap-1 p-3 rounded-2xl border text-left transition ${
                      paymentMethod === "telebirr"
                        ? "bg-emerald-500/10 border-emerald-500/50 shadow-md shadow-emerald-500/10"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📱</span>
                        <span className="text-sm font-bold text-white">Telebirr</span>
                      </div>
                      {paymentMethod === "telebirr" && <Check className="h-4 w-4 text-emerald-400" />}
                    </div>
                    <span className="text-[11px] text-slate-400">Mobile Money Transfer</span>
                  </button>

                  {/* CBE Button */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cbe")}
                    className={`flex flex-col gap-1 p-3 rounded-2xl border text-left transition ${
                      paymentMethod === "cbe"
                        ? "bg-emerald-500/10 border-emerald-500/50 shadow-md shadow-emerald-500/10"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🏦</span>
                        <span className="text-sm font-bold text-white">CBE / CBE Birr</span>
                      </div>
                      {paymentMethod === "cbe" && <Check className="h-4 w-4 text-emerald-400" />}
                    </div>
                    <span className="text-[11px] text-slate-400">Commercial Bank of Ethiopia</span>
                  </button>

                </div>
              </div>

              {/* Step 2: Payment Details Card & Transfer Guide */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-emerald-950/20 border border-emerald-500/30 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5" />
                    <span>Official Receiver Details</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Active
                  </span>
                </div>

                {/* Receiver Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  
                  {/* Account Name */}
                  <div className="flex flex-col gap-1 bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Account Holder Name</span>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">Ezera Hailu</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard("Ezera Hailu", "name")}
                        className="text-slate-400 hover:text-emerald-400 transition"
                        title="Copy Name"
                      >
                        {copiedField === "name" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Account / Phone Number */}
                  <div className="flex flex-col gap-1 bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      {paymentMethod === "telebirr" ? "Telebirr Phone Number" : "CBE Account Number"}
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-mono text-emerald-400 text-sm tracking-wide">
                        {paymentMethod === "telebirr" ? "0941960863" : "1000400846271"}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(paymentMethod === "telebirr" ? "0941960863" : "1000400846271", "account")}
                        className="text-slate-400 hover:text-emerald-400 transition"
                        title="Copy Number"
                      >
                        {copiedField === "account" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                </div>

                {/* Step-by-step Guide */}
                <div className="rounded-xl bg-slate-900/50 p-2.5 border border-slate-800/60 text-[11px] text-slate-300 flex flex-col gap-1">
                  <span className="font-bold text-slate-200">How to deposit:</span>
                  <ol className="list-decimal list-inside space-y-0.5 text-slate-400 text-[10px]">
                    {paymentMethod === "telebirr" ? (
                      <>
                        <li>Open your <strong>Telebirr App</strong> or dial *127#.</li>
                        <li>Send the deposit amount to <span className="text-emerald-400 font-bold font-mono">0941960863</span>.</li>
                        <li>Verify the receiver name displays <strong className="text-white">Ezera Hailu</strong>.</li>
                        <li>Take a screenshot of the completed transaction message.</li>
                      </>
                    ) : (
                      <>
                        <li>Open your <strong>CBE Mobile App</strong> or visit CBE branch/CBE Birr.</li>
                        <li>Transfer to Account Number <span className="text-emerald-400 font-bold font-mono">1000400846271</span>.</li>
                        <li>Verify receiver name is <strong className="text-white">Ezera Hailu</strong>.</li>
                        <li>Save the transfer confirmation receipt / screenshot.</li>
                      </>
                    )}
                  </ol>
                </div>
              </div>

              {/* Step 3: Deposit Amount */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">2. Deposit Amount (ETB)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    step="10"
                    required
                    placeholder="500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2.5 px-3 text-sm font-bold text-white tabular-nums focus:border-emerald-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-500">ETB</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {DEPOSIT_PRESETS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val.toString())}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition ${
                        amount === val.toString()
                          ? "bg-emerald-500 text-slate-950 border-emerald-400 font-bold"
                          : "bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white"
                      }`}
                    >
                      +{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4: Sender Details & Screenshot Verification */}
              <div className="flex flex-col gap-3 border-t border-slate-800 pt-4">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">3. Your Deposit Proof Details</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Sender Name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-slate-400">Sender Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Abebe Bekele"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Sender Phone/Account */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-slate-400">
                      {paymentMethod === "telebirr" ? "Your Phone Number *" : "Your Account Number *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={paymentMethod === "telebirr" ? "09..." : "1000..."}
                      value={senderAccount}
                      onChange={(e) => setSenderAccount(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Screenshot Upload */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-400">Payment Screenshot / Receipt</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {screenshotPreview ? (
                    <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <img
                          src={screenshotPreview}
                          alt="Deposit receipt"
                          className="h-12 w-12 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-white truncate">{screenshotFileName}</span>
                          <span className="text-[10px] text-emerald-400 font-medium">Receipt Attached</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setScreenshotPreview(null);
                          setScreenshotFileName(null);
                        }}
                        className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-900 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 p-4 flex flex-col items-center justify-center gap-1.5 text-center hover:border-emerald-500/50 hover:bg-slate-950 transition group"
                    >
                      <Upload className="h-5 w-5 text-slate-400 group-hover:text-emerald-400 transition" />
                      <span className="text-xs font-semibold text-slate-300">Click to Upload Payment Screenshot</span>
                      <span className="text-[10px] text-slate-500">Supports PNG, JPG, JPEG up to 5MB</span>
                    </button>
                  )}
                </div>

              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !amount || Number(amount) <= 0 || !senderName || !senderAccount}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-emerald-500/20 hover:brightness-110 disabled:opacity-50 transition"
              >
                {loading ? "Verifying Deposit Proof..." : `Confirm Deposit of ${Number(amount || 0).toLocaleString()} ETB`}
              </button>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}

