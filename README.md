# local development advice
create a local database call 'tiramisu' and add a new user:
CREATE USER 'tiramisu_dev'@'localhost' IDENTIFIED BY 'tiramisu_dev';
CREATE DATABASE IF NOT EXISTS tiramisu CHARSET utf8;
GRANT ALL PRIVILEGES ON tiramisu . * TO 'tiramisu_dev'@'localhost';
FLUSH PRIVILEGES;

copy a one local config to connect to your own machine's mysql database
cp config/dev.js config/local.js