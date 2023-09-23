// Copyright 2015-2023 Nstream, inc.
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

import {Identity} from "./Identity";
import {Strings} from "./Strings";
import {Numbers} from "./Numbers";
import {Booleans} from "./Booleans";
import {Objects} from "./Objects";

/**
 * Associates a type `T` with a loosely typed representation `L`. Loose type
 * representations are modeled as a phantom method `likeType?(like: L): void`
 * whose argument type is the loosely typed representation of `T`. Because the
 * `likeType` method is optional, values of type `T` are assignable to type
 * `Like<T, L>`, and vice versa.
 *
 * The preferred way to associate loose type representations with a custom
 * class is to declare a `likeType?(like: L): void` method on the class itself.
 * The `Like` type is used to inject a phantom `likeType` method into an
 * existing type. This enables ad hoc loose types to be declared without
 * needing to change the declaration of the strict type.
 *
 * @example Ad hoc number coercion
 *
 * ```ts
 * const NumberLike: FromLike<Like<number, string | boolean>> = {
 *   fromLike(value: number | string | boolean): number {
 *     return Number(value);
 *   },
 * };
 *
 * NumberLike.fromLike("42") // yields 42
 * NumberLike.fromLike(true) // yields 1
 * ```
 *
 * @example Using an ad hoc conversion with a `@Property` fastener
 *
 * ```ts
 * class Person {
 *   @Property({valueType: NumberLike})
 *   readonly age!: Property<Like<number, string | boolean>>;
 * }
 *
 * const person = new Person();
 * person.age.setValue("42");
 * person.age.value // yields 42
 * ```
 *
 * @public
 */
export type Like<T, L> = T & {likeType?(like: LikeType<T> | L): void};

/**
 * Extracts the loosely typed representation of a type `T`. `LikeType` is used
 * in conjunction with [[FromLike]] to generically convert loosely typed values
 * to strictly typed instances using only a single generic type parameter to
 * track both strict and loose types.
 * @public
 */
export type LikeType<T> = T extends {likeType?(like: infer L): any} ? L : never;

/**
 * Conversion from loosely typed values to a strictly typed instances.
 *
 * @example Generic wrapper class
 *
 * Consider the case of implementing a generic wrapper class. Although the
 * wrapper encapsulates a particular concrete type, the API for the wrapper
 * should accept similarly typed values--but not any value. Two generic types
 * are in play here, the strict type being wrapped, and a loose type that's
 * accepted as arguments and internally converted to the strict type. These
 * types are not independent of each other; each strict type has an associated
 * loose type from which it can be converted. To minimize boilerplate, the
 * wrapper class should only need to be parameterized with a single type.
 *
 * These requirements can be cleanly met with a combination of [[Like]] types
 * and `FromLike` conversions. The generic wrapper class described above can
 * be implemented as follows:
 *
 * ```
 * class GenericWrapper<T> {
 *   valueType: FromLike<T>;
 *   value: T;
 *   constructor(valueType: FromLike<T>, value: T) {
 *     this.valueType = valueType;
 *     this.value = value;
 *   }
 *   set(value: T | LikeType<T>): void {
 *     this.value = this.valueType.fromLike(value);
 *   }
 * }
 * ```
 *
 * When no loose type conversions are needed, `GenericWrapper` can be
 * instantiated with an identity `FromLike` converter.
 *
 * ```
 * const greeting = new GenericWrapper(FromLike<string>(), "");
 * greeting.set("Hello, world!");
 * greeting.value // yields "Hello, world!";
 * ```
 *
 * A `GenericWrapper` parameterized with a `Like` type and accompanying
 * `FromLike` conversion can be set with any like-typed value.
 *
 * ```
 * const NumberLike: FromLike<Like<number, string | boolean>> = {
 *   fromLike(value: number | string | boolean): number {
 *     return Number(value);
 *   },
 * };
 * export const foo = new GenericWrapper(NumberLike, 0);
 * foo.set("42")
 * foo.value // yields 42
 * ```
 *
 * @public
 */
export interface FromLike<T> {
  /**
   * Coerces a loosely typed `value` to a strictly typed instance.
   */
  fromLike(value: T | LikeType<T>): T;
}

/** @public */
export const FromLike = (function () {
  const FromLike = function <F>(type?: F, value?: F extends {fromLike(value: infer L): any} ? L : unknown): (F extends {fromLike(...args: any): infer T} ? T : unknown) | FromLike<F extends abstract new (...args: any) => infer T ? T : any> {
    let likeness: FromLike<any>;
    if (FromLike[Symbol.hasInstance](type)) {
      likeness = type;
    } else if (type === String) {
      likeness = Strings;
    } else if (type === Number) {
      likeness = Numbers;
    } else if (type === Boolean) {
      likeness = Booleans;
    } else {
      likeness = Identity;
    }
    if (arguments.length < 2) {
      return likeness;
    }
    return likeness.fromLike(value);
  } as {
    /**
     * Returns the [[FromLike.fromLike fromLike]] conversion of `value` by `type`,
     * if `type` conforms to the `FromLike` interface; otherwise returns `value` itself.
     */
    <F>(type: F, value: F extends {fromLike(value: infer L): any} ? L : any): F extends {fromLike(...args: any): infer T} ? T : any;
    /**
     * Returns a [[FromLike]] converter for the given `type`. Returns `type` itself,
     * if `type` conforms to the `FromLike` interface; returns a primitive converter,
     * if `type` is the `String`, `Number`, or `Boolean` constructor; otherwise
     * returns an identity converter.
     */
    <F>(type: F): FromLike<F extends abstract new (...args: any) => infer T ? T : any>;
    /**
     * Returns an identity [[FromLike]] converter.
     */
    <T>(): FromLike<T>;

    /**
     * Returns `true` if `instance` appears to conform to the [[FromLike]] interface.
     */
    [Symbol.hasInstance]<T>(instance: unknown): instance is FromLike<T>
  };

  Object.defineProperty(FromLike, Symbol.hasInstance, {
    value: function <T>(instance: unknown): instance is FromLike<T> {
      return Objects.hasAllKeys<FromLike<T>>(instance, "fromLike");
    },
    enumerable: true,
    configurable: true,
  });

  return FromLike;
})();

/**
 * Conversion to loosely typed values from strictly typed instances.
 * @public
 */
export interface ToLike<T> {
  /**
   * Returns a loosely typed representation of this instance.
   */
  toLike(): LikeType<T>;
}

/** @public */
export const ToLike = (function () {
  const ToLike = function (value: unknown): unknown {
    if (ToLike[Symbol.hasInstance](value)) {
      return value.toLike();
    }
    return value;
  } as {
    /**
     * Returns the [[ToLike.toLike toLike]] conversion of `value`, if `value`
     * conforms to the `ToLike` interface; otherwise returns `value` itself.
     */
    <T>(value: ToLike<T>): T;
    (value: any): any;

    /**
     * Returns `true` if `instance` appears to conform to the [[ToLike]] interface.
     */
    [Symbol.hasInstance]<T>(instance: unknown): instance is ToLike<T>
  };

  Object.defineProperty(ToLike, Symbol.hasInstance, {
    value: function <T>(instance: unknown): instance is ToLike<T> {
      return Objects.hasAllKeys<ToLike<T>>(instance, "toLike");
    },
    enumerable: true,
    configurable: true,
  });

  return ToLike;
})();
