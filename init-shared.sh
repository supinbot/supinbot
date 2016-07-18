#!/bin/bash

if [ ! -d ./shared ]; then
	mkdir ./shared
fi

if [ ! -e ./shared/.env ]; then
	cp .env-sample ./shared/.env
fi

if [ ! -d ./shared/plugins ]; then
	mkdir ./shared/plugins
fi
