// Copyright 2015-2021 Swim.inc
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

import {HashGenCacheMap} from "@swim/util";
import {AnyUri, Uri} from "./Uri";

/** @public */
export class UriCache {
  constructor(base: Uri, size: number = 32) {
    this.base = base;
    this.resolveCache = new HashGenCacheMap(size);
    this.unresolveCache = new HashGenCacheMap(size);
  }

  readonly base: Uri;

  /** @internal */
  readonly resolveCache: HashGenCacheMap<Uri, Uri>;

  /** @internal */
  readonly unresolveCache: HashGenCacheMap<Uri, Uri>;

  resolve(relative: AnyUri): Uri {
    relative = Uri.fromAny(relative);
    let absolute = this.resolveCache.get(relative);
    if (absolute === void 0) {
      absolute = this.base.resolve(relative);
      this.resolveCache.put(relative, absolute);
    }
    return absolute;
  }

  unresolve(absolute: AnyUri): Uri {
    absolute = Uri.fromAny(absolute);
    let relative = this.unresolveCache.get(absolute);
    if (relative === void 0) {
      relative = this.base.unresolve(absolute);
      this.unresolveCache.put(absolute, relative);
    }
    return relative;
  }
}
