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

package swim.dataflow.graph.persistence;

import java.util.ArrayList;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Pair;

public final class PairForm<S, T> extends Form<Pair<S, T>> {

  private final Form<S> left;
  private final Form<T> right;

  public PairForm(final Form<S> l, final Form<T> r) {
    left = l;
    right = r;
  }

  @Override
  public Class<?> type() {
    return Pair.class;
  }

  @Override
  public Item mold(final Pair<S, T> object) {
    if (object != null) {
      return Record.of(left.mold(object.getFirst()), right.mold(object.getSecond()));
    } else {
      return Item.extant();
    }
  }

  @Override
  public Pair<S, T> cast(final Item item) {
    final Value val = item.toValue();
    final ArrayList<Item> children = new ArrayList<>(2);
    for (final Item child : val) {
      children.add(child);
    }
    if (children.size() == 2) {
      return new Pair<>(left.cast(children.get(0)), right.cast(children.get(1)));
    } else {
      return null;
    }
  }
}
