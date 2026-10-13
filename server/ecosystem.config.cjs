// pm2 process definition for the deployed app (software-license-manager2).
// The name differs from the earlier deployment so both can coexist on the instance.
module.exports = {
  apps: [
    {
      name: "license-manager2",
      script: "server.js",
      cwd: __dirname,
      env: { NODE_ENV: "production" },
    },
  ],
};
