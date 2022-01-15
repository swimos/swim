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

  public JsonWriter() {
    // nop
  }

  public abstract Iterator<I> items(I item);

  public abstract I item(V value);

  public abstract V key(I item);

  public abstract V value(I item);

  public abstract Writer<?, ?> writeItem(Output<?> output, I item);

  public abstract Writer<?, ?> writeField(Output<?> output, I item, int index);

  public abstract Writer<?, ?> writeValue(Output<?> output, I item, int index);

  public abstract Writer<?, ?> writeValue(Output<?> output, V value);

  public Writer<?, ?> writeField(Output<?> output, V key, V value) {
    return FieldWriter.write(output, this, key, value);
  }

  public Writer<?, ?> writeArray(Output<?> output, I item) {
    return ArrayWriter.write(output, this, this.items(item));
  }

  public Writer<?, ?> writeObject(Output<?> output, I item) {
    return ObjectWriter.write(output, this, this.items(item));
  }

  public Writer<?, ?> writeData(Output<?> output, ByteBuffer value) {
    if (value != null) {
      return DataWriter.write(output, value);
    } else {
      return Unicode.writeString(output, "\"\"");
    }
  }

  public Writer<?, ?> writeText(Output<?> output, String value) {
    return StringWriter.write(output, value);
  }

  public Writer<?, ?> writeNum(Output<?> output, int value) {
    return Base10.writeInt(output, value);
  }

  public Writer<?, ?> writeNum(Output<?> output, long value) {
    return Base10.writeLong(output, value);
  }

  public Writer<?, ?> writeNum(Output<?> output, float value) {
    return Base10.writeFloat(output, value);
  }

  public Writer<?, ?> writeNum(Output<?> output, double value) {
    return Base10.writeDouble(output, value);
  }

  public Writer<?, ?> writeNum(Output<?> output, BigInteger value) {
    return Unicode.writeString(output, value);
  }

  public Writer<?, ?> writeUint32(Output<?> output, int value) {
    return Base16.lowercase().writeIntLiteral(output, value, 8);
  }

  public Writer<?, ?> writeUint64(Output<?> output, long value) {
    return Base16.lowercase().writeLongLiteral(output, value, 16);
  }

  public Writer<?, ?> writeBool(Output<?> output, boolean value) {
    return Unicode.writeString(output, value ? "true" : "false");
  }

  public Writer<?, ?> writeNull(Output<?> output) {
    return Unicode.writeString(output, "null");
  }

  public Writer<?, ?> writeUndefined(Output<?> output) {
    return Unicode.writeString(output, "undefined");
  }

}
