exports.server = {
  secret: "khangnn greenwich",
  port: process.env.PORT || 3000,
  sessionMaxAge:  90 * 24 * 60 * 60 * 1000 //90 days
}

exports.database = {
  host: 'cluster0.sholq.mongodb.net',
  port: 27017,
  name: 'atnshop',
  username: 'admin',
  password: 'admin',
  optional: '?retryWrites=true&w=majority'
}
