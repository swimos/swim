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
  public Writer<?, ?> writeItem(Item item, Output<?> output) {
    if (item instanceof Field) {
      if (item instanceof Attr) {
        final Attr that = (Attr) item;
        return writeField(Text.from('@' + that.key().stringValue()), that.value(), output);
      } else if (item instanceof Slot) {
        final Slot that = (Slot) item;
        if (that.key() instanceof Text) {
          return writeField(that.key(), that.value(), output);
        } else {
          return writeValue(Record.of(Slot.of("$key", that.key()), Slot.of("$value", that.value())), output);
        }
      }
    } else if (item instanceof Value) {
      return writeValue((Value) item, output);
    }
    return Writer.error(new WriterException("No JSON serialization for " + item));
  }

  @Override
  public Writer<?, ?> writeField(Item item, Output<?> output, int index) {
    if (item instanceof Field) {
      if (item instanceof Attr) {
        final Attr that = (Attr) item;
        return writeField(Text.from('@' + that.key().stringValue()), that.value(), output);
      } else if (item instanceof Slot) {
        final Slot that = (Slot) item;
        if (that.key() instanceof Text) {
          return writeField(that.key(), that.value(), output);
        } else {
          return writeField(Text.from("$" + index),
                            Record.of(Slot.of("$key", that.key()), Slot.of("$value", that.value())),
                            output);
        }
      }
    } else if (item instanceof Value) {
      return writeItem(Slot.of(Text.from("$" + index), (Value) item), output);
    }
    return Writer.error(new WriterException("No JSON serialization for " + item));
  }

  @Override
  public Writer<?, ?> writeValue(Item item, Output<?> output, int index) {
    if (item instanceof Field) {
      return writeValue(item.toValue(), output);
    } else if (item instanceof Value) {
      return writeValue((Value) item, output);
    }
    return Writer.error(new WriterException("No JSON serialization for " + item));
  }

  @Override
  public Writer<?, ?> writeValue(Value value, Output<?> output) {
    if (value instanceof Record) {
      final Record that = (Record) value;
      if (that.isArray()) {
        return writeArray(that, output);
      } else {
        return writeObject(that, output);
      }
    } else if (value instanceof Data) {
      final Data that = (Data) value;
      return writeData(that.asByteBuffer(), output);
    } else if (value instanceof Text) {
      final Text that = (Text) value;
      return writeText(that.stringValue(), output);
    } else if (value instanceof Num) {
      final Num that = (Num) value;
      if (that.isUint32()) {
        return writeUint32(that.intValue(), output);
      } else if (that.isUint64()) {
        return writeUint64(that.longValue(), output);
      } else if (that.isValidInt()) {
        return writeNum(that.intValue(), output);
      } else if (that.isValidLong()) {
        return writeNum(that.longValue(), output);
      } else if (that.isValidFloat()) {
        return writeNum(that.floatValue(), output);
      } else if (that.isValidDouble()) {
        return writeNum(that.doubleValue(), output);
      } else if (that.isValidInteger()) {
        return writeNum(that.integerValue(), output);
      }
    } else if (value instanceof Bool) {
      final Bool that = (Bool) value;
      return writeBool(that.booleanValue(), output);
    } else if (value instanceof Extant) {
      return writeNull(output);
    } else if (value instanceof Absent) {
      return writeUndefined(output);
    }
    return Writer.error(new WriterException("No JSON serialization for " + value));
  }
}
