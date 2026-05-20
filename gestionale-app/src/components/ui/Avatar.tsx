import type { CSSProperties } from 'react';

interface AvatarProps {
    src?: string | null;
    name?: string;
    color?: string | null;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    ring?: boolean;
    className?: string;
}

const sizeMap = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
};

const palette = ['#1a7a55', '#3ba876', '#145c42', '#5fc494', '#0f3d2e', '#238f63', '#041f17'];

function hashColor(name = '?') {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return palette[h % palette.length];
}

function initials(name = '?') {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ src, name = '?', color, size = 'md', ring = false, className = '' }: AvatarProps) {
    const cls = `${sizeMap[size]} ${ring ? 'ring-2 ring-surface-raised' : ''} ${className}`;
    const bg = color || hashColor(name);
    const style: CSSProperties = {
        background: `linear-gradient(135deg, ${bg} 0%, ${bg}AA 100%)`,
    };

    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className={`${cls} rounded-full object-cover`}
            />
        );
    }
    return (
        <div
            style={style}
            className={`${cls} rounded-full flex items-center justify-center font-semibold text-white shadow-sm`}
            title={name}
        >
            {initials(name)}
        </div>
    );
}
