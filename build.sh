#!/usr/bin/env bash
# exit on error
set -o errexit

poetry install

python pustak/manage.py collectstatic --no-input
python pustak/manage.py migrate