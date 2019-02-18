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
import swim.structure.Record;
import swim.structure.Value;
import swim.uri.Uri;

abstract class LinkAddressedForm<E extends LinkAddressed> extends Form<E> {
  abstract E from(Uri nodeUri, Uri laneUri, float prio, float rate, Value body);

  @Override
  public E unit() {
    return null;
  }

  @Override
  public Item mold(E envelope) {
    if (envelope != null) {
      final Record headers = Record.create(4)
          .slot("node", envelope.nodeUri.toString())
          .slot("lane", envelope.laneUri.toString());
      final float prio = envelope.prio;
      if (prio != 0f && !Float.isNaN(prio)) {
        headers.slot("prio", prio);
      }
      final float rate = envelope.rate;
      if (rate != 0f && !Float.isNaN(rate)) {
        headers.slot("rate", rate);
      }
      return Attr.of(tag(), headers).concat(envelope.body());
    } else {
      return Item.extant();
    }
  }

  @Override
  public E cast(Item item) {
    final Value value = item.toValue();
    final Record headers = value.headers(tag());
    Uri nodeUri = null;
    Uri laneUri = null;
    float prio = 0f;
    float rate = 0f;
    for (int i = 0, n = headers.size(); i < n; i += 1) {
      final Item header = headers.get(i);
      final String key = header.key().stringValue(null);
      if (key != null) {
        if ("node".equals(key)) {
          nodeUri = Uri.parse(header.toValue().stringValue(""));
        } else if ("lane".equals(key)) {
          laneUri = Uri.parse(header.toValue().stringValue(""));
        } else if ("prio".equals(key)) {
          prio = header.toValue().floatValue();
        } else if ("rate".equals(key)) {
          rate = header.toValue().floatValue();
        }
      } else if (header instanceof Value) {
        if (i == 0) {
          nodeUri = Uri.parse(header.stringValue(""));
        } else if (i == 1) {
          laneUri = Uri.parse(header.stringValue(""));
        }
      }
    }
    if (nodeUri != null && laneUri != null) {
      final Value body = value.body();
      return from(nodeUri, laneUri, prio, rate, body);
    }
    return null;
  }
}
