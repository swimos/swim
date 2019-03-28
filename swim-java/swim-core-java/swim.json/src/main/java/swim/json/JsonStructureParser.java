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

package swim.json;

import java.math.BigInteger;
import swim.codec.Output;
import swim.structure.Attr;
import swim.structure.Bool;
import swim.structure.Item;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Text;
import swim.structure.Value;
import swim.util.Builder;

public class JsonStructureParser extends JsonParser<Item, Value> {
  @Override
  public Item item(Value value) {
    return value;
  }

  @Override
  public Value value(Item item) {
    return item.toValue();
  }

  @Override
  public Item field(Value key, Value value) {
    if (key instanceof Text) {
      final String name = key.stringValue();
      if (name.length() > 1 && name.charAt(0) == '@') {
        return Attr.of(Text.from(name.substring(1)), value);
      }
    }
    return Slot.of(key, value);
  }

  @SuppressWarnings("unchecked")
  @Override
  public Builder<Item, Value> objectBuilder() {
    return (Builder<Item, Value>) (Builder<?, ?>) Record.create();
  }

  @SuppressWarnings("unchecked")
  @Override
  public Builder<Item, Value> arrayBuilder() {
    return (Builder<Item, Value>) (Builder<?, ?>) Record.create();
  }

  @SuppressWarnings("unchecked")
  @Override
  public Output<Value> textOutput() {
    return (Output<Value>) (Output<?>) Text.output();
  }

  @Override
  public Value ident(Value value) {
    if (value instanceof Text) {
      final String string = value.stringValue();
      if ("true".equals(string)) {
        return Bool.from(true);
      } else if ("false".equals(string)) {
        return Bool.from(false);
      } else if ("null".equals(string)) {
        return Value.extant();
      }
    }
    return value;
  }

  @Override
  public Value num(int value) {
    return Num.from(value);
  }

  @Override
  public Value num(long value) {
    if ((int) value == value) {
      return Num.from((int) value);
    } else {
      return Num.from(value);
    }
  }

  @Override
  public Value num(float value) {
    return Num.from(value);
  }

  @Override
  public Value num(double value) {
    if ((float) value == value) {
      return Num.from((float) value);
    } else {
      return Num.from(value);
    }
  }

  @Override
  public Value num(BigInteger value) {
    return Num.from(value);
  }

  @Override
  public Value num(String value) {
    return Num.from(value);
  }

  @Override
  public Value uint32(int value) {
    return Num.uint32(value);
  }

  @Override
  public Value uint64(long value) {
    return Num.uint64(value);
  }

  @Override
  public Value bool(boolean value) {
    return Bool.from(value);
  }
}
