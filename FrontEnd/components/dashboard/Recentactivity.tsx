'use client';

import { useEffect, useMemo, useState } from 'react';

type EmployeeStatus = 'active' | 'inactive' | 'on_break' | 'on_leave' | 'absent';

type RecentActivityEmployee = {
    id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    status?: EmployeeStatus | string;
    lastLoginAt?: string | Date | null;
    updatedAt?: string | Date | null;
    createdAt?: string | Date | null;
};

interface RecentActivityProps {
    employees: RecentActivityEmployee[];
}

const getEmployeeName = (employee: RecentActivityEmployee) => {
    if (employee.name) return employee.name;

    const fullName = `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim();

    return fullName || 'Employee';
};

const getEmployeeInitials = (employee: RecentActivityEmployee) => {
    const name = getEmployeeName(employee);
    const parts = name.split(' ').filter(Boolean);

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const formatStatus = (status?: string) => {
    if (!status) return 'Unknown';

    return status
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getActivityDate = (employee: RecentActivityEmployee) => {
    return employee.lastLoginAt || employee.updatedAt || employee.createdAt || null;
};

const getTimeAgo = (dateValue?: string | Date | null) => {
    if (!dateValue) return 'Just now';

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return 'Just now';
    }

    const now = new Date();
    const seconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds}s`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;

    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo`;

    const years = Math.floor(days / 365);
    return `${years}y`;
};

const getSortTime = (employee: RecentActivityEmployee) => {
    const activityDate = getActivityDate(employee);
    const time = activityDate ? new Date(activityDate).getTime() : 0;

    return Number.isNaN(time) ? 0 : time;
};

const RecentActivity = ({ employees }: RecentActivityProps) => {
    const [, setTick] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTick((prev) => prev + 1);
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const recentEmployees = useMemo(() => {
        return [...employees].sort((a, b) => {
            const aIsActive = a.status === 'active' ? 1 : 0;
            const bIsActive = b.status === 'active' ? 1 : 0;

            if (aIsActive !== bIsActive) {
                return bIsActive - aIsActive;
            }

            return getSortTime(b) - getSortTime(a);
        });
    }, [employees]);

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="mb-3 flex-shrink-0">
                <h2
                    className="text-base font-bold"
                    style={{ color: 'var(--text-primary)' }}
                >
                    Recent Activity
                </h2>

                <p
                    className="mt-1 text-[11px]"
                    style={{ color: 'var(--text-muted)' }}
                >
                    Latest employee status updates
                </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                {recentEmployees.length > 0 ? (
                    recentEmployees.map((employee) => (
                        <div
                            key={employee.id}
                            className="border-b py-2.5 last:border-b-0"
                            style={{ borderColor: 'var(--border-soft)' }}
                        >
                            <div className="flex items-start gap-2.5">
                                <div
                                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-black"
                                    style={{
                                        background: 'var(--accent-soft)',
                                        color: 'var(--accent)',
                                    }}
                                >
                                    {getEmployeeInitials(employee)}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <p
                                            className="break-words text-[12px] font-black leading-tight"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {getEmployeeName(employee)}
                                        </p>

                                        <span
                                            className="flex-shrink-0 whitespace-nowrap text-[10px] font-bold leading-tight"
                                            style={{ color: 'var(--text-muted)' }}
                                        >
                                            {getTimeAgo(getActivityDate(employee))}
                                        </span>
                                    </div>

                                    <p
                                        className="mt-1 break-words text-[10px] leading-tight"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        Current status: {formatStatus(employee.status)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div
                        className="rounded-2xl border px-4 py-6 text-center text-sm font-semibold"
                        style={{
                            background: 'var(--bg-surface-soft)',
                            borderColor: 'var(--border)',
                            color: 'var(--text-muted)',
                        }}
                    >
                        No recent activity found
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentActivity;