import { Avatar } from './Avatar';
import type { User } from '../../types/models';

interface AvatarGroupProps {
    users: Pick<User, 'id' | 'name' | 'avatarUrl' | 'color'>[];
    max?: number;
    size?: 'xs' | 'sm' | 'md';
}

export function AvatarGroup({ users, max = 3, size = 'sm' }: AvatarGroupProps) {
    const visible = users.slice(0, max);
    const remaining = users.length - visible.length;

    return (
        <div className="flex -space-x-2">
            {visible.map(u => (
                <Avatar
                    key={u.id}
                    name={u.name}
                    src={u.avatarUrl}
                    color={u.color}
                    size={size}
                    ring
                />
            ))}
            {remaining > 0 && (
                <div
                    className={`${size === 'xs' ? 'w-6 h-6 text-[10px]' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'}
                                rounded-full bg-surface-inset border-2 border-surface-raised
                                flex items-center justify-center font-semibold text-ink-muted`}
                >
                    +{remaining}
                </div>
            )}
        </div>
    );
}
