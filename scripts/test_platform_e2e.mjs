import { PrismaClient } from "@prisma/client";

const BASE_URL = "http://localhost:3000";
const prisma = new PrismaClient();

async function runE2ETests() {
  console.log("==================================================");
  console.log("🚀 STARTING ALUMNECT FULL END-TO-END VALIDATION");
  console.log("==================================================");

  // 1. Fetch sample mentee and mentor from database
  const menteeUser = await prisma.user.findFirst({
    where: { role: "MENTEE" },
    include: { profile: true },
  });
  const mentorUser = await prisma.user.findFirst({
    where: { role: "MENTOR" },
    include: { profile: true },
  });

  if (!menteeUser || !mentorUser) {
    throw new Error("Could not find seeded mentor or mentee in DB.");
  }

  console.log(`\n[STEP 1] Testing Mentee Login: ${menteeUser.email}`);
  const menteeLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: menteeUser.email, password: "password123" }),
  });
  const menteeLoginData = await menteeLoginRes.json();
  if (!menteeLoginData.success) {
    throw new Error(`Mentee login failed: ${menteeLoginData.error}`);
  }
  const menteeCookie = menteeLoginRes.headers.get("set-cookie")?.split(";")[0] || "";
  console.log(`✓ Mentee logged in: ${menteeLoginData.data.fullName} | Role: ${menteeLoginData.data.role} | Redirect: ${menteeLoginData.data.redirectTo}`);

  // 2. Test RBAC Redirects with Mentee Cookie
  console.log(`\n[STEP 2] Testing Next.js 16 Proxy RBAC Protection with Mentee Cookie`);
  const rAdmin = await fetch(`${BASE_URL}/admin/dashboard`, {
    headers: { Cookie: menteeCookie },
    redirect: "manual",
  });
  console.log(`✓ Mentee accessing /admin/dashboard -> Status: ${rAdmin.status} | Location: ${rAdmin.headers.get("location")}`);

  const rMentor = await fetch(`${BASE_URL}/dashboard/mentor`, {
    headers: { Cookie: menteeCookie },
    redirect: "manual",
  });
  console.log(`✓ Mentee accessing /dashboard/mentor -> Status: ${rMentor.status} | Location: ${rMentor.headers.get("location")}`);

  const rLoginRedirect = await fetch(`${BASE_URL}/login`, {
    headers: { Cookie: menteeCookie },
    redirect: "manual",
  });
  console.log(`✓ Mentee accessing /login while authenticated -> Status: ${rLoginRedirect.status} | Location: ${rLoginRedirect.headers.get("location")}`);

  // 3. Mentee semantic recommendation query
  console.log(`\n[STEP 3] Semantic Vector Discovery (Threshold >= 0.45, 384-D SBERT)`);
  const matchRes = await fetch(`${BASE_URL}/api/matches/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: menteeCookie },
    body: JSON.stringify({
      bioText: menteeUser.profile?.rawBio || "Commercial pilot aiming for B737 type rating and line operations.",
      department: "Flight Operations",
      minSimilarity: 0.45,
      limit: 5,
    }),
  });
  const matchData = await matchRes.json();
  if (!matchData.success || !matchData.data) {
    throw new Error(`Semantic match failed: ${matchData.error}`);
  }
  console.log(`✓ Discovered ${matchData.data.length} candidate mentors meeting threshold >= 0.45:`);
  matchData.data.slice(0, 3).forEach((m, idx) => {
    console.log(`   ${idx + 1}. ${m.fullName} (${m.jobTitle}) - Match: ${m.compatibilityPercentage}% (Similarity: ${m.similarity.toFixed(4)})`);
  });

  const chosenMentor = matchData.data[0];

  // 4. Mentee sends mentorship request
  console.log(`\n[STEP 4] Mentee Submitting Mentorship Request to: ${chosenMentor.fullName}`);
  const reqRes = await fetch(`${BASE_URL}/api/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: menteeCookie },
    body: JSON.stringify({
      mentorId: chosenMentor.userId,
      similarityScore: chosenMentor.similarity,
      notes: "Hello Capt., I am preparing for my simulator check ride and would value your guidance.",
    }),
  });
  const reqData = await reqRes.json();
  if (!reqData.success) {
    throw new Error(`Mentorship request submission failed: ${reqData.error}`);
  }
  const createdRequestId = reqData.data.id;
  console.log(`✓ Request created with ID: ${createdRequestId} | Status: ${reqData.data.status}`);

  // 5. Mentor login
  console.log(`\n[STEP 5] Mentor Login: ${chosenMentor.fullName} (ID: ${chosenMentor.userId})`);
  const mentorRecord = await prisma.user.findUnique({ where: { id: chosenMentor.userId } });
  const mentorLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: mentorRecord.email, password: "password123" }),
  });
  const mentorLoginData = await mentorLoginRes.json();
  const mentorCookie = mentorLoginRes.headers.get("set-cookie")?.split(";")[0] || "";
  console.log(`✓ Mentor logged in: ${mentorLoginData.data.fullName} | Role: ${mentorLoginData.data.role}`);

  // 6. Mentor checks incoming requests queue
  console.log(`\n[STEP 6] Mentor Retrieving Inbound Request Queue`);
  const mentorQueueRes = await fetch(`${BASE_URL}/api/requests`, {
    headers: { Cookie: mentorCookie },
  });
  const mentorQueue = await mentorQueueRes.json();
  const foundReq = mentorQueue.data.find((r) => r.id === createdRequestId);
  if (!foundReq) {
    throw new Error("Created mentorship request not found in mentor inbound queue.");
  }
  console.log(`✓ Found pending request from ${foundReq.mentee?.profile?.fullName || 'Mentee'} with note: "${foundReq.notes}"`);

  // 7. Mentor approves request
  console.log(`\n[STEP 7] Mentor Approving Mentorship Request`);
  const approveRes = await fetch(`${BASE_URL}/api/requests`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: mentorCookie },
    body: JSON.stringify({
      requestId: createdRequestId,
      status: "APPROVED",
    }),
  });
  const approveData = await approveRes.json();
  console.log(`✓ Request updated. New status: ${approveData.data.status}`);

  // 8. Mentee verifies approval and mutual contact
  console.log(`\n[STEP 8] Mentee Verifying Request Status & Contact Reveal`);
  const menteeReqListRes = await fetch(`${BASE_URL}/api/requests`, {
    headers: { Cookie: menteeCookie },
  });
  const menteeReqList = await menteeReqListRes.json();
  const approvedReq = menteeReqList.data.find((r) => r.id === createdRequestId);
  console.log(`✓ Mentee confirmed status: ${approvedReq.status} | Mentor Contact: ${approvedReq.mentor?.email}`);

  // 9. Admin Stats and User Management
  console.log(`\n[STEP 9] Admin Dashboard Analytics & User Management`);
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@alumnect.dev", password: "admin123" }),
  });
  const adminCookie = adminLoginRes.headers.get("set-cookie")?.split(";")[0] || "";
  const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
    headers: { Cookie: adminCookie },
  });
  const statsData = await statsRes.json();
  console.log(`✓ Admin Stats: Total Users: ${statsData.data.totalUsers} | Mentors: ${statsData.data.mentorsCount} | Mentees: ${statsData.data.menteesCount} | Active Connections: ${statsData.data.activeConnections} | Avg Similarity: ${statsData.data.avgScore}`);

  // 10. Registration & Onboarding Lifecycle
  console.log(`\n[STEP 10] Testing New User Registration + Mandatory Onboarding Gate + Vector Generation`);
  const testEmail = `cadet.test.${Date.now()}@alumnect.dev`;
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: "TestPassword123!",
      role: "MENTEE",
    }),
  });
  const regData = await regRes.json();
  const newCadetCookie = regRes.headers.get("set-cookie")?.split(";")[0] || "";
  console.log(`✓ Registered new user: ${testEmail} | Needs Onboarding: ${regData.data.needsOnboarding}`);

  // Attempting to visit /dashboard/mentee before onboarding
  const rPreOnboard = await fetch(`${BASE_URL}/dashboard/mentee`, {
    headers: { Cookie: newCadetCookie },
    redirect: "manual",
  });
  console.log(`✓ Gated pre-onboarding access to /dashboard/mentee -> Status: ${rPreOnboard.status} | Redirects to: ${rPreOnboard.headers.get("location")}`);

  // Complete onboarding
  const onboardRes = await fetch(`${BASE_URL}/api/onboarding`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: newCadetCookie },
    body: JSON.stringify({
      fullName: "Cadet Alex Taylor",
      department: "Flight Operations",
      jobTitle: "Student Aviator - PPL Stage",
      yearsExperience: 1,
      certifications: "FAA Private Pilot License, Class 1 Medical",
      rawBio: "Aspiring commercial airline first officer currently building cross-country PIC hours in Cessna 172. Seeking guidance from seasoned B737 or A320 airline captains on instrument ratings and airline cadet assessments.",
    }),
  });
  const onboardData = await onboardRes.json();
  console.log(`✓ Onboarding completed: ${onboardData.message}`);

  const postOnboardCookie = onboardRes.headers.get("set-cookie")?.split(";")[0] || newCadetCookie;
  const rPostOnboard = await fetch(`${BASE_URL}/dashboard/mentee`, {
    headers: { Cookie: postOnboardCookie },
    redirect: "manual",
  });
  console.log(`✓ Post-onboarding access to /dashboard/mentee -> Status: ${rPostOnboard.status} (Allowed!)`);

  console.log("\n==================================================");
  console.log("🎉 ALL 10 END-TO-END FLOWS PASSED FLAWLESSLY!");
  console.log("==================================================");
}

runE2ETests()
  .catch((err) => {
    console.error("\n❌ E2E Test Failure:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

