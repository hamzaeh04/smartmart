import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { useSettings, useUpdateSettings } from "@/features/settings/hooks";

const schema = z.object({
  storeName: z.string().trim().min(2, "Store name is required"),
  storeLogo: z.string().optional(),
  storeAddress: z.string().trim().min(4, "Store address is required"),
  storePhone: z.string().trim().min(6, "Enter a valid phone number"),
  storeEmail: z.string().trim().email("Enter a valid email address"),
  currency: z.string().min(1),
  taxPercentage: z.coerce.number().min(0).max(100, "Must be 100 or less"),
  receiptFooter: z.string().trim().optional(),
  lowStockDefaultLevel: z.coerce.number().int().min(0),
  dateFormat: z.string().min(1),
  timeFormat: z.enum(["12h", "24h"]),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

const CURRENCIES = [
  { value: "USD", label: "USD — US Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — British Pound" },
  { value: "PKR", label: "PKR — Pakistani Rupee" },
  { value: "AED", label: "AED — UAE Dirham" },
];

const DATE_FORMATS = [
  { value: "MMM DD, YYYY", label: "Jul 29, 2026" },
  { value: "DD/MM/YYYY", label: "29/07/2026" },
  { value: "MM/DD/YYYY", label: "07/29/2026" },
  { value: "YYYY-MM-DD", label: "2026-07-29" },
];

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormInput, unknown, FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (settings) {
      reset(settings);
      setLogoPreview(settings.storeLogo ?? "");
    }
  }, [settings, reset]);

  if (isLoading || !settings) return <LoadingSpinner />;

  function onSubmit(values: FormValues) {
    updateSettings.mutate(values);
  }

  function handleReset() {
    reset(settings);
    setLogoPreview(settings?.storeLogo ?? "");
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLogoPreview(dataUrl);
      setValue("storeLogo", dataUrl, { shouldDirty: true });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Configure your store profile and application preferences.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <Card>
          <CardHeader title="Store Information" />
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-400 hover:border-brand-400 hover:text-brand-500"
              >
                {logoPreview ? <img src={logoPreview} alt="Store logo" className="size-full object-cover" /> : <ImagePlus className="size-5" />}
              </button>
              <div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  Upload Logo
                </Button>
              </div>
            </div>
            <Input label="Store Name" error={errors.storeName?.message} {...register("storeName")} />
            <Input label="Store Address" error={errors.storeAddress?.message} {...register("storeAddress")} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Phone Number" error={errors.storePhone?.message} {...register("storePhone")} />
              <Input label="Email" type="email" error={errors.storeEmail?.message} {...register("storeEmail")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Business Settings" />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select label="Currency" options={CURRENCIES} {...register("currency")} />
              <Input label="Tax Percentage (%)" type="number" min={0} max={100} step="0.1" error={errors.taxPercentage?.message} {...register("taxPercentage")} />
            </div>
            <Textarea label="Receipt Footer" {...register("receiptFooter")} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Application Settings" />
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input label="Low-Stock Default Level" type="number" min={0} error={errors.lowStockDefaultLevel?.message} {...register("lowStockDefaultLevel")} />
            <Select label="Date Format" options={DATE_FORMATS} {...register("dateFormat")} />
            <Select label="Time Format" options={[{ value: "12h", label: "12-hour" }, { value: "24h", label: "24-hour" }]} {...register("timeFormat")} />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleReset} disabled={!isDirty}>
            Reset
          </Button>
          <Button type="submit" isLoading={updateSettings.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
