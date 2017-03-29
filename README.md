## Prerequisites

- [NodeJS 6.x](https://nodejs.org/en/download/)

- [MongoDB Community](https://www.mongodb.com/download-center#community)

## Config

### 1. From the root of source code, run these commands:

	$ cp config/config.js.example config/config.js
	$ npm install

 
### 2. Config database

##### Start MongoDB
	$ mongod --dbpath="path\to\mongodb\storage\directory"

##### Copy file initDB.js to the folder you installed MongoDB (usually C:\Program Files\MongoDB\Server\xxx\bin) and run this command from there:
	$ mongo initDB.js


##### Or change line 6 of file config/config.js from url: ``'mongodb://mongodbuser:mongodbpassword@127.0.0.1:27017/museum'`` to the url in mLab server (will email you)

### 3. Initialize

#### Config data.json and run

	$ node initialize.js

### 4. Install pm2
	$ npm install -g pm2

## Run

### From the root of source code:

	$ npm install
	$ pm2 start bin/www --name museum

## Use

Open [http://localhost:8000](http://localhost:8000) or [http://127.0.0.1:8000](http://127.0.0.1:8000) in browser (Chrome, Firefox, ...)

## Stop
	$ pm2 delete museum