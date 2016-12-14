var noble = require('noble');
var async = require('async');

//replace localhost with your server's IP;
var socket = require('socket.io-client')('http://localhost/scanner');

//replace with your hardware address
var serviceUuidToTrack = 'E6ED937950CF4C2687A8DE1D4B75BDAB';
var characteristicUuidToRead = '551A74EA928D439B9225AE3CCC275822';
var peripheralToRead = "TestPeripheral";
var allowDuplicates = false; // default: false


noble.on('stateChange', function(state) {
  if(state === 'poweredOn') {
    noble.startScanning();
    console.log('scanning...');
  } else {
    console.log('not scanning');
    noble.stopScanning();
  }
});

var loginService = null;
var loginCharacteristic = null;

noble.on('discover', function(peripheral) {   
  // we found a peripheral, stop scanning
  noble.stopScanning();

  var uuids = peripheral.advertisement.serviceUuids
  var macAddress = peripheral.address;
  var rss = peripheral.rssi;
  var localName = peripheral.advertisement.localName;
  console.log('BLE: ', macAddress, ' ', localName, ' ', rss);
  console.log('Services: ', peripheral);

  peripheral.connect(function(err) {
    //
    // Once the peripheral has been connected, then discover the
    // services and characteristics of interest.
    //
    console.log('Conectado:');

    peripheral.discoverServices([serviceUuidToTrack], function(err, services) {
      services.forEach(function(service) {
        //
        // This must be the service we were looking for.
        //
        console.log('Servicio encontrado:', service.uuid);

        //
        // So, discover its characteristics.
        //
        service.discoverCharacteristics([], function(err, characteristics) {

          characteristics.forEach(function(characteristic) {
            //
            // Loop through each characteristic and match them to the
            // UUIDs that we know about.
            //
            console.log('Caracteristica Encontrada:', characteristic.uuid);

            if (characteristicUuidToRead == characteristic.uuid) {
              loginCharacteristic = characteristic;
            }
          })

          //
          // Check to see if we found all of our characteristics.
          //
          if (characteristicUuidToRead) {
            //make connection to socket to check credentials
            console.log("conect to server");
          }
          else {
            console.log('missing characteristics');
          }
        })
      })
    })
  })
});