"use client";

import { useState, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AnimatePresence, motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import type { Section, Question } from '@/lib/survey-data';
import { allQuestions } from '@/lib/survey-data';
import { submitSurvey } from '@/app/actions';
import { Loader2 } from 'lucide-react';

type SurveyFormProps = {
  sections: Section[];
};

const createSchema = (questions: Question[]) => {
  const schemaObject = questions.reduce((acc, q) => {
    let validator;
    switch (q.type) {
      case 'text':
        validator = z.string().min(1, { message: "Wajib diisi" });
        break;
      case 'number':
        validator = z.string().min(1, { message: "Wajib diisi" }).regex(/^\d+$/, "Harus berupa angka");
        break;
      case 'radio':
        validator = z.string({ required_error: "Pilih salah satu opsi" });
        break;
      default:
        validator = z.any();
    }
    acc[q.id] = validator;
    return acc;
  }, {} as Record<string, z.ZodType<any, any>>);
  return z.object(schemaObject);
};

const surveySchema = createSchema(allQuestions);
type SurveyFormData = z.infer<typeof surveySchema>;

export function SurveyForm({ sections }: SurveyFormProps) {
  const [step, setStep] = useState(0);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    defaultValues: allQuestions.reduce((acc, q) => ({...acc, [q.id]: undefined}), {})
  });

  const currentQuestion = allQuestions[step];
  const isFirstStep = step === 0;
  const isLastStep = step === allQuestions.length - 1;

  const handleNext = async () => {
    const isValid = await form.trigger(currentQuestion.id);
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
      const result = await submitSurvey(data);
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

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <Progress value={progressValue} className="w-full" />
      
      <div className="relative min-h-[200px] overflow-hidden">
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
                    {currentQuestion.type === 'text' && (
                      <Input id={currentQuestion.id} placeholder={currentQuestion.placeholder} {...field} />
                    )}
                    {currentQuestion.type === 'number' && (
                      <Input id={currentQuestion.id} type="number" placeholder={currentQuestion.placeholder} {...field} />
                    )}
                    {currentQuestion.type === 'radio' && currentQuestion.options && (
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                        {currentQuestion.options.map((option) => (
                          <div key={option} className="flex items-center space-x-2 rounded-md border p-4 hover:bg-accent/50 has-[[data-state=checked]]:bg-accent">
                            <RadioGroupItem value={option} id={`${currentQuestion.id}-${option}`} />
                            <Label htmlFor={`${currentQuestion.id}-${option}`} className="w-full cursor-pointer">{option}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
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
