#!/bin/sh

PKG_VERSION=$1

mkdir pageDocs && ln -sf ../eslint-plugin/README.md pageDocs/EslintPlugin.md

yarn run typedoc --out "docs/${PKG_VERSION}"

echo "<meta http-equiv='refresh' content='0; URL=\"${PKG_VERSION}/index.html\"' />;" > docs/index.html

rm -rf pageDocs