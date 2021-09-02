// Copyright 2015-2021 Swim Inc.
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

import java.util.Iterator;
import swim.codec.Output;
import swim.codec.Writer;
import swim.codec.WriterException;
import swim.structure.Absent;
import swim.structure.Attr;
import swim.structure.Bool;
import swim.structure.Data;
import swim.structure.Extant;
import swim.structure.Field;
import swim.structure.Item;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Text;
import swim.structure.Value;

public class JsonStructureWriter extends JsonWriter<Item, Value> {

  @Override
  public Iterator<Item> items(Item item) {
    return item.iterator();
  }

  @Override
  public Item item(Value value) {
    return value;
  }

  @Override
  public Value key(Item item) {
    return item.key();
  }

  @Override
  public Value value(Item item) {
    return item.toValue();
  }

  @Override
  public Writer<?, ?> writeItem(Output<?> output, Item item) {
    if (item instanceof Field) {
      if (item instanceof Attr) {
        final Attr that = (Attr) item;
        return this.writeField(output, Text.from('@' + that.key().stringValue()), that.value());
      } else if (item instanceof Slot) {
        final Slot that = (Slot) item;
        if (that.key() instanceof Text) {
          return this.writeField(output, that.key(), that.value());
        } else {
          return this.writeValue(output, Record.of(Slot.of("$key", that.key()), Slot.of("$value", that.value())));
        }
      }
    } else if (item instanceof Value) {
      return this.writeValue(output, (Value) item);
    }
    return Writer.error(new WriterException("No JSON serialization for " + item));
  }

  @Override
  public Writer<?, ?> writeField(Output<?> output, Item item, int index) {
    if (item instanceof Field) {
      if (item instanceof Attr) {
        final Attr that = (Attr) item;
        return this.writeField(output, Text.from('@' + that.key().stringValue()), that.value());
      } else if (item instanceof Slot) {
        final Slot that = (Slot) item;
        if (that.key() instanceof Text) {
          return this.writeField(output, that.key(), that.value());
        } else {
          return this.writeField(output, Text.from("$" + index),
                                 Record.of(Slot.of("$key", that.key()), Slot.of("$value", that.value())));
        }
      }
    } else if (item instanceof Value) {
      return this.writeItem(output, Slot.of(Text.from("$" + index), (Value) item));
    }
    return Writer.error(new WriterException("No JSON serialization for " + item));
  }

  @Override
  public Writer<?, ?> writeValue(Output<?> output, Item item, int index) {
    if (item instanceof Field) {
      return this.writeValue(output, item.toValue());
    } else if (item instanceof Value) {
      return this.writeValue(output, (Value) item);
    }
    return Writer.error(new WriterException("No JSON serialization for " + item));
  }

  @Override
  public Writer<?, ?> writeValue(Output<?> output, Value value) {
    if (value instanceof Record) {
      final Record that = (Record) value;
      if (that.isArray()) {
        return this.writeArray(output, that);
      } else {
        return this.writeObject(output, that);
      }
    } else if (value instanceof Data) {
      final Data that = (Data) value;
      return this.writeData(output, that.asByteBuffer());
    } else if (value instanceof Text) {
      final Text that = (Text) value;
      return this.writeText(output, that.stringValue());
    } else if (value instanceof Num) {
      final Num that = (Num) value;
      if (that.isUint32()) {
        return this.writeUint32(output, that.intValue());
      } else if (that.isUint64()) {
        return this.writeUint64(output, that.longValue());
      } else if (that.isValidInt()) {
        return this.writeNum(output, that.intValue());
      } else if (that.isValidLong()) {
        return this.writeNum(output, that.longValue());
      } else if (that.isValidFloat()) {
        return this.writeNum(output, that.floatValue());
      } else if (that.isValidDouble()) {
        return this.writeNum(output, that.doubleValue());
      } else if (that.isValidInteger()) {
        return this.writeNum(output, that.integerValue());
      }
    } else if (value instanceof Bool) {
      final Bool that = (Bool) value;
      return this.writeBool(output, that.booleanValue());
    } else if (value instanceof Extant) {
      return this.writeNull(output);
    } else if (value instanceof Absent) {
      return this.writeUndefined(output);
    }
    return Writer.error(new WriterException("No JSON serialization for " + value));
  }

}
