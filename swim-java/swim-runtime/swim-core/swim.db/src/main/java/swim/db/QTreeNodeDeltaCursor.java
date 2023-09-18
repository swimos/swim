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

package swim.db;

import swim.structure.Slot;
import swim.util.Cursor;

final class QTreeNodeDeltaCursor extends QTreeNodeCursor {

  final long sinceVersion;

  QTreeNodeDeltaCursor(QTreeNode page, long x, long y, long index, int slotIndex,
                       int childIndex, long sinceVersion) {
    super(page, x, y, index, slotIndex, childIndex);
    this.sinceVersion = sinceVersion;
  }

  QTreeNodeDeltaCursor(QTreeNode page, long x, long y, long sinceVersion) {
    this(page, x, y, 0L, 0, 0, sinceVersion);
  }

  @Override
  Cursor<Slot> childCursor(QTreePageRef childRef) {
    return childRef.deltaCursor(this.x, this.y, this.sinceVersion);
  }

}
