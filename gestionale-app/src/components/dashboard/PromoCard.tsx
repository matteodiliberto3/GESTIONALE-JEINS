import { ShieldCheck, Sparkles } from 'lucide-react';

export function PromoCard({ onAction }: { onAction?: () => void }) {
    return (
        <div className="card relative overflow-hidden p-5">
            <div
                aria-hidden
                className="absolute inset-0 bg-grad-promo opacity-90"
            />
            <div
                aria-hidden
                className="absolute -top-16 -right-16 w-56 h-56 rounded-full"
                style={{
                    background: 'radial-gradient(closest-side, rgba(217,70,239,.55), transparent 70%)',
                    filter: 'blur(8px)',
                }}
            />
            <div
                aria-hidden
                className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full"
                style={{
                    background: 'radial-gradient(closest-side, rgba(34,211,238,.4), transparent 70%)',
                    filter: 'blur(10px)',
                }}
            />

            <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[11px] uppercase tracking-wider text-white/70 font-medium">
                        Premium
                    </span>
                </div>

                <h3 className="text-xl font-bold text-white leading-tight max-w-xs">
                    La migliore <span className="bg-clip-text text-transparent bg-grad-cyan">soluzione</span><br />
                    al miglior <span className="bg-clip-text text-transparent bg-grad-pink">prezzo</span>
                </h3>

                <p className="text-xs text-white/70 mt-2 max-w-xs">
                    Sblocca tutte le feature premium del gestionale: report avanzati, automazioni e supporto prioritario.
                </p>

                <div className="mt-4 flex items-center justify-between gap-4">
                    <button className="btn-primary text-xs px-4 py-2" onClick={onAction}>
                        Scopri di più
                    </button>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-white/10 border border-white/15">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                        <div className="leading-tight">
                            <p className="text-[11px] font-semibold text-white">100%</p>
                            <p className="text-[9px] text-white/70 -mt-0.5">Money-Back</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
