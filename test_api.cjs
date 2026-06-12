const fetch = require('node-fetch');

async function test() {
  // Login to get token
  const loginRes = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: '사업자@naver.com', password: 'password123!' })
  });
  
  if (!loginRes.ok) {
    console.log("Login failed");
    return;
  }
  
  const token = await loginRes.text();
  
  // Fetch seller boards
  const res = await fetch('http://localhost:8080/api/kuji/seller', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
