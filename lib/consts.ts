// redirect urls
export const REDIRECT_AFTER_LOGIN = '/dashboard';

// app settings
export const APP_NAME = 'MediCare';
export const APP_DESCRIPTION =
  'MediCare este o platformă pentru gestionarea dosarelor medicale';

import { Option } from './types';

export const priorityOptions: Option[] = [
  { label: 'Toate', value: 'Toate' },
  { label: 'Înaltă', value: 'High' },
  { label: 'Medie', value: 'Medium' },
  { label: 'Scăzută', value: 'Low' },
];

export const statusOptions: Option[] = [
  { label: 'Toate', value: 'Toate' },
  { label: 'Finalizat', value: 'completed' },
  { label: 'Programat', value: 'confirmed' },
  { label: 'În curs', value: 'pending' },
];
