const { withNetlify } = require('@netlify/next');

module.exports = withNetlify({
  // your existing Next.js config goes here
  reactStrictMode: true,
});
