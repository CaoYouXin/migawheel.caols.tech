#!/usr/bin/env bash

ng build --env=prod \
    && rm -rf ./docs/ \
    && git checkout -- docs/CNAME \
    && cp -r ./dist/ ./docs/
#    && git add --all \
#    && git commit -m "$1" \
#    && git push origin master