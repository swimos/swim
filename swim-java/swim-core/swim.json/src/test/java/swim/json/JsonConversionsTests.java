// Copyright 2015-2022 Swim.inc
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

import java.util.List;
import java.util.Objects;
import org.junit.jupiter.api.Test;
import swim.annotations.FromForm;
import swim.annotations.IntoForm;
import swim.annotations.Nullable;
import swim.codec.ParseException;
import swim.util.Murmur3;
import swim.util.Notation;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class JsonConversionsTests {

  public static class StringWrapper {

    String value;

    StringWrapper(String value) {
      this.value = value;
    }

    @Override
    public boolean equals(@Nullable Object other) {
      if (other instanceof StringWrapper that) {
        return Objects.equals(this.value, that.value);
      }
      return false;
    }

    @Override
    public int hashCode() {
      return Murmur3.mash(Murmur3.mix(Murmur3.seed(StringWrapper.class),
          Objects.hashCode(this.value)));
    }

    @Override
    public String toString() {
      return Notation.of().beginInvokeNew("StringWrapper")
                          .appendArgument(this.value)
                          .toString();
    }

    @FromJson
    public static StringWrapper fromJson(String value) {
      return new StringWrapper(value);
    }

    @IntoJson
    public static String intoJson(StringWrapper wrapper) {
      return wrapper.value;
    }

  }

  @Test
  public void parseStringWrapper() throws ParseException {
    assertEquals(new StringWrapper("foo"),
                 Json.parse(StringWrapper.class, "\"foo\"").getNonNull());
  }

  @Test
  public void writeStringWrapper() {
    assertEquals("\"foo\"",
                 Json.toString(new StringWrapper("foo")));
  }

  public static class IntWrapper {

    int value;

    IntWrapper(int value) {
      this.value = value;
    }

    @Override
    public boolean equals(@Nullable Object other) {
      if (other instanceof IntWrapper that) {
        return this.value == that.value;
      }
      return false;
    }

    @Override
    public int hashCode() {
      return Murmur3.mash(Murmur3.mix(Murmur3.seed(IntWrapper.class),
          Murmur3.hash(this.value)));
    }

    @Override
    public String toString() {
      return Notation.of().beginInvokeNew("IntWrapper")
                          .appendArgument(this.value)
                          .toString();
    }

    @FromJson
    public static IntWrapper fromJson(int value) {
      return new IntWrapper(value);
    }

    @IntoJson
    public static int intoJson(IntWrapper wrapper) {
      return wrapper.value;
    }

  }

  @Test
  public void parseIntWrapper() throws ParseException {
    assertEquals(new IntWrapper(42),
                 Json.parse(IntWrapper.class, "42").getNonNull());
  }

  @Test
  public void writeIntWrapper() {
    assertEquals("42",
                 Json.toString(new IntWrapper(42)));
  }

  public static class ListWrapper {

    List<Number> value;

    ListWrapper(List<Number> value) {
      this.value = value;
    }

    @Override
    public boolean equals(@Nullable Object other) {
      if (other instanceof ListWrapper that) {
        return Objects.equals(this.value, that.value);
      }
      return false;
    }

    @Override
    public int hashCode() {
      return Murmur3.mash(Murmur3.mix(Murmur3.seed(ListWrapper.class),
          Objects.hashCode(this.value)));
    }

    @Override
    public String toString() {
      return Notation.of().beginInvokeNew("ListWrapper")
                          .appendArgument(this.value)
                          .toString();
    }

    @IntoJson
    public List<Number> intoJson() {
      return this.value;
    }

    @FromJson
    public static ListWrapper fromJson(List<Number> value) {
      return new ListWrapper(value);
    }

  }

  @Test
  public void parseListWrapper() throws ParseException {
    assertEquals(new ListWrapper(List.of(3, 3.14, 4)),
                 Json.parse(ListWrapper.class, "[3,3.14,4]").getNonNull());
  }

  @Test
  public void writeListWrapper() {
    assertEquals("[3,3.14,4]",
                 Json.toString(new ListWrapper(List.of(3, 3.14, 4))));
  }

  public static class OpaqueWrapper {

    @Nullable Object value;

    OpaqueWrapper(@Nullable Object value) {
      this.value = value;
    }

    @Override
    public boolean equals(@Nullable Object other) {
      if (other instanceof OpaqueWrapper that) {
        return Objects.equals(this.value, that.value);
      }
      return false;
    }

    @Override
    public int hashCode() {
      return Murmur3.mash(Murmur3.mix(Murmur3.seed(OpaqueWrapper.class),
          Objects.hashCode(this.value)));
    }

    @Override
    public String toString() {
      return Notation.of().beginInvokeNew("OpaqueWrapper")
                          .appendArgument(this.value)
                          .toString();
    }

    @FromForm
    public static OpaqueWrapper fromJson(@Nullable Object value) {
      return new OpaqueWrapper(value);
    }

    @IntoForm
    public static @Nullable Object intoJson(OpaqueWrapper wrapper) {
      return wrapper.value;
    }

  }

  @Test
  public void parseOpaqueWrapper() throws ParseException {
    assertEquals(new OpaqueWrapper(null),
                 Json.parse(OpaqueWrapper.class, "null").getNonNull());
    assertEquals(new OpaqueWrapper(42),
                 Json.parse(OpaqueWrapper.class, "42").getNonNull());
    assertEquals(new OpaqueWrapper("foo"),
                 Json.parse(OpaqueWrapper.class, "\"foo\"").getNonNull());
  }

  @Test
  public void writeOpaqueWrapper() {
    assertEquals("null",
                 Json.toString(new OpaqueWrapper(null)));
    assertEquals("42",
                 Json.toString(new OpaqueWrapper(42)));
    assertEquals("\"foo\"",
                 Json.toString(new OpaqueWrapper("foo")));
  }

}
