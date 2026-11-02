import { LAUMajorGroup } from '../types';

export const LAU_MAJORS_BY_SCHOOL: LAUMajorGroup[] = [
  {
    school: 'SOE',
    schoolName: 'School of Engineering (SOE)',
    majors: [
      'B.E. in Computer Engineering',
      'B.E. in Electrical Engineering',
      'B.E. in Mechanical Engineering',
      'B.E. in Civil Engineering',
      'B.E. in Industrial Engineering',
      'B.E. in Mechatronics Engineering',
      'B.E. in Chemical Engineering',
      'B.E. in Petroleum Engineering',
    ],
  },
  {
    school: 'AKSOB',
    schoolName: 'Adnan Kassar School of Business (AKSOB)',
    majors: [
      'B.S. in Business - Banking & Finance',
      'B.S. in Business - Information Technology Management (ITM)',
      'B.S. in Business - Accounting',
      'B.S. in Business - Management',
      'B.S. in Business - Marketing',
      'B.S. in Business - International Business',
      'B.S. in Business - Family & Entrepreneurial Business',
      'B.S. in Economics',
      'B.S. in Hospitality & Tourism Management',
    ],
  },
  {
    school: 'SAS',
    schoolName: 'School of Arts and Sciences (SAS)',
    majors: [
      'B.S. in Computer Science',
      'B.S. in Bioinformatics',
      'B.S. in Biology (Pre-Med)',
      'B.S. in Chemistry (Pre-Med)',
      'B.S. in Mathematics',
      'B.S. in Applied Physics',
      'B.S. in Nutrition & Dietetics',
      'B.A. in Psychology',
      'B.A. in Political Science & International Affairs',
      'B.A. in Communication',
      'B.A. in Multimedia Journalism',
      'B.A. in Television & Film',
      'B.A. in Performing Arts',
      'B.A. in English',
      'B.A. in Translation',
      'B.S. in Education',
    ],
  },
  {
    school: 'SArD',
    schoolName: 'School of Architecture and Design (SArD)',
    majors: [
      'Bachelor of Architecture (B.Arch.)',
      'B.F.A. in Interior Design',
      'B.F.A. in Graphic Design',
      'B.F.A. in Fashion Design',
      'B.F.A. in Studio Arts',
    ],
  },
];

export const ALL_LAU_MAJORS: string[] = LAU_MAJORS_BY_SCHOOL.flatMap(group => group.majors);
