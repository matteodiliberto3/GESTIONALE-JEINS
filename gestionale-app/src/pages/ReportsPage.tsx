import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, FolderOpen, FileText } from 'lucide-react';
import { useClients, useContracts, useProjects } from '../features/data/hooks';

export function ReportsPage() {
    const navigate = useNavigate();
    const { data: clients = [] } = useClients();
    const { data: projects = [] } = useProjects();
    const { data: contracts = [] } = useContracts();

    const byStatus = (items: { status: string }[]) =>
        items.reduce<Record<string, number>>((acc, x) => {
            acc[x.status] = (acc[x.status] || 0) + 1;
            return acc;
        }, {});

    const clientStats = byStatus(clients);
    const projectStats = byStatus(projects);
    const openInvoices = contracts.filter(
        c => c.type === 'Fattura' && c.status === 'Inviato',
    );
    const totalOpen = openInvoices.reduce((s, c) => s + (c.amount || 0), 0);

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="card p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-grad-brand flex items-center justify-center text-white">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-ink">Report operativo</h2>
                        <p className="text-sm text-ink-muted">Dati live dal gestionale</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <StatCard
                        icon={Users}
                        label="Clienti"
                        value={String(clients.length)}
                        detail={Object.entries(clientStats).map(([k, v]) => `${k}: ${v}`).join(' · ') || '—'}
                        onClick={() => navigate('/clienti')}
                    />
                    <StatCard
                        icon={FolderOpen}
                        label="Progetti"
                        value={String(projects.length)}
                        detail={Object.entries(projectStats).map(([k, v]) => `${k}: ${v}`).join(' · ') || '—'}
                        onClick={() => navigate('/progetti')}
                    />
                    <StatCard
                        icon={FileText}
                        label="Documenti"
                        value={String(contracts.length)}
                        detail={`Fatture aperte: €${totalOpen.toLocaleString('it-IT')}`}
                        onClick={() => navigate('/contabilita')}
                    />
                </div>
            </div>
        </div>
    );
}

function StatCard({
    icon: Icon, label, value, detail, onClick,
}: {
    icon: typeof Users;
    label: string;
    value: string;
    detail: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="card-inset p-4 text-left hover:border-line-strong transition-colors"
        >
            <Icon className="w-4 h-4 text-brand-300 mb-2" />
            <p className="text-xs text-ink-subtle uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-semibold text-ink mt-1">{value}</p>
            <p className="text-xs text-ink-muted mt-2 leading-relaxed">{detail}</p>
        </button>
    );
}
