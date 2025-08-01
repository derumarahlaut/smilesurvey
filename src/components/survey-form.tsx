"use client";

import { useState, useTransition, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Check, ChevronsUpDown } from "lucide-react";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useToast } from '@/hooks/use-toast';
import type { Question } from '@/lib/survey-data';
import { allQuestions } from '@/lib/survey-data';
import { submitSurvey } from '@/app/actions';
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { provinces, getCitiesByProvince } from '@/lib/location-data';
import { Odontogram } from '@/components/odontogram';

const createSchema = (questions: Question[]) => {
  const schemaObject = questions.reduce((acc, q) => {
    let validator;
    switch (q.type) {
      case 'text':
      case 'textarea':
        validator = z.string().min(1, { message: "Wajib diisi" });
        break;
      case 'number':
        validator = z.string().min(1, { message: "Wajib diisi" }).regex(/^\d+$/, "Harus berupa angka");
        break;
      case 'radio':
      case 'select':
        validator = z.string({ required_error: "Pilih salah satu opsi" }).min(1, "Wajib diisi");
        break;
      case 'date':
        validator = z.date({ required_error: "Tanggal wajib diisi" });
        break;
      case 'custom':
        if (q.id === 'odontogram-chart') {
           validator = z.any().optional(); // Odontogram data will be handled separately
        }
        break;
      default:
        validator = z.any();
    }
    if (validator) {
      acc[q.id] = validator;
    }
    return acc;
  }, {} as Record<string, z.ZodType<any, any>>);
  return z.object(schemaObject);
};

const surveySchema = createSchema(allQuestions);
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

export function SurveyForm() {
  const [step, setStep] = useState(0);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    defaultValues: allQuestions.reduce((acc, q) => ({...acc, [q.id]: undefined}), {})
  });

  const selectedProvince = form.watch('province');
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    if (selectedProvince) {
      setCities(getCitiesByProvince(selectedProvince));
      form.setValue('city', '');
    } else {
      setCities([]);
    }
  }, [selectedProvince, form]);


  const currentQuestion = allQuestions[step];
  const isFirstStep = step === 0;
  const isLastStep = step === allQuestions.length - 1;

  const handleNext = async () => {
    let isValid = true;
    if (currentQuestion.type !== 'custom') {
      isValid = await form.trigger(currentQuestion.id);
    }

    if (isValid && !isLastStep) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setStep((prev) => prev - 1);
    }
  };

  const onSubmit = (data: SurveyFormData) => {
    startTransition(async () => {
      // Get odontogram data from the form
      const odontogramData = form.getValues('odontogram-chart');
      const combinedData = { ...data, ...odontogramData };

      const result = await submitSurvey(combinedData);
      if (result?.error) {
        toast({
          title: "Terjadi Kesalahan",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  };

  const progressValue = (step / allQuestions.length) * 100;

  const renderQuestion = (field: any) => {
     switch (currentQuestion.type) {
      case 'text':
        return <Input id={currentQuestion.id} placeholder={currentQuestion.placeholder} {...field} />;
      case 'number':
        return <Input id={currentQuestion.id} type="number" placeholder={currentQuestion.placeholder} {...field} />;
      case 'textarea':
        return <Textarea id={currentQuestion.id} placeholder={currentQuestion.placeholder} {...field} />;
      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {field.value ? format(field.value, "PPP") : <span>Pilih tanggal</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus captionLayout="dropdown-buttons" fromYear={1924} toYear={new Date().getFullYear()} />
            </PopoverContent>
          </Popover>
        );
      case 'radio':
        return (
          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
            {currentQuestion.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2 rounded-md border p-4 hover:bg-accent/50 has-[[data-state=checked]]:bg-accent">
                <RadioGroupItem value={option} id={`${currentQuestion.id}-${option}`} />
                <Label htmlFor={`${currentQuestion.id}-${option}`} className="w-full cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
       case 'select':
        if (currentQuestion.id === 'province') {
           return <SearchableSelect field={field} options={provinces.map(p => p.name)} placeholder="Pilih Provinsi..." onValueChange={field.onChange} />;
        }
        if (currentQuestion.id === 'city') {
           return <SearchableSelect field={field} options={cities} placeholder="Pilih Kota/Kabupaten..." disabled={!selectedProvince} onValueChange={field.onChange} />;
        }
        return null;
      case 'custom':
        if (currentQuestion.id === 'odontogram-chart') {
           return <Odontogram form={form} />;
        }
        return null;
      default:
        return null;
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <Progress value={progressValue} className="w-full" />
      
      <div className="relative min-h-[300px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full"
          >
            <div className="space-y-4">
              <Label htmlFor={currentQuestion.id} className="text-xl text-center block">
                {currentQuestion.question}
              </Label>
              <Controller
                name={currentQuestion.id}
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    {renderQuestion(field)}
                    {fieldState.error && <p className="text-sm font-medium text-destructive">{fieldState.error.message}</p>}
                  </div>
                )}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={handlePrevious} disabled={isFirstStep || isPending}>
          Kembali
        </Button>
        {isLastStep ? (
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Selesai & Lihat Hasil
          </Button>
        ) : (
          <Button type="button" onClick={handleNext}>
            Lanjut
          </Button>
        )}
      </div>
    </form>
  );
}
