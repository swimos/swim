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

import swim.codec.Output;
import swim.codec.Unicode;
import swim.concurrent.Conts;
import swim.recon.Recon;
import swim.structure.Record;
import swim.structure.Value;

public class Seed {
  final TreeType treeType;
  final int stem;
  final long created;
  final long updated;
  final Value rootRefValue;

  public Seed(TreeType treeType, int stem, long created, long updated, Value rootRefValue) {
    this.treeType = treeType;
    this.stem = stem;
    this.created = created;
    this.updated = updated;
    this.rootRefValue = rootRefValue.commit();
  }

  public TreeType treeType() {
    return this.treeType;
  }

  public int stem() {
    return this.stem;
  }

  public long created() {
    return this.created;
  }

  public long updated() {
    return this.updated;
  }

  public Value rootRefValue() {
    return this.rootRefValue;
  }

  public PageRef rootRef(PageContext pageContext) {
    if (this.rootRefValue.isDefined()) {
      return this.treeType.pageRefFromValue(pageContext, this.stem, this.rootRefValue);
    } else {
      return this.treeType.emptyPageRef(pageContext, this.stem, 0L);
    }
  }

  public Seed committed(long updated, PageRef newRootRef) {
    return new Seed(this.treeType, this.stem, this.created, updated, newRootRef.toValue());
  }

  public Seed uncommitted(PageRef newRootRef) {
    return new Seed(this.treeType, this.stem, this.created, this.updated, newRootRef.toValue());
  }

  public Value toValue() {
    final Record header = Record.create(3)
        .slot("stem", this.stem)
        .slot("created", this.created)
        .slot("updated", this.updated);
    return Record.create(2)
        .attr(this.treeType.tag(), header)
        .slot("root", this.rootRefValue);
  }

  public static Seed fromValue(Value value) {
    try {
      final String tag = value.tag();
      final TreeType treeType = TreeType.fromTag(tag);
      if (treeType == null) {
        return null;
      }
      final Value header = value.header(tag);
      final int stem = header.get("stem").intValue();
      final long created = header.get("created").longValue();
      final long updated = header.get("updated").longValue();
      final Value rootRefValue = value.get("root");
      return new Seed(treeType, stem, created, updated, rootRefValue);
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        final Output<String> message = Unicode.stringOutput("Malformed seed: ");
        Recon.write(value, message);
        throw new StoreException(message.bind(), cause);
      } else {
        throw cause;
      }
    }
  }
}
