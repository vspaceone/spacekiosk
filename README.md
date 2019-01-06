# Spacekiosk
This is a kiosk-system, providing simple "prepaid" accounts for users with a RFID-Tag.
Data is stored in an external mongodb and the ui is shown in a window.

Upon reading a tag-id with the connected reader (the implemented reader is a metraTec QR15) a corresponding account is seeked in the database.
If no account for this tag-id can be found, a new one will be created with 0€ credit.
Future readings of this tag open the associated account showing its credit and make it possible to change the credit by adding or removing different amounts.

## TODOs / Future-features
- Make the currency symbol configurable (€,$ etc.)
- Support for other reader models and better tagreader API for easier replacement of different reader implementation
- Possibility to migrate account to another tag-id (als possible with minor mongodb manipulation for now)
- More error messages in the UI (like e.g. "DB connection failed")
- Further separation between UI and Backend (by directories), to make it easier to change the theme in forks

## Prerequisites
What do I need to have in order to use this directly?

- A metraTec QR15 RFID-Tag reader, others can be implemented in the `tagreader.js` file with simple serial commands
- The UI is designed to be used solely with a numpad (USB, Bluetooth or whatever connects well to your platform), I suggest one with a backspace key
- A monitor for the UI
- Something to run this software and connect the hardware to. From a Raspberry Pi to a beefy gaming rig everything that can run Node applications with the electron framework, has a few USB-ports and a video output should work 

## Configuration
Configuration can be accomplished either by environment variables or a configuration file.

__Keep in mind__ that environment variables overwrite settings made in the configuration file.

### Environment variables

|Variable| Description|
|-------------|-------------|
|SK_ReaderDevice  | Device location of the reader (`/dev/ttyUSB0`)|
|SK_ReaderBaudrate      | Device baudrate (`115200`) |
|SK_MongoDB    | Connection string to the MongoDB (`mongodb://root:example@localhost:27017/?authMechanism=DEFAULT&authSource=admin`) |
|SK_WWidth      | Width of the window (ignored if fullscreen option is `true`) |
|SK_WHeight     | Height of the window (ignored if fullscreen option is `true`) |
|SK_WFullscreen | If `true` the window will be fullscreen |
|SK_WHideMenu   | If `false` the top menubar won't show  |

### Configuration file
To run this app a configuration file needs to be created like in this example:

config/default.json
```
{
    "mongo":"mongodb://root:example@localhost:27017/?authMechanism=DEFAULT&authSource=admin",
    "reader":{
        "dev": "/dev/ttyUSB0",
        "baudrate": 115200
    },
    "window":{
        "width": 960,
        "height":640,
        "fullscreen":false,
        "hidemenu":false
    }
}
```