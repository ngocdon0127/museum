const CronJob = require('cron').CronJob;
const fsE = require('fs-extra');
const path = require('path');
const ROOT = path.join(__dirname, '../');

let cleanJob = new CronJob('0 0 0 * * *', () => {
  cleanInstantUploadedFiles()
})

function cleanInstantUploadedFiles() {
  fsE.removeSync(path.join(ROOT, global.myCustomVars.TMP_UPLOAD_DIR))
  fsE.mkdirpSync(path.join(ROOT, global.myCustomVars.TMP_UPLOAD_DIR))
}