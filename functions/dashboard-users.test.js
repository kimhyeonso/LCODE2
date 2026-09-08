const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");

function setup({ failWrite = false, failClose = false } = {}) {
  let closed = false;
  class HttpsError extends Error {
    constructor(code, message) { super(message); this.code = code; }
  }
  const database = {
    doc: () => ({ get: async () => ({ data: () => ({ role: "admin" }) }) }),
    getAll: async () => [{ exists: true, data: () => ({ nickname: "Member" }) }],
    bulkWriter: () => ({
      set: async () => { if (failWrite) throw new Error("write failed"); },
      close: async () => { closed = true; if (failClose) throw new Error("close failed"); },
    }),
  };
  const context = { exports: {}, require: (name) => {
    if (name === "firebase-functions/v2/https") return { onCall: (_, handler) => handler, HttpsError };
    if (name === "firebase-admin/app") return { initializeApp() {} };
    if (name === "firebase-admin/auth") return { getAuth: () => ({ listUsers: async () => ({ users: [{ uid: "u1", providerData: [], metadata: {} }] }) }) };
    if (name === "firebase-admin/firestore") return { getFirestore: () => database, FieldValue: { serverTimestamp: () => 1 } };
    return {};
  } };
  vm.runInNewContext(fs.readFileSync(`${__dirname}/index.js`, "utf8"), context);
  return { run: context.exports.listDashboardUsers, closed: () => closed };
}

test("dashboard waits for successful member synchronization", async () => {
  const app = setup();
  const result = await app.run({ auth: { uid: "admin" } });
  assert.equal(result.users[0].nickname, "Member");
  assert.equal(app.closed(), true);
});

test("dashboard reports individual write and writer-close failures", async () => {
  for (const options of [{ failWrite: true }, { failClose: true }]) {
    const app = setup(options);
    await assert.rejects(app.run({ auth: { uid: "admin" } }), { code: "unavailable" });
    assert.equal(app.closed(), true);
  }
});
