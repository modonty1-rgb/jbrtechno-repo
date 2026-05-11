import { PrismaClient } from '@jbrtechno/database';

const prisma = new PrismaClient();

async function check() {
  try {
    // Check if RoutePermission collection exists using raw query
    const routePermissions = await prisma.$runCommandRaw({
      find: 'RoutePermission',
      limit: 10,
    }) as any;

    console.log('RoutePermission collection:');
    console.log(`Found documents: ${routePermissions?.cursor?.firstBatch?.length || 0}\n`);

    if (routePermissions?.cursor?.firstBatch && routePermissions.cursor.firstBatch.length > 0) {
      console.log('Sample documents:');
      routePermissions.cursor.firstBatch.forEach((doc: any, i: number) => {
        console.log(`${i + 1}. _id: ${doc._id}`);
        console.log(`   route: ${doc.route}`);
        if (doc.roles) {
          console.log(`   roles: ${Array.isArray(doc.roles) ? doc.roles.join(', ') : doc.roles}`);
        }
        console.log('');
      });

      // Check for /admin prefix
      const withAdmin = routePermissions.cursor.firstBatch.filter((doc: any) => 
        doc.route && (doc.route === '/admin' || doc.route.startsWith('/admin/'))
      );
      console.log(`\nDocuments with /admin prefix: ${withAdmin.length}`);
    } else {
      console.log('No documents found or collection does not exist.');
    }
  } catch (error: any) {
    console.error('Error:', error.message);
    console.log('\nNote: RoutePermission might not exist or might be accessed differently.');
  } finally {
    await prisma.$disconnect();
  }
}

check();




