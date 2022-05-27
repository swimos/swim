// Copyright 2015-2022 Swim.inc
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

import {Values} from "../values/Values";
import {AssertException} from "./AssertException";

/**
 * Callable [[Assert]] interface.
 *
 * @public
 */
export interface AssertFunction extends Assert {
  /**
   * Asserts that `condition` is truthy.
   *
   * @throws [[AssertException]] with `message` if `condition` is falsy.
   */
  (condition: unknown, message?: string): void;
}

/**
 * Type that implements common assertion functions.
 * @public
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
   * Asserts that `lhs` is identical (`===`) to `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` is not identical (`!==`) to `rhs`.
   */
  identical(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` is not identical (`!==`) to `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` is identical (`===`) to `rhs`.
   */
  notIdentical(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` is less than (`<`) `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` is not less than (`!<`) `rhs`.
   */
  lessThan(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` is less than or equal (`<=`) to `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` is not less than or equal (`!<=`) to `rhs`.
   */
  lessThanOrEqual(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` is greater than (`>`) `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` is not greater than (`!>`) `rhs`.
   */
  greaterThan(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` is greater than or equal (`>=`) to `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` is not greater than or equal (`!>=`) to `rhs`.
   */
  greaterThanOrEqual(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` is not less than (`!<`) `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` is less than (`<`) `rhs`.
   */
  notLessThan(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` is not less than or equal (`!<=`) to `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` is less than or equal (`<=`) to `rhs`.
   */
  notLessThanOrEqual(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` is not greater than (`!>`) `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` is greater than (`>`) `rhs`.
   */
  notGreaterThan(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` is not greater than or equal (`!>=`) to `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` is greater than or equal (`>=`) to `rhs`.
   */
  notGreaterThanOrEqual(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `object` has the prototype of `constructor` in its prototype chain.
   *
   * @throws [[AssertException]] with `message` if `object` does not have the prototype of `constructor` in its prototype chain.
   */
  instanceOf(object: unknown, constructor: Function, message?: string): void;

  /**
   * Asserts that `object` does not have the prototype of `constructor` in its prototype chain.
   *
   * @throws [[AssertException]] with `message` if `object` does have the prototype of `constructor` in its prototype chain.
   */
  notInstanceOf(object: unknown, constructor: Function, message?: string): void;

  /**
   * Asserts that `lhs` is [[Values.equal structurally equal]] to `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` is not structurally equal to `rhs`.
   */
  equal(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` is not [[Values.equal structurally equal]] to `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` is structurally equal to `rhs`.
   */
  notEqual(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` is [[Values.equivalent structurally equivalent]] to `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` is not structurally equivalent to `rhs`.
   */
  equivalent(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` is not [[Values.equivalent structurally equivalent]] to `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` is structurally equivalent to `rhs`.
   */
  notEquivalent(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` [[Values.compare structurally orders before]] `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` does not structurally order before `rhs`.
   */
  compareLessThan(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` does not [[Values.compare structurally order before]] `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` does structurally order before `rhs`.
   */
  compareNotLessThan(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` [[Values.compare structurally orders before or the same as]] `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` does not structurally order before or the same as `rhs`.
   */
  compareLessThanOrEqual(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` does not [[Values.compare structurally order before or the same as]] `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` does structurally order before or the same as `rhs`.
   */
  compareNotLessThanOrEqual(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` [[Values.compare structurally orders the same as]] `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` does not structurally order before or the same as `rhs`.
   */
  compareEqual(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` does not [[Values.compare structurally order the same as]] `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` does structurally order before or the same as `rhs`.
   */
  compareNotEqual(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` [[Values.compare structurally orders after or the same as]] `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` does not structurally order after or the same as `rhs`.
   */
  compareGreaterThanOrEqual(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` does not [[Values.compare structurally order after or the same as]] `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` does structurally order after or the same as `rhs`.
   */
  compareNotGreaterThanOrEqual(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` [[Values.compare structurally orders after]] `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` does not structurally order after `rhs`.
   */
  compareGreaterThan(lhs: unknown, rhs: unknown, message?: string): void;

  /**
   * Asserts that `lhs` does not [[Values.compare structurally order after]] `rhs`.
   *
   * @throws [[AssertException]] with `message` if `lhs` does structurally order after `rhs`.
   */
  compareNotGreaterThan(lhs: unknown, rhs: unknown, message?: string): void;
}

/** @public */
export const Assert = (function () {
  const Assert = function (condition: unknown, message?: string): void {
    if (!condition) {
      throw new AssertException(message);
    }
  } as AssertFunction;

  Assert.ok = function (condition: unknown, message?: string): void {
    if (!condition) {
      throw new AssertException(message);
    }
  };

  Assert.notOk = function (condition: unknown, message?: string): void {
    if (condition) {
      throw new AssertException(message);
    }
  };

  Assert.equal = function (lhs: unknown, rhs: unknown, message?: string): void {
    if (!Values.equal(lhs, rhs)) {
      throw new AssertException(message);
    }
  };

  Assert.notEqual = function (lhs: unknown, rhs: unknown, message?: string): void {
    if (Values.equal(lhs, rhs)) {
      throw new AssertException(message);
    }
  };

  Assert.identical = function (lhs: unknown, rhs: unknown, message?: string): void {
    if (lhs !== rhs) {
      throw new AssertException(message);
    }
  };

  Assert.notIdentical = function (lhs: unknown, rhs: unknown, message?: string): void {
    if (lhs === rhs) {
      throw new AssertException(message);
    }
  };

  Assert.lessThan = function (lhs: unknown, rhs: unknown, message?: string): void {
    if (!((lhs as any) < (rhs as any))) {
      throw new AssertException(message);
    }
  };

  Assert.lessThanOrEqual = function (lhs: unknown, rhs: unknown, message?: string): void {
    if (!((lhs as any) <= (rhs as any))) {
      throw new AssertException(message);
    }
  };

  Assert.greaterThan = function (lhs: unknown, rhs: unknown, message?: string): void {
    if (!((lhs as any) > (rhs as any))) {
      throw new AssertException(message);
    }
  };

  Assert.greaterThanOrEqual = function (lhs: unknown, rhs: unknown, message?: string): void {
    if (!((lhs as any) >= (rhs as any))) {
      throw new AssertException(message);
    }
  };

  Assert.notLessThan = function (lhs: unknown, rhs: unknown, message?: string): void {
    if ((lhs as any) < (rhs as any)) {
      throw new AssertException(message);
    }
  };

  Assert.notLessThanOrEqual = function (lhs: unknown, rhs: unknown, message?: string): void {
    if ((lhs as any) <= (rhs as any)) {
      throw new AssertException(message);
    }
  };

  Assert.notGreaterThan = function (lhs: unknown, rhs: unknown, message?: string): void {
    if ((lhs as any) > (rhs as any)) {
      throw new AssertException(message);
    }
  };

  Assert.notGreaterThanOrEqual = function (lhs: unknown, rhs: unknown, message?: string): void {
    if ((lhs as any) >= (rhs as any)) {
      throw new AssertException(message);
    }
  };

  Assert.instanceOf = function (object: unknown, constructor: Function, message?: string): void {
    if (!(object instanceof constructor)) {
      throw new AssertException(message);
    }
  };

  Assert.notInstanceOf = function (object: unknown, constructor: Function, message?: string): void {
    if (object instanceof constructor) {
      throw new AssertException(message);
    }
  };

  Assert.compareLessThan = function (lhs: unknown, rhs: unknown, message?: string): void {
    if (!(Values.compare(lhs, rhs) < 0)) {
      throw new AssertException(message);
    }
  };

  Assert.compareNotLessThan = function (lhs: unknown, rhs: unknown, message?: string): void {
    if (Values.compare(lhs, rhs) < 0) {
      throw new AssertException(message);
    }
  };

  Assert.compareLessThanOrEqual = function (lhs: unknown, rhs: unknown, message?: string): void {
    if (!(Values.compare(lhs, rhs) <= 0)) {
      throw new AssertException(message);
    }
  };

  Assert.compareNotLessThanOrEqual = function (lhs: unknown, rhs: unknown, message?: string): void {
    if (Values.compare(lhs, rhs) <= 0) {
      throw new AssertException(message);
    }
  };

  Assert.compareEqual = function (lhs: unknown, rhs: unknown, message?: string): void {
    if (!(Values.compare(lhs, rhs) === 0)) {
      throw new AssertException(message);
    }
  };

  Assert.compareNotEqual = function (lhs: unknown, rhs: unknown, message?: string): void {
    if (Values.compare(lhs, rhs) === 0) {
      throw new AssertException(message);
    }
  };

  Assert.compareGreaterThanOrEqual = function (lhs: unknown, rhs: unknown, message?: string): void {
    if (!(Values.compare(lhs, rhs) >= 0)) {
      throw new AssertException(message);
    }
  };

  Assert.compareNotGreaterThanOrEqual = function (lhs: unknown, rhs: unknown, message?: string): void {
    if (Values.compare(lhs, rhs) >= 0) {
      throw new AssertException(message);
    }
  };

  Assert.compareGreaterThan = function (lhs: unknown, rhs: unknown, message?: string): void {
    if (!(Values.compare(lhs, rhs) > 0)) {
      throw new AssertException(message);
    }
  };

  Assert.compareNotGreaterThan = function (lhs: unknown, rhs: unknown, message?: string): void {
    if (Values.compare(lhs, rhs) > 0) {
      throw new AssertException(message);
    }
  };

  return Assert;
})();
