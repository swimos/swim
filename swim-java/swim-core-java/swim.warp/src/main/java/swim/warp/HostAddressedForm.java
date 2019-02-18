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

package swim.warp;

import swim.structure.Attr;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Value;

abstract class HostAddressedForm<E extends HostAddressed> extends Form<E> {
  abstract E from(Value body);

  @Override
  public E unit() {
    return null;
  }

  @Override
  public Item mold(E envelope) {
    if (envelope != null) {
      return Attr.of(tag()).concat(envelope.body());
    } else {
      return Item.extant();
    }
  }

  @Override
  public E cast(Item item) {
    final Value value = item.toValue();
    if (tag().equals(value.tag())) {
      final Value body = value.body();
      return from(body);
    }
    return null;
  }
}
