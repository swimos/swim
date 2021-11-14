// Copyright 2015-2021 Swim Inc.
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

/**
 * Decorator that memoizes the computed value of a getter or nullary method.
 * @public
 */
export const Lazy: MethodDecorator = function <T>(target: Object, propertyKey: string | symbol,
                                                  descriptor: TypedPropertyDescriptor<T>): void {
  const writable = descriptor.writable;
  const enumerable = descriptor.enumerable;
  const configurable = descriptor.configurable;
  if (descriptor.get !== void 0) {
    const get = descriptor.get;
    descriptor.get = function (this: unknown): T {
      const value = get.call(this);
      Object.defineProperty(target, propertyKey, {
        value,
        writable,
        enumerable,
        configurable,
      });
      return value;
    };
  } else if (descriptor.value !== void 0) {
    const method = descriptor.value as unknown as () => T;
    descriptor.value = function (this: unknown): T {
      const value = method.call(this);
      Object.defineProperty(target, propertyKey, {
        value: function (): T {
          return value;
        },
        writable,
        enumerable,
        configurable,
      });
      return value;
    } as unknown as T;
  } else {
    throw new Error("invalid lazy property descriptor");
  }
}
