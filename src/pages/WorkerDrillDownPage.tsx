import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, subMonths, startOfMonth } from 'date-fns';
import { ArrowLeft, User, MapPin, Star, Briefcase } from 'lucide-react';
import { agenciesApi } from '@/api/agencies';
import { workersApi } from '@/api/workers';
import { jobsApi } from '@/api/jobs';
import { Card } from '@/components/Card';
import { KpiCard } from '@/components/KpiCard';
import { BarChartCard } from '@/components/BarChartCard';

export function WorkerDrillDownPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const { data: agency } = useQuery({
    queryKey: ['agency', 'me'],
    queryFn: () => agenciesApi.getMyAgency(),
  });

  const { data: worker } = useQuery({
    queryKey: ['worker', userId],
    queryFn: () => workersApi.getWorkerByUserId(userId!),
    enabled: !!userId,
  });

  const { data: jobsData } = useQuery({
    queryKey: ['agency', agency?.agencyId, 'jobs'],
    queryFn: () => jobsApi.getAgencyJobs(agency!.agencyId, 0, 500),
    enabled: !!agency?.agencyId,
  });

  const workerJobs = useMemo(() => {
    return (jobsData?.listings ?? []);
  }, [jobsData]);

  const jobsPerMonth = useMemo(() => {
    const buckets = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
      const m = startOfMonth(subMonths(new Date(), i));
      buckets.set(format(m, 'MMM'), 0);
    }
    workerJobs.forEach((j) => {
      const key = format(startOfMonth(new Date(j.createdAt)), 'MMM');
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    });
    return Array.from(buckets.entries()).map(([label, value]) => ({ label, value }));
  }, [workerJobs]);

  if (!worker || !agency) {
    return <div className="text-sm text-mutedForeground">Loading…</div>;
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-mutedForeground hover:text-foreground inline-flex items-center gap-1"
      >
        <ArrowLeft size={14} /> Back
      </button>

      <header>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {worker.firstName} {worker.lastName}
            </h1>
            <p className="text-sm text-mutedForeground">
              @{worker.username} · {worker.workerTypeDisplayName}
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total jobs done" value={worker.totalJobsCompleted} icon={<Briefcase size={14} />} />
        <KpiCard label="Avg rating" value={worker.averageRating > 0 ? worker.averageRating.toFixed(1) : '—'} icon={<Star size={14} />} tone="amber" />
        <KpiCard label="Experience" value={`${worker.experienceYears}y`} />
        <KpiCard label="Verified" value={worker.isVerified ? 'Yes' : 'No'} tone={worker.isVerified ? 'green' : 'slate'} />
      </div>

      <BarChartCard
        title="Jobs per month"
        description="Last 6 months (approximate — agency-level tally)"
        data={jobsPerMonth}
      />

      <Card title="Profile">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <Field label="City"><MapPin size={12} className="inline mr-1 text-mutedForeground" />{worker.cityDisplayName ?? worker.city}</Field>
          <Field label="Area">{worker.area ?? '—'}</Field>
          <Field label="Hourly rate">Rs. {worker.hourlyRate.toLocaleString()}</Field>
          <Field label="Availability">{worker.availabilityStatus}</Field>
          <Field label="Agency">{worker.agencyName ?? '—'}</Field>
        </dl>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <dt className="text-mutedForeground">{label}</dt>
      <dd className="text-foreground">{children}</dd>
    </div>
  );
}
