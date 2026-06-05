import assert from 'assert';

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('🧪 Starting API Integration Tests...\n');
  let failures = 0;

  // Helper for requests
  const request = async (path, options = {}) => {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    const data = await response.json();
    return { status: response.status, data };
  };

  // Test 1: Health Check
  try {
    const { status, data } = await request('/health');
    assert.strictEqual(status, 200);
    assert.strictEqual(data.status, 'OK');
    console.log('✅ Test 1: Health Check Endpoint Passed');
  } catch (err) {
    console.error('❌ Test 1: Health Check Endpoint Failed:', err.message);
    failures++;
  }

  // Test 2: Login Pre-seeded Student
  let studentToken = '';
  try {
    const { status, data } = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'student@interview.com',
        password: 'Password123'
      })
    });
    assert.strictEqual(status, 200);
    assert.ok(data.accessToken);
    assert.strictEqual(data.user.email, 'student@interview.com');
    studentToken = data.accessToken;
    console.log('✅ Test 2: Pre-seeded Student Login Passed');
  } catch (err) {
    console.error('❌ Test 2: Pre-seeded Student Login Failed:', err.message);
    failures++;
  }

  // Test 3: Register New User & Auto-Verify
  try {
    const testEmail = `testuser_${Date.now()}@example.com`;
    const regRes = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Candidate',
        email: testEmail,
        password: 'Password123',
        college: 'Test College',
        branch: 'CSE',
        graduationYear: 2026
      })
    });
    assert.strictEqual(regRes.status, 201);
    const verifyToken = regRes.data.devVerificationToken;
    assert.ok(verifyToken);
    
    // Perform verification
    const verRes = await request('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token: verifyToken })
    });
    assert.strictEqual(verRes.status, 200);

    // Login new user
    const logRes = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        password: 'Password123'
      })
    });
    assert.strictEqual(logRes.status, 200);
    console.log('✅ Test 3: Registration and Auto-Verification Flow Passed');
  } catch (err) {
    console.error('❌ Test 3: Registration and Auto-Verification Flow Failed:', err.message);
    failures++;
  }

  // Test 4: Global System Analytics
  try {
    const { status, data } = await request('/api/analytics');
    assert.strictEqual(status, 200);
    assert.ok(data.totalExperiences >= 2);
    assert.ok(data.totalQuestions >= 3);
    assert.ok(data.topCompanies.length > 0);
    console.log('✅ Test 4: System Analytics Aggregate Passed');
  } catch (err) {
    console.error('❌ Test 4: System Analytics Aggregate Failed:', err.message);
    failures++;
  }

  // Test 5: Company Insights (Google)
  try {
    const { status, data } = await request('/api/companies/Google/insights');
    assert.strictEqual(status, 200);
    assert.strictEqual(data.companyName, 'Google');
    assert.ok(data.difficultyDistribution);
    assert.ok(data.frequentlyAskedTopics);
    console.log('✅ Test 5: Company Insights Explorer Passed');
  } catch (err) {
    console.error('❌ Test 5: Company Insights Explorer Failed:', err.message);
    failures++;
  }

  console.log('\n======================================');
  if (failures === 0) {
    console.log('🏆 All API Integration Tests Passed Successfully!');
    process.exit(0);
  } else {
    console.log(`⚠️ Completed with ${failures} failure(s).`);
    process.exit(1);
  }
}

runTests();
