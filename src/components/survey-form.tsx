
"use client";

import { useState, useEffect, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Check, ChevronsUpDown } from "lucide-react";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { allQuestions } from '@/lib/survey-data';
import { submitSurvey } from '@/app/actions';
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { provinces, getCitiesByProvince } from '@/lib/location-data';
import { Odontogram } from '@/components/odontogram';
import { Button } from './ui/button';

const createSchema = () => {
  const schemaObject = allQuestions.reduce((acc, q) => {
    let validator;
    switch (q.type) {
      case 'text':
      case 'textarea':
        validator = z.string().optional();
        break;
      case 'number':
        validator = z.string().optional();
        break;
      case 'radio':
      case 'select':
        validator = z.string().optional();
        break;
      case 'date':
        // For date, we can have separate fields
        validator = z.object({
          day: z.string().optional(),
          month: z.string().optional(),
          year: z.string().optional(),
        }).optional();
        break;
      case 'custom':
         validator = z.any().optional();
        break;
      default:
        validator = z.any().optional();
    }
    acc[q.id] = validator;
    return acc;
  }, {} as Record<string, z.ZodType<any, any>>);
  
  // Make all fields optional for single page submit
  return z.object(schemaObject).partial();
};


const surveySchema = createSchema();
type SurveyFormData = z.infer<typeof surveySchema>;

function SearchableSelect({ field, options, placeholder, disabled, onValueChange }: { field: any, options: string[], placeholder: string, disabled?: boolean, onValueChange: (value: string) => void }) {
    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    disabled={disabled}
                >
                    {field.value
                        ? options.find((option) => option.toLowerCase() === field.value.toLowerCase())
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" style={{minWidth: "var(--radix-popover-trigger-width)"}}>
                <Command>
                    <CommandInput placeholder={placeholder} />
                    <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                    <CommandList>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option}
                                    value={option}
                                    onSelect={(currentValue) => {
                                        const newValue = currentValue.toLowerCase() === field.value?.toLowerCase() ? "" : currentValue
                                        onValueChange(newValue)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            field.value?.toLowerCase() === option.toLowerCase() ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

const DateOfBirthInput = ({ control, name }: { control: any, name: string }) => {
    const years = Array.from({ length: 101 }, (_, i) => new Date().getFullYear() - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
        <div className="flex gap-2">
            <Controller
                name={`${name}.day`}
                control={control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue placeholder="Tgl" /></SelectTrigger>
                        <SelectContent>
                            {days.map(d => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )}
            />
            <Controller
                name={`${name}.month`}
                control={control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue placeholder="Bln" /></SelectTrigger>
                        <SelectContent>
                            {months.map(m => <SelectItem key={m} value={String(m)}>{m}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )}
            />
            <Controller
                name={`${name}.year`}
                control={control}
                render={({ field }) => (
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue placeholder="Thn" /></SelectTrigger>
                        <SelectContent>
                            {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )}
            />
        </div>
    );
};

export function SurveyForm({ 
  onSurveySubmit,
  setIsLoading,
  onInteraction
}: { 
  onSurveySubmit: (tips: string[]) => void;
  setIsLoading: (loading: boolean) => void;
  onInteraction: () => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const adultTeethIds = [
    ...[18, 17, 16, 15, 14, 13, 12, 11],
    ...[21, 22, 23, 24, 25, 26, 27, 28],
    ...[31, 32, 33, 34, 35, 36, 37, 38],
    ...[41, 42, 43, 44, 45, 46, 47, 48],
  ];

  const defaultOdontogram = adultTeethIds.reduce((acc, id) => {
    acc[`tooth-${id}`] = '0';
    return acc;
  }, {} as Record<string, string>);

  const form = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      ...allQuestions.reduce((acc, q) => ({...acc, [q.id]: undefined}), {}),
      province: 'Jawa Barat',
      'odontogram-chart': defaultOdontogram,
    }
  });

  const selectedProvince = form.watch('province');
  const [cities, setCities] = useState<string[]>([]);
  
  const watchedData = form.watch();

  useEffect(() => {
    if (form.formState.isDirty) {
      onInteraction();
      setIsLoading(true);

      const handler = setTimeout(() => {
        const data = form.getValues();
        startTransition(async () => {
          let birthDate = '';
          if (data['birth-date'] && data['birth-date'].year && data['birth-date'].month && data['birth-date'].day) {
            const { year, month, day } = data['birth-date'];
            birthDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          }

          const transformedData = {
            ...data,
            'birth-date': birthDate
          }
          
          const odontogramData = form.getValues('odontogram-chart');
          const combinedData = { ...transformedData, 'odontogram-chart': odontogramData };

          const result = await submitSurvey(combinedData);
          
          if (result?.error) {
            toast({
              title: "Terjadi Kesalahan",
              description: result.error,
              variant: "destructive",
            });
            onSurveySubmit([]);
          } else if (result?.tips) {
            onSurveySubmit(result.tips);
          }
          setIsLoading(false);
        });
      }, 1500); // 1.5 second debounce delay

      return () => {
        clearTimeout(handler);
        // Do not set loading to false here, to avoid flashing
      };
    }
  }, [JSON.stringify(watchedData), form.formState.isDirty]);


  useEffect(() => {
    if (selectedProvince) {
      setCities(getCitiesByProvince(selectedProvince));
      // Don't reset city if the default province is selected initially
      if (form.formState.isDirty) {
        form.setValue('city', '');
      }
    } else {
      setCities([]);
    }
  }, [selectedProvince, form]);
  
  useEffect(() => {
     if(form.formState.isDirty || form.formState.isSubmitted) return;
     if (selectedProvince === 'Jawa Barat') {
       setCities(getCitiesByProvince('Jawa Barat'));
     }
  }, [selectedProvince, form.formState.isDirty, form.formState.isSubmitted])
  
  const FormField = ({ id, children }: { id: string, children: React.ReactNode }) => {
      const question = allQuestions.find(q => q.id === id);
      if (!question) return null;
      return (
          <div className="space-y-2">
              <Label htmlFor={id}>{question.question}</Label>
              {children}
          </div>
      )
  }

  return (
    <form className="space-y-8">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField id="province">
                <Controller
                  name="province"
                  control={form.control}
                  render={({ field }) => (
                    <SearchableSelect
                      field={field}
                      options={provinces.map(p => p.name)}
                      placeholder="Pilih Provinsi..."
                      onValueChange={(value) => {
                        form.setValue('province', value, { shouldDirty: true })
                      }}
                    />
                  )}
                />
              </FormField>
              <FormField id="city">
                <Controller
                  name="city"
                  control={form.control}
                  render={({ field }) => (
                    <SearchableSelect
                      field={field}
                      options={cities}
                      placeholder="Pilih Kota/Kabupaten..."
                      disabled={!selectedProvince}
                      onValueChange={(value) => form.setValue('city', value, { shouldDirty: true })}
                    />
                  )}
                />
              </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField id="exam-id">
                 <Controller name="exam-id" control={form.control} render={({ field }) => <Input {...field} id="exam-id" />} />
              </FormField>
              <FormField id="name">
                 <Controller name="name" control={form.control} render={({ field }) => <Input {...field} id="name" />} />
              </FormField>
              <FormField id="village">
                 <Controller name="village" control={form.control} render={({ field }) => <Input {...field} id="village" />} />
              </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField id="occupation">
                <Controller
                    name="occupation"
                    control={form.control}
                    render={({ field }) => (
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                              <SelectValue placeholder="Pilih Pekerjaan..." />
                          </SelectTrigger>
                          <SelectContent>
                              {(allQuestions.find(q => q.id === 'occupation')?.options || []).map(opt => (
                                 <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                    )} />
            </FormField>
            <FormField id="address">
               <Controller name="address" control={form.control} render={({ field }) => <Input {...field} id="address" />} />
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField id="birth-date">
                <DateOfBirthInput control={form.control} name="birth-date" />
            </FormField>
             <FormField id="gender">
                <Controller
                    name="gender"
                    control={form.control}
                    render={({ field }) => (
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                              <SelectValue placeholder="Pilih Jenis Kelamin..." />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="1">Laki-laki</SelectItem>
                             <SelectItem value="2">Perempuan</SelectItem>
                          </SelectContent>
                      </Select>
                    )} />
            </FormField>
            <FormField id="education">
                <Controller
                    name="education"
                    control={form.control}
                    render={({ field }) => (
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                              <SelectValue placeholder="Pilih Pendidikan..." />
                          </SelectTrigger>
                          <SelectContent>
                              {(allQuestions.find(q => q.id === 'education')?.options || []).map(opt => (
                                 <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                    )} />
            </FormField>
          </div>
        </div>

        <div className="space-y-4">
             <h3 className="text-lg font-medium">Status Gigi Geligi</h3>
            <Odontogram form={form} />
        </div>
    </form>
  );
}
