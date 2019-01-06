const config = require('config')
const SerialPort = require('serialport')

const Readline = SerialPort.parsers.Readline

const port = new SerialPort(defaultIfUndefined(process.env.SK_ReaderDevice, config.get('reader.dev')), {
    baudRate: defaultIfUndefined(process.env.SK_ReaderBaudrate, config.get('reader.baudrate'))
})
const parser = new Readline({delimiter:"\r"})

function defaultIfUndefined(vvalue, def){
    return vvalue != undefined ? vvalue : def
}

//################################################################
// tag reader part
//################################################################
// metraTec QR15 reader is used
// Doc: http://www.metratec.com/fileadmin/docs/en/documentation/Docu_QR15_v1-8.pdf
// Protocol Guide: http://www.metratec.com/fileadmin/docs/en/documentation/metraTec_ISO_Protocol-Guide_3_6.pdf

var onTagRead = function(uid) {}

function setOnTagReadCallback(func){
    onTagRead = func;
}
exports.setOnTagReadCallback = setOnTagReadCallback


port.pipe(parser)

port.on('open', function() {
    console.log("Initializing")
    port.write("SRI SS 100\r") // Init of tagreader (metraTec QR15)
    port.write("CNR INV ONT\r") // Starting continuous reading of ids from nearby tags
});

parser.on('data', function(data) {
    
    if (data.toString().length == 16) {
        console.log("TAG! " + data)
        onTagRead(data)
    } 
});

// open errors will be emitted as an error event
port.on('error', function(err) {
    console.log('Error: ', err.message);
})

window.onbeforeunload = function() {
    //close tag, end readings etc
    console.log("onbeforeunload")
    port.write("BRK\r") // stopping any continuous readings
}