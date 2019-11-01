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

package swim.protobuf;

import swim.codec.Output;
import swim.structure.Data;
import swim.structure.Item;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Text;
import swim.structure.Value;
import swim.util.Builder;

public class ProtobufStructureDecoder extends ProtobufDecoder<Item, Value> {
  @Override
  public Item item(Value value) {
    return value;
  }

  @Override
  public Value value(Item item) {
    return item.toValue();
  }

  @Override
  public Item field(long key, Value value) {
    return Slot.of((long) (int) key == key ? Num.from((int) key) : Num.from(key), value);
  }

  @Override
  public Value uint(long value) {
    if ((int) value == value) {
      return Num.from((long) (int) value);
    } else {
      return Num.from(value);
    }
  }

  @Override
  public Value sint(long value) {
    if ((int) value == value) {
      return Num.from((long) (int) value);
    } else {
      return Num.from(value);
    }
  }

  @Override
  public Value fixed(int value) {
    return Num.from(Float.intBitsToFloat(value));
  }

  @Override
  public Value fixed(long value) {
    return Num.from(Double.longBitsToDouble(value));
  }

  @SuppressWarnings("unchecked")
  @Override
  public Builder<Item, Value> messageBuilder() {
    return (Builder<Item, Value>) (Builder<?, ?>) Record.create();
  }

  @SuppressWarnings("unchecked")
  @Override
  public Output<Value> dataOutput() {
    return (Output<Value>) (Output<?>) Data.output();
  }

  @SuppressWarnings("unchecked")
  @Override
  public Output<Value> textOutput() {
    return (Output<Value>) (Output<?>) Text.output();
  }
}
