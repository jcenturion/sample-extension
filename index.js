module.exports = function (cb) {
  cb(null, 'Welcome to Sample Webtask!');
}

module.exports.meta = {
  title:       "Sample Webtask",
  name:        "sample-webtask",
  version:     "1.0.0",
  author:      "javier.centurion@auth0.com",
  description: "This is an example about how to use webtasks",
  type:        "application",
  repository:  "https://github.com/jcenturion/sample-webtask",
  keywords: [
    "auth0",
    "extension"
  ]
}
