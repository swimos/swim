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

package swim.security;

import java.math.BigInteger;
import java.util.Iterator;
import swim.codec.Binary;
import swim.codec.Encoder;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Builder;

final class Der {
  private Der() {
    // stub
  }

  private static DerDecoder<Value> structureDecoder;
  private static DerEncoder<Value> structureEncoder;

  public static DerDecoder<Value> structureDecoder() {
    if (structureDecoder == null) {
      structureDecoder = new DerStructureDecoder();
    }
    return structureDecoder;
  }

  public static DerEncoder<Value> structureEncoder() {
    if (structureEncoder == null) {
      structureEncoder = new DerStructureEncoder();
    }
    return structureEncoder;
  }
}

class DerStructureDecoder extends DerDecoder<Value> {
  @Override
  public Value integer(byte[] data) {
    return Num.from(new BigInteger(data));
  }

  @SuppressWarnings("unchecked")
  @Override
  public Builder<Value, Value> sequenceBuilder() {
    return (Builder<Value, Value>) (Builder<?, ?>) Record.builder();
  }
}

class DerStructureEncoder extends DerEncoder<Value> {
  @Override
  public boolean isSequence(Value value) {
    if (value instanceof Record) {
      final Record record = (Record) value;
      return record.isArray();
    }
    return false;
  }

  @SuppressWarnings("unchecked")
  @Override
  public Iterator<Value> iterator(Value value) {
    if (value instanceof Record) {
      final Record record = (Record) value;
      if (record.isArray()) {
        return (Iterator<Value>) (Iterator<?>) record.iterator();
      }
    }
    return null;
  }

  @Override
  public int tagOf(Value value) {
    if (value instanceof Num) {
      return 0x02;
    } else if (value instanceof Record) {
      final Record record = (Record) value;
      if (record.isArray()) {
        return 0x30;
      }
    }
    throw new IllegalArgumentException(value.toString());
  }

  @Override
  public int sizeOfPrimitive(Value value) {
    if (value instanceof Num) {
      final BigInteger integer = value.integerValue();
      return (int) Math.ceil((double) (integer.bitLength() + 1) / 8.0);
    }
    throw new IllegalArgumentException(value.toString());
  }

  @SuppressWarnings("unchecked")
  @Override
  public Encoder<?, ?> primitiveEncoder(int length, Value value) {
    if (value instanceof Num) {
      final BigInteger integer = value.integerValue();
      return Binary.byteArrayWriter(integer.toByteArray());
    }
    throw new IllegalArgumentException(value.toString());
  }
}
