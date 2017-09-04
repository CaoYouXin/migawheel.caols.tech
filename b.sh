#!/usr/bin/env bash

cd webapp \
    && npm run build \
    && cd .. \
    && rm -rf ./docs/ \
    && git checkout -- docs/CNAME \
    && cp -r ./webapp/dist/ ./docs/ \
    && cp ./docs/index.html ./docs/404.html
#    && git add --all \
#    && git commit -m "$1" \
#    && git push origin master