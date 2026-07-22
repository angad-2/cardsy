// Loads the native C++ SRS engine if it has been compiled
// (`npm run build-engine`), otherwise falls back to the JS implementation.
// The rest of the app calls engine.updateCard / engine.rankCards without
// caring which one is active.

const fallback = require('./fallback');

let engine = fallback;
let native = false;

try {
  // Produced by node-gyp at engine/build/Release/srs_engine.node
  engine = require('./build/Release/srs_engine.node');
  native = true;
} catch (err) {
  // Native module missing/incompatible — silently use the JS fallback.
  engine = fallback;
}

console.log(`[SRS engine] using ${native ? 'native C++ addon' : 'JS fallback'}`);

module.exports = {
  updateCard: engine.updateCard,
  rankCards: engine.rankCards,
  isNative: native,
};
