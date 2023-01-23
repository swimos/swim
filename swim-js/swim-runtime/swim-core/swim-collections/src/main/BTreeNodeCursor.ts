// Copyright 2015-2023 Swim.inc
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
import type {BTreePage} from "./BTreePage";

/** @internal */
export class BTreeNodeCursor<K, V, U> extends NodeCursor<[K, V], BTreePage<K, V, U>> {
  constructor(pages: ReadonlyArray<BTreePage<K, V, U>>, index: number = 0,
              childIndex: number = 0, childCursor: Cursor<[K, V]> | null = null) {
    super(pages, index, childIndex, childCursor);
  }

  protected override pageSize(page: BTreePage<K, V, U>): number {
    return page.size;
  }

  protected override pageCursor(page: BTreePage<K, V, U>): Cursor<[K, V]> {
    return page.entries();
  }

  protected override reversePageCursor(page: BTreePage<K, V, U>): Cursor<[K, V]> {
    return page.reverseEntries();
  }
}
