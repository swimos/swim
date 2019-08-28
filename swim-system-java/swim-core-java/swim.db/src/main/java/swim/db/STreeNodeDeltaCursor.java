// Copyright 2015-2019 SWIM.AI inc.
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

final class STreeNodeDeltaCursor extends STreeNodeCursor {
  final long sinceVersion;

  STreeNodeDeltaCursor(STreeNode page, long index, int childIndex, long sinceVersion) {
    super(page, index, childIndex);
    this.sinceVersion = sinceVersion;
  }

  STreeNodeDeltaCursor(STreeNode page, long sinceVersion) {
    this(page, 0L, 0, sinceVersion);
  }

  @Override
  Cursor<Slot> childCursor(STreePageRef childRef) {
    return childRef.deltaCursor(this.sinceVersion);
  }
}
