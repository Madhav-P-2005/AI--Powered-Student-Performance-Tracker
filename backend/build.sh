#!/usr/bin/env bash
# Render Build Script — runs on every deploy

set -o errexit  # Exit on error

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate
