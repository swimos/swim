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

package swim.avro;

import org.testng.annotations.Test;
import swim.avro.schema.AvroType;
import swim.structure.Bool;
import swim.structure.Data;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Text;
import swim.structure.Value;

public class AvroDecoderSpec {
  @Test
  public void decodeNull() {
    assertDecodes(Avro.nullType(),
                  Data.empty(), Value.extant());
  }

  @Test
  public void decodeBooleans() {
    assertDecodes(Avro.booleanType(),
                  Data.fromBase16("00"), Bool.from(false));
    assertDecodes(Avro.booleanType(),
                  Data.fromBase16("01"), Bool.from(true));
  }

  @Test
  public void decodeVarints() {
    assertDecodes(Avro.intType(),
                  Data.fromBase16("00"), Num.from(0));
    assertDecodes(Avro.intType(),
                  Data.fromBase16("01"), Num.from(-1));
    assertDecodes(Avro.intType(),
                  Data.fromBase16("02"), Num.from(1));
    assertDecodes(Avro.intType(),
                  Data.fromBase16("03"), Num.from(-2));
    assertDecodes(Avro.intType(),
                  Data.fromBase16("04"), Num.from(2));
    assertDecodes(Avro.intType(),
                  Data.fromBase16("7f"), Num.from(-64));
    assertDecodes(Avro.intType(),
                  Data.fromBase16("8001"), Num.from(64));
  }

  @Test
  public void decodeFloats() {
    assertDecodes(Avro.floatType(),
                  Data.fromBase16("00000000"), Num.from(0.0f));
    assertDecodes(Avro.floatType(),
                  Data.fromBase16("0000803f"), Num.from(1.0f));
    assertDecodes(Avro.floatType(),
                  Data.fromBase16("000080bf"), Num.from(-1.0f));
    assertDecodes(Avro.floatType(),
                  Data.fromBase16("0000c07f"), Num.from(Float.NaN));
    assertDecodes(Avro.floatType(),
                  Data.fromBase16("0000807f"), Num.from(Float.POSITIVE_INFINITY));
    assertDecodes(Avro.floatType(),
                  Data.fromBase16("000080ff"), Num.from(Float.NEGATIVE_INFINITY));
  }

  @Test
  public void decodeDoubles() {
    assertDecodes(Avro.doubleType(),
                  Data.fromBase16("0000000000000000"), Num.from(0.0));
    assertDecodes(Avro.doubleType(),
                  Data.fromBase16("000000000000f03f"), Num.from(1.0));
    assertDecodes(Avro.doubleType(),
                  Data.fromBase16("000000000000f0bf"), Num.from(-1.0));
    assertDecodes(Avro.doubleType(),
                  Data.fromBase16("000000000000f87f"), Num.from(Double.NaN));
    assertDecodes(Avro.doubleType(),
                  Data.fromBase16("000000000000f07f"), Num.from(Double.POSITIVE_INFINITY));
    assertDecodes(Avro.doubleType(),
                  Data.fromBase16("000000000000f0ff"), Num.from(Double.NEGATIVE_INFINITY));
  }

  @Test
  public void decodeData() {
    assertDecodes(Avro.dataType(),
                  Data.fromBase16("08f0e1d2c3"), Data.fromBase16("f0e1d2c3"));
  }

  @Test
  public void decodeStrings() {
    assertDecodes(Avro.stringType(),
                  Data.fromBase16("06666f6f"), Text.from("foo"));
  }

  @Test
  public void decodeRecords() {
    assertDecodes(Avro.recordType("test")
                      .field("a", Avro.longType())
                      .field("b", Avro.stringType()),
                  Data.fromBase16("3606666f6f"), Record.of(Slot.of("a", 27), Slot.of("b", "foo")));
  }

  @Test
  public void decodeEnums() {
    assertDecodes(Avro.enumType("Foo", "A", "B", "C", "D"),
                  Data.fromBase16("04"), Text.from("C"));
  }

  @Test
  public void decodeArrays() {
    assertDecodes(Avro.arrayType(Avro.longType()),
                  Data.fromBase16("04063600"), Record.of(3, 27));
  }

  @Test
  public void decodeMaps() {
    assertDecodes(Avro.mapType(Avro.longType()),
                  Data.fromBase16("0402610602623600"), Record.of(Slot.of("a", 3), Slot.of("b", 27)));
  }

  @Test
  public void decodeUnions() {
    assertDecodes(Avro.unionType().variant(Avro.nullType())
                                  .variant(Avro.stringType()),
                  Data.fromBase16("00"), Value.extant());
    assertDecodes(Avro.unionType().variant(Avro.nullType())
                                  .variant(Avro.stringType()),
                  Data.fromBase16("020261"), Text.from("a"));
  }

  @Test
  public void decodeFixed() {
    assertDecodes(Avro.fixedType("quad", 4),
                  Data.fromBase16("f0e1d2c3"), Data.fromBase16("f0e1d2c3"));
  }

  public static <T> void assertDecodes(AvroType<T> type, Data data, T expected) {
    Assertions.assertDecodes(Avro.typeDecoder(type), data, expected);
  }
}
