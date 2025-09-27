# [The Regailator](https://www.regailator.com/)

[![npm](https://img.shields.io/npm/v/froala-design-blocks.svg?colorB=brightgreen)](https://www.npmjs.com/package/berry-material-react-free)
[![GitHub package version](https://img.shields.io/github/package-json/v/froala/design-blocks.svg)](https://github.com/codedthemes/berry-free-react-admin-template/)


The Regailator

## Start
```
npm install
```
then,
```
export NODE_OPTIONS=--openssl-legacy-provider && npm run build && serve -s build -l 3001
```
next, deploy:
```
tar -czvf build.tar.gz -C ./ build && scp build.tar.gz ubuntu@3.140.152.13:/home/ubuntu/
```
next, enter the ubuntu@3.140.152.13:
```
ssh ubuntu@3.140.152.13
```
last, run:
```
sudo tar -xzvf ~/build.tar.gz -C /var/www/regailator --strip-components=1
```