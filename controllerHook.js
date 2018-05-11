var http = require('http');
const request = require('request-promise')
const fetch = require('node-fetch');
var https = require('https');
//const proxyInfo = 'http://OdeioSenhas##\@\@!!@ncproxy1:8080';
const proxyInfo = 'http://ncproxy1:8080';
const controller = 'https://10.170.136.162:8081';
const requestConf = {'proxy':proxyInfo, timeout: 120000,rejectUnauthorized:false};


//Auxiliary functions
exports.getAgents = function(){
  return request(controller+"/agents",requestConf).then(res => {
    return res;
  });
}

exports.getRemoteActionList = function(srvName){
  return request(controller+"/getremoteactionlist?server="+srvName,requestConf).then(res => {
    return res
  });
}


exports.sendRemoteAction = function(srvName,action){
  return request(controller+"/setremoteaction?server="+srvName+"&param=/apps&action="+action+"&application=teste",requestConf).then(res => {
    return res;
  });
}

exports.getRemoteactionStatus = function(srvName,id){
  return request(controller+"/getremoteactionstatus?server="+srvName+"&param=/apps&ID="+id,requestConf).then(res => {
    return res;
  });
}