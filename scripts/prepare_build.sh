#!//bin/bash
set -e
bash --version

echo Viz dir: $GITHUB_WORKSPACE
ls -al $GITHUB_WORKSPACE

echo Superset dir: $GITHUB_WORKSPACE/superset
ls -al $GITHUB_WORKSPACE/superset

# Add dependencies superset-frontend and generate the preset
cp .npmrc ./superset/superset-frontend/.npmrc

# add dependencies to package.json
node ./scripts/addDependencies.js superset/superset-frontend/package.json

# generate preset file and locate in incubator source code
node ./scripts/generatePreset.js superset/superset-frontend/src/visualizations/presets/MainPreset.js

cat "superset/superset-frontend/src/visualizations/presets/MainPreset.js"
# generate setupPluginsExtra override in incubator source code
# node ./scripts/generateSetupPluginsExtra.js
#mv "${PLUGINS_EXTRA_FILENAME}" "superset/superset-frontend/src/setup/${PLUGINS_EXTRA_FILENAME}"
#cat "superset/superset-frontend/src/setup/${PLUGINS_EXTRA_FILENAME}"

cd superset/superset-frontend

npm install

#yarn lint-fix
