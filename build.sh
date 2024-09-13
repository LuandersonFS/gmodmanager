tsc main.ts --target es6 --outDir dist
for file in ./dist/*; do mv $file ${file:0:-3}.mjs;done
