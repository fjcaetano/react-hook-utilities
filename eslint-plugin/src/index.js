/**
 * @fileoverview ESLint rules for hook react-hook-utilities
 * @author Flávio Caetano
 */
'use strict';

import ExhaustiveDeps from './rules/ExaustiveDeps';

export const rules = {
  'exhaustive-deps': ExhaustiveDeps,
};
