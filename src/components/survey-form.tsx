
"use client";

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Check, ChevronsUpDown, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { allQuestions } from '@/lib/survey-data';
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { provinces, getCitiesByProvince } from '@/lib/location-data';
import { Odontogram } from '@/components/odontogram';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';

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
      case 'datetime':
        // For date, we can have separate fields or a single string
        if (q.id === 'birth-date') {
            validator = z.object({
              day: z.string().optional(),
              month: z.string().optional(),
              year: z.string().optional(),
            }).optional();
        } else {
            validator = z.date().optional();
        }
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

export function SurveyForm() {
  const adultTeethIds = [
    ...[18, 17, 16, 15, 14, 13, 12, 11],
    ...[21, 22, 23, 24, 25, 26, 27, 28],
    ...[31, 32, 33, 34, 35, 36, 37, 38],
    ...[48, 47, 46, 45, 44, 43, 42, 41],
  ];
  
  const childTeethIds = [
      ...[55, 54, 53, 52, 51],
      ...[61, 62, 63, 64, 65],
      ...[71, 72, 73, 74, 75],
      ...[85, 84, 83, 82, 81],
  ]

  const defaultOdontogram = [...adultTeethIds, ...childTeethIds].reduce((acc, id) => {
    const isAdult = adultTeethIds.includes(id);
    acc[`tooth-${id}`] = isAdult ? '0' : 'A';
    return acc;
  }, {} as Record<string, string>);

  const form = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      ...allQuestions.reduce((acc, q) => ({...acc, [q.id]: undefined}), {}),
      'patient-category': 'Umum',
      province: 'Jawa Barat',
      agency: 'Dinas Kesehatan Provinsi Jawa Barat',
      'odontogram-chart': defaultOdontogram,
      'exam-date': new Date(),
    }
  });

  const selectedProvince = form.watch('province');
  const selectedCity = form.watch('city');
  const examDate = form.watch('exam-date');
  const patientCategory = form.watch('patient-category');
  
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    if (selectedProvince) {
      const cityList = getCitiesByProvince(selectedProvince);
      setCities(cityList);
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
  }, [selectedProvince, form.formState.isDirty, form.formState.isSubmitted]);

  useEffect(() => {
    const provinceIndex = provinces.findIndex(p => p.name === selectedProvince);
    const provinceCode = provinceIndex > -1 ? String(provinceIndex + 1).padStart(2, '0') : 'XX';

    const cityIndex = cities.findIndex(c => c === selectedCity);
    const cityCode = cityIndex > -1 ? String(cityIndex + 1).padStart(2, '0') : 'XX';
    
    const dateCode = examDate ? format(examDate, 'yyyyMMdd') : 'YYYYMMDD';

    const uniqueId = `${provinceCode}-${cityCode}-${dateCode}-`;
    form.setValue('exam-id', uniqueId);

  }, [selectedProvince, selectedCity, examDate, form, cities]);
  
  const FormField = ({ id, children, className }: { id: string, children: React.ReactNode, className?: string }) => {
      const question = allQuestions.find(q => q.id === id);
      if (!question) return null;
      return (
          <div className={cn("space-y-2", className)}>
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
               <FormField id="agency">
                 <Controller name="agency" control={form.control} render={({ field }) => <Input {...field} id="agency" />} />
              </FormField>
              <FormField id="examiner">
                 <Controller name="examiner" control={form.control} render={({ field }) => <Input {...field} id="examiner" />} />
              </FormField>
               <FormField id="recorder">
                 <Controller name="recorder" control={form.control} render={({ field }) => <Input {...field} id="recorder" />} />
              </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <FormField id="exam-date">
                    <Controller
                        name="exam-date"
                        control={form.control}
                        render={({field}) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4"/>
                                        {field.value ? format(field.value, "PPP") : <span>Pilih tanggal</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                </FormField>
                <FormField id="exam-id" className="md:col-span-2">
                 <Controller name="exam-id" control={form.control} render={({ field }) => <Input {...field} id="exam-id" readOnly className="bg-gray-100" />} />
              </FormField>
          </div>
          
           <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField id="patient-category">
                <Controller
                    name="patient-category"
                    control={form.control}
                    render={({ field }) => (
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                              <SelectValue placeholder="Pilih Kategori Pasien..." />
                          </SelectTrigger>
                          <SelectContent>
                              {(allQuestions.find(q => q.id === 'patient-category')?.options || []).map(opt => (
                                 <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                    )} />
            </FormField>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField id="name">
                 <Controller name="name" control={form.control} render={({ field }) => <Input {...field} id="name" />} />
              </FormField>
               <FormField id="birth-date">
                <DateOfBirthInput control={form.control} name="birth-date" />
            </FormField>
          </div>

          {patientCategory === 'Siswa sekolah dasar (SD)' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField id="school-name">
                     <Controller name="school-name" control={form.control} render={({ field }) => <Input {...field} id="school-name" />} />
                  </FormField>
                  <FormField id="class-level">
                    <Controller
                        name="class-level"
                        control={form.control}
                        render={({ field }) => (
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                  <SelectValue placeholder="Pilih Kelas..." />
                              </SelectTrigger>
                              <SelectContent>
                                  {(allQuestions.find(q => q.id === 'class-level')?.options || []).map(opt => (
                                     <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                        )} />
                </FormField>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField id="parent-occupation">
                    <Controller
                        name="parent-occupation"
                        control={form.control}
                        render={({ field }) => (
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                  <SelectValue placeholder="Pilih Pekerjaan Orang Tua..." />
                              </SelectTrigger>
                              <SelectContent>
                                  {(allQuestions.find(q => q.id === 'parent-occupation')?.options || []).map(opt => (
                                     <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                        )} />
                </FormField>
                 <FormField id="parent-education">
                    <Controller
                        name="parent-education"
                        control={form.control}
                        render={({ field }) => (
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                  <SelectValue placeholder="Pilih Pendidikan Orang Tua..." />
                              </SelectTrigger>
                              <SelectContent>
                                  {(allQuestions.find(q => q.id === 'parent-education')?.options || []).map(opt => (
                                     <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                        )} />
                </FormField>
              </div>
            </>
          )}

          {patientCategory === 'Umum' && (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField id="village">
                     <Controller name="village" control={form.control} render={({ field }) => <Input {...field} id="village" />} />
                  </FormField>
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
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField id="address">
                       <Controller name="address" control={form.control} render={({ field }) => <Input {...field} id="address" />} />
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
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
        </div>

        <div className="space-y-4">
             <h3 className="text-lg font-medium">Status Gigi Geligi</h3>
            <Odontogram form={form} />
        </div>
    </form>
  );
}
