// Test the migration logic
function migrateRoute(route: string): string {
  if (route === '/admin') {
    return '/';
  }
  if (route.startsWith('/admin/')) {
    return route.replace('/admin', '');
  }
  return route;
}

const testCases = [
  { input: '/admin', expected: '/' },
  { input: '/admin/applications', expected: '/applications' },
  { input: '/admin/settings', expected: '/settings' },
  { input: '/admin/organizational-structure', expected: '/organizational-structure' },
  { input: '/applications', expected: '/applications' },
  { input: '/', expected: '/' },
  { input: '/admin/applications/interviews', expected: '/applications/interviews' },
];

console.log('Testing migration logic:\n');

let allPassed = true;
testCases.forEach(({ input, expected }) => {
  const result = migrateRoute(input);
  const passed = result === expected;
  allPassed = allPassed && passed;
  
  const status = passed ? '✓' : '✗';
  console.log(`${status} ${input.padEnd(35)} → ${result.padEnd(30)} ${passed ? '' : `(expected: ${expected})`}`);
});

console.log(`\n${allPassed ? '✅ All tests passed!' : '❌ Some tests failed!'}`);




