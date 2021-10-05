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

import type {Outlet} from "./Outlet";
import type {StreamletContext} from "./StreamletContext";

export interface StreamletScope<O> {
  /**
   * The lexically scoped parent of this `StreamletScope`, or `null` if this
   * `StreamletScope` has no lexical parent.
   */
  readonly streamletScope: StreamletScope<O> | null;

  /**
   * The environment in which this `StreamletScope` operates.
   */
  readonly streamletContext: StreamletContext | null;

  /**
   * Returns an `Outlet` that updates when the specified `key` updates.
   */
  outlet(key: string): Outlet<O> | null;
}

/** @internal */
export const StreamletScope = (function () {
  const StreamletScope = {} as {
    is<O>(object: unknown): object is StreamletScope<O>;
  };

  StreamletScope.is = function <O>(object: unknown): object is StreamletScope<O> {
    if (typeof object === "object" && object !== null || typeof object === "function") {
      const scope = object as StreamletScope<O>;
      return "streamletScope" in scope
          && "streamletContext" in scope
          && typeof scope.outlet === "function";
    }
    return false;
  };

  return StreamletScope;
})();
