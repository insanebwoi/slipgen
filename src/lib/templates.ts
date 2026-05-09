import { Template, PassionTheme } from '@/types';

export const passionThemes: PassionTheme[] = [
  { passion: 'Doctor', background: '/backgrounds/doctor.png', color: '#00BCD4', icon: '🩺' },
  { passion: 'Engineer', background: '/backgrounds/engineer.png', color: '#FF9800', icon: '⚙️' },
  { passion: 'Scientist', background: '/backgrounds/scientist.png', color: '#9C27B0', icon: '🔬' },
  { passion: 'Pilot', background: '/backgrounds/pilot.png', color: '#2196F3', icon: '✈️' },
  { passion: 'Artist', background: '/backgrounds/artist.png', color: '#E91E63', icon: '🎨' },
  { passion: 'Teacher', background: '/backgrounds/nature.png', color: '#4CAF50', icon: '📚' },
  { passion: 'Athlete', background: '/backgrounds/nature.png', color: '#FF5722', icon: '⚽' },
  { passion: 'Astronaut', background: '/backgrounds/scientist.png', color: '#3F51B5', icon: '🚀' },
  { passion: 'Chef', background: '/backgrounds/nature.png', color: '#795548', icon: '👨‍🍳' },
  { passion: 'Musician', background: '/backgrounds/artist.png', color: '#FF4081', icon: '🎵' },
  { passion: 'Writer', background: '/backgrounds/nature.png', color: '#607D8B', icon: '✍️' },
  { passion: 'Designer', background: '/backgrounds/artist.png', color: '#00BCD4', icon: '🎯' },
  { passion: 'Police', background: '/backgrounds/nature.png', color: '#1565C0', icon: '👮' },
  { passion: 'Firefighter', background: '/backgrounds/nature.png', color: '#D32F2F', icon: '🚒' },
  { passion: 'Other', background: '/backgrounds/nature.png', color: '#4CAF50', icon: '⭐' },
];

export function getPassionTheme(passion: string): PassionTheme {
  return passionThemes.find(t => t.passion === passion) || passionThemes[passionThemes.length - 1];
}

// Standard name slip: 85 x 50 mm (3.35 x 1.97 inches)
// Wide variant: 90 x 50 mm

export const templates: Template[] = [
  {
    id: 'plain-pastel',
    name: 'Plain Pastel',
    thumbnail: '',
    style: 'landscape-left',
    detailsPosition: 'right',
    detailsStyle: 'clean',
    fontFamily: "'Roboto', sans-serif",
    width: 85,
    height: 50,
  },
  {
    id: 'line-pattern',
    name: 'Line Pattern',
    thumbnail: '',
    style: 'landscape-left',
    detailsPosition: 'right',
    detailsStyle: 'lined',
    fontFamily: "'Roboto', sans-serif",
    width: 85,
    height: 50,
  },
  {
    id: 'cartoon-fun',
    name: 'Cartoon Fun',
    thumbnail: '',
    style: 'landscape-left',
    detailsPosition: 'right',
    detailsStyle: 'clean',
    fontFamily: "'Roboto', sans-serif",
    width: 85,
    height: 50,
  },
  {
    id: 'wavy-pattern',
    name: 'Wavy Pattern',
    thumbnail: '',
    style: 'landscape-left',
    detailsPosition: 'right',
    detailsStyle: 'clean',
    fontFamily: "'Roboto', sans-serif",
    width: 85,
    height: 50,
  },
  {
    id: 'classic-traditional',
    name: 'Classic Traditional',
    thumbnail: '',
    style: 'landscape-left',
    detailsPosition: 'right',
    detailsStyle: 'lined',
    fontFamily: "'Roboto', sans-serif",
    width: 90,
    height: 50,
  },
  {
    id: 'plain-classic-noimage',
    name: 'Plain Classic (No Image)',
    thumbnail: '',
    style: 'landscape-left',
    detailsPosition: 'right',
    detailsStyle: 'lined',
    fontFamily: "'Roboto', sans-serif",
    width: 90,
    height: 50,
  },
];

export function getTemplate(id: string): Template | undefined {
  return templates.find((t) => t.id === id);
}
