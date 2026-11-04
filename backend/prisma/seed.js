const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CivicPulse database...');

  // 1. Password Hashes
  const defaultPasswordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  // 2. Departments
  const departmentDefinitions = [
    ['Electrical Department', 'electrical', 'Street lighting and electrical infrastructure'],
    ['Water Department', 'water', 'Water supply, drainage, and sewage infrastructure'],
    ['Road Safety Department', 'road-safety', 'Roads, traffic signals, and public safety infrastructure'],
    ['Municipal Department', 'municipal', 'Waste, parks, sanitation, and general civic services'],
  ];
  const departments = {};
  for (const [name, slug, description] of departmentDefinitions) {
    departments[name] = await prisma.department.upsert({
      where: { slug },
      update: { name, description, isActive: true },
      create: { name, slug, description },
    });
  }

  // 3. Users
  const citizen1 = await prisma.user.upsert({
    where: { email: 'citizen@civicpulse.org' },
    update: {},
    create: {
      name: 'Jane Citizen',
      email: 'citizen@civicpulse.org',
      passwordHash: defaultPasswordHash,
      role: 'CITIZEN',
      avatarUrl: 'https://ui-avatars.com/api/?name=Jane+Citizen&background=7c3aed&color=fff&bold=true',
    },
  });

  const admin1 = await prisma.user.upsert({
    where: { email: 'admin@civicpulse.org' },
    update: { department: 'ALL', departmentId: null },
    create: {
      name: 'City Super Admin',
      email: 'admin@civicpulse.org',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      department: 'ALL',
      avatarUrl: 'https://ui-avatars.com/api/?name=Super+Admin&background=2563eb&color=fff&bold=true',
    },
  });

  const adminElectrical = await prisma.user.upsert({
    where: { email: 'admin-electrical@civicpulse.org' },
    update: { department: 'Electrical Department', departmentId: departments['Electrical Department'].id },
    create: {
      name: 'Chief Electrical Officer',
      email: 'admin-electrical@civicpulse.org',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      department: 'Electrical Department',
      departmentId: departments['Electrical Department'].id,
      avatarUrl: 'https://ui-avatars.com/api/?name=Electrical+Admin&background=eab308&color=fff&bold=true',
    },
  });

  const adminWater = await prisma.user.upsert({
    where: { email: 'admin-water@civicpulse.org' },
    update: { department: 'Water Department', departmentId: departments['Water Department'].id },
    create: {
      name: 'Water Works Commissioner',
      email: 'admin-water@civicpulse.org',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      department: 'Water Department',
      departmentId: departments['Water Department'].id,
      avatarUrl: 'https://ui-avatars.com/api/?name=Water+Admin&background=0284c7&color=fff&bold=true',
    },
  });

  const adminRoads = await prisma.user.upsert({
    where: { email: 'admin-roads@civicpulse.org' },
    update: { department: 'Road Safety Department', departmentId: departments['Road Safety Department'].id },
    create: {
      name: 'Road & Highway Authority',
      email: 'admin-roads@civicpulse.org',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      department: 'Road Safety Department',
      departmentId: departments['Road Safety Department'].id,
      avatarUrl: 'https://ui-avatars.com/api/?name=Roads+Admin&background=f97316&color=fff&bold=true',
    },
  });

  const adminMunicipal = await prisma.user.upsert({
    where: { email: 'admin-municipal@civicpulse.org' },
    update: { department: 'Municipal Department', departmentId: departments['Municipal Department'].id },
    create: {
      name: 'Municipal Chief Officer',
      email: 'admin-municipal@civicpulse.org',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      department: 'Municipal Department',
      departmentId: departments['Municipal Department'].id,
      avatarUrl: 'https://ui-avatars.com/api/?name=Municipal+Admin&background=10b981&color=fff&bold=true',
    },
  });

  console.log('Admins seeded: Super, Electrical, Water, Road Safety, Municipal');

  // 4. Categories
  const categoriesData = [
    {
      name: 'Roads & Potholes',
      slug: 'roads-potholes',
      description: 'Dangerous potholes, damaged asphalt, missing curb stones, and road degradation.',
      icon: 'Construction',
      department: 'Road Safety Department',
      priorityWeight: 1.4,
      departmentId: departments['Road Safety Department'].id,
    },
    {
      name: 'Waste & Sanitation',
      slug: 'waste-sanitation',
      description: 'Overflowing dumpsters, illegal dumping, littering, and uncollected trash.',
      icon: 'Trash2',
      department: 'Municipal Department',
      priorityWeight: 1.3,
      departmentId: departments['Municipal Department'].id,
    },
    {
      name: 'Street Lighting',
      slug: 'street-lighting',
      description: 'Broken, flickering, or non-functioning street lamps causing safety concerns.',
      icon: 'Lightbulb',
      department: 'Electrical Department',
      priorityWeight: 1.2,
      departmentId: departments['Electrical Department'].id,
    },
    {
      name: 'Water & Drainage',
      slug: 'water-drainage',
      description: 'Pipe leaks, water main bursts, blocked storm drains, and sewage backups.',
      icon: 'Droplets',
      department: 'Water Department',
      priorityWeight: 1.5,
      departmentId: departments['Water Department'].id,
    },
    {
      name: 'Traffic & Signage',
      slug: 'traffic-signage',
      description: 'Fallen stop signs, malfunctioning traffic signals, obscured road markings.',
      icon: 'AlertTriangle',
      department: 'Road Safety Department',
      priorityWeight: 1.1,
      departmentId: departments['Road Safety Department'].id,
    },
    {
      name: 'Parks & Public Space',
      slug: 'parks-public-space',
      description: 'Broken playground equipment, damaged benches, overgrown vegetation.',
      icon: 'Trees',
      department: 'Municipal Department',
      priorityWeight: 1.0,
      departmentId: departments['Municipal Department'].id,
    },
  ];

  const createdCategories = [];
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { department: cat.department, departmentId: cat.departmentId },
      create: cat,
    });
    createdCategories.push(created);
  }

  console.log(`Seeded ${createdCategories.length} categories.`);

  // 5. Sample Issues
  const roadCat = createdCategories.find((c) => c.slug === 'roads-potholes') || createdCategories[0];
  const wasteCat = createdCategories.find((c) => c.slug === 'waste-sanitation') || createdCategories[1];
  const lightCat = createdCategories.find((c) => c.slug === 'street-lighting') || createdCategories[2];
  const waterCat = createdCategories.find((c) => c.slug === 'water-drainage') || createdCategories[3];

  const sampleIssues = [
    {
      userId: citizen1.id,
      categoryId: roadCat.id,
      assignedDepartment: 'Road Safety Department',
      title: 'Deep Pothole on Main Street near 5th Avenue',
      description: 'Severe pothole measuring approximately 2 feet wide and 5 inches deep. Multiple vehicles have sustained tire damage.',
      status: 'OPEN',
      severity: 'HIGH',
      priorityScore: 78,
      latitude: 40.7128,
      longitude: -74.006,
      address: '5th Ave & Main St, Metro City',
      isLiveCapture: true,
      capturedLatitude: 40.7128,
      capturedLongitude: -74.006,
      capturedAt: new Date(),
      confirmationsCount: 12,
    },
    {
      userId: citizen1.id,
      categoryId: wasteCat.id,
      assignedDepartment: 'Municipal Department',
      title: 'Overflowing Trash Dumpster at Community Park',
      description: 'Public dumpster has been overflowing for 3 days attracting pests and creating severe odor near children play area.',
      status: 'IN_PROGRESS',
      severity: 'CRITICAL',
      priorityScore: 89,
      latitude: 40.7145,
      longitude: -74.0082,
      address: 'Central Park West Entrance',
      isLiveCapture: true,
      capturedLatitude: 40.7145,
      capturedLongitude: -74.0082,
      capturedAt: new Date(),
      confirmationsCount: 24,
    },
    {
      userId: citizen1.id,
      categoryId: lightCat.id,
      assignedDepartment: 'Electrical Department',
      title: 'Dark Alley due to Unlit Streetlamp',
      description: 'Street light bulb burned out on Elm Street. Dark area causes night pedestrian safety concerns.',
      status: 'UNDER_REVIEW',
      severity: 'MEDIUM',
      priorityScore: 45,
      latitude: 40.711,
      longitude: -74.0035,
      address: '142 Elm Street, Metro City',
      isLiveCapture: true,
      capturedLatitude: 40.711,
      capturedLongitude: -74.0035,
      capturedAt: new Date(),
      confirmationsCount: 5,
    },
    {
      userId: citizen1.id,
      categoryId: waterCat.id,
      assignedDepartment: 'Water Department',
      title: 'Major Clean Water Main Pipe Leak on Pine Street',
      description: 'Underground drinking water main cracked, spewing high volume water down Pine Street, eroding road foundations.',
      status: 'OPEN',
      severity: 'CRITICAL',
      priorityScore: 92,
      latitude: 40.715,
      longitude: -74.009,
      address: '88 Pine Street, Metro City',
      isLiveCapture: true,
      capturedLatitude: 40.715,
      capturedLongitude: -74.009,
      capturedAt: new Date(),
      confirmationsCount: 18,
    },
  ];

  for (const issueData of sampleIssues) {
    const existing = await prisma.issue.findFirst({ where: { title: issueData.title } });
    if (!existing) {
      const createdIssue = await prisma.issue.create({
        data: {
          ...issueData,
          departmentId: departments[issueData.assignedDepartment].id,
          images: {
            create: [
              {
                imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
                publicId: 'seed_sample_1',
                isLiveCamera: true,
                latitude: issueData.latitude,
                longitude: issueData.longitude,
                capturedAt: new Date(),
              },
            ],
          },
          statusHistory: {
            create: [
              {
                oldStatus: null,
                newStatus: issueData.status,
                changedBy: 'Jane Citizen',
                note: 'Report submitted by citizen.',
              },
            ],
          },
          confirmations: {
            create: [
              { userId: citizen1.id },
            ],
          },
        },
      });
      console.log(`Created sample issue: ${createdIssue.title}`);
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
