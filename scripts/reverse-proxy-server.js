#!/usr/bin/env node
	
var express = require('express'),
    app     = express(),
    httpProxy = require('http-proxy'),
    port    = 2000;

app.
	use('/redmine', httpProxy.createServer(3000, 'localhost')).
	use(express.static(__dirname + '/../app'));
	
app.listen(port);
