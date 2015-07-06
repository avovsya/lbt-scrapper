#! /bin/bash

node downloader.js &
node parser.js &
node scheduler.js
