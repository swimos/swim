// Copyright 2015-2024 Nstream, inc.
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
export const Lazy: {
  <F extends () => unknown>(target: F, context?: ClassMethodDecoratorContext<ThisParameterType<F>, F>): F;
  <T, R>(target: (this: T) => R, context?: ClassGetterDecoratorContext<T, R>): (this: T) => R;
} = function <T, R>(target: (this: T) => R, context?: ClassMethodDecoratorContext<T, (this: T) => R> | ClassGetterDecoratorContext<T, R>): (this: T) => R {
  let defined = false;
  let value: R;
  return function (this: T): R {
    if (!defined) {
      defined = true;
      value = target.call(this);
    }
    return value;
  };
};
