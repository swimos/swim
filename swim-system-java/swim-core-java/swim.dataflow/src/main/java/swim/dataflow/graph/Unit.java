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

package swim.dataflow.graph;

import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Record;
import swim.util.Murmur3;

/**
 * Canonical type with a single member.
 */
public final class Unit {

  private Unit() {
  }

  public static final Unit INSTANCE = new Unit();

  @Override
  public boolean equals(final Object obj) {
    return obj == this;
  }

  private static final int HASH = Murmur3.seed(Unit.class);

  @Override
  public int hashCode() {
    return HASH;
  }

  public static final Form<Unit> FORM = new Form<Unit>() {

    @Override
    public Class<?> type() {
      return Unit.class;
    }

    @Override
    public Item mold(final Unit object) {
      return Record.of();
    }

    @Override
    public Unit cast(final Item item) {
      return INSTANCE;
    }
  };

}
