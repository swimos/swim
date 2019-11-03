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

package swim.avro.decoder;

import java.util.HashMap;
import java.util.Map;
import org.testng.annotations.Test;
import swim.avro.Assertions;
import swim.avro.Avro;
import swim.avro.reflection.AvroReflection;
import swim.avro.schema.AvroType;
import swim.structure.Data;
import swim.util.Murmur3;

public class AvroReflectionDecoderSpec {
  @Test
  public void decodeNullReflections() {
    assertDecodes(AvroReflection.nullType(),
                  Data.empty(), null);
  }

  @Test
  public void decodeBooleanReflections() {
    assertDecodes(AvroReflection.booleanType(),
                  Data.fromBase16("00"), false);
    assertDecodes(AvroReflection.booleanType(),
                  Data.fromBase16("01"), true);
  }

  @Test
  public void decodeIntReflections() {
    assertDecodes(AvroReflection.intType(),
                  Data.fromBase16("00"), 0);
    assertDecodes(AvroReflection.intType(),
                  Data.fromBase16("01"), -1);
    assertDecodes(AvroReflection.intType(),
                  Data.fromBase16("02"), 1);
    assertDecodes(AvroReflection.intType(),
                  Data.fromBase16("03"), -2);
    assertDecodes(AvroReflection.intType(),
                  Data.fromBase16("04"), 2);
    assertDecodes(AvroReflection.intType(),
                  Data.fromBase16("7f"), -64);
    assertDecodes(AvroReflection.intType(),
                  Data.fromBase16("8001"), 64);
  }

  @Test
  public void decodeLongReflections() {
    assertDecodes(AvroReflection.longType(),
                  Data.fromBase16("00"), 0L);
    assertDecodes(AvroReflection.longType(),
                  Data.fromBase16("01"), -1L);
    assertDecodes(AvroReflection.longType(),
                  Data.fromBase16("02"), 1L);
    assertDecodes(AvroReflection.longType(),
                  Data.fromBase16("03"), -2L);
    assertDecodes(AvroReflection.longType(),
                  Data.fromBase16("04"), 2L);
    assertDecodes(AvroReflection.longType(),
                  Data.fromBase16("7f"), -64L);
    assertDecodes(AvroReflection.longType(),
                  Data.fromBase16("8001"), 64L);
  }

  @Test
  public void decodeFloatReflections() {
    assertDecodes(AvroReflection.floatType(),
                  Data.fromBase16("00000000"), 0.0f);
    assertDecodes(AvroReflection.floatType(),
                  Data.fromBase16("0000803f"), 1.0f);
    assertDecodes(AvroReflection.floatType(),
                  Data.fromBase16("000080bf"), -1.0f);
    assertDecodes(AvroReflection.floatType(),
                  Data.fromBase16("0000c07f"), Float.NaN);
    assertDecodes(AvroReflection.floatType(),
                  Data.fromBase16("0000807f"), Float.POSITIVE_INFINITY);
    assertDecodes(AvroReflection.floatType(),
                  Data.fromBase16("000080ff"), Float.NEGATIVE_INFINITY);
  }

  @Test
  public void decodeDoubleReflections() {
    assertDecodes(AvroReflection.doubleType(),
                  Data.fromBase16("0000000000000000"), 0.0);
    assertDecodes(AvroReflection.doubleType(),
                  Data.fromBase16("000000000000f03f"), 1.0);
    assertDecodes(AvroReflection.doubleType(),
                  Data.fromBase16("000000000000f0bf"), -1.0);
    assertDecodes(AvroReflection.doubleType(),
                  Data.fromBase16("000000000000f87f"), Double.NaN);
    assertDecodes(AvroReflection.doubleType(),
                  Data.fromBase16("000000000000f07f"), Double.POSITIVE_INFINITY);
    assertDecodes(AvroReflection.doubleType(),
                  Data.fromBase16("000000000000f0ff"), Double.NEGATIVE_INFINITY);
  }

  @Test
  public void decodeDataReflections() {
    assertDecodes(AvroReflection.dataType(),
                  Data.fromBase16("08f0e1d2c3"), Data.fromBase16("f0e1d2c3").toByteBuffer());
  }

  @Test
  public void decodeStringReflections() {
    assertDecodes(AvroReflection.stringType(),
                  Data.fromBase16("06666f6f"), "foo");
  }

  public static class TestRecord {
    long a;
    String b;
    TestRecord(long a, String b) {
      this.a = a;
      this.b = b;
    }
    public TestRecord() {
      // stub
    }
    @Override
    public boolean equals(Object other) {
      if (other instanceof TestRecord) {
        final TestRecord that = (TestRecord) other;
        return this.a == that.a && (this.b == null ? that.b == null : this.b.equals(that.b));
      }
      return false;
    }
    @Override
    public int hashCode() {
      return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.seed(TestRecord.class),
          Murmur3.hash(this.a)), Murmur3.hash(this.b)));
    }
  }

  @Test
  public void decodeRecordReflections() {
    assertDecodes(AvroReflection.classType(TestRecord.class),
                  Data.fromBase16("3606666f6f"), new TestRecord(27, "foo"));
  }

  public enum TestEnum {
    A,
    B,
    C,
    D;
  }

  @Test
  public void decodeEnumReflections() {
    assertDecodes(AvroReflection.enumType(TestEnum.class),
                  Data.fromBase16("04"), TestEnum.C);
  }

  @Test
  public void decodeArrayReflections() {
    assertDecodes(AvroReflection.arrayType(Long.TYPE, AvroReflection.longType()),
                  Data.fromBase16("04063600"), new long[] {3, 27});
  }

  @Test
  public void decodeMapReflections() {
    final Map<String, Long> map = new HashMap<String, Long>();
    map.put("a", 3L);
    map.put("b", 27L);
    assertDecodes(AvroReflection.mapType(AvroReflection.longType()),
                  Data.fromBase16("0402610602623600"), map);
  }

  @Test
  public void decodeUnionReflections() {
    assertDecodes(AvroReflection.unionType().variant(AvroReflection.nullType())
                                            .variant(AvroReflection.stringType()),
                  Data.fromBase16("00"), null);
    assertDecodes(AvroReflection.unionType().variant(AvroReflection.nullType())
                                            .variant(AvroReflection.stringType()),
                  Data.fromBase16("020261"), "a");
  }

  @Test
  public void decodeFixedReflections() {
    assertDecodes(AvroReflection.fixedType("quad", 4),
                  Data.fromBase16("f0e1d2c3"), new byte[] {(byte) 0xf0, (byte) 0xe1, (byte) 0xd2, (byte) 0xc3});
  }

  public static <T> void assertDecodes(AvroType<T> type, Data data, T expected) {
    Assertions.assertDecodes(Avro.typeDecoder(type), data, expected);
  }
}
