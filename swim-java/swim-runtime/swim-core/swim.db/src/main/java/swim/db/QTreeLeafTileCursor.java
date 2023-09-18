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

final class QTreeLeafTileCursor extends QTreeLeafCursor {

  QTreeLeafTileCursor(QTreeLeaf page, long x, long y, int index) {
    super(page, x, y, index);
  }

  QTreeLeafTileCursor(QTreeLeaf page, long x, long y) {
    this(page, x, y, 0);
  }

  @Override
  protected Slot getSlot(Slot slot) {
    return slot;
  }

}
