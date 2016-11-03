# Prerequisites

- [NodeJS 4.x](https://nodejs.org/en/download/)

- npm (Go with NodeJS)

# Config

### From the root of source code, run these commands:

	$ cp config/config.js.example config/config.js
	$ cp config/acl.json.example config/acl.json
	$ cp app/service.js.example app/service.js


### Config file config/config.js
Change line 6 from url: 'mongodb://ngocdon:123123@127.0.0.1:27017/museum' to the real url of the database (in Facebook Group)

### Install pm2
	$ npm install -g pm2

# Run

### From the root of source code:

	$ npm install
	$ pm2 start bin/www --name museum

# Use

Open [http://localhost:8000](http://localhost:8000) or [http://127.0.0.1:8000](http://127.0.0.1:8000) in browser (Chrome, Firefox, ...)

# Stop
	$ pm2 delete museum