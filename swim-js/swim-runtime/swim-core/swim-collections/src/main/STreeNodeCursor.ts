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

import type {Cursor} from "@swim/util";
import {NodeCursor} from "./NodeCursor";
import type {STreePage} from "./STreePage";

/** @internal */
export class STreeNodeCursor<V, I> extends NodeCursor<[I, V], STreePage<V, I>> {
  constructor(pages: ReadonlyArray<STreePage<V, I>>, index: number = 0,
              childIndex: number = 0, childCursor: Cursor<[I, V]> | null = null) {
    super(pages, index, childIndex, childCursor);
  }

  protected override pageSize(page: STreePage<V, I>): number {
    return page.size;
  }

  protected override pageCursor(page: STreePage<V, I>): Cursor<[I, V]> {
    return page.entries();
  }

  protected override reversePageCursor(page: STreePage<V, I>): Cursor<[I, V]> {
    return page.reverseEntries();
  }
}
