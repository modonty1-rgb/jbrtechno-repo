import { PrismaClient } from '@jbrtechno/database';

const prisma = new PrismaClient();

async function check() {
  try {
    const userRoutePermissions = await prisma.userRoutePermission.findMany({
      take: 5,
    });

    console.log('UserRoutePermission collection:');
    console.log(`Found ${userRoutePermissions.length} records\n`);

    if (userRoutePermissions.length > 0) {
      console.log('Sample records:');
      userRoutePermissions.forEach((perm, i) => {
        console.log(`${i + 1}. ID: ${perm.id}`);
        console.log(`   userId: ${perm.userId}`);
        console.log(`   route: ${perm.route}\n`);
      });
    } else {
      console.log('No records found in UserRoutePermission collection.');
      console.log('This might mean:');
      console.log('1. The collection is empty');
      console.log('2. The collection name is different');
      console.log('3. You might be looking at RoutePermission (old collection) instead\n');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();




