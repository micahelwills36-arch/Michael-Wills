import isabellaPhoto from '../assets/images/isabella_passport_photo_1788855003934.jpg';

export interface PassportPortrait {
  id: string;
  name: string;
  url: string;
  gender: 'female' | 'male';
  attire: 'white_collared' | 'blazer' | 'casual_student';
  backgroundStyle: 'studio_white' | 'studio_blue' | 'studio_grey';
  ethnicityOrStyle?: string;
  recommendedZoom?: number;
  recommendedOffsetY?: number;
}

export const REAL_HUMAN_PORTRAITS: PassportPortrait[] = [
  {
    id: 'isabella_rose',
    name: 'Isabella Rose',
    url: isabellaPhoto,
    gender: 'female',
    attire: 'white_collared',
    backgroundStyle: 'studio_white',
    ethnicityOrStyle: 'South Asian Student (Formal)',
    recommendedZoom: 1.05,
    recommendedOffsetY: 0,
  },
  {
    id: 'aarav_shrestha',
    name: 'Aarav Shrestha',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    gender: 'male',
    attire: 'casual_student',
    backgroundStyle: 'studio_white',
    ethnicityOrStyle: 'Engineering Scholar',
    recommendedZoom: 1.1,
    recommendedOffsetY: -4,
  },
  {
    id: 'ananya_adhikari',
    name: 'Ananya Adhikari',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    gender: 'female',
    attire: 'white_collared',
    backgroundStyle: 'studio_white',
    ethnicityOrStyle: 'CSIT Graduate',
    recommendedZoom: 1.05,
    recommendedOffsetY: -2,
  },
  {
    id: 'rohan_karki',
    name: 'Rohan Karki',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    gender: 'male',
    attire: 'blazer',
    backgroundStyle: 'studio_blue',
    ethnicityOrStyle: 'Faculty Executive',
    recommendedZoom: 1.15,
    recommendedOffsetY: -6,
  },
  {
    id: 'priya_tamang',
    name: 'Priya Tamang',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    gender: 'female',
    attire: 'casual_student',
    backgroundStyle: 'studio_white',
    ethnicityOrStyle: 'Medical Researcher',
    recommendedZoom: 1.05,
    recommendedOffsetY: 0,
  },
  {
    id: 'bibek_thapa',
    name: 'Bibek Thapa',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    gender: 'male',
    attire: 'white_collared',
    backgroundStyle: 'studio_white',
    ethnicityOrStyle: 'IOE Engineer',
    recommendedZoom: 1.1,
    recommendedOffsetY: -3,
  },
  {
    id: 'kritika_sharma',
    name: 'Kritika Sharma',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    gender: 'female',
    attire: 'blazer',
    backgroundStyle: 'studio_grey',
    ethnicityOrStyle: 'Research Fellow',
    recommendedZoom: 1.1,
    recommendedOffsetY: -5,
  },
  {
    id: 'manish_gurung',
    name: 'Manish Gurung',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    gender: 'male',
    attire: 'blazer',
    backgroundStyle: 'studio_blue',
    ethnicityOrStyle: 'Senior Lecturer',
    recommendedZoom: 1.2,
    recommendedOffsetY: -8,
  },
  {
    id: 'sneha_bhattarai',
    name: 'Sneha Bhattarai',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    gender: 'female',
    attire: 'white_collared',
    backgroundStyle: 'studio_white',
    ethnicityOrStyle: 'Library Scholar',
    recommendedZoom: 1.05,
    recommendedOffsetY: 0,
  },
  {
    id: 'deepak_pokhrel',
    name: 'Deepak Pokhrel',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    gender: 'male',
    attire: 'casual_student',
    backgroundStyle: 'studio_grey',
    ethnicityOrStyle: 'B.Sc. Student',
    recommendedZoom: 1.1,
    recommendedOffsetY: -2,
  },
];
