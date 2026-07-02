// Babel config used only by Jest (see jest.config.ts). Kept out of
// babel.config.js / .babelrc so that `next build`/`next dev` keep using SWC.
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
};
