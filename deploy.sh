
#!/usr/bin/env sh

set -e

cd demo
npm run build;

cd dist
git init
git add -A
git commit -m 'deploy'

git push -f git@github.com:novlan1/v-image-preview.git master:gh-pages

cd -

# rm -rf dist

# node .bin/changeBase.js