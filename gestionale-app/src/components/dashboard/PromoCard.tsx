import { ShieldCheck, Sparkles } from 'lucide-react';

export function PromoCard({ onAction }: { onAction?: () => void }) {
    return (
        <div className="bento-panel relative overflow-hidden p-5 h-full min-h-[12rem]">
            <div
                aria-hidden
                className="absolute inset-0 bg-grad-promo opacity-95"
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

            <div className="relative h-full flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[11px] uppercase tracking-wider text-white/70 font-medium">
                            WORK solution
                        </span>
                    </div>

                    <h3 className="text-2xl font-bold text-white leading-tight">
                        <span className="bg-clip-text text-transparent bg-grad-cyan">7$</span>{' '}
                        <span className="text-white/90">unlimited</span>
                    </h3>
                    <p className="text-xs text-white/65 mt-2 max-w-[14rem] leading-relaxed">
                        La migliore soluzione al miglior prezzo per il tuo team.
                    </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                    <button className="btn-primary text-xs px-4 py-2 shadow-glow-violet" onClick={onAction}>
                        Scopri di più
                    </button>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm">
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
