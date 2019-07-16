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

import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Value;

final class PrecisionForm extends Form<Precision> {
  @Override
  public String tag() {
    return "precision";
  }

  @Override
  public Precision unit() {
    return Precision.undefined();
  }

  @Override
  public Class<?> type() {
    return Precision.class;
  }

  @Override
  public Item mold(Precision precision) {
    if (precision != null) {
      return Record.create(1).attr(tag(), Record.create(1)
          .slot("bits", precision.bits));
    } else {
      return Item.extant();
    }
  }

  @Override
  public Precision cast(Item item) {
    final Value header = item.toValue().getAttr(tag());
    if (header.isDefined()) {
      final Value bits = header.get("bits");
      if (bits instanceof Num) {
        return Precision.fromBits(bits.intValue());
      }
    }
    return null;
  }
}
