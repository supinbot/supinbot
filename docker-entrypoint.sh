#!/bin/bash

if [ "$1" = 'supinbot' ]; then
	source ./init-shared.sh
	exec node index.js "$@"
fi

exec "$@"
