/**
 * @fileoverview ESLint rules for hook react-hook-utilities
 * @author Flávio Caetano
 */
'use strict';

const ExhaustiveDeps = require('./rules/ExaustiveDeps');
exports.rules = {
  'exhaustive-deps': ExhaustiveDeps,
};
