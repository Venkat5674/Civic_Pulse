// Seeded initial mock data for CivicPulse standalone frontend experience

export const MOCK_USERS = [
  {
    id: 'usr-1',
    name: 'Jane Citizen',
    email: 'citizen@civicpulse.org',
    role: 'CITIZEN',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 'usr-2',
    name: 'Alex Rivera (City Admin)',
    email: 'admin@civicpulse.org',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-11-01T08:00:00Z',
  },
  {
    id: 'usr-3',
    name: 'Marcus Chen',
    email: 'marcus@example.com',
    role: 'CITIZEN',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-02-10T11:30:00Z',
  },
  {
    id: 'usr-4',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    role: 'CITIZEN',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-03-01T14:15:00Z',
  }
];

export const MOCK_CATEGORIES = [
  {
    id: 'cat-1',
    name: 'Roads & Potholes',
    slug: 'roads-potholes',
    description: 'Damaged asphalt, dangerous potholes, cracked pavement, and road hazards.',
    icon: 'Car',
    priorityWeight: 1.2,
    isActive: true,
  },
  {
    id: 'cat-2',
    name: 'Street Lighting',
    slug: 'street-lighting',
    description: 'Broken, flickering, or unlit streetlights affecting night pedestrian safety.',
    icon: 'Lightbulb',
    priorityWeight: 1.1,
    isActive: true,
  },
  {
    id: 'cat-3',
    name: 'Water Leakage',
    slug: 'water-leakage',
    description: 'Main pipe bursts, clean water wastage, damaged fire hydrants, and supply leaks.',
    icon: 'Droplets',
    priorityWeight: 1.4,
    isActive: true,
  },
  {
    id: 'cat-4',
    name: 'Waste & Sanitation',
    slug: 'waste-sanitation',
    description: 'Overflowing public dumpsters, uncollected garbage, illegal dumping, and littering.',
    icon: 'Trash2',
    priorityWeight: 1.0,
    isActive: true,
  },
  {
    id: 'cat-5',
    name: 'Drainage & Sewage',
    slug: 'drainage-sewage',
    description: 'Clogged storm drains, sewage backups, standing rainwater, and flood risks.',
    icon: 'Waves',
    priorityWeight: 1.3,
    isActive: true,
  },
  {
    id: 'cat-6',
    name: 'Traffic & Signals',
    slug: 'traffic-signals',
    description: 'Malfunctioning traffic lights, missing stop signs, obscured road signs, hazards.',
    icon: 'AlertTriangle',
    priorityWeight: 1.5,
    isActive: true,
  },
  {
    id: 'cat-7',
    name: 'Parks & Recreation',
    slug: 'parks-recreation',
    description: 'Damaged playground equipment, fallen tree branches in public parks, bench vandalism.',
    icon: 'Trees',
    priorityWeight: 0.9,
    isActive: true,
  }
];

export const MOCK_ISSUES = [
  {
    id: 'iss-101',
    userId: 'usr-1',
    userName: 'Jane Citizen',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    categoryId: 'cat-1',
    categoryName: 'Roads & Potholes',
    title: 'Hazardous deep pothole on 4th Ave near Main St intersection',
    description: 'A very deep pothole roughly 2 feet wide and 5 inches deep has developed right in the middle of the right-bound lane. Multiple vehicles have sustained tire damage.',
    status: 'IN_PROGRESS',
    severity: 'CRITICAL',
    priorityScore: 88,
    latitude: 37.774929,
    longitude: -122.419416,
    address: '401 Main St, Downtown Civic Area, Metro City',
    images: [
      {
        id: 'img-1',
        imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
        publicId: 'civic_pothole_1',
      },
      {
        id: 'img-2',
        imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
        publicId: 'civic_pothole_2',
      }
    ],
    confirmationsCount: 14,
    userConfirmed: true,
    createdAt: '2026-09-02T10:15:00Z',
    updatedAt: '2026-09-06T14:20:00Z',
    resolvedAt: null,
    statusHistory: [
      {
        id: 'hist-1',
        oldStatus: null,
        newStatus: 'OPEN',
        changedBy: 'Jane Citizen',
        note: 'Report submitted by citizen with 2 photo evidence files.',
        createdAt: '2026-09-02T10:15:00Z',
      },
      {
        id: 'hist-2',
        oldStatus: 'OPEN',
        newStatus: 'UNDER_REVIEW',
        changedBy: 'Alex Rivera (City Admin)',
        note: 'Inspected by Municipal Works department. Confirmed severity critical.',
        createdAt: '2026-09-04T09:30:00Z',
      },
      {
        id: 'hist-3',
        oldStatus: 'UNDER_REVIEW',
        newStatus: 'IN_PROGRESS',
        changedBy: 'Alex Rivera (City Admin)',
        note: 'Contractor dispatch assigned. Asphalt patch crew scheduled for repair.',
        createdAt: '2026-09-06T14:20:00Z',
      }
    ]
  },
  {
    id: 'iss-102',
    userId: 'usr-3',
    userName: 'Marcus Chen',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    categoryId: 'cat-3',
    categoryName: 'Water Leakage',
    title: 'Clean water main leak pooling on Pine Street sidewalk',
    description: 'Drinking water is continuously spouting from a cracked underground pipe junction near house #128. Water has been wasting for over 24 hours.',
    status: 'OPEN',
    severity: 'HIGH',
    priorityScore: 72,
    latitude: 37.783348,
    longitude: -122.41677,
    address: '128 Pine St, North District, Metro City',
    images: [
      {
        id: 'img-3',
        imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80',
        publicId: 'civic_water_1',
      }
    ],
    confirmationsCount: 9,
    userConfirmed: false,
    createdAt: '2026-09-05T08:45:00Z',
    updatedAt: '2026-09-05T08:45:00Z',
    resolvedAt: null,
    statusHistory: [
      {
        id: 'hist-4',
        oldStatus: null,
        newStatus: 'OPEN',
        changedBy: 'Marcus Chen',
        note: 'Reported water leak.',
        createdAt: '2026-09-05T08:45:00Z',
      }
    ]
  },
  {
    id: 'iss-103',
    userId: 'usr-4',
    userName: 'Sarah Jenkins',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    categoryId: 'cat-4',
    categoryName: 'Waste & Sanitation',
    title: 'Overflowing commercial dumpsters attracting pests at Oak Park',
    description: 'Three large public waste bins near the park entrance have not been emptied for 4 days. Waste is overflowing onto the grass walkway.',
    status: 'RESOLVED',
    severity: 'MEDIUM',
    priorityScore: 45,
    latitude: 37.76904,
    longitude: -122.44688,
    address: 'Oak Park Gateway, Westside, Metro City',
    images: [
      {
        id: 'img-4',
        imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80',
        publicId: 'civic_waste_1',
      }
    ],
    confirmationsCount: 6,
    userConfirmed: false,
    createdAt: '2026-08-28T16:20:00Z',
    updatedAt: '2026-08-30T11:10:00Z',
    resolvedAt: '2026-08-30T11:10:00Z',
    statusHistory: [
      {
        id: 'hist-5',
        oldStatus: null,
        newStatus: 'OPEN',
        changedBy: 'Sarah Jenkins',
        note: 'Report created.',
        createdAt: '2026-08-28T16:20:00Z',
      },
      {
        id: 'hist-6',
        oldStatus: 'OPEN',
        newStatus: 'IN_PROGRESS',
        changedBy: 'Alex Rivera (City Admin)',
        note: 'Sanitation vehicle dispatched.',
        createdAt: '2026-08-29T08:00:00Z',
      },
      {
        id: 'hist-7',
        oldStatus: 'IN_PROGRESS',
        newStatus: 'RESOLVED',
        changedBy: 'Alex Rivera (City Admin)',
        note: 'Dumpsters emptied and park walkway cleaned.',
        createdAt: '2026-08-30T11:10:00Z',
      }
    ]
  },
  {
    id: 'iss-104',
    userId: 'usr-1',
    userName: 'Jane Citizen',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    categoryId: 'cat-2',
    categoryName: 'Street Lighting',
    title: 'Multiple dark streetlights along Elm Street residential strip',
    description: 'Four consecutive street lamps are completely dark between 12th and 14th street, creating unsafe dark zones for evening commuters.',
    status: 'UNDER_REVIEW',
    severity: 'MEDIUM',
    priorityScore: 52,
    latitude: 37.75545,
    longitude: -122.4221,
    address: '1350 Elm St, Mission District, Metro City',
    images: [
      {
        id: 'img-5',
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        publicId: 'civic_light_1',
      }
    ],
    confirmationsCount: 8,
    userConfirmed: true,
    createdAt: '2026-09-04T20:10:00Z',
    updatedAt: '2026-09-05T10:00:00Z',
    resolvedAt: null,
    statusHistory: [
      {
        id: 'hist-8',
        oldStatus: null,
        newStatus: 'OPEN',
        changedBy: 'Jane Citizen',
        note: 'Reported streetlight outage.',
        createdAt: '2026-09-04T20:10:00Z',
      },
      {
        id: 'hist-9',
        oldStatus: 'OPEN',
        newStatus: 'UNDER_REVIEW',
        changedBy: 'Alex Rivera (City Admin)',
        note: 'Electrical team ticket opened.',
        createdAt: '2026-09-05T10:00:00Z',
      }
    ]
  },
  {
    id: 'iss-105',
    userId: 'usr-3',
    userName: 'Marcus Chen',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    categoryId: 'cat-6',
    categoryName: 'Traffic & Signals',
    title: 'Traffic signal stuck on red continuously at 5th & Broadway',
    description: 'The south-bound traffic light at the busy 5th & Broadway junction is stuck on solid red, causing severe gridlock and dangerous illegal turns.',
    status: 'IN_PROGRESS',
    severity: 'CRITICAL',
    priorityScore: 94,
    latitude: 37.7812,
    longitude: -122.4085,
    address: '5th St & Broadway Ave, Central Commercial Zone',
    images: [
      {
        id: 'img-6',
        imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df515122519?w=800&auto=format&fit=crop&q=80',
        publicId: 'civic_traffic_1',
      }
    ],
    confirmationsCount: 22,
    userConfirmed: false,
    createdAt: '2026-09-07T07:30:00Z',
    updatedAt: '2026-09-07T08:15:00Z',
    resolvedAt: null,
    statusHistory: [
      {
        id: 'hist-10',
        oldStatus: null,
        newStatus: 'OPEN',
        changedBy: 'Marcus Chen',
        note: 'Urgent traffic hazard reported.',
        createdAt: '2026-09-07T07:30:00Z',
      },
      {
        id: 'hist-11',
        oldStatus: 'OPEN',
        newStatus: 'IN_PROGRESS',
        changedBy: 'Alex Rivera (City Admin)',
        note: 'Traffic management technician en route for emergency signal box reboot.',
        createdAt: '2026-09-07T08:15:00Z',
      }
    ]
  },
  {
    id: 'iss-106',
    userId: 'usr-4',
    userName: 'Sarah Jenkins',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    categoryId: 'cat-5',
    categoryName: 'Drainage & Sewage',
    title: 'Clogged storm drain causing severe standing water on Market St',
    description: 'Heavy leaf buildup and trash have completely blocked the storm drain inlet. Rainwater is flooding into the sidewalk and bus stop area.',
    status: 'OPEN',
    severity: 'MEDIUM',
    priorityScore: 58,
    latitude: 37.7791,
    longitude: -122.4142,
    address: '890 Market St, Financial Plaza',
    images: [
      {
        id: 'img-7',
        imageUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&auto=format&fit=crop&q=80',
        publicId: 'civic_drain_1',
      }
    ],
    confirmationsCount: 5,
    userConfirmed: false,
    createdAt: '2026-09-06T15:40:00Z',
    updatedAt: '2026-09-06T15:40:00Z',
    resolvedAt: null,
    statusHistory: [
      {
        id: 'hist-12',
        oldStatus: null,
        newStatus: 'OPEN',
        changedBy: 'Sarah Jenkins',
        note: 'Drainage blockage submitted.',
        createdAt: '2026-09-06T15:40:00Z',
      }
    ]
  }
];

export const MOCK_COMMENTS = [
  {
    id: 'cmt-1',
    issueId: 'iss-101',
    userId: 'usr-3',
    userName: 'Marcus Chen',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    userRole: 'CITIZEN',
    body: 'I damaged my front suspension coil on this exact pothole last Tuesday! Very glad to see it is marked In Progress.',
    createdAt: '2026-09-03T11:20:00Z',
  },
  {
    id: 'cmt-2',
    issueId: 'iss-101',
    userId: 'usr-2',
    userName: 'Alex Rivera (City Admin)',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    userRole: 'ADMIN',
    body: 'Public Works crew #4 has been scheduled with cold-mix asphalt patch equipment. Target completion within 24 hours.',
    createdAt: '2026-09-06T14:25:00Z',
  },
  {
    id: 'cmt-3',
    issueId: 'iss-102',
    userId: 'usr-1',
    userName: 'Jane Citizen',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    userRole: 'CITIZEN',
    body: 'Confirmed! I walked past Pine St this morning and water is still running into the storm drain.',
    createdAt: '2026-09-05T12:00:00Z',
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-1',
    userId: 'usr-1',
    issueId: 'iss-101',
    type: 'STATUS_CHANGE',
    title: 'Issue Status Updated',
    message: 'Your report "Hazardous deep pothole on 4th Ave" status changed to IN_PROGRESS.',
    readAt: null,
    createdAt: '2026-09-06T14:20:00Z',
  },
  {
    id: 'notif-2',
    userId: 'usr-1',
    issueId: 'iss-104',
    type: 'ADMIN_NOTE',
    title: 'Report Under Review',
    message: 'An administrator reviewed your report on Elm Street streetlights.',
    readAt: '2026-09-05T11:00:00Z',
    createdAt: '2026-09-05T10:00:00Z',
  },
  {
    id: 'notif-3',
    userId: 'usr-1',
    issueId: 'iss-101',
    type: 'COMMENT_ADDED',
    title: 'New Comment on your Report',
    message: 'City Admin Alex Rivera left a comment on your issue.',
    readAt: '2026-09-06T15:00:00Z',
    createdAt: '2026-09-06T14:25:00Z',
  }
];

export const MOCK_AUDIT_LOGS = [
  {
    id: 'audit-1',
    actorUserId: 'usr-2',
    actorName: 'Alex Rivera (City Admin)',
    action: 'UPDATE_ISSUE_STATUS',
    entityType: 'ISSUE',
    entityId: 'iss-101',
    metadata: { oldStatus: 'UNDER_REVIEW', newStatus: 'IN_PROGRESS', note: 'Assigned asphalt repair crew' },
    createdAt: '2026-09-06T14:20:00Z',
  },
  {
    id: 'audit-2',
    actorUserId: 'usr-2',
    actorName: 'Alex Rivera (City Admin)',
    action: 'UPDATE_ISSUE_PRIORITY',
    entityType: 'ISSUE',
    entityId: 'iss-105',
    metadata: { oldScore: 75, newScore: 94, reason: 'High traffic junction safety risk' },
    createdAt: '2026-09-07T08:10:00Z',
  }
];
