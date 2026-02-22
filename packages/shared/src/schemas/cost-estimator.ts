import { z } from 'zod'

export const CostEstimatorSchema = z.object({
  vehicleType: z.enum(['motorcycle', 'car', 'truck', 'bus', 'special']),
  modelYear: z.number().int().min(1990).max(new Date().getFullYear()),
  monthsLate: z.number().int().min(0).max(60),
})

export type CostEstimator = z.infer<typeof CostEstimatorSchema>
