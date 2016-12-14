var noble = require('noble');

//replace localhost with your server's IP;
var socket = require('socket.io-client')('http://localhost/scanner');

//replace with your hardware address
var serviceToTrack = 'E6ED937950CF4C2687A8DE1D4B75BDAB';
var characteristicToRead = ['551A74EA928D439B9225AE3CCC275822'];
var peripheralToRead = "TestPeripheral";

noble.on('stateChange', function(state) {
  if(state === 'poweredOn') {
    noble.startScanning();
    console.log('scanning...');
  } else {
    console.log('not scanning');
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {   
  var uuids = peripheral.advertisement.serviceUuids
  var macAddress = peripheral.uuid;
  var rss = peripheral.rssi;
  var localName = peripheral.advertisement.localName;
  console.log('found device: ', macAddress, ' ', localName, ' ', rss);

  if(typeof localName !== "undefined"){
    console.log("Not Undefined!!!");

    if(localName == peripheralToRead) {
      console.log("Service Found!!!");
    }
  } 
});