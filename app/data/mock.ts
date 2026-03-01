// app/data/mock.ts
import type { Tenant, ServiceCategory, Service, StaffMember, TenantSettings } from '~/types'

export const mockTenant: Tenant = {
  id: 't1',
  slug: 'nour-beauty',
  name: 'صالون نور للتجميل',
  nameEn: 'Nour Beauty Salon',
  description: 'صالون نسائي متخصص في العناية بالشعر والأظافر والبشرة في الرياض',
  logoUrl: null,
  brandColor: '#C9A87C',
  phone: '+966501234567',
}

export const mockSettings: TenantSettings = {
  paymentMode: 'full',
  depositPercent: null,
  maxAdvanceDays: 30,
}

export const mockCategories: ServiceCategory[] = [
  { id: 'cat-hair',   tenantId: 't1', name: 'الشعر',    nameEn: 'Hair',    sortOrder: 1 },
  { id: 'cat-nails',  tenantId: 't1', name: 'الأظافر',  nameEn: 'Nails',   sortOrder: 2 },
  { id: 'cat-skin',   tenantId: 't1', name: 'البشرة',   nameEn: 'Skin',    sortOrder: 3 },
  { id: 'cat-makeup', tenantId: 't1', name: 'المكياج',  nameEn: 'Makeup',  sortOrder: 4 },
]

export const mockServices: Service[] = [
  // Hair
  { id: 's1',  tenantId: 't1', categoryId: 'cat-hair',   name: 'قص وتصفيف الشعر',   nameEn: 'Haircut & Style',      description: null, price: 150, durationMinutes: 60,  isActive: true },
  { id: 's2',  tenantId: 't1', categoryId: 'cat-hair',   name: 'صبغة شعر كاملة',    nameEn: 'Full Hair Color',       description: null, price: 350, durationMinutes: 120, isActive: true },
  { id: 's3',  tenantId: 't1', categoryId: 'cat-hair',   name: 'كيراتين',            nameEn: 'Keratin Treatment',     description: null, price: 500, durationMinutes: 180, isActive: true },
  { id: 's4',  tenantId: 't1', categoryId: 'cat-hair',   name: 'بروتين للشعر',       nameEn: 'Protein Treatment',     description: null, price: 280, durationMinutes: 90,  isActive: true },
  // Nails
  { id: 's5',  tenantId: 't1', categoryId: 'cat-nails',  name: 'مناكير جل',          nameEn: 'Gel Manicure',          description: null, price: 120, durationMinutes: 45,  isActive: true },
  { id: 's6',  tenantId: 't1', categoryId: 'cat-nails',  name: 'باديكير',            nameEn: 'Pedicure',              description: null, price: 100, durationMinutes: 45,  isActive: true },
  { id: 's7',  tenantId: 't1', categoryId: 'cat-nails',  name: 'تطويل أظافر',        nameEn: 'Nail Extensions',       description: null, price: 200, durationMinutes: 90,  isActive: true },
  // Skin
  { id: 's8',  tenantId: 't1', categoryId: 'cat-skin',   name: 'تنظيف بشرة عميق',   nameEn: 'Deep Cleansing Facial', description: null, price: 250, durationMinutes: 60,  isActive: true },
  { id: 's9',  tenantId: 't1', categoryId: 'cat-skin',   name: 'إزالة شعر بالشمع',  nameEn: 'Full Waxing',           description: null, price: 180, durationMinutes: 60,  isActive: true },
  // Makeup
  { id: 's10', tenantId: 't1', categoryId: 'cat-makeup', name: 'مكياج سهرة',         nameEn: 'Evening Makeup',        description: null, price: 300, durationMinutes: 75,  isActive: true },
  { id: 's11', tenantId: 't1', categoryId: 'cat-makeup', name: 'مكياج عرائس',        nameEn: 'Bridal Makeup',         description: null, price: 800, durationMinutes: 120, isActive: true },
]

export const mockStaff: StaffMember[] = [
  {
    id: 'st1', tenantId: 't1',
    name: 'سارة العمري', nameEn: 'Sara Al-Omari', photoUrl: null,
    serviceIds: ['s1', 's2', 's3', 's4'],
  },
  {
    id: 'st2', tenantId: 't1',
    name: 'نورة الزهراني', nameEn: 'Noura Al-Zahrani', photoUrl: null,
    serviceIds: ['s5', 's6', 's7'],
  },
  {
    id: 'st3', tenantId: 't1',
    name: 'ريم الشمري', nameEn: 'Reem Al-Shammari', photoUrl: null,
    serviceIds: ['s8', 's9', 's10', 's11'],
  },
]

// Returns deterministically varied time slots for any date.
// "Deterministic" means the same date always returns the same slots,
// but different dates feel different — avoids every day being fully open.
export function mockAvailableSlots(date: string): string[] {
  const allSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30',
  ]
  const day = new Date(date).getDate()
  return allSlots.filter((_, i) => (i + day) % 3 !== 0)
}
