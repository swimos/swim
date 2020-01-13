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

import {HashGenCacheMap} from "@swim/util";
import {AnyUri, Uri} from "./Uri";

export class UriCache {
  /** @hidden */
  _base: Uri;
  /** @hidden */
  _resolveCache: HashGenCacheMap<Uri, Uri>;
  /** @hidden */
  _unresolveCache: HashGenCacheMap<Uri, Uri>;

  constructor(base: Uri, size: number = 32) {
    this._base = base;
    this._resolveCache = new HashGenCacheMap(size);
    this._unresolveCache = new HashGenCacheMap(size);
  }

  resolve(relative: AnyUri): Uri {
    relative = Uri.fromAny(relative);
    let absolute = this._resolveCache.get(relative);
    if (absolute === undefined) {
      absolute = this._base.resolve(relative);
      this._resolveCache.put(relative, absolute);
    }
    return absolute;
  }

  unresolve(absolute: AnyUri): Uri {
    absolute = Uri.fromAny(absolute);
    let relative = this._unresolveCache.get(absolute);
    if (relative === undefined) {
      relative = this._base.unresolve(absolute);
      this._unresolveCache.put(absolute, relative);
    }
    return relative;
  }
}
