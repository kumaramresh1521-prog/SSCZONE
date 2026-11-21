const assert = require("assert");

async function getGateExpectedHash(secret) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`ssc_admin_gate_v1:${secret}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function simulateMiddleware({ path, searchParams = {}, cookies = {}, user = null, isUserAdmin = false }) {
  const ADMIN_SECRET_KEY = "ssczone-secure-gateway-2026";
  const ADMIN_GATE_COOKIE = "ssczone_admin_pass";

  const isProtectedAdmin = path.startsWith("/admin");
  const isProtectedAdminApi = path.startsWith("/api/admin");
  const isProtectedDashboard = path.startsWith("/dashboard");
  const isAuthPage = path === "/login" || path === "/signup";
  const isGateRoute = path === "/admin-gate" || path === "/portal-gate";

  const providedKey = searchParams.key || searchParams.secret || searchParams.gate;
  const expectedGateHash = await getGateExpectedHash(ADMIN_SECRET_KEY);

  // 1. Key unlock
  if (providedKey && providedKey === ADMIN_SECRET_KEY) {
    return {
      action: "REDIRECT_CLEAN",
      destination: "/admin",
      setCookie: { name: ADMIN_GATE_COOKIE, value: expectedGateHash },
      status: 307,
    };
  }

  // 2. Secret gate route without valid key
  if (isGateRoute) {
    return { action: "REWRITE_404", status: 404 };
  }

  // 3. Admin API
  if (isProtectedAdminApi) {
    if (path === "/api/admin/gate/lock") {
      return { action: "PASS" };
    }
    if (!user || !isUserAdmin) {
      return { action: "JSON_404", status: 404, body: { error: "Not Found" } };
    }
    return { action: "PASS_ADMIN_API", headers: { "x-admin-verified": "ssczone-admin-verified" } };
  }

  // 4. Admin UI
  if (isProtectedAdmin) {
    const gateCookie = cookies[ADMIN_GATE_COOKIE];
    const hasValidGateCookie = gateCookie === expectedGateHash;

    // Stealth check: neither admin nor valid cookie -> 404
    if (!isUserAdmin && !hasValidGateCookie) {
      return { action: "REWRITE_404", status: 404 };
    }

    if (!user) {
      return { action: "REDIRECT_LOGIN", destination: `/login?next=${encodeURIComponent(path)}` };
    }

    if (!isUserAdmin) {
      return { action: "REWRITE_404", status: 404 };
    }

    return { action: "ALLOW_ADMIN_UI", status: 200 };
  }

  return { action: "PASS" };
}

async function runTests() {
  console.log("=== Testing Admin Stealth & Security Gateway ===");

  // Test 1: Random outsider visits /admin
  const t1 = await simulateMiddleware({ path: "/admin" });
  assert.strictEqual(t1.action, "REWRITE_404", "Test 1 failed: Outsider should get 404 on /admin");
  assert.strictEqual(t1.status, 404);
  console.log("✔ Test 1 passed: Guest accessing /admin gets pure 404 Not Found");

  // Test 2: Random outsider visits /admin/questions
  const t2 = await simulateMiddleware({ path: "/admin/questions" });
  assert.strictEqual(t2.action, "REWRITE_404", "Test 2 failed: Outsider should get 404 on /admin/questions");
  console.log("✔ Test 2 passed: Guest accessing /admin/questions gets pure 404 Not Found");

  // Test 3: Random outsider probes /api/admin/questions
  const t3 = await simulateMiddleware({ path: "/api/admin/questions" });
  assert.strictEqual(t3.action, "JSON_404", "Test 3 failed: API probe should get 404 Not Found");
  console.log("✔ Test 3 passed: Outsider probing /api/admin/questions gets JSON 404 Not Found");

  // Test 4: Attacker tries /admin-gate without key
  const t4 = await simulateMiddleware({ path: "/admin-gate" });
  assert.strictEqual(t4.action, "REWRITE_404", "Test 4 failed: /admin-gate without key should 404");
  console.log("✔ Test 4 passed: Accessing /admin-gate without key gets 404 Not Found");

  // Test 5: Attacker tries wrong secret key
  const t5 = await simulateMiddleware({ path: "/admin", searchParams: { key: "wrong_password_123" } });
  assert.strictEqual(t5.action, "REWRITE_404", "Test 5 failed: Wrong key should get 404");
  console.log("✔ Test 5 passed: Accessing /admin with wrong key gets 404 Not Found");

  // Test 6: Admin visits with correct secret key
  const t6 = await simulateMiddleware({ path: "/admin", searchParams: { key: "ssczone-secure-gateway-2026" } });
  assert.strictEqual(t6.action, "REDIRECT_CLEAN", "Test 6 failed: Valid key should redirect clean");
  assert.strictEqual(t6.destination, "/admin");
  assert.ok(t6.setCookie?.value, "Test 6 failed: Gate cookie should be set");
  console.log("✔ Test 6 passed: Valid secret key unlocks gate, sets cookie & strips query param");

  const validCookieVal = t6.setCookie.value;

  // Test 7: Unlocked browser visits /admin (not logged in yet)
  const t7 = await simulateMiddleware({ path: "/admin", cookies: { ssczone_admin_pass: validCookieVal } });
  assert.strictEqual(t7.action, "REDIRECT_LOGIN", "Test 7 failed: Unlocked browser should be redirected to login");
  console.log("✔ Test 7 passed: Unlocked device without session is safely prompted to log in");

  // Test 8: Regular student (isUserAdmin: false) visits /admin even if they have cookie
  const t8 = await simulateMiddleware({
    path: "/admin",
    cookies: { ssczone_admin_pass: validCookieVal },
    user: { id: "student-123" },
    isUserAdmin: false,
  });
  assert.strictEqual(t8.action, "REWRITE_404", "Test 8 failed: Non-admin student must still get 404");
  console.log("✔ Test 8 passed: Authenticated non-admin student gets 404 Not Found");

  // Test 9: Verified Admin (isUserAdmin: true) visits /admin
  const t9 = await simulateMiddleware({
    path: "/admin",
    cookies: { ssczone_admin_pass: validCookieVal },
    user: { id: "admin-master" },
    isUserAdmin: true,
  });
  assert.strictEqual(t9.action, "ALLOW_ADMIN_UI", "Test 9 failed: Verified admin should be allowed in");
  console.log("✔ Test 9 passed: Verified admin successfully enters admin dashboard");

  // Test 10: Verified Admin makes API call
  const t10 = await simulateMiddleware({
    path: "/api/admin/questions",
    user: { id: "admin-master" },
    isUserAdmin: true,
  });
  assert.strictEqual(t10.action, "PASS_ADMIN_API", "Test 10 failed: Verified admin should pass API checks");
  assert.strictEqual(t10.headers["x-admin-verified"], "ssczone-admin-verified");
  console.log("✔ Test 10 passed: Verified admin API requests pass through with verification headers");

  console.log("\nALL 10 SECURITY GATE TESTS PASSED 100%! 🎉");
}

runTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
