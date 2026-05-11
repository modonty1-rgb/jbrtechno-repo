import { PrismaClient } from '@jbrtechno/database';

const prisma = new PrismaClient();

async function check() {
  try {
    const allPermissions = await prisma.userRoutePermission.findMany();
    
    console.log(`Total UserRoutePermission records: ${allPermissions.length}\n`);
    
    const adminRoutes = allPermissions.filter(p => p.route.startsWith('/admin'));
    
    console.log(`Records with /admin prefix: ${adminRoutes.length}\n`);
    
    if (adminRoutes.length > 0) {
      console.log('Routes that need migration:');
      adminRoutes.forEach((perm, i) => {
        console.log(`${i + 1}. ${perm.route} (userId: ${perm.userId})`);
      });
    } else {
      console.log('✅ All routes are already migrated (no /admin prefix found)');
      console.log('\nSample of current routes:');
      allPermissions.slice(0, 10).forEach((perm, i) => {
        console.log(`  ${i + 1}. ${perm.route}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();




