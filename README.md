# local development advice
Install mysql to your machine and run the follow sql
```sql
create a local database call 'tiramisu' and add a new user:
CREATE USER 'tiramisu_dev'@'localhost' IDENTIFIED BY 'tiramisu_dev';
CREATE DATABASE IF NOT EXISTS tiramisu CHARSET utf8;
GRANT ALL PRIVILEGES ON tiramisu . * TO 'tiramisu_dev'@'localhost';
FLUSH PRIVILEGES;
```
copy a one local config to connect to your own machine's mysql database
```bash
cp config/dev.js config/local.js
```
# Quick Start
#### frontend
```bash
npm run frontend
```
#### backend
to load the **test** db config

```bash
npm run dev
```
or

to load the **dev** or **test** db config

```bash
npm run frontend | npm run fe 
```
# update frontend compile js
```bash
sudo npm install -g gulp
cd public
npm install
```
```bash
gulp deploy
```

# Run the tests
```bash
npm test
```

# writing tests
The test entry file is
```bash
test/test.js
```
you can add a new test file with following format
```js
// newTest.js
module.exports = function () {
  describe(...);
}
```
then add it to the test.js file
```js
// test.js
require('./newTest');
```
# Deployment
You may need to go to the Aliyun console to load the following files to populate the db
```bash
ls ./sql
```
Then run the following deployment script
```bash
./deploy_tiramisu.sh reload
```
