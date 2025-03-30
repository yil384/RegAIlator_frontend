# [The Regailator](https://www.regailator.com/)

[![npm](https://img.shields.io/npm/v/froala-design-blocks.svg?colorB=brightgreen)](https://www.npmjs.com/package/berry-material-react-free)
[![GitHub package version](https://img.shields.io/github/package-json/v/froala/design-blocks.svg)](https://github.com/codedthemes/berry-free-react-admin-template/)


The Regailator

## Quick Start
```
npm install
```
then,
```
export NODE_OPTIONS=--openssl-legacy-provider && npm start
```
or
```
export NODE_OPTIONS=--openssl-legacy-provider && npm run build && serve -s build -l 3001
```


## Deploy
```
git pull && export NODE_OPTIONS=--openssl-legacy-provider && npm run build && tar -czvf ~/RegAIlator_frontend/build.tar.gz -C ~/RegAIlator_frontend build && scp -i ~/web_server_key.pem ~/RegAIlator_frontend/build.tar.gz ubuntu@3.137.84.84:/home/ubuntu/
```