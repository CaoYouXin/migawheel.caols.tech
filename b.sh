#!/usr/bin/env bash

ng build -prod \
    && cp -r ./dist/ ./docs/ \
    && git add --all \
    && git commit -m "$1" \
    && git push origin master