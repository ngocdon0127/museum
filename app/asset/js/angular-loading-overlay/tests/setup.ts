declare var require: any;

const testsContext = require.context('../source/', true, /\.ts$/);
testsContext.keys().filter((filename) => filename.indexOf('.spec.ts') !== -1).forEach(testsContext);

const componentsContext = require.context('../source/', true, /\.ts$/);
componentsContext.keys().filter((filename) =>
    (filename.indexOf('.spec.ts') === -1) &&
    (filename.indexOf('main.ts') === -1) &&
    (filename.indexOf('Mock.ts') === -1)
).forEach(componentsContext);
