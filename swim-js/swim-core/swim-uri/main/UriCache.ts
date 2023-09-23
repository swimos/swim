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

import type {UriLike} from "./Uri";
import {Uri} from "./Uri";

/** @public */
export class UriCache {
  constructor(base: Uri, capacity: number = 128) {
    this.base = base;
    this.capacity = capacity;
    this.resolveCache = new Map<string, Uri>();
    this.unresolveCache = new Map<string, Uri>();
  }

  readonly base: Uri;

  readonly capacity: number;

  /** @internal */
  readonly resolveCache: Map<string, Uri>;

  /** @internal */
  readonly unresolveCache: Map<string, Uri>;

  resolve(relative: UriLike): Uri {
    if (typeof relative !== "string") {
      relative = Uri.fromLike(relative).toString();
    }

    const resolveCache = this.resolveCache;
    let absolute = resolveCache.get(relative);
    if (absolute === void 0) {
      absolute = this.base.resolve(relative);
    } else {
      resolveCache.delete(relative);
    }
    resolveCache.set(relative, absolute);

    const capacity = this.capacity;
    let size = resolveCache.size;
    if (size > capacity) {
      const keys = resolveCache.keys();
      let next: IteratorResult<string>;
      while (size > capacity && (next = keys.next()).done !== true) {
        resolveCache.delete(next.value);
        size -= 1;
      }
    }

    return absolute;
  }

  unresolve(absolute: UriLike): Uri {
    if (typeof absolute !== "string") {
      absolute = Uri.fromLike(absolute).toString();
    }

    const unresolveCache = this.unresolveCache;
    let relative = unresolveCache.get(absolute);
    if (relative === void 0) {
      relative = this.base.unresolve(absolute);
    } else {
      unresolveCache.delete(absolute);
    }
    unresolveCache.set(absolute, relative);

    const capacity = this.capacity;
    let size = unresolveCache.size;
    if (size > capacity) {
      const keys = unresolveCache.keys();
      let next: IteratorResult<string>;
      while (size > capacity && (next = keys.next()).done !== true) {
        unresolveCache.delete(next.value);
        size -= 1;
      }
    }

    return relative;
  }
}
