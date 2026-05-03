import { useEffect, useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Building2, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { agenciesApi } from '@/api/agencies';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import type { AgencyProfile, UpdateAgency } from '@/types';

const PAKISTAN_CITIES = [
  'KARACHI', 'LAHORE', 'ISLAMABAD', 'RAWALPINDI', 'FAISALABAD',
  'MULTAN', 'PESHAWAR', 'QUETTA', 'SIALKOT', 'GUJRANWALA',
];

export function AgencyProfilePage() {
  const qc = useQueryClient();
  const { data: agency, isLoading } = useQuery({
    queryKey: ['agency', 'me'],
    queryFn: () => agenciesApi.getMyAgency(),
  });

  const [form, setForm] = useState<UpdateAgency>({});
  const [savedFlash, setSavedFlash] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (agency) {
      setForm({
        agencyName: agency.agencyName,
        description: agency.description ?? '',
        contactNumber: agency.contactNumber ?? '',
        contactEmail: agency.contactEmail ?? '',
        city: agency.city,
        address: agency.address ?? '',
        serviceCities: agency.serviceCities,
      });
    }
  }, [agency]);

  const saveMutation = useMutation({
    mutationFn: (data: UpdateAgency) => agenciesApi.updateMyAgency(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agency', 'me'] });
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    },
  });

  const renewMutation = useMutation({
    mutationFn: () =>
      agenciesApi.payAgencySubscription({
        agencyId: agency!.agencyId,
        paymentMethod: 'MOCK_CARD',
        maskedDetails: '**** **** **** 4242',
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agency', 'me'] }),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => agenciesApi.uploadLicense(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agency', 'me'] }),
  });

  if (isLoading || !agency) {
    return <div className="text-sm text-mutedForeground">Loading…</div>;
  }

  const onSave = () => saveMutation.mutate(form);

  const toggleServiceCity = (city: string) => {
    setForm((prev) => {
      const cities = prev.serviceCities ?? [];
      return cities.includes(city)
        ? { ...prev, serviceCities: cities.filter((c) => c !== city) }
        : { ...prev, serviceCities: [...cities, city] };
    });
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Agency Profile</h1>
        <p className="text-sm text-mutedForeground mt-1">
          Edit public information, manage your subscription, and upload your business license.
        </p>
      </header>

      <Card title="Public profile">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Agency name">
            <input
              value={form.agencyName ?? ''}
              onChange={(e) => setForm({ ...form, agencyName: e.target.value })}
              className={inputClass}
            />
          </FormField>

          <FormField label="Primary city">
            <select
              value={form.city ?? ''}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className={inputClass}
            >
              {PAKISTAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormField>

          <FormField label="Contact number">
            <input
              value={form.contactNumber ?? ''}
              onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
              className={inputClass}
              placeholder="+923XXXXXXXXX"
            />
          </FormField>

          <FormField label="Contact email">
            <input
              type="email"
              value={form.contactEmail ?? ''}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              className={inputClass}
            />
          </FormField>

          <FormField label="Address" className="md:col-span-2">
            <input
              value={form.address ?? ''}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className={inputClass}
            />
          </FormField>

          <FormField label="Description" className="md:col-span-2">
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className={inputClass}
            />
          </FormField>

          <FormField label="Service cities" className="md:col-span-2">
            <div className="flex flex-wrap gap-2">
              {PAKISTAN_CITIES.map((c) => {
                const selected = form.serviceCities?.includes(c) ?? false;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleServiceCity(c)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      selected
                        ? 'bg-primary text-white border-primary'
                        : 'bg-card text-foreground border-border hover:bg-muted'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </FormField>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Button onClick={onSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving…' : 'Save changes'}
          </Button>
          {savedFlash && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 size={14} /> Saved
            </span>
          )}
          {saveMutation.isError && (
            <span className="text-sm text-red-700 flex items-center gap-1">
              <AlertCircle size={14} /> Save failed
            </span>
          )}
        </div>
      </Card>

      <Card title="Subscription">
        <SubscriptionRow agency={agency} />
        <div className="mt-4">
          <Button
            onClick={() => renewMutation.mutate()}
            disabled={renewMutation.isPending}
            variant={agency.subscriptionActive ? 'secondary' : 'primary'}
          >
            {renewMutation.isPending
              ? 'Processing…'
              : agency.subscriptionActive ? 'Extend subscription' : 'Activate subscription'}
          </Button>
        </div>
      </Card>

      <Card title="Business license">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Building2 size={20} className="text-mutedForeground" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-foreground">
              {agency.licensePath
                ? <>Uploaded · status: <Badge tone={verificationTone(agency.verificationStatus)}>{agency.verificationStatus}</Badge></>
                : 'No document uploaded yet'}
            </div>
            {agency.licenseNumber && (
              <div className="text-xs text-mutedForeground mt-0.5">License #: {agency.licenseNumber}</div>
            )}
            <div className="mt-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadMutation.mutate(f);
                  e.target.value = '';
                }}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending}
              >
                <Upload size={14} />
                {uploadMutation.isPending ? 'Uploading…' : (agency.licensePath ? 'Replace' : 'Upload')}
              </Button>
              {uploadMutation.isError && (
                <span className="ml-2 text-xs text-red-700">Upload failed.</span>
              )}
              {uploadMutation.isSuccess && (
                <span className="ml-2 text-xs text-green-600">Uploaded.</span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

function FormField({
  label,
  className = '',
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-mutedForeground mb-1">{label}</label>
      {children}
    </div>
  );
}

function SubscriptionRow({ agency }: { agency: AgencyProfile }) {
  if (!agency.subscriptionActive) {
    return (
      <div className="flex items-center gap-3">
        <Badge tone="red">INACTIVE</Badge>
        <span className="text-sm text-mutedForeground">
          Renew to invite workers and place bids.
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <Badge tone="green">ACTIVE</Badge>
      {agency.subscriptionExpiresAt && (
        <span className="text-sm text-mutedForeground">
          Expires {format(new Date(agency.subscriptionExpiresAt), 'PPP')}
        </span>
      )}
    </div>
  );
}

function verificationTone(status: string): 'green' | 'amber' | 'red' | 'slate' {
  if (status === 'VERIFIED') return 'green';
  if (status === 'PENDING') return 'amber';
  if (status === 'REJECTED') return 'red';
  return 'slate';
}
