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

public class MetaTree {
  final Value name;
  final TreeType type;
  final int stem;
  final long created;
  final long updated;

  public MetaTree(Value name, TreeType type, int stem, long created, long updated) {
    this.name = name;
    this.type = type;
    this.stem = stem;
    this.created = created;
    this.updated = updated;
  }

  public final Value name() {
    return this.name;
  }

  public final TreeType type() {
    return this.type;
  }

  public final int stem() {
    return this.stem;
  }

  public final long created() {
    return this.created;
  }

  public final long updated() {
    return this.updated;
  }

  public Value toValue() {
    return Record.create(5)
        .slot("name", this.name)
        .slot("type", this.type.tag())
        .slot("stem", this.stem)
        .slot("created", this.created)
        .slot("updated", this.updated);
  }

  public static MetaTree fromValue(Value name, Value value) {
    final String tag = value.tag();
    final TreeType type = TreeType.fromTag(tag);
    final int stem = value.get("stem").intValue(0);
    final long created = value.get("created").longValue(0L);
    final long updated = value.get("updated").longValue(0L);
    return new MetaTree(name, type, stem, created, updated);
  }
}
