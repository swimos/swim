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

import org.testng.annotations.Test;
import swim.avro.Assertions;
import swim.avro.Avro;
import swim.avro.schema.AvroType;
import swim.avro.structure.AvroStructure;
import swim.structure.Bool;
import swim.structure.Data;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Text;
import swim.structure.Value;

public class AvroStructureDecoderSpec {
  @Test
  public void decodeNullStructures() {
    assertDecodes(AvroStructure.nullType(),
                  Data.empty(), Value.extant());
  }

  @Test
  public void decodeBooleanStructures() {
    assertDecodes(AvroStructure.booleanType(),
                  Data.fromBase16("00"), Bool.from(false));
    assertDecodes(AvroStructure.booleanType(),
                  Data.fromBase16("01"), Bool.from(true));
  }

  @Test
  public void decodeIntStructures() {
    assertDecodes(AvroStructure.intType(),
                  Data.fromBase16("00"), Num.from(0));
    assertDecodes(AvroStructure.intType(),
                  Data.fromBase16("01"), Num.from(-1));
    assertDecodes(AvroStructure.intType(),
                  Data.fromBase16("02"), Num.from(1));
    assertDecodes(AvroStructure.intType(),
                  Data.fromBase16("03"), Num.from(-2));
    assertDecodes(AvroStructure.intType(),
                  Data.fromBase16("04"), Num.from(2));
    assertDecodes(AvroStructure.intType(),
                  Data.fromBase16("7f"), Num.from(-64));
    assertDecodes(AvroStructure.intType(),
                  Data.fromBase16("8001"), Num.from(64));
  }

  @Test
  public void decodeLongStructures() {
    assertDecodes(AvroStructure.longType(),
                  Data.fromBase16("00"), Num.from(0L));
    assertDecodes(AvroStructure.longType(),
                  Data.fromBase16("01"), Num.from(-1L));
    assertDecodes(AvroStructure.longType(),
                  Data.fromBase16("02"), Num.from(1L));
    assertDecodes(AvroStructure.longType(),
                  Data.fromBase16("03"), Num.from(-2L));
    assertDecodes(AvroStructure.longType(),
                  Data.fromBase16("04"), Num.from(2L));
    assertDecodes(AvroStructure.longType(),
                  Data.fromBase16("7f"), Num.from(-64L));
    assertDecodes(AvroStructure.longType(),
                  Data.fromBase16("8001"), Num.from(64L));
  }

  @Test
  public void decodeFloatStructures() {
    assertDecodes(AvroStructure.floatType(),
                  Data.fromBase16("00000000"), Num.from(0.0f));
    assertDecodes(AvroStructure.floatType(),
                  Data.fromBase16("0000803f"), Num.from(1.0f));
    assertDecodes(AvroStructure.floatType(),
                  Data.fromBase16("000080bf"), Num.from(-1.0f));
    assertDecodes(AvroStructure.floatType(),
                  Data.fromBase16("0000c07f"), Num.from(Float.NaN));
    assertDecodes(AvroStructure.floatType(),
                  Data.fromBase16("0000807f"), Num.from(Float.POSITIVE_INFINITY));
    assertDecodes(AvroStructure.floatType(),
                  Data.fromBase16("000080ff"), Num.from(Float.NEGATIVE_INFINITY));
  }

  @Test
  public void decodeDoubleStructures() {
    assertDecodes(AvroStructure.doubleType(),
                  Data.fromBase16("0000000000000000"), Num.from(0.0));
    assertDecodes(AvroStructure.doubleType(),
                  Data.fromBase16("000000000000f03f"), Num.from(1.0));
    assertDecodes(AvroStructure.doubleType(),
                  Data.fromBase16("000000000000f0bf"), Num.from(-1.0));
    assertDecodes(AvroStructure.doubleType(),
                  Data.fromBase16("000000000000f87f"), Num.from(Double.NaN));
    assertDecodes(AvroStructure.doubleType(),
                  Data.fromBase16("000000000000f07f"), Num.from(Double.POSITIVE_INFINITY));
    assertDecodes(AvroStructure.doubleType(),
                  Data.fromBase16("000000000000f0ff"), Num.from(Double.NEGATIVE_INFINITY));
  }

  @Test
  public void decodeDataStructures() {
    assertDecodes(AvroStructure.dataType(),
                  Data.fromBase16("08f0e1d2c3"), Data.fromBase16("f0e1d2c3"));
  }

  @Test
  public void decodeStringStructures() {
    assertDecodes(AvroStructure.stringType(),
                  Data.fromBase16("06666f6f"), Text.from("foo"));
  }

  @Test
  public void decodeRecordStructures() {
    assertDecodes(AvroStructure.recordType("test")
                               .field(AvroStructure.field("a", AvroStructure.longType()))
                               .field(AvroStructure.field("b", AvroStructure.stringType())),
                  Data.fromBase16("3606666f6f"), Record.of(Slot.of("a", 27), Slot.of("b", "foo")));
  }

  @Test
  public void decodeEnumStructures() {
    assertDecodes(AvroStructure.enumType("Foo", "A", "B", "C", "D"),
                  Data.fromBase16("04"), Text.from("C"));
  }

  @Test
  public void decodeArrayStructures() {
    assertDecodes(AvroStructure.arrayType(AvroStructure.longType()),
                  Data.fromBase16("04063600"), Record.of(3, 27));
  }

  @Test
  public void decodeMapStructures() {
    assertDecodes(AvroStructure.mapType(AvroStructure.longType()),
                  Data.fromBase16("0402610602623600"), Record.of(Slot.of("a", 3), Slot.of("b", 27)));
  }

  @Test
  public void decodeUnionStructures() {
    assertDecodes(AvroStructure.unionType().variant(AvroStructure.nullType())
                                           .variant(AvroStructure.stringType()),
                  Data.fromBase16("00"), Value.extant());
    assertDecodes(AvroStructure.unionType().variant(AvroStructure.nullType())
                                           .variant(AvroStructure.stringType()),
                  Data.fromBase16("020261"), Text.from("a"));
  }

  @Test
  public void decodeFixedStructures() {
    assertDecodes(AvroStructure.fixedType("quad", 4),
                  Data.fromBase16("f0e1d2c3"), Data.fromBase16("f0e1d2c3"));
  }

  public static <T> void assertDecodes(AvroType<T> type, Data data, T expected) {
    Assertions.assertDecodes(Avro.typeDecoder(type), data, expected);
  }
}
