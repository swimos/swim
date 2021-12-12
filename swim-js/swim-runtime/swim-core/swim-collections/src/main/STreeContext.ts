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

import {Random, Values} from "@swim/util";
import type {STreePage} from "./STreePage";

/** @public */
export abstract class STreeContext<V, I> {
  pageSplitSize: number = 32;

  identify(value: V): I {
    const id = new Uint8Array(6);
    Random.fillBytes(id);
    return id as unknown as I;
  }

  compare(x: I, y: I): number {
    return Values.compare(x, y);
  }

  /** @internal */
  pageShouldSplit(page: STreePage<V, I>): boolean {
    return page.arity > this.pageSplitSize;
  }

  /** @internal */
  pageShouldMerge(page: STreePage<V, I>): boolean {
    return page.arity < this.pageSplitSize >>> 1;
  }
}
