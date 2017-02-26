var db = connect('localhost:27017/museum')
db.dropAllUsers()
db.createUser({user: 'mongodbuser', pwd: 'mongodbpassword', roles: ['readWrite']})
db.auth({user: 'mongodbuser', pwd: 'mongodbpassword'})