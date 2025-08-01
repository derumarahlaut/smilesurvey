
"use client";

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Check, ChevronsUpDown, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from 'next/navigation';


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
import { useToast } from '@/hooks/use-toast';
import { saveSurvey } from '@/app/actions';

function SearchableSelect({ field, options, placeholder, disabled, onValueChange }: { field: any, options: string[], placeholder: string, disabled?: boolean, onValueChange: (value: string) => void }) {
    const [open, setOpen] = useState(false);

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
                        ? options.find((option) => option.toLowerCase() === field.value.toLowerCase()) || placeholder
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
    );
}


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
  

  return z.object(schemaObject).partial();
};


const surveySchema = createSchema();
type SurveyFormData = z.infer<typeof surveySchema>;



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
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
                     <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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

export function EditSurveyForm({ patientData, examId }: { patientData: any, examId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    defaultValues: patientData,
  });

  const selectedProvince = form.watch('province');
  const patientCategory = form.watch('patient-category');
  
  const [cities, setCities] = useState<string[]>([]);
  
  const onSubmit = async (data: SurveyFormData) => {
    setIsSubmitting(true);
    
    const result = await saveSurvey(data, examId);
    setIsSubmitting(false);

    if (result.error) {
      toast({
        title: "Gagal Memperbarui",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Data Berhasil Diperbarui",
        description: `Data pasien dengan nomor urut ${result.examId} telah diperbarui.`,
      });
      router.push('/master');
    }
  };


  useEffect(() => {
    if (selectedProvince) {
      const cityList = getCitiesByProvince(selectedProvince);
      setCities(cityList);
      if (form.formState.isDirty && form.getValues('province') !== patientData.province) {
        form.setValue('city', '');
      }
    } else {
      setCities([]);
    }
  }, [selectedProvince, form, patientData.province]);
  
  useEffect(() => {
     if (selectedProvince) {
       setCities(getCitiesByProvince(selectedProvince));
     }
  }, [selectedProvince]);

  
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                                        disabled
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                </FormField>
                <div className="md:col-span-2">
                  <FormField id="exam-id">
                    <div className="flex items-center gap-2">
                        <Input 
                            value={examId}
                            readOnly 
                            className="flex-grow bg-muted"
                        />
                    </div>
                     <p className="text-sm text-muted-foreground mt-1">Nomor urut tidak dapat diubah.</p>
                  </FormField>
                </div>
          </div>
          
           <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField id="patient-category">
                <Controller
                    name="patient-category"
                    control={form.control}
                    render={({ field }) => (
                       <Select onValueChange={field.onChange} value={field.value}>
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
                           <Select onValueChange={field.onChange} value={field.value}>
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
                           <Select onValueChange={field.onChange} value={field.value}>
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
                           <Select onValueChange={field.onChange} value={field.value}>
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
                   <FormField id="district">
                     <Controller name="district" control={form.control} render={({ field }) => <Input {...field} id="district" />} />
                  </FormField>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField id="address">
                       <Controller name="address" control={form.control} render={({ field }) => <Input {...field} id="address" />} />
                    </FormField>
                    <FormField id="occupation">
                        <Controller
                            name="occupation"
                            control={form.control}
                            render={({ field }) => (
                               <Select onValueChange={field.onChange} value={field.value}>
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
                     <FormField id="education">
                        <Controller
                            name="education"
                            control={form.control}
                            render={({ field }) => (
                               <Select onValueChange={field.onChange} value={field.value}>
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
                       <Select onValueChange={field.onChange} value={field.value}>
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
        
        <div className="flex justify-end gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
        </div>
    </form>
  );
}
