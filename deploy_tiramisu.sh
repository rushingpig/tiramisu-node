#!/bin/bash

# created-by : pigo.can
# created-at : 2015-12-11
# desc : to deploy the project -> 'tiramisu'

project_name="tiramisu"
project_path="/project/tiramisu"
git=`which git`
pm2=`which pm2`
npm=`which npm`

function init(){
  ${git} pull && \
  ${npm} install && \
  ${npm} prune
}

function start(){
  ${pm2} start "${project_name}"
}

function stop(){
  ${pm2} stop "${project_name}"
}

function restart(){
  ${pm2} restart "${project_name}"
}
function reload(){
  ${pm2} reload "${project_name}"
}

function usage(){
  echo "Usage:::::::::: sh|./ $0 { start | restart | stop | reload }"
  exit 1
}

case "$1" in
  start | restart | stop | reload)
    init
    $1
  ;;
  *)
    usage
  ;;
esac