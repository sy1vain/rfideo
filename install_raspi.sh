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
	echo >> ~/.bashrc
    echo 'export PATH=$PATH:"$(yarn global bin)"'  >> ~/.bashrc
	. ~/.bashrc
fi

prepare_boot_config () {
	if ! grep -Pq '^dtparam=spi=on$' /boot/config.txt; then
		echo 'Turning on SPI'
		echo 'dtparam=spi=on' | sudo tee -a /boot/config.txt > /dev/null
	fi
	if ! grep -Pq '^disable_splash=1$' /boot/config.txt; then
		echo 'Disable splash screen'
		echo 'disable_splash=1' | sudo tee -a /boot/config.txt > /dev/null
	fi
	if ! grep -Pq '^gpu_mem=\d+$' /boot/config.txt; then
		echo 'Setting gpu memory'
		echo 'gpu_mem=128' | sudo tee -a /boot/config.txt > /dev/null
	fi
}

prepare_boot_config;

echo
echo "Installing node_modules"
yarn

if ! [ -x "$(which rfideo)" ]; then
	echo "Linking module"
	yarn link > /dev/null
fi

add_startup () {
	if grep -q '# RFIDEO' ~/.bashrc; then
  		echo "Already added?"
		return
	fi
	echo >> ~/.bashrc
	echo "if ! ([ -n \"\$SSH_CLIENT\" ] || [ -n \"\$SSH_TTY\" ]); then $(which node) $(pwd); fi # RFIDEO" >> ~/.bashrc
}

remove_startup () {
	sed -i 's/^.*# RFIDEO//' ~/.bashrc
}

# todo: check if not available
while true; do
	echo
	echo
	read -p "Add this script to ~/.bashrc as auto run? " yn
    case $yn in
        [Yy]* ) add_startup; break;;
        [Nn]* ) remove_startup; break;;
        * ) echo "Please answer yes or no.";;
    esac
done

echo '** PLEASE REBOOT NOW **'