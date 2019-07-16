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

package swim.math;

import swim.structure.Attr;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Value;

final class TensorDimsForm extends Form<TensorDims> {
  @Override
  public String tag() {
    return "dim";
  }

  @Override
  public TensorDims unit() {
    return TensorDims.undefined();
  }

  @Override
  public Class<?> type() {
    return TensorDims.class;
  }

  @Override
  public Item mold(TensorDims dim) {
    final Record record = Record.create(dim.rank());
    do {
      final Record header = Record.create(2);
      header.slot("size", dim.size);
      if (!dim.isPacked()) {
        header.slot("stride", dim.stride);
      }
      record.attr(tag(), header);
      dim = dim.next;
    } while (dim != null);
    return record;
  }

  @Override
  public TensorDims cast(Item item) {
    final Value value = item.toValue();
    TensorDims next = null;
    for (int i = value.length() - 1; i >= 0; i -= 1) {
      final Item member = value.getItem(i);
      if (member instanceof Attr && tag().equals(member.key().stringValue(null))) {
        final Value header = member.toValue();
        final Value size = header.get("size");
        if (size instanceof Num) {
          final Value stride = header.get("stride");
          if (stride instanceof Num) {
            if (next != null) {
              next = next.by(size.intValue(), stride.intValue());
            } else {
              next = TensorDims.of(size.intValue(), stride.intValue());
            }
          } else if (next != null) {
            next = next.by(size.intValue());
          } else {
            next = TensorDims.of(size.intValue());
          }
        }
      }
    }
    return next;
  }
}
