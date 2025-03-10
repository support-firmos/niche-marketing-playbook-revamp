// components/ResearchForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from './Button';

const formSchema = z.object({
  nicheConsideration: z.string().min(10, 'Please provide more details about your niche consideration'),
  profitability: z.string().min(10, 'Please provide details about client profitability'),
  experience: z.string().min(10, 'Please describe your experience in this niche'),
  clientPercentage: z.string().min(1, 'Please select a percentage'),
  successStories: z.string().min(10, 'Please share at least one success story'),
  teamSize: z.number().min(1, 'Team size must be at least 1').or(z.string().transform(val => parseInt(val, 10)))
});

type FormValues = z.infer<typeof formSchema>;

export default function ResearchForm({ onSubmit }: { onSubmit: (values: FormValues) => Promise<void> }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nicheConsideration: '',
      profitability: '',
      experience: '',
      clientPercentage: '',
      successStories: '',
      teamSize: undefined
    }
  });
  
  const submitHandler = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
      <div>
        <label htmlFor="nicheConsideration" className="block text-[#f7f8f8] font-medium mb-2">
          1) Have you considered focusing on a niche?
        </label>
        <textarea
          id="nicheConsideration"
          className="input-field text-lg min-h-[120px] w-full"
          placeholder="Describe your niche (or potential niche) in detail. Who are they? What industry do they belong to? What unique challenges do they face?"
          {...register('nicheConsideration')}
        />
        {errors.nicheConsideration && (
          <p className="mt-2 text-red-400 text-sm">{errors.nicheConsideration.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="profitability" className="block text-[#f7f8f8] font-medium mb-2">
          2) Have these clients been profitable for your firm?
        </label>
        <textarea
          id="profitability"
          className="input-field text-lg min-h-[120px] w-full"
          placeholder="Describe the financial and strategic benefits of working with this niche. How do they compare to other clients?"
          {...register('profitability')}
        />
        {errors.profitability && (
          <p className="mt-2 text-red-400 text-sm">{errors.profitability.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="experience" className="block text-[#f7f8f8] font-medium mb-2">
          3) What is your experience or background in this niche?
        </label>
        <textarea
          id="experience"
          className="input-field text-lg min-h-[120px] w-full"
          placeholder="Explain your industry experience and why it positions you as an expert."
          {...register('experience')}
        />
        {errors.experience && (
          <p className="mt-2 text-red-400 text-sm">{errors.experience.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="clientPercentage" className="block text-[#f7f8f8] font-medium mb-2">
          4) What percentage of your current clients are in this niche?
        </label>
        <select
          id="clientPercentage"
          className="input-field text-lg w-full"
          {...register('clientPercentage')}
        >
          <option value="">Select a percentage range</option>
          <option value="Less than 10% – Just getting started">Less than 10% – Just getting started</option>
          <option value="10-25% – Gaining momentum">10-25% – Gaining momentum</option>
          <option value="25-50% – Becoming a specialist">25-50% – Becoming a specialist</option>
          <option value="50%+ – Established authority">50%+ – Established authority</option>
        </select>
        {errors.clientPercentage && (
          <p className="mt-2 text-red-400 text-sm">{errors.clientPercentage.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="successStories" className="block text-[#f7f8f8] font-medium mb-2">
          5) Share success stories of clients you&apos;ve helped in this niche
        </label>
        <textarea
          id="successStories"
          className="input-field text-lg min-h-[120px] w-full"
          placeholder="Describe your most impactful client results in detail. The more specific, the better!"
          {...register('successStories')}
        />
        {errors.successStories && (
          <p className="mt-2 text-red-400 text-sm">{errors.successStories.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="teamSize" className="block text-[#f7f8f8] font-medium mb-2">
          6) How big is your current team?
        </label>
        <input
          id="teamSize"
          type="number"
          className="input-field text-lg w-full"
          placeholder="Enter number of team members"
          {...register('teamSize')}
          min="1"
        />
        {errors.teamSize && (
          <p className="mt-2 text-red-400 text-sm">{errors.teamSize.message}</p>
        )}
      </div>
      
      <div className="pt-4">
        <Button 
          type="submit" 
          isLoading={isSubmitting} 
          size="lg" 
          className="w-full"
        >
          Find Target Segments
        </Button>
      </div>
    </form>
  );
}