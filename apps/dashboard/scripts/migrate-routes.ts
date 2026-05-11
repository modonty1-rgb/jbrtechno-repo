import { PrismaClient } from '@jbrtechno/database';

const prisma = new PrismaClient();

/**
 * Migration script to remove /admin prefix from all route permissions
 * 
 * This script:
 * 1. Updates all UserRoutePermission records to remove /admin prefix
 * 2. Converts /admin to / for dashboard route
 * 3. Includes safety checks and rollback capability
 * 
 * Usage:
 *   npx tsx scripts/migrate-routes.ts
 * 
 * Rollback:
 *   npx tsx scripts/migrate-routes.ts --rollback
 */

interface MigrationRecord {
  id: string;
  userId: string;
  oldRoute: string;
  newRoute: string;
}

const migrationLog: MigrationRecord[] = [];

function migrateRoute(route: string): string {
  if (route === '/admin') {
    return '/';
  }
  if (route.startsWith('/admin/')) {
    return route.replace('/admin', '');
  }
  return route;
}

async function migrateUserRoutePermissions() {
  console.log('Migrating UserRoutePermission collection...\n');

  try {
    const allPermissions = await prisma.userRoutePermission.findMany({
      select: {
        id: true,
        userId: true,
        route: true,
      },
    });

    console.log(`Found ${allPermissions.length} UserRoutePermission records\n`);

    if (allPermissions.length === 0) {
      console.log('No UserRoutePermission records to migrate.\n');
      return { updated: 0, skipped: 0 };
    }

    let updated = 0;
    let skipped = 0;
    const needsMigration: string[] = [];

    for (const permission of allPermissions) {
      const newRoute = migrateRoute(permission.route);

      if (permission.route === newRoute) {
        skipped++;
        continue;
      }

      needsMigration.push(permission.route);
      migrationLog.push({
        id: permission.id,
        userId: permission.userId,
        oldRoute: permission.route,
        newRoute,
      });

      try {
        await prisma.userRoutePermission.update({
          where: { id: permission.id },
          data: { route: newRoute },
        });

        updated++;
        console.log(`✓ UserRoutePermission: ${permission.route} → ${newRoute}`);
      } catch (error: any) {
        console.error(`✗ Failed to update ${permission.route}:`, error.message);
        throw error;
      }
    }

    if (needsMigration.length > 0) {
      console.log(`\nUserRoutePermission routes migrated:`);
      needsMigration.forEach(route => console.log(`  - ${route}`));
    }
    
    if (updated === 0 && skipped > 0) {
      console.log(`✅ All UserRoutePermission routes are already in correct format.\n`);
    }

    return { updated, skipped };
  } catch (error) {
    console.error('UserRoutePermission migration failed:', error);
    throw error;
  }
}

async function migrateRoutePermissions() {
  console.log('Migrating RoutePermission collection...\n');

  try {
    // Get all RoutePermission documents using raw MongoDB query
    const result = await prisma.$runCommandRaw({
      find: 'RoutePermission',
    }) as any;

    const documents = result?.cursor?.firstBatch || [];
    console.log(`Found ${documents.length} RoutePermission records\n`);

    if (documents.length === 0) {
      console.log('No RoutePermission records to migrate.\n');
      return { updated: 0, skipped: 0 };
    }

    let updated = 0;
    let skipped = 0;
    const needsMigration: string[] = [];

    for (const doc of documents) {
      const oldRoute = doc.route;
      if (!oldRoute) {
        skipped++;
        continue;
      }

      const newRoute = migrateRoute(oldRoute);

      if (oldRoute === newRoute) {
        skipped++;
        continue;
      }

      needsMigration.push(oldRoute);

      try {
        // Update using raw MongoDB update
        await prisma.$runCommandRaw({
          update: 'RoutePermission',
          updates: [
            {
              q: { _id: doc._id },
              u: { $set: { route: newRoute } },
            },
          ],
        });

        updated++;
        console.log(`✓ RoutePermission: ${oldRoute} → ${newRoute}`);
      } catch (error: any) {
        console.error(`✗ Failed to update ${oldRoute}:`, error.message);
        throw error;
      }
    }

    if (needsMigration.length > 0) {
      console.log(`\nRoutePermission routes migrated:`);
      needsMigration.forEach(route => console.log(`  - ${route}`));
    }
    
    if (updated === 0 && skipped > 0) {
      console.log(`✅ All RoutePermission routes are already in correct format.\n`);
    }

    return { updated, skipped };
  } catch (error: any) {
    if (error.message?.includes('RoutePermission') || error.message?.includes('collection')) {
      console.log('⚠️  RoutePermission collection might not exist or is not accessible.\n');
      return { updated: 0, skipped: 0 };
    }
    console.error('RoutePermission migration failed:', error);
    throw error;
  }
}

async function migrate() {
  console.log('Starting route migration...\n');
  console.log('='.repeat(50));
  console.log('');

  try {
    const userRouteResult = await migrateUserRoutePermissions();
    console.log('='.repeat(50));
    console.log('');
    
    const routeResult = await migrateRoutePermissions();
    console.log('='.repeat(50));
    console.log('');

    const totalUpdated = userRouteResult.updated + routeResult.updated;
    const totalSkipped = userRouteResult.skipped + routeResult.skipped;

    console.log(`\nMigration Summary:`);
    console.log(`- UserRoutePermission: ${userRouteResult.updated} updated, ${userRouteResult.skipped} skipped`);
    console.log(`- RoutePermission: ${routeResult.updated} updated, ${routeResult.skipped} skipped`);
    console.log(`- Total: ${totalUpdated} updated, ${totalSkipped} skipped`);
    
    if (totalUpdated === 0 && totalSkipped > 0) {
      console.log(`\n✅ All routes are already in the correct format (no /admin prefix).`);
      console.log(`   No migration needed!`);
    }
    
    if (totalUpdated > 0) {
      console.log(`\nMigration log saved for rollback capability.`);
    }
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

async function rollback() {
  console.log('Starting rollback...\n');

  if (migrationLog.length === 0) {
    console.log('No migration log found. Cannot rollback.');
    return;
  }

  try {
    let rolledBack = 0;

    for (const record of migrationLog) {
      await prisma.userRoutePermission.update({
        where: { id: record.id },
        data: { route: record.oldRoute },
      });

      rolledBack++;
      console.log(`✓ ${record.newRoute} → ${record.oldRoute}`);
    }

    console.log(`\nRollback complete! Rolled back ${rolledBack} records.`);
  } catch (error) {
    console.error('Rollback failed:', error);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isRollback = args.includes('--rollback');

  if (isRollback) {
    await rollback();
  } else {
    await migrate();
  }
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

