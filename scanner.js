var noble = require('noble');
var async = require('async');

//replace localhost with your server's IP;
var socket = require('socket.io-client')('http://localhost/scanner');

//replace with your hardware address
var serviceToTrack = 'E6ED937950CF4C2687A8DE1D4B75BDAB';
var characteristicToRead = ['551A74EA928D439B9225AE3CCC275822'];
var peripheralToRead = "TestPeripheral";
var allowDuplicates = true; // default: false


noble.on('stateChange', function(state) {
  if(state === 'poweredOn') {
    //noble.startScanning();
    noble.startScanning([], true);

    console.log('scanning...');
  } else {
    console.log('not scanning');
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {   
  var uuids = peripheral.advertisement.serviceUuids
  var macAddress = peripheral.address;
  var rss = peripheral.rssi;
  var localName = peripheral.advertisement.localName;
  console.log('BLE: ', macAddress, ' ', localName, ' ', rss);
  console.log('Services: ', peripheral);
});

function readCharacteristic(peripheral) {
  console.log('Reading characteristics from : ', peripheral.advertisement.localName);

  peripheral.on('disconnect', function() {
    process.exit(0);
  });

  peripheral.connect(function(error) {
    peripheral.discoverServices([], function(error, services) {
      var serviceIndex = 0;

      async.whilst(function () {
          return (serviceIndex < services.length);
        },
        function(callback) {
          var service = services[serviceIndex];
          var serviceInfo = service.uuid;

          if (service.name) {
            serviceInfo += ' (' + service.name + ')';
          }
          console.log(serviceInfo);

          service.discoverCharacteristics([], function(error, characteristics) {
            var characteristicIndex = 0;

            async.whilst(
              function () {
                return (characteristicIndex < characteristics.length);
              },
              function(callback) {
                var characteristic = characteristics[characteristicIndex];
                var characteristicInfo = '  ' + characteristic.uuid;

                if (characteristic.name) {
                  characteristicInfo += ' (' + characteristic.name + ')';
                }

                async.series([
                  function(callback) {
                    characteristic.discoverDescriptors(function(error, descriptors) {
                      async.detect(
                        descriptors,
                        function(descriptor, callback) {
                          return callback(descriptor.uuid === '2901');
                        },
                        function(userDescriptionDescriptor){
                          if (userDescriptionDescriptor) {
                            userDescriptionDescriptor.readValue(function(error, data) {
                              if (data) {
                                characteristicInfo += ' (' + data.toString() + ')';
                              }
                              callback();
                            });
                          } else {
                            callback();
                          }
                        }
                      );
                    });
                  },
                  function(callback) {
                        characteristicInfo += '\n    properties  ' + characteristic.properties.join(', ');

                    if (characteristic.properties.indexOf('read') !== -1) {
                      characteristic.read(function(error, data) {
                        if (data) {
                          var string = data.toString('ascii');

                          characteristicInfo += '\n    value       ' + data.toString('hex') + ' | \'' + string + '\'';
                        }
                        callback();
                      });
                    } else {
                      callback();
                    }
                  },
                  function() {
                    console.log(characteristicInfo);
                    characteristicIndex++;
                    callback();
                  }
                ]);
              },
              function(error) {
                serviceIndex++;
                callback();
              }
            );
          });
        },
        function (err) {
          peripheral.disconnect();
        }
      );
    });
  });
}