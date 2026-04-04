async function testPerformance() {
  const API_URL = 'http://localhost:5000/api/products';
  console.log(`Starting API Performance test across 50 requests...`);
  
  let times = [];
  
  for (let i = 0; i < 50; i++) {
    const start = Date.now();
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed');
      await res.json();
      const end = Date.now();
      times.push(end - start);
      process.stdout.write('-');
    } catch (err) {
      console.error(`\nRequest ${i} failed`);
    }
  }
  
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const max = Math.max(...times);
  const min = Math.min(...times);
  
  console.log(`\n\n✅ API Performance Test Complete.`);
  console.log(`Average Retrieval Time: ${avg.toFixed(2)}ms`);
  console.log(`Max Retrieval Time: ${max}ms`);
  console.log(`Min Retrieval Time: ${min}ms`);
  
  if (avg < 200) {
    console.log(`\nSUCCESS: Product retrieval times remained comfortably under 200ms!`);
  } else {
    console.log(`\nWARNING: Performance test failed to keep average under 200ms.`);
  }
}

testPerformance();
