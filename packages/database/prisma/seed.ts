import { PrismaClient, UserRole, TaskStatus, TaskPriority, NoteType, TargetAudience } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create default SUPER_ADMIN user
  const superAdmin = await prisma.user.upsert({
    where: { email: 'nadish' },
    update: {},
    create: {
      email: 'nadish',
      password: 'Leno_1972', // Plain text password
      role: UserRole.SUPER_ADMIN,
      name: 'Nadish',
      isActive: true,
    },
  });

  console.log('✅ Created SUPER_ADMIN user:', superAdmin.email);

  // Define route-to-role mapping for migration (no longer using RoutePermission model)
  const routeRoleMapping: Record<string, UserRole[]> = {
    '/admin': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF],
    '/admin/general-plan': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    '/admin/phase-1-requirements': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    '/admin/hiring-plan': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    '/admin/applications': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF],
    '/admin/contact-messages': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF],
    '/admin/accounting': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    '/admin/costs': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    '/admin/subscriptions': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    '/admin/customers': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    '/admin/tasks': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    '/admin/tasks/my-tasks': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF],
    '/admin/employee-affairs': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    '/admin/notes': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF],
    '/admin/contracts': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    '/admin/reports': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    '/admin/settings': [UserRole.SUPER_ADMIN],
    '/admin/users': [UserRole.SUPER_ADMIN],
  };

  // Migrate existing users to user-based permissions
  console.log('🔄 Migrating users to user-based permissions...');
  const allUsers = await prisma.user.findMany({
    where: {
      role: {
        not: UserRole.SUPER_ADMIN, // Skip SUPER_ADMIN (they have access to all routes)
      },
    },
  });

  let migratedCount = 0;
  for (const user of allUsers) {
    // Get routes that this user's role has access to based on hardcoded mapping
    const userRoutes: string[] = [];
    for (const [route, allowedRoles] of Object.entries(routeRoleMapping)) {
      if (allowedRoles.includes(user.role)) {
        userRoutes.push(route);
      }
    }

    // Create UserRoutePermission records for each route the role has access to
    for (const route of userRoutes) {
      await prisma.userRoutePermission.upsert({
        where: {
          userId_route: {
            userId: user.id,
            route,
          },
        },
        update: {},
        create: {
          userId: user.id,
          route,
        },
      });
    }

    migratedCount++;
    console.log(`  ✅ Migrated user: ${user.email} (${userRoutes.length} routes)`);
  }

  console.log(`✅ Migrated ${migratedCount} users to user-based permissions`);

  // Seed Tasks and ManagementNotes
  console.log('📝 Seeding tasks and management notes...');

  // Get or create a staff user for task assignment
  let staffUser = await prisma.user.findFirst({
    where: { role: UserRole.STAFF },
  });

  if (!staffUser) {
    staffUser = await prisma.user.create({
      data: {
        email: 'staff@example.com',
        password: 'password123',
        role: UserRole.STAFF,
        name: 'Test Staff',
        isActive: true,
      },
    });
    console.log('  ✅ Created test staff user for seeding');
  }

  // Get admin user (superAdmin) for creating tasks and notes
  const adminUser = superAdmin;

  // Create dummy tasks
  const taskTitles = [
    'Review and update documentation',
    'Implement new feature for dashboard',
    'Fix bug in authentication flow',
    'Prepare monthly report',
    'Update user interface components',
    'Optimize database queries',
    'Write unit tests for new module',
    'Code review for pull request',
  ];

  const taskDescriptions = [
    'Please review the current documentation and update any outdated information.',
    'Implement the new analytics feature as discussed in the meeting.',
    'There is a bug in the login flow that needs to be fixed urgently.',
    'Prepare the monthly performance report for management review.',
    'Update the UI components to match the new design system.',
    'Optimize slow database queries to improve performance.',
    'Write comprehensive unit tests for the new payment module.',
    'Review the code changes in PR #123 before merging.',
  ];

  const createdTasks = [];
  for (let i = 0; i < 8; i++) {
    const statuses: TaskStatus[] = [TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED];
    const priorities: TaskPriority[] = [TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH];

    const task = await prisma.task.create({
      data: {
        title: taskTitles[i],
        description: taskDescriptions[i],
        status: statuses[i % statuses.length],
        priority: priorities[i % priorities.length],
        assignedToUserId: staffUser.id,
        createdByUserId: adminUser.id,
        dueDate: i % 2 === 0 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
        completedAt: statuses[i % statuses.length] === TaskStatus.COMPLETED ? new Date() : null,
      },
    });
    createdTasks.push(task);
  }

  console.log(`  ✅ Created ${createdTasks.length} tasks`);

  // Create dummy management notes
  const notes = [
    {
      title: 'Welcome to the Team!',
      content: 'We are excited to have you on board. Please familiarize yourself with our processes and don\'t hesitate to ask questions.',
      type: NoteType.ANNOUNCEMENT,
      targetAudience: TargetAudience.ALL,
      isImportant: true,
    },
    {
      title: 'Excellent Work on the Project',
      content: 'Your dedication and attention to detail on the recent project was outstanding. Keep up the great work!',
      type: NoteType.TASK,
      targetAudience: TargetAudience.SPECIFIC_USER,
      targetUserId: staffUser.id,
      isImportant: false,
    },
    {
      title: 'Time Management Improvement Needed',
      content: 'Please work on improving time management skills. Try to prioritize tasks better and meet deadlines more consistently.',
      type: NoteType.GENERAL,
      targetAudience: TargetAudience.SPECIFIC_USER,
      targetUserId: staffUser.id,
      isImportant: false,
    },
    {
      title: 'Q4 Performance Bonus',
      content: 'Congratulations on your excellent performance this quarter! You have earned a performance bonus.',
      type: NoteType.REWARD,
      targetAudience: TargetAudience.SPECIFIC_USER,
      targetUserId: staffUser.id,
      rewardAmount: 5000,
      rewardCurrency: 'SAR',
      isImportant: true,
    },
    {
      title: 'Holiday Gift',
      content: 'As a token of appreciation, please accept this holiday gift. Thank you for your hard work throughout the year.',
      type: NoteType.REWARD,
      targetAudience: TargetAudience.STAFF,
      rewardAmount: 1000,
      rewardCurrency: 'SAR',
      isImportant: false,
    },
  ];

  const createdNotes = [];
  for (const noteData of notes) {
    const note = await prisma.managementNote.create({
      data: {
        ...noteData,
        createdByUserId: adminUser.id,
        readBy: [],
      },
    });
    createdNotes.push(note);
  }

  console.log(`  ✅ Created ${createdNotes.length} management notes`);
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


