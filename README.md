# RFIDEO

Plays videos triggered by RFID tags read through a rc522 RFID reader. Based on nodejs. Supports an 'idle' looping video.

_I know this could be easilier done without using nodejs, but this was a fun little thing to test and make._

## RFID Reader

Easiest is to follow the wiring guid, found [here](https://pimylifeup.com/raspberry-pi-rfid-rc522/)

## Install

1. Download a Raspberrpi Pi Buster (not Bullseye) image [here](https://downloads.raspberrypi.org/raspios_armhf/images/raspios_armhf-2021-05-28/) and flash it to an SD card
2. Connect the RFID reader to the raspberry pi. as mentioned [above](#rfid-reader).
3. Start the Raspberry Pi with the newly flashed SD card (this should boot to Desktop)
4. Open a terminal window
5. Clone this repo: `git clone https://github.com/sy1vain/rfideo.git`
6. Run the install script by typing `./rfideo/install_raspi.sh` in the same terminal window
   1. It will first install some dependencies and add the `rfideo` command to your path, this might take a while on the first run
   2. You will be asked if you want to automatically stgart the program, best to say `Y` for yes

## Running the program

### Auto-start

If you chose to install rfideo with auto-start: you need to reboot it and cancel (ESC key) when it asks 'What do you want to do?'. That will return you back to the default terminal. If you want to transfer files, it is easiest to type `startx`. This will launch you into Desktop mode. Opening a terminal will give you the options to run/write/read again.

### Write tag

From a terminal run `rfideo write`, type the filename to be associated and hold a card to the reader.

### Read tag

From a terminal run `rfideo read` and hold a card to the reader.

## Adding video files

The program looks for files in the `/home/pi/Videos` folder. Placing your videos there should make them play once a valid RFID tag is scanned. The tag should contain the fill filename relative to `/home/pi/Videos`

### Idle loop file

On program start rfideo will look for a file named `idle.mp4`. This file will become the idle video that loops when no other video is playing.
