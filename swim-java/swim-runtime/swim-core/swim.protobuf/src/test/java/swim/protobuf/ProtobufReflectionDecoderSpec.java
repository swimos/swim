// Copyright 2015-2023 Swim.inc
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

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import org.testng.annotations.Test;
import swim.protobuf.reflection.ProtobufReflection;
import swim.protobuf.schema.ProtobufMessageType;
import swim.protobuf.schema.ProtobufType;
import swim.structure.Data;
import swim.util.Murmur3;

public class ProtobufReflectionDecoderSpec {

  @Test
  public void decodeBooleanReflections() {
    assertDecodes(ProtobufReflection.booleanType(),
                  Data.fromBase16("00"), false);
    assertDecodes(ProtobufReflection.booleanType(),
                  Data.fromBase16("01"), true);
  }

  @Test
  public void decodeIntReflections() {
    assertDecodes(ProtobufReflection.intType(),
                  Data.fromBase16("00"), 0);
    assertDecodes(ProtobufReflection.intType(),
                  Data.fromBase16("01"), -1);
    assertDecodes(ProtobufReflection.intType(),
                  Data.fromBase16("02"), 1);
    assertDecodes(ProtobufReflection.intType(),
                  Data.fromBase16("03"), -2);
    assertDecodes(ProtobufReflection.intType(),
                  Data.fromBase16("04"), 2);
    assertDecodes(ProtobufReflection.intType(),
                  Data.fromBase16("7f"), -64);
    assertDecodes(ProtobufReflection.intType(),
                  Data.fromBase16("8001"), 64);
  }

  @Test
  public void decodeLongReflections() {
    assertDecodes(ProtobufReflection.longType(),
                  Data.fromBase16("00"), 0L);
    assertDecodes(ProtobufReflection.longType(),
                  Data.fromBase16("01"), -1L);
    assertDecodes(ProtobufReflection.longType(),
                  Data.fromBase16("02"), 1L);
    assertDecodes(ProtobufReflection.longType(),
                  Data.fromBase16("03"), -2L);
    assertDecodes(ProtobufReflection.longType(),
                  Data.fromBase16("04"), 2L);
    assertDecodes(ProtobufReflection.longType(),
                  Data.fromBase16("7f"), -64L);
    assertDecodes(ProtobufReflection.longType(),
                  Data.fromBase16("8001"), 64L);
  }

  @Test
  public void decodeFloatReflections() {
    assertDecodes(ProtobufReflection.floatType(),
                  Data.fromBase16("00000000"), 0.0f);
    assertDecodes(ProtobufReflection.floatType(),
                  Data.fromBase16("0000803f"), 1.0f);
    assertDecodes(ProtobufReflection.floatType(),
                  Data.fromBase16("000080bf"), -1.0f);
    assertDecodes(ProtobufReflection.floatType(),
                  Data.fromBase16("0000c07f"), Float.NaN);
    assertDecodes(ProtobufReflection.floatType(),
                  Data.fromBase16("0000807f"), Float.POSITIVE_INFINITY);
    assertDecodes(ProtobufReflection.floatType(),
                  Data.fromBase16("000080ff"), Float.NEGATIVE_INFINITY);
  }

  @Test
  public void decodeDoubleReflections() {
    assertDecodes(ProtobufReflection.doubleType(),
                  Data.fromBase16("0000000000000000"), 0.0);
    assertDecodes(ProtobufReflection.doubleType(),
                  Data.fromBase16("000000000000f03f"), 1.0);
    assertDecodes(ProtobufReflection.doubleType(),
                  Data.fromBase16("000000000000f0bf"), -1.0);
    assertDecodes(ProtobufReflection.doubleType(),
                  Data.fromBase16("000000000000f87f"), Double.NaN);
    assertDecodes(ProtobufReflection.doubleType(),
                  Data.fromBase16("000000000000f07f"), Double.POSITIVE_INFINITY);
    assertDecodes(ProtobufReflection.doubleType(),
                  Data.fromBase16("000000000000f0ff"), Double.NEGATIVE_INFINITY);
  }

  @Test
  public void decodeDataReflections() {
    assertDecodes(ProtobufReflection.dataType(),
                  Data.fromBase16("04f0e1d2c3"), Data.fromBase16("f0e1d2c3").toByteBuffer());
  }

  @Test
  public void decodeStringReflections() {
    assertDecodes(ProtobufReflection.stringType(),
                  Data.fromBase16("03666f6f"), "foo");
  }

  @Test
  public void decodePackedArrayReflections() {
    assertDecodes(ProtobufReflection.arrayType(Long.TYPE, ProtobufReflection.longType()),
                  Data.fromBase16("069601"), new long[] {3, 75});
  }

  @Test
  public void decodeMessageReflections() {
    assertDecodesPayload(ProtobufReflection.classType(TestMessage.class),
                         Data.fromBase16("0896011203666f6f"), new TestMessage(75, "foo"));
    assertDecodesPayload(ProtobufReflection.classType(TestMessage.class),
                         Data.fromBase16("089601"), new TestMessage(75, null));
    assertDecodesPayload(ProtobufReflection.classType(TestMessage.class),
                         Data.fromBase16("1203666f6f"), new TestMessage(0, "foo"));
  }

  public static class TestMessage {

    @ProtobufMember(1)
    long a;
    @ProtobufMember(2)
    String b;

    TestMessage(long a, String b) {
      this.a = a;
      this.b = b;
    }

    public TestMessage() {
      // default
    }

    @Override
    public boolean equals(Object other) {
      if (other instanceof TestMessage) {
        final TestMessage that = (TestMessage) other;
        return this.a == that.a && (this.b == null ? that.b == null : this.b.equals(that.b));
      }
      return false;
    }

    @Override
    public int hashCode() {
      return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.seed(TestMessage.class),
          Murmur3.hash(this.a)), Murmur3.hash(this.b)));
    }

    @Override
    public String toString() {
      return "new TestMessage(" + this.a + ", " + this.b + ")";
    }

  }

  @Test
  public void decodeRepeatedArrayFields() {
    assertDecodesPayload(ProtobufReflection.classType(TestArrayMessage.class),
                         Data.fromBase16("0806089601"), new TestArrayMessage(new int[] {3, 75}));
  }

  public static class TestArrayMessage {

    @ProtobufMember(1)
    int[] array;

    TestArrayMessage(int[] array) {
      this.array = array;
    }

    public TestArrayMessage() {
      // default
    }

    @Override
    public boolean equals(Object other) {
      if (other instanceof TestArrayMessage) {
        final TestArrayMessage that = (TestArrayMessage) other;
        return (this.array == null ? that.array == null : Arrays.equals(this.array, that.array));
      }
      return false;
    }

    @Override
    public int hashCode() {
      return Murmur3.mash(Murmur3.mix(Murmur3.seed(TestArrayMessage.class), Murmur3.hash(this.array)));
    }

    @Override
    public String toString() {
      return "new TestArrayMessage(" + Arrays.toString(this.array) + ")";
    }

  }

  @Test
  public void decodePackedArrayFields() {
    assertDecodesPayload(ProtobufReflection.classType(TestArrayMessage.class),
                         Data.fromBase16("0a069601"), new TestArrayMessage(new int[] {3, 75}));
  }

  @Test
  public void decodeMapEntryFields() {
    final Map<String, Integer> map = new HashMap<String, Integer>();
    map.put("a", 3);
    map.put("b", 75);
    assertDecodesPayload(ProtobufReflection.classType(TestMapMessage.class),
                         Data.fromBase16("0a050a016110060a060a0162109601"), new TestMapMessage(map));
  }

  public static class TestMapMessage {

    @ProtobufMember(1)
    Map<String, Integer> map;

    TestMapMessage(Map<String, Integer> map) {
      this.map = map;
    }

    public TestMapMessage() {
      // default
    }

    @Override
    public boolean equals(Object other) {
      if (other instanceof TestMapMessage) {
        final TestMapMessage that = (TestMapMessage) other;
        return (this.map == null ? that.map == null : this.map.equals(that.map));
      }
      return false;
    }

    @Override
    public int hashCode() {
      return Murmur3.mash(Murmur3.mix(Murmur3.seed(TestMapMessage.class), Murmur3.hash(this.map)));
    }

    @Override
    public String toString() {
      return "new TestMapMessage(" + this.map + ")";
    }

  }

  public static <T> void assertDecodes(ProtobufType<T> type, Data data, T expected) {
    ProtobufAssertions.assertDecodes(Protobuf.typeDecoder(type), data, expected);
  }

  public static <T> void assertDecodesPayload(ProtobufType<T> type, Data data, T expected) {
    ProtobufAssertions.assertDecodes(Protobuf.payloadDecoder((ProtobufMessageType<T, ?>) type), data, expected);
  }

}
