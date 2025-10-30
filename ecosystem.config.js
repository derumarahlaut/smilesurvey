module.exports = {
  apps: [{
    name: 'smilesurvey',
    script: 'npm',
    args: 'start',
    cwd: '/www/wwwroot/your-domain.com', // Sesuaikan dengan path domain Anda
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DB_HOST: 'localhost',
      DB_PORT: 3306,
      DB_USER: 'sql_skg_polkesba',
      DB_PASSWORD: 'pajajaran56',
      DB_NAME: 'sql_skg_polkesba'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      DB_HOST: 'localhost',
      DB_PORT: 3306,
      DB_USER: 'sql_skg_polkesba',
      DB_PASSWORD: 'pajajaran56',
      DB_NAME: 'sql_skg_polkesba'
    },
    error_file: '/www/wwwroot/your-domain.com/logs/err.log',
    out_file: '/www/wwwroot/your-domain.com/logs/out.log',
    log_file: '/www/wwwroot/your-domain.com/logs/combined.log',
    time: true
  }]
};