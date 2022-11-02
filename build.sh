#!/usr/bin/env bash
# exit on error
set -o errexit

poetry install
pip install setuptools
python pustak/manage.py collectstatic --no-input
python pustak/manage.py migrate