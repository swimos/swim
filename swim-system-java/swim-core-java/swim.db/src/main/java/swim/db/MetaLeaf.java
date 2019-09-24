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

import swim.structure.Record;
import swim.structure.Value;

public class MetaLeaf {
  final Value name;
  final TreeType type;
  final Value key;
  final Value value;

  public MetaLeaf(Value name, TreeType type, Value key, Value value) {
    this.name = name;
    this.type = type;
    this.key = key;
    this.value = value;
  }

  public final Value name() {
    return this.name;
  }

  public final TreeType type() {
    return this.type;
  }

  public final Value key() {
    return this.key;
  }

  public final Value value() {
    return this.value;
  }

  public Value toValue() {
    final Record record = Record.create(4)
        .slot("tree", this.name)
        .slot("type", this.type.tag());
    if (this.key.isDefined()) {
      record.slot("key", this.key);
    }
    record.slot("value", this.value);
    return record;
  }
}
