#!/bin/bash
abs_path=$(cd `dirname $0`; pwd)
nginx -c $abs_path/nginx.conf;
echo 'start nginx success~'
