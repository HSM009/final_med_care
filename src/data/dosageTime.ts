export interface DosageTime {
  id: number
  time: string
  uTime: string
}

export const dosageTime: DosageTime[] = [
  {
    id: 1,
    time: '1+1+1',
    uTime: 'ایک صبح، ایک دوپہر، ایک رات',
  },
  {
    id: 2,
    time: '0+1+0',
    uTime: 'ایک دوپہر',
  },
  {
    id: 3,
    time: '0+0+1',
    uTime: 'ایک رات',
  },
  {
    id: 4,
    time: 'One Per Day',
    uTime: 'فی دن ایک',
  },
  { id: 5, time: 'Twice Per Day', uTime: 'فی دن دو' },
]
