var express = require('express');
var router = express.Router();
var passport = require('passport');
var path = require('path');
var fs = require('fs');
var fsE = require('fs-extra');
const ROOT = path.join(__dirname, '..')

var aclMiddleware = global.myCustomVars.aclMiddleware;

const qt = require('quickthumb');
const reducedStatic = qt.static(path.join(ROOT, 'public/uploads'), {type: 'resize', cacheDir: path.join(ROOT, '.qtcache')})
// const normalStatic = express.static(path.join(ROOT, 'public/uploads'))
router.use('/', isLoggedIn);

router.get('/*', (req, res, next) => {
  let fn = decodeURIComponent(req.path);
  if (fsE.existsSync(path.join(ROOT, 'public/uploads', fn))) {
    if (mediaType(extension(fn)) == 'image') {
      if (!req.query.dim) {
        return res.redirect('/uploads' + req.path + '?dim=300')
      }
      if (req.query.dim == 'full') {
        // return normalStatic(req, res, next);
        return next() // express.static, serve full-sized image
      }
      if ( /^[0-9]+$/.test(req.query.dim)
        || /^[0-9]+x[0-9]*$/.test(req.query.dim)
        || /^[0-9]*x[0-9]+$/.test(req.query.dim)) {
          return reducedStatic(req, res, next);
      }
      return res.redirect('/uploads' + req.path + '?dim=300')
    }
    return next(); // back to express.static
  }
  return res.status(404).end('Not Found')
  // return next();
})

function extension(filename) {
  var idx = filename.lastIndexOf('.');
  if (idx >= 0){
    return filename.substring(idx + 1);
  }
  return 'nothing';
}

function mediaType(extension) {
  // console.log(extension)
  extension = extension.toLowerCase();
  var imgs = ["jpg", "jpeg", "gif", "png", "tif", "tiff", "raw", "bmp", "bpg", "eps"];
  var videos = ["mp4","mpg","flv","rm","webm","mkv","ogg","avi","mov","wmv","3gp","m4v"];
  if (imgs.indexOf(extension) >= 0){
    return 'image';
  }
  if (videos.indexOf(extension) >= 0){
    return 'video';
  }
  return 'document'
}

function isLoggedIn (req, res, next) {
  if (!req.isAuthenticated()){
    return res.redirect('/auth/login');
  }
  return next();
}

module.exports = router;
