#!/bin/bash

install() {
	npm install --silent --prefix "./shared/plugins" "$2"
}

uninstall() {
	npm uninstall --silent --prefix "./shared/plugins" "$2"
}

if [ ! -d ./shared/plugins ]; then
	mkdir ./shared/plugins
fi

case "$1" in
	install)
		install $@
		;;
	uninstall)
		uninstall $@
		;;
	*)
		echo "Usage: {install|uninstall} {npm-name|git://URL}"
		exit 1
		;;
esac
