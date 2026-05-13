import { Trash2, Plus, FileText, Receipt, FileSignature } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import type { Contract } from '../types/models';

const CONTRACT_STATUS_OPTIONS = ['Bozza', 'Inviato', 'Firmato', 'Pagato', 'Annullato'];

const statusTone: Record<string, 'violet' | 'cyan' | 'pink' | 'emerald' | 'amber' | 'rose' | 'neutral'> = {
    'Bozza': 'cyan',
    'Inviato': 'amber',
    'Firmato': 'violet',
    'Pagato': 'emerald',
    'Annullato': 'rose',
};

const typeIcon: Record<string, any> = {
    Contratto: FileSignature,
    Fattura: Receipt,
    Preventivo: FileText,
};

interface ContabilitaViewProps {
    contracts: Contract[];
    onUpdateStatus: (id: string, status: string) => void;
    onDelete: (id: string) => void;
    onOpenAdd: () => void;
    getClientName: (id: string) => string;
    getProjectName: (id: string) => string;
}

const fmtAmount = (n: number) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(Number(n));

export function ContabilitaView({
    contracts, onUpdateStatus, onDelete, onOpenAdd, getClientName, getProjectName,
}: ContabilitaViewProps) {
    const totals = contracts.reduce((acc, c) => {
        acc.total += Number(c.amount);
        if (c.status === 'Pagato') acc.paid += Number(c.amount);
        if (c.type === 'Fattura' && c.status !== 'Pagato' && c.status !== 'Annullato') acc.due += Number(c.amount);
        return acc;
    }, { total: 0, paid: 0, due: 0 });

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KpiCard label="Totale Documenti" value={fmtAmount(totals.total)} tone="violet" />
                <KpiCard label="Già Incassato"     value={fmtAmount(totals.paid)}  tone="emerald" />
                <KpiCard label="Da Incassare"      value={fmtAmount(totals.due)}   tone="amber" />
            </div>

            <Card
                title={`Documenti (${contracts.length})`}
                subtitle="Contratti, fatture e preventivi"
                headerAction={
                    <button onClick={onOpenAdd} className="btn-primary text-xs px-3 py-1.5">
                        <Plus className="w-3.5 h-3.5" /> Nuovo Documento
                    </button>
                }
                padding="none"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-[11px] uppercase tracking-wider text-ink-subtle border-y border-line/60">
                                <th className="text-left font-medium px-5 py-3">Tipo</th>
                                <th className="text-left font-medium px-5 py-3">Cliente</th>
                                <th className="text-left font-medium px-5 py-3 hidden md:table-cell">Progetto</th>
                                <th className="text-left font-medium px-5 py-3 hidden sm:table-cell">Data</th>
                                <th className="text-right font-medium px-5 py-3">Importo</th>
                                <th className="text-left font-medium px-5 py-3">Stato</th>
                                <th className="text-right font-medium px-5 py-3">Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contracts.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-5 py-12 text-center text-ink-subtle text-sm italic">
                                        Nessun documento ancora.
                                    </td>
                                </tr>
                            )}
                            {contracts.map(c => {
                                const Icon = typeIcon[c.type] || FileText;
                                return (
                                    <tr
                                        key={c.id}
                                        onClick={() => window.dispatchEvent(new CustomEvent('app:notice', {
                                            detail: {
                                                title: `${c.type} - ${fmtAmount(Number(c.amount))}`,
                                                message: 'Documento selezionato. Qui potrai aprire dettaglio, scadenze e collegamenti al progetto.',
                                            },
                                        }))}
                                        className="border-b border-line/40 hover:bg-surface-inset/40 transition cursor-pointer"
                                    >
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="w-7 h-7 rounded-lg bg-surface-inset flex items-center justify-center">
                                                    <Icon className="w-3.5 h-3.5 text-brand-300" />
                                                </span>
                                                <span className="text-sm font-medium text-ink">{c.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-sm text-ink-muted">{getClientName(c.clientId || '')}</td>
                                        <td className="px-5 py-3 hidden md:table-cell text-sm text-ink-muted">{getProjectName(c.projectId || '')}</td>
                                        <td className="px-5 py-3 hidden sm:table-cell text-xs text-ink-subtle">
                                            {new Date(c.date).toLocaleDateString('it-IT')}
                                        </td>
                                        <td className="px-5 py-3 text-right text-sm font-semibold text-ink tabular-nums">
                                            {fmtAmount(Number(c.amount))}
                                        </td>
                                        <td className="px-5 py-3">
                                            <select
                                                value={c.status}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => onUpdateStatus(c.id, e.target.value)}
                                                className={`text-[11px] font-medium rounded-full px-2.5 py-1
                                                            bg-surface-inset border border-line/60
                                                            text-${statusTone[c.status]}-300`}
                                            >
                                                {CONTRACT_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                                                className="icon-btn text-rose-400 hover:bg-rose-500/10"
                                                aria-label="Elimina"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

function KpiCard({ label, value, tone }: { label: string; value: string; tone: 'violet' | 'emerald' | 'amber' }) {
    const accentClass = {
        violet: 'bg-grad-violet',
        emerald: 'bg-grad-emerald',
        amber: 'bg-amber-500/80',
    }[tone];

    return (
        <Card
            padding="lg"
            headerAction={null}
            role="button"
            tabIndex={0}
            onClick={() => window.dispatchEvent(new CustomEvent('app:notice', {
                detail: { title: label, message: `Valore corrente: ${value}` },
            }))}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    window.dispatchEvent(new CustomEvent('app:notice', {
                        detail: { title: label, message: `Valore corrente: ${value}` },
                    }));
                }
            }}
            className="cursor-pointer transition-transform active:scale-[0.99]"
        >
            <div className="flex items-start gap-3">
                <span className={`w-10 h-10 rounded-xl ${accentClass} shadow-soft`} />
                <div>
                    <p className="text-[11px] uppercase tracking-wider text-ink-subtle font-medium">{label}</p>
                    <p className="text-2xl font-bold text-ink tabular-nums mt-1">{value}</p>
                </div>
            </div>
            <Badge tone={tone} className="mt-3"><span className="opacity-90">questo periodo</span></Badge>
        </Card>
    );
}
