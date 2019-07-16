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
import java.nio.ByteBuffer;
import java.util.Iterator;
import swim.codec.Base10;
import swim.codec.Base16;
import swim.codec.Output;
import swim.codec.Unicode;
import swim.codec.Writer;

/**
 * Factory for constructing JSON writers.
 */
public abstract class JsonWriter<I, V> {
  public abstract Iterator<I> items(I item);

  public abstract I item(V value);

  public abstract V key(I item);

  public abstract V value(I item);

  public abstract Writer<?, ?> writeItem(I item, Output<?> output);

  public abstract Writer<?, ?> writeField(I item, Output<?> output, int index);

  public abstract Writer<?, ?> writeValue(I item, Output<?> output, int index);

  public abstract Writer<?, ?> writeValue(V value, Output<?> output);

  public Writer<?, ?> writeField(V key, V value, Output<?> output) {
    return FieldWriter.write(output, this, key, value);
  }

  public Writer<?, ?> writeArray(I item, Output<?> output) {
    return ArrayWriter.write(output, this, items(item));
  }

  public Writer<?, ?> writeObject(I item, Output<?> output) {
    return ObjectWriter.write(output, this, items(item));
  }

  public Writer<?, ?> writeData(ByteBuffer value, Output<?> output) {
    if (value != null) {
      return DataWriter.write(output, value);
    } else {
      return Unicode.writeString("\"\"", output);
    }
  }

  public Writer<?, ?> writeText(String value, Output<?> output) {
    return StringWriter.write(output, value);
  }

  public Writer<?, ?> writeNum(int value, Output<?> output) {
    return Base10.writeInt(value, output);
  }

  public Writer<?, ?> writeNum(long value, Output<?> output) {
    return Base10.writeLong(value, output);
  }

  public Writer<?, ?> writeNum(float value, Output<?> output) {
    return Base10.writeFloat(value, output);
  }

  public Writer<?, ?> writeNum(double value, Output<?> output) {
    return Base10.writeDouble(value, output);
  }

  public Writer<?, ?> writeNum(BigInteger value, Output<?> output) {
    return Unicode.writeString(value, output);
  }

  public Writer<?, ?> writeUint32(int value, Output<?> output) {
    return Base16.lowercase().writeIntLiteral(value, output, 8);
  }

  public Writer<?, ?> writeUint64(long value, Output<?> output) {
    return Base16.lowercase().writeLongLiteral(value, output, 16);
  }

  public Writer<?, ?> writeBool(boolean value, Output<?> output) {
    return Unicode.writeString(value ? "true" : "false", output);
  }

  public Writer<?, ?> writeNull(Output<?> output) {
    return Unicode.writeString("null", output);
  }

  public Writer<?, ?> writeUndefined(Output<?> output) {
    return Unicode.writeString("undefined", output);
  }
}
