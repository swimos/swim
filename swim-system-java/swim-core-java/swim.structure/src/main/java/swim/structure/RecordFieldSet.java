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

package swim.structure;

import java.util.AbstractSet;
import java.util.Iterator;

final class RecordFieldSet extends AbstractSet<Field> {
  final Record record;

  RecordFieldSet(Record record) {
    this.record = record;
  }

  @Override
  public int size() {
    return this.record.fieldCount();
  }

  @Override
  public Iterator<Field> iterator() {
    return this.record.fieldIterator();
  }
}
