import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Coins, Smartphone, CreditCard, Check, Loader2, Shield, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { CREDIT_PACKAGES, formatKES } from '@/lib/brand';

export default function Credits() {
  const { user, refreshUser } = useOutletContext() || {};
  const { toast } = useToast();
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [method, setMethod] = useState('mpesa');
  const [phone, setPhone] = useState('');
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '' });
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(null);
  const [history, setHistory] = useState([]);

  React.useEffect(() => {
    base44.entities.CreditTransaction.filter({ type: 'purchase' }, '-created_date', 20)
      .then(setHistory).catch(() => {});
  }, []);

  const balance = user?.credit_balance || 0;

  const handlePurchase = async () => {
    if (!selectedPkg) return;
    if (method === 'mpesa' && !phone) { toast({ title: 'Phone number required', variant: 'destructive' }); return; }
    if (method === 'card' && (!card.number || !card.expiry || !card.cvc)) { toast({ title: 'Card details required', variant: 'destructive' }); return; }

    setProcessing(true);
    try {
      // Simulate payment gateway processing
      await new Promise(r => setTimeout(r, 2200));
      const newBalance = balance + selectedPkg.credits;
      await base44.auth.updateMe({ credit_balance: newBalance });
      const txn = await base44.entities.CreditTransaction.create({
        type: 'purchase',
        credits: selectedPkg.credits,
        amount_kes: selectedPkg.price,
        package_name: selectedPkg.name,
        payment_method: method,
        status: 'completed',
        reference: method === 'mpesa' ? `MPESA-${Date.now().toString().slice(-8)}` : `CARD-${Date.now().toString().slice(-8)}`,
      });
      await base44.entities.Notification.create({
        title: 'Credits Added 💰',
        message: `${selectedPkg.credits} credits added to your account. You now have ${newBalance} credits.`,
        type: 'credit',
      });
      setHistory([txn, ...history]);
      setSuccess({ pkg: selectedPkg, newBalance });
      refreshUser();
      setProcessing(false);
    } catch (err) {
      setProcessing(false);
      toast({ title: 'Payment failed', description: err.message, variant: 'destructive' });
    }
  };

  const reset = () => { setSelectedPkg(null); setSuccess(null); setPhone(''); setCard({ number: '', expiry: '', cvc: '' }); };

  if (success) {
    return (
      <div className="mx-auto max-w-md py-12 text-center animate-fade-in">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Check className="text-green-600" size={32} />
        </div>
        <h2 className="mt-4 font-heading text-2xl font-bold text-secondary">Payment Successful!</h2>
        <p className="mt-2 text-muted-foreground">You added <span className="font-bold text-secondary">{success.pkg.credits} credits</span> to your account.</p>
        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">New balance</p>
          <p className="font-heading text-3xl font-bold text-gold">{success.newBalance} credits</p>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={reset} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-semibold text-secondary hover:bg-muted">Buy More</button>
          <a href="/catalogue" className="flex-1 rounded-lg bg-primary py-2.5 text-center text-sm font-bold text-primary-foreground hover:bg-primary/90">Browse Courses</a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-secondary lg:text-3xl">Credits & Payments</h1>
          <p className="mt-1 text-sm text-muted-foreground">1 credit unlocks 1 course. Credits are valid for 12 months.</p>
        </div>
        <div className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground">Your balance</p>
          <p className="font-heading text-2xl font-bold text-gold">{balance}</p>
        </div>
      </div>

      {/* Packages */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {CREDIT_PACKAGES.map(pkg => (
          <button
            key={pkg.id}
            onClick={() => setSelectedPkg(pkg)}
            className={`relative flex flex-col rounded-2xl border-2 p-5 text-left transition-all ${selectedPkg?.id === pkg.id ? 'border-accent bg-accent/5 shadow-lift' : 'border-border bg-card hover:border-accent/40'}`}
          >
            {pkg.popular && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-0.5 text-[10px] font-bold text-secondary">★ POPULAR</span>}
            <Coins className={pkg.popular ? 'text-gold' : 'text-accent'} size={24} />
            <h3 className="mt-3 font-heading text-base font-bold text-secondary">{pkg.name}</h3>
            <p className="mt-1 flex items-baseline gap-1">
              <span className="font-heading text-2xl font-extrabold text-secondary">{pkg.credits}</span>
              <span className="text-xs text-muted-foreground">credits</span>
            </p>
            <p className="mt-1 text-sm font-bold text-primary">{formatKES(pkg.price)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{pkg.description}</p>
          </button>
        ))}
      </div>

      {/* Checkout */}
      {selectedPkg && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="font-heading text-lg font-bold text-secondary">Checkout</h2>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{selectedPkg.name}</p>
              <p className="font-heading text-xl font-bold text-primary">{formatKES(selectedPkg.price)}</p>
            </div>
          </div>

          {/* Payment method toggle */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={() => setMethod('mpesa')}
              className={`flex items-center gap-2 rounded-xl border-2 p-3 transition-colors ${method === 'mpesa' ? 'border-green-500 bg-green-50' : 'border-border hover:bg-muted/50'}`}
            >
              <Smartphone className={method === 'mpesa' ? 'text-green-600' : 'text-muted-foreground'} size={20} />
              <span className="text-sm font-semibold text-secondary">M-Pesa</span>
            </button>
            <button
              onClick={() => setMethod('card')}
              className={`flex items-center gap-2 rounded-xl border-2 p-3 transition-colors ${method === 'card' ? 'border-accent bg-accent/5' : 'border-border hover:bg-muted/50'}`}
            >
              <CreditCard className={method === 'card' ? 'text-accent' : 'text-muted-foreground'} size={20} />
              <span className="text-sm font-semibold text-secondary">Card</span>
            </button>
          </div>

          {method === 'mpesa' ? (
            <div className="mt-5">
              <label className="text-sm font-medium text-secondary">M-Pesa Phone Number</label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="07XX XXX XXX"
                className="mt-1.5 w-full rounded-lg border border-input bg-background py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-green-500/30"
              />
              <p className="mt-2 text-xs text-muted-foreground">You'll receive an STK push prompt on your phone to confirm payment.</p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              <div>
                <label className="text-sm font-medium text-secondary">Card Number</label>
                <input value={card.number} onChange={e => setCard({ ...card, number: e.target.value })} placeholder="4242 4242 4242 4242" className="mt-1.5 w-full rounded-lg border border-input bg-background py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-accent/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-secondary">Expiry</label>
                  <input value={card.expiry} onChange={e => setCard({ ...card, expiry: e.target.value })} placeholder="MM/YY" className="mt-1.5 w-full rounded-lg border border-input bg-background py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-accent/30" />
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary">CVC</label>
                  <input value={card.cvc} onChange={e => setCard({ ...card, cvc: e.target.value })} placeholder="123" className="mt-1.5 w-full rounded-lg border border-input bg-background py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-accent/30" />
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handlePurchase}
            disabled={processing}
            className={`mt-5 flex w-full items-center justify-center gap-2 rounded-lg py-3.5 text-sm font-bold text-white transition-colors ${method === 'mpesa' ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primary/90'} disabled:opacity-70`}
          >
            {processing ? (
              <><Loader2 size={18} className="animate-spin" /> Processing payment...</>
            ) : (
              <>Pay {formatKES(selectedPkg.price)} via {method === 'mpesa' ? 'M-Pesa' : 'Card'}</>
            )}
          </button>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Shield size={13} /> Secured payment · <Clock size={13} /> Credits valid 12 months
          </div>
        </div>
      )}

      {/* Transaction history */}
      {history.length > 0 && (
        <div>
          <h2 className="mb-3 font-heading text-lg font-bold text-secondary">Purchase History</h2>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {history.map(t => (
              <div key={t.id} className="flex items-center justify-between border-b border-border p-4 last:border-0">
                <div>
                  <p className="text-sm font-medium text-secondary">{t.package_name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(t.created_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })} · {t.reference}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">+{t.credits} credits</p>
                  <p className="text-xs text-muted-foreground">{formatKES(t.amount_kes)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}