module.exports = {
  apps: [
    {
      name: 'teamio-api',
      script: 'server.js',
      cwd: __dirname,
      env_file: '.env',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
