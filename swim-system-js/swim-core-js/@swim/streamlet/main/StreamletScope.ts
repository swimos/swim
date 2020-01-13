// Copyright 2015-2020 SWIM.AI inc.
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

import {Outlet} from "./Outlet";

import {StreamletContext} from "./StreamletContext";

export interface StreamletScope<O> {
  /**
   * Returns the lexically scoped parent of this `StreamletScope`.
   * Returns `null` if this `StreamletScope` has no lexical parent.
   */
  streamletScope(): StreamletScope<O> | null;

  /**
   * Returns the environment in which this `StreamletScope` operates.
   */
  streamletContext(): StreamletContext | null;

  /**
   * Returns an `Outlet` that updates when the specified `key` updates.
   */
  outlet(key: string): Outlet<O> | null;
}

/** @hidden */
export const StreamletScope = {
  is<O>(object: unknown): object is StreamletScope<O> {
    if (typeof object === "object" && object) {
      const scope = object as StreamletScope<O>;
      return typeof scope.streamletScope === "function"
          && typeof scope.streamletContext === "function"
          && typeof scope.outlet === "function";
    }
    return false;
  },
};
