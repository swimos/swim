// Copyright 2015-2020 Swim inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {Objects} from "./Objects";
import {AssertException} from "./AssertException";

/**
 * Type that implements common assertion functions.
 */
export interface Assert {
  /**
   * Asserts that `condition` is truthy.
   *
   * @throws [[AssertException]] with `message` if `condition` is falsy.
   */
  ok(condition: unknown, message?: string): void;

  /**
   * Asserts that `condition` is falsy.
   *
   * @throws [[AssertException]] with `message` if `condition` is truthy.
   */
  notOk(condition: unknown, message?: string): void;

  /**
   * Asserts that `lhs` is [[Objects.equal structurally equal]] to `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` is not structurally equal to `rhs`.
   */
  equal(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` is not [[Objects.equal structurally equal]] to `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` is structurally equal to `rhs`.
   */
  notEqual(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` is identical (`===`) to `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` is not identical (`!==`) to `rhs`.
   */
  identity(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` is not identical (`!==`) to `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` is identical (`===`) to `rhs`.
   */
  notIdentity(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` [[Objects.compare structurally orders before]] `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` does not structurally order before `rhs`.
   */
  compareLessThan(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` does not [[Objects.compare structurally order before]] `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` does structurally order before `rhs`.
   */
  compareNotLessThan(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` [[Objects.compare structurally orders before or the same as]] `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` does not structurally order before or the same as `rhs`.
   */
  compareLessThanOrEqual(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` does not [[Objects.compare structurally order before or the same as]] `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` does structurally order before or the same as `rhs`.
   */
  compareNotLessThanOrEqual(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` [[Objects.compare structurally orders the same as]] `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` does not structurally order before or the same as `rhs`.
   */
  compareEqual(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` does not [[Objects.compare structurally order the same as]] `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` does structurally order before or the same as `rhs`.
   */
  compareNotEqual(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` [[Objects.compare structurally orders after or the same as]] `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` does not structurally order after or the same as `rhs`.
   */
  compareGreaterThanOrEqual(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` does not [[Objects.compare structurally order after or the same as]] `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` does structurally order after or the same as `rhs`.
   */
  compareNotGreaterThanOrEqual(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` [[Objects.compare structurally orders after]] `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` does not structurally order after `rhs`.
   */
  compareGreaterThan(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` does not [[Objects.compare structurally order after]] `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` does structurally order after `rhs`.
   */
  compareNotGreaterThan(lhs: unknown, rhs: unknown, message?: string): void;
}

/**
 * General `Assert` implementation.  When called as a function, asserts that
 * `condition` is truthy.
 *
 * @throws [[AssertException]] with `message` if `condition` is falsy.
 */
export const assert = function (condition: unknown, message?: string): void {
  if (!condition) {
    throw new AssertException(message);
  }
} as Assert & ((condition: unknown, message?: string) => void);

assert.ok = function (condition: unknown, message?: string): void {
  if (!condition) {
    throw new AssertException(message);
  }
};

assert.notOk = function (condition: unknown, message?: string): void {
  if (condition) {
    throw new AssertException(message);
  }
};

assert.equal = function (lhs: unknown, rhs: unknown, message?: string): void {
  if (!Objects.equal(lhs, rhs)) {
    throw new AssertException(message);
  }
};

assert.notEqual = function (lhs: unknown, rhs: unknown, message?: string): void {
  if (Objects.equal(lhs, rhs)) {
    throw new AssertException(message);
  }
};

assert.identity = function (lhs: unknown, rhs: unknown, message?: string): void {
  if (lhs !== rhs) {
    throw new AssertException(message);
  }
};

assert.notIdentity = function (lhs: unknown, rhs: unknown, message?: string): void {
  if (lhs === rhs) {
    throw new AssertException(message);
  }
};

assert.compareLessThan = function (lhs: unknown, rhs: unknown, message?: string): void {
  if (!(Objects.compare(lhs, rhs) < 0)) {
    throw new AssertException(message);
  }
};

assert.compareNotLessThan = function (lhs: unknown, rhs: unknown, message?: string): void {
  if (Objects.compare(lhs, rhs) < 0) {
    throw new AssertException(message);
  }
};

assert.compareLessThanOrEqual = function (lhs: unknown, rhs: unknown, message?: string): void {
  if (!(Objects.compare(lhs, rhs) <= 0)) {
    throw new AssertException(message);
  }
};

assert.compareNotLessThanOrEqual = function (lhs: unknown, rhs: unknown, message?: string): void {
  if (Objects.compare(lhs, rhs) <= 0) {
    throw new AssertException(message);
  }
};

assert.compareEqual = function (lhs: unknown, rhs: unknown, message?: string): void {
  if (!(Objects.compare(lhs, rhs) === 0)) {
    throw new AssertException(message);
  }
};

assert.compareNotEqual = function (lhs: unknown, rhs: unknown, message?: string): void {
  if (Objects.compare(lhs, rhs) === 0) {
    throw new AssertException(message);
  }
};

assert.compareGreaterThanOrEqual = function (lhs: unknown, rhs: unknown, message?: string): void {
  if (!(Objects.compare(lhs, rhs) >= 0)) {
    throw new AssertException(message);
  }
};

assert.compareNotGreaterThanOrEqual = function (lhs: unknown, rhs: unknown, message?: string): void {
  if (Objects.compare(lhs, rhs) >= 0) {
    throw new AssertException(message);
  }
};

assert.compareGreaterThan = function (lhs: unknown, rhs: unknown, message?: string): void {
  if (!(Objects.compare(lhs, rhs) > 0)) {
    throw new AssertException(message);
  }
};

assert.compareNotGreaterThan = function (lhs: unknown, rhs: unknown, message?: string): void {
  if (Objects.compare(lhs, rhs) > 0) {
    throw new AssertException(message);
  }
};
