#! /bin/sh

cd "$(dirname "$0")"

if ! [ -x "$(which omxplayer)" ]; then
    echo "Installing omxplayer"
    sudo apt update
	sudo apt install -y omxplayer
fi

if ! [ -x "$(which node)" ]; then
    echo "Installing nodejs 16"
	curl -sSL https://deb.nodesource.com/setup_16.x | sudo bash -
	sudo apt install -y nodejs
fi

if ! [ -x "$(which yarn)" ]; then
	echo "Installing yarn (& node dependency)"
	wget -O- https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | sudo tee /usr/share/keyrings/yarn-archive-keyring.gpg > /dev/null
	echo "deb [signed-by=/usr/share/keyrings/yarn-archive-keyring.gpg] https://dl.yarnpkg.com/debian stable main" | sudo tee /etc/apt/sources.list.d/yarn.list > /dev/null
	sudo apt update
	sudo apt install -y yarn

    echo "Adding yarn to path"
    echo 'export PATH=$PATH:"$(yarn global bin)"'  >> ~/.bashrc
	. ~/.bashrc
fi

echo
echo "Installing node_modules"
yarn

if ! [ -x "$(which rfideo)" ]; then
	echo "Linking module"
	yarn link > /dev/null
fi

while true; do
	read -p "Add this script to bashrc as auto run? " yn
    case $yn in
        [Yy]* ) echo "$(which node) $(pwd)" >> ~/.bashrc; break;;
        [Nn]* ) break;;
        * ) echo "Please answer yes or no.";;
    esac
done