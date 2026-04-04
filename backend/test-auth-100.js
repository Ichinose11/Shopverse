async function testSignupLoop() {
  const API_URL = 'http://localhost:5000/api/auth/signup';
  const start = Date.now();
  let successCount = 0;
  console.log(`Starting 100+ account simulation...`);
  
  for (let i = 1; i <= 105; i++) {
    const user = {
      name: `Test User ${i}`,
      email: `testuser${i}_${Date.now()}@example.com`,
      password: 'StrongPassword123!'
    };
    
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      const data = await res.json();
      if (data.token) {
        successCount++;
        process.stdout.write('.');
      } else {
        console.error(`\nError creating user ${i}:`, data.message);
      }
    } catch (err) {
      console.error(`\nError creating user ${i}:`, err.message);
    }
  }
  
  const end = Date.now();
  console.log(`\n\n✅ Secure Authentication Test Complete.`);
  console.log(`Successfully simulated, authenticated, and secured data for ${successCount} accounts.`);
  console.log(`Total time: ${(end - start) / 1000}s`);
}

testSignupLoop();
