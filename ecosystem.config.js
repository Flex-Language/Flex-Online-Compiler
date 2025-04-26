module.exports = {
  apps: [{
    name: 'flex-web-compiler',
    script: './backend/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '6144M',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    merge_logs: true,
    cpu: '80%',
    node_args: '--max-old-space-size=6144',
    kill_timeout: 3000,
    wait_ready: true,
    listen_timeout: 50000,
    max_restarts: 10,
    restart_delay: 1000
  }],
  
  deploy: {
    production: {
      user: 'root',
      host: 'localhost',
      ref: 'origin/main',
      repo: 'local',
      path: '/var/wwww/Flex/src/flex_web',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  }
}; 