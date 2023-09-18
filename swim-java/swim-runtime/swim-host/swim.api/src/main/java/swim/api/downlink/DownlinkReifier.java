// Copyright 2015-2023 Nstream, inc.
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

package swim.api.downlink;

import swim.api.ref.WarpRef;
import swim.dataflow.RecordModel;
import swim.dataflow.Reifier;
import swim.structure.Field;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Value;

final class DownlinkReifier extends Reifier {

  final WarpRef warp;

  DownlinkReifier(WarpRef warp) {
    this.warp = warp;
  }

  @Override
  public Item reify(Item item) {
    if (item instanceof Field) {
      return this.reifyField((Field) item);
    } else {
      return this.reifyValue((Value) item);
    }
  }

  public Field reifyField(Field field) {
    final Value oldValue = field.value();
    final Value newValue = this.reifyValue(oldValue);
    if (oldValue != newValue) {
      return field.updatedValue(newValue);
    } else {
      return field;
    }
  }

  public Value reifyValue(Value value) {
    if (value instanceof RecordModel) {
      return this.reifyModel((RecordModel) value);
    } else {
      return value;
    }
  }

  public Record reifyModel(RecordModel model) {
    if ("link".equals(model.tag())) {
      final DownlinkStreamlet streamlet = new DownlinkStreamlet(this.warp, model);
      streamlet.compile();
      return streamlet;
    }
    return model;
  }

}
