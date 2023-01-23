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

import org.testng.annotations.Test;
import swim.protobuf.schema.ProtobufMessageType;
import swim.protobuf.schema.ProtobufType;
import swim.protobuf.structure.ProtobufStructure;
import swim.structure.Bool;
import swim.structure.Data;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Text;

public class ProtobufStructureDecoderSpec {

  @Test
  public void decodeBooleanStructures() {
    assertDecodes(ProtobufStructure.booleanType(),
                  Data.fromBase16("00"), Bool.from(false));
    assertDecodes(ProtobufStructure.booleanType(),
                  Data.fromBase16("01"), Bool.from(true));
  }

  @Test
  public void decodeVarintStructures() {
    assertDecodes(ProtobufStructure.varintType(),
                  Data.fromBase16("00"), Num.from(0));
    assertDecodes(ProtobufStructure.varintType(),
                  Data.fromBase16("01"), Num.from(1));
    assertDecodes(ProtobufStructure.varintType(),
                  Data.fromBase16("02"), Num.from(2));
    assertDecodes(ProtobufStructure.varintType(),
                  Data.fromBase16("8001"), Num.from(128));
  }

  @Test
  public void decodeZigZagStructures() {
    assertDecodes(ProtobufStructure.zigZagType(),
                  Data.fromBase16("00"), Num.from(0));
    assertDecodes(ProtobufStructure.zigZagType(),
                  Data.fromBase16("01"), Num.from(-1));
    assertDecodes(ProtobufStructure.zigZagType(),
                  Data.fromBase16("02"), Num.from(1));
    assertDecodes(ProtobufStructure.zigZagType(),
                  Data.fromBase16("03"), Num.from(-2));
    assertDecodes(ProtobufStructure.zigZagType(),
                  Data.fromBase16("04"), Num.from(2));
    assertDecodes(ProtobufStructure.zigZagType(),
                  Data.fromBase16("7f"), Num.from(-64));
    assertDecodes(ProtobufStructure.zigZagType(),
                  Data.fromBase16("8001"), Num.from(64));
  }

  @Test
  public void decodeFloatStructures() {
    assertDecodes(ProtobufStructure.floatType(),
                  Data.fromBase16("00000000"), Num.from(0.0f));
    assertDecodes(ProtobufStructure.floatType(),
                  Data.fromBase16("0000803f"), Num.from(1.0f));
    assertDecodes(ProtobufStructure.floatType(),
                  Data.fromBase16("000080bf"), Num.from(-1.0f));
    assertDecodes(ProtobufStructure.floatType(),
                  Data.fromBase16("0000c07f"), Num.from(Float.NaN));
    assertDecodes(ProtobufStructure.floatType(),
                  Data.fromBase16("0000807f"), Num.from(Float.POSITIVE_INFINITY));
    assertDecodes(ProtobufStructure.floatType(),
                  Data.fromBase16("000080ff"), Num.from(Float.NEGATIVE_INFINITY));
  }

  @Test
  public void decodeDoubleStructures() {
    assertDecodes(ProtobufStructure.doubleType(),
                  Data.fromBase16("0000000000000000"), Num.from(0.0));
    assertDecodes(ProtobufStructure.doubleType(),
                  Data.fromBase16("000000000000f03f"), Num.from(1.0));
    assertDecodes(ProtobufStructure.doubleType(),
                  Data.fromBase16("000000000000f0bf"), Num.from(-1.0));
    assertDecodes(ProtobufStructure.doubleType(),
                  Data.fromBase16("000000000000f87f"), Num.from(Double.NaN));
    assertDecodes(ProtobufStructure.doubleType(),
                  Data.fromBase16("000000000000f07f"), Num.from(Double.POSITIVE_INFINITY));
    assertDecodes(ProtobufStructure.doubleType(),
                  Data.fromBase16("000000000000f0ff"), Num.from(Double.NEGATIVE_INFINITY));
  }

  @Test
  public void decodeDataStructures() {
    assertDecodes(ProtobufStructure.dataType(),
                  Data.fromBase16("04f0e1d2c3"), Data.fromBase16("f0e1d2c3"));
  }

  @Test
  public void decodeStringStructures() {
    assertDecodes(ProtobufStructure.stringType(),
                  Data.fromBase16("03666f6f"), Text.from("foo"));
  }

  @Test
  public void decodeMessagePayloads() {
    assertDecodesPayload(ProtobufStructure.messageType()
                                          .field(ProtobufStructure.field("a", 1L, ProtobufStructure.varintType())),
                         Data.fromBase16("089601"), Record.of(Slot.of("a", 150)));
  }

  @Test
  public void decodeEmbeddedMessageStructure() {
    assertDecodesPayload(ProtobufStructure.messageType()
                                          .field(ProtobufStructure.field("c", 3L, ProtobufStructure.messageType()
                                                                                                   .field(ProtobufStructure.field("a", 1L, ProtobufStructure.varintType())))),
                         Data.fromBase16("1a03089601"), Record.of(Slot.of("c", Record.of(Slot.of("a", 150)))));
  }

  public static <T> void assertDecodes(ProtobufType<T> type, Data data, T expected) {
    ProtobufAssertions.assertDecodes(Protobuf.typeDecoder(type), data, expected);
  }

  public static <T> void assertDecodesPayload(ProtobufMessageType<T, ?> type, Data data, T expected) {
    ProtobufAssertions.assertDecodes(Protobuf.payloadDecoder(type), data, expected);
  }

}
