// components/ResearchForm.tsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from './Button';
import { useRevenueStore } from '@/app/store/revenueStore';
import { useServicesStore } from '@/app/store/servicesStore';
import { serviceCategories } from '@/app/constants/services';

const formSchema = z.object({
  nicheConsideration: z.string().min(10, 'Please provide more details about your niche consideration'),
  profitability: z.string().min(10, 'Please provide details about client profitability'),
  experience: z.string().min(10, 'Please describe your experience in this niche'),
  clientPercentage: z.string().min(1, 'Please select a percentage'),
  successStories: z.string().min(10, 'Please share at least one success story'),
  teamSize: z.number().min(1, 'Team size must be at least 1')
  .or(z.string().refine(val => val !== '', 'Team size is required')
  .transform(val => parseInt(val, 10))),
  revenue: z.number().min(1, 'Average annual revenue per client must be at least 1').nullable()
});

type FormValues = z.infer<typeof formSchema>;

export default function ResearchForm({ onSubmit }: { onSubmit: (values: FormValues) => Promise<void> }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { revenue, setRevenue } = useRevenueStore();
  const { selectedServices, setSelectedServices } = useServicesStore();
  const [localSelectedServices, setLocalSelectedServices] = useState<Record<string, boolean>>({});
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nicheConsideration: '',
      profitability: '',
      experience: '',
      clientPercentage: '',
      successStories: '',
      teamSize: undefined,
      revenue: revenue ?? null
    }
  });

  useEffect(() => {
    setValue('revenue', revenue ?? null);
  }, [revenue, setValue]);

  useEffect(() => {
    const servicesMap: Record<string, boolean> = {};
    selectedServices.forEach(service => {
      servicesMap[service.id] = true;
    });
    setLocalSelectedServices(servicesMap);
  }, [selectedServices]);

  const handleServiceToggle = (serviceId: string): void => {
    setLocalSelectedServices({
      ...localSelectedServices,
      [serviceId]: !localSelectedServices[serviceId]
    });
  };

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRevenue(e.target.value);
    setValue('revenue', e.target.value ? Number(e.target.value) : null);
  };
  
  const submitHandler = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
       const selectedServicesArray = Object.entries(localSelectedServices)
       .filter(([, isSelected]) => isSelected)
       .map(([id]) => {
         const service = serviceCategories.flatMap(cat => cat.services).find(svc => svc.id === id);
         return { id, label: service?.label || id };
       });

     setSelectedServices(selectedServicesArray);
    setRevenue(values.revenue != null ? values.revenue.toString() : null);
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

   const hasSelectedServices = Object.values(localSelectedServices).some(value => value);

   return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-8">
      {/* Services Selection Section */}
      <div className="rounded-lg p-6 shadow-inner">
        <label className="block text-[#f7f8f8] font-medium mb-3 text-lg">
          Select The Services For Your Client
        </label>
        <div className="space-y-6">
          {serviceCategories.map((category, index) => (
            <div key={index} className="bg-gray-800 rounded-md p-5">
              <h2 className="text-lg font-semibold mb-4 text-[#f7f8f8] border-b border-gray-600 pb-2">
                {index + 1}. {category.name}
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {category.services.map((service) => (
                  <li key={service.id} className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        id={service.id}
                        checked={!!localSelectedServices[service.id]}
                        onChange={() => handleServiceToggle(service.id)}
                        className="h-4 w-4 rounded border-gray-500 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                      />
                    </div>
                    <label htmlFor={service.id} className="ml-3 cursor-pointer text-sm text-[#f7f8f8] font-medium">
                      {service.label}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {!hasSelectedServices && (
          <p className="mt-3 text-orange-500 text-sm font-medium">Please select at least one service</p>
        )}
      </div>

      {/* Original form fields - styled consistently */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg p-6 shadow-inner md:col-span-2">
          <label htmlFor="nicheConsideration" className="block text-[#f7f8f8] font-medium mb-3 text-lg">
            1. Your Client's Niche
          </label>
          <textarea
            id="nicheConsideration"
            className=" border-none resize-none input-field text-sm min-h-[120px] w-full bg-gray-800 rounded-md px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200"
            placeholder="Describe your niche (or potential niche) in detail. Who are they? What industry do they belong to? What unique challenges do they face?"
            {...register('nicheConsideration')}
          />
          {errors.nicheConsideration && (
            <p className="mt-2 text-orange-500 text-sm">{errors.nicheConsideration.message}</p>
          )}
        </div>

        <div className="rounded-lg p-6 shadow-inner md:col-span-2">
          <label htmlFor="profitability" className="block text-[#f7f8f8] font-medium mb-3 text-lg">
            2. How profitable are your existing clients under this niche?
          </label>
          <textarea
            id="profitability"
            className="resize-none input-field text-sm min-h-[120px] w-full bg-gray-800 border-none rounded-md px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200"
            placeholder="Describe the financial and strategic benefits of working with this niche. How do they compare to other clients?"
            {...register('profitability')}
          />
          {errors.profitability && (
            <p className="mt-2 text-orange-500 text-sm">{errors.profitability.message}</p>
          )}
        </div>

        <div className=" rounded-lg p-6 shadow-inner md:col-span-2">
          <label htmlFor="experience" className="block text-[#f7f8f8] font-medium mb-3 text-lg">
            3. What is your experience or background in this niche?
          </label>
          <textarea
            id="experience"
            className="bg-gray-800 border-none resize-none input-field text-sm min-h-[120px] w-full rounded-md px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200"
            placeholder="Explain your industry experience and why it positions you as an expert."
            {...register('experience')}
          />
          {errors.experience && (
            <p className="mt-2 text-orange-500 text-sm">{errors.experience.message}</p>
          )}
        </div>

        <div className="rounded-lg p-6 shadow-inner">
          <label htmlFor="clientPercentage" className="block text-[#f7f8f8] font-medium mb-3 text-lg">
            4. What percentage of your current clients are in this niche?
          </label>
          <select
            id="clientPercentage"
            className="bg-gray-800 border-none resize-none input-field text-sm w-full rounded-md px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200"
            {...register('clientPercentage')}
          >
            <option value="">Select a percentage range</option>
            <option value="Less than 10% – Just getting started">Less than 10% – Just getting started</option>
            <option value="10-25% – Gaining momentum">10-25% – Gaining momentum</option>
            <option value="25-50% – Becoming a specialist">25-50% – Becoming a specialist</option>
            <option value="50%+ – Established authority">50%+ – Established authority</option>
          </select>
          {errors.clientPercentage && (
            <p className="mt-2 text-orange-500 text-sm">{errors.clientPercentage.message}</p>
          )}
        </div>

        <div className="0 rounded-lg p-6 shadow-inner">
          <label htmlFor="teamSize" className="block text-[#f7f8f8] font-medium mb-3 text-lg">
            5. How big is your current team?
          </label>
          <input
            id="teamSize"
            type="number"
            className="border-none resize-none input-field text-sm w-full bg-gray-800 rounded-md px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200"
            placeholder="Enter number of team members"
            {...register('teamSize')}
            min="1"
          />
          {errors.teamSize && (
            <p className="mt-2 text-orange-500 text-sm">{errors.teamSize.message}</p>
          )}
        </div>

      {/* Revenue Section */}
      <div className=" rounded-lg p-6 bordershadow-inner md:col-span-2">
        <label htmlFor="revenue" className="block text-[#f7f8f8] font-medium mb-3 text-lg">
          6. What is your average annual revenue per client($)?
        </label>
        <input
          id="revenue"
          type="number"
          className="input-field text-sm w-full bg-gray-800 border-none rounded-md px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200"
          placeholder="Enter average annual revenue"
          value={revenue !== null ? revenue.toString() : ''}
          onChange={handleRevenueChange}
          min="1"
        />
        {errors.revenue && (
          <p className="mt-2 text-orange-500 text-sm">{errors.revenue.message}</p>
        )}
        {!revenue && (
        <p className="mt-3 text-orange-500 text-sm font-medium">Please enter your average annual revenue</p>      
        )}
      </div>

        <div className="rounded-lg p-6 shadow-inner md:col-span-2">
          <label htmlFor="successStories" className="block text-[#f7f8f8] font-medium mb-3 text-lg">
            7. Share success stories of clients you&apos;ve helped in this niche
          </label>
          <textarea
            id="successStories"
            className="input-field border-none resize-none text-sm min-h-[120px] w-full bg-gray-800 rounded-md px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200"
            placeholder="Describe your most impactful client results in detail. The more specific, the better!"
            {...register('successStories')}
          />
          {errors.successStories && (
            <p className="mt-2 text-orange-500 text-sm">{errors.successStories.message}</p>
          )}
        </div>
      </div>
      
      <div className="flex justify-center mt-8">
          <Button
        type="submit"
        isLoading={isSubmitting}
        size="md"
        disabled={isSubmitting || !hasSelectedServices || !revenue}
        className={`
          bg-green-700 hover:bg-green-800 text-white font-medium text-base rounded-md 
          !py-2 !px-4 transition-all duration-300 
          disabled:bg-gray-600 disabled:cursor-not-allowed
        `}
      >
          Find Target Segments
        </Button>
      </div>
    </form>
  );
}