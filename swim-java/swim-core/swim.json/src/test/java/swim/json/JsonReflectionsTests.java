// Copyright 2015-2023 Nstream, inc.
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
import org.junit.platform.commons.JUnitException;
import swim.annotations.Nullable;
import swim.codec.ParseException;
import swim.decl.Creator;
import swim.decl.Getter;
import swim.decl.Initializer;
import swim.decl.Marshal;
import swim.decl.Property;
import swim.decl.Setter;
import swim.decl.Unmarshal;
import swim.json.decl.JsonAnnex;
import swim.json.decl.JsonCreator;
import swim.json.decl.JsonFlatten;
import swim.json.decl.JsonGetter;
import swim.json.decl.JsonMarshal;
import swim.json.decl.JsonProperty;
import swim.json.decl.JsonSetter;
import swim.json.decl.JsonUnmarshal;
import swim.repr.BooleanRepr;
import swim.repr.NumberRepr;
import swim.repr.ObjectRepr;
import swim.util.Murmur3;
import swim.util.Notation;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class JsonReflectionsTests {

  public static class StringWrapper {

    String value;

    StringWrapper(String value) {
      this.value = value;
    }

    @Override
    public boolean equals(@Nullable Object other) {
      if (this == other) {
        return true;
      } else if (other instanceof StringWrapper that) {
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

    @JsonUnmarshal
    static StringWrapper wrap(String value) {
      return new StringWrapper(value);
    }

    @JsonMarshal
    static String unwrap(StringWrapper wrapper) {
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
      if (this == other) {
        return true;
      } else if (other instanceof IntWrapper that) {
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

    @JsonUnmarshal
    static IntWrapper wrap(int value) {
      return new IntWrapper(value);
    }

    @JsonMarshal
    static int unwrap(IntWrapper wrapper) {
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
      if (this == other) {
        return true;
      } else if (other instanceof ListWrapper that) {
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

    @JsonMarshal
    public List<Number> unwrap() {
      return this.value;
    }

    @JsonUnmarshal
    static ListWrapper wrap(List<Number> value) {
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
      if (this == other) {
        return true;
      } else if (other instanceof OpaqueWrapper that) {
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

    @Unmarshal
    public static OpaqueWrapper wrap(@Nullable Object value) {
      return new OpaqueWrapper(value);
    }

    @Marshal
    public static @Nullable Object unwrap(OpaqueWrapper wrapper) {
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

  public static class ImmutableWithConstructorAndGetters {

    final double x;
    final double y;

    @JsonCreator
    ImmutableWithConstructorAndGetters(@JsonProperty("x") double x,
                                       @Property("y") double y) {
      this.x = x;
      this.y = y;
    }

    @Getter
    public double x() {
      return this.x;
    }

    @JsonGetter
    public double y() {
      return this.y;
    }

    @Override
    public boolean equals(@Nullable Object other) {
      if (this == other) {
        return true;
      } else if (other instanceof ImmutableWithConstructorAndGetters that) {
        return this.x == that.x && this.y == that.y;
      }
      return false;
    }

    @Override
    public int hashCode() {
      return Murmur3.mash(Murmur3.mix(Murmur3.mix(
          Murmur3.seed(ImmutableWithConstructorAndGetters.class),
          Murmur3.hash(this.x)), Murmur3.hash(this.x)));
    }

    @Override
    public String toString() {
      return Notation.of().beginInvokeNew("ImmutableWithConstructorAndGetters")
                          .appendArgument(this.x)
                          .appendArgument(this.y)
                          .endInvoke()
                          .toString();
    }

  }

  @Test
  public void parseImmutableWithConstructorAndGetters() throws ParseException {
    assertParses(ImmutableWithConstructorAndGetters.class,
                 new ImmutableWithConstructorAndGetters(-2.0, 3.0),
                 "{\"x\": -2.0, \"y\": 3.0}");
  }

  @Test
  public void writeImmutableWithConstructorAndGetters() {
    assertWrites(ImmutableWithConstructorAndGetters.class,
                 "{\"x\":-2.0,\"y\":3.0}",
                 new ImmutableWithConstructorAndGetters(-2.0, 3.0));
  }

  public static class MutableWithNoArgConstructorAndSetters {

    double x;
    double y;

    MutableWithNoArgConstructorAndSetters(double x, double y) {
      this.x = x;
      this.y = y;
    }

    MutableWithNoArgConstructorAndSetters() {
      this.x = Double.NaN;
      this.y = Double.NaN;
    }

    @Getter
    public double x() {
      return this.x;
    }

    @JsonGetter
    public double y() {
      return this.y;
    }

    @JsonSetter
    public void setX(double x) {
      this.x = x;
    }

    @Setter
    public void setY(double y) {
      this.y = y;
    }

    @Override
    public boolean equals(@Nullable Object other) {
      if (this == other) {
        return true;
      } else if (other instanceof MutableWithNoArgConstructorAndSetters that) {
        return this.x == that.x && this.y == that.y;
      }
      return false;
    }

    @Override
    public int hashCode() {
      return Murmur3.mash(Murmur3.mix(Murmur3.mix(
          Murmur3.seed(MutableWithNoArgConstructorAndSetters.class),
          Murmur3.hash(this.x)), Murmur3.hash(this.x)));
    }

    @Override
    public String toString() {
      return Notation.of().beginInvokeNew("MutableWithNoArgConstructorAndSetters")
                          .appendArgument(this.x)
                          .appendArgument(this.y)
                          .endInvoke()
                          .toString();
    }

  }

  @Test
  public void parseMutableWithNoArgConstructorAndSetters() throws ParseException {
    assertParses(MutableWithNoArgConstructorAndSetters.class,
                 new MutableWithNoArgConstructorAndSetters(-2.0, 3.0),
                 "{\"x\": -2.0, \"y\": 3.0}");
  }

  @Test
  public void writeMutableWithNoArgConstructorAndSetters() {
    assertWrites(MutableWithNoArgConstructorAndSetters.class,
                 "{\"x\":-2.0,\"y\":3.0}",
                 new MutableWithNoArgConstructorAndSetters(-2.0, 3.0));
  }

  public static class LngLat {

    @Property
    final double lng;

    @Property
    final double lat;

    @Creator
    public LngLat(@Property("lng") double lng,
                  @Property("lat") double lat) {
      this.lng = lng;
      this.lat = lat;
    }

    @Property
    public LngLat withLng(double lng) {
      return new LngLat(lng, this.lat);
    }

    @Property
    public LngLat withLat(double lat) {
      return new LngLat(this.lng, lat);
    }

    @Override
    public boolean equals(@Nullable Object other) {
      if (this == other) {
        return true;
      } else if (other instanceof LngLat that) {
        return this.lng == that.lng && this.lat == that.lat;
      }
      return false;
    }

    @Override
    public int hashCode() {
      return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.seed(LngLat.class),
          Murmur3.hash(this.lng)), Murmur3.hash(this.lng)));
    }

    @Override
    public String toString() {
      return Notation.of().beginInvokeNew("LngLat")
                          .appendArgument(this.lng)
                          .appendArgument(this.lat)
                          .endInvoke()
                          .toString();
    }

    static final LngLat ORIGIN = new LngLat(0.0, 0.0);

    @Initializer
    public static LngLat origin() {
      return ORIGIN;
    }

  }

  public static class FlattenedWithWrappedCreator {

    @JsonProperty
    final String name;

    @JsonFlatten
    @JsonProperty
    final LngLat location;

    @Creator
    public FlattenedWithWrappedCreator(@JsonProperty("name") String name,
                                       @JsonProperty("location") LngLat location) {
      this.name = name;
      this.location = location;
    }

    @JsonProperty
    public FlattenedWithWrappedCreator withName(String name) {
      return new FlattenedWithWrappedCreator(name, this.location);
    }

    @JsonProperty
    public FlattenedWithWrappedCreator withLocation(LngLat location) {
      return new FlattenedWithWrappedCreator(this.name, location);
    }

    @Override
    public boolean equals(@Nullable Object other) {
      if (this == other) {
        return true;
      } else if (other instanceof FlattenedWithWrappedCreator that) {
        return Objects.equals(this.name, that.name)
            && Objects.equals(this.location, that.location);
      }
      return false;
    }

    @Override
    public int hashCode() {
      return Murmur3.mash(Murmur3.mix(Murmur3.mix(
          Murmur3.seed(FlattenedWithWrappedCreator.class),
          Objects.hashCode(this.name)), Objects.hashCode(this.location)));
    }

    @Override
    public String toString() {
      return Notation.of().beginInvokeNew("FlattenedWithWrappedCreator")
                          .appendArgument(this.name)
                          .appendArgument(this.location)
                          .endInvoke()
                          .toString();
    }

  }

  @Test
  public void parseFlattenedWithWrappedCreator() throws ParseException {
    assertParses(FlattenedWithWrappedCreator.class,
                 new FlattenedWithWrappedCreator("place", new LngLat(-2.0, 3.0)),
                 "{\"name\": \"place\", \"lng\": -2.0, \"lat\": 3.0}");
  }

  @Test
  public void writeFlattenedWithWrappedCreator() {
    assertWrites(FlattenedWithWrappedCreator.class,
                 "{\"name\":\"place\",\"lng\":-2.0,\"lat\":3.0}",
                 new FlattenedWithWrappedCreator("place", new LngLat(-2.0, 3.0)));
  }

  public static class FlattenedWithUnwrappedCreator {

    @JsonProperty
    final String name;

    @JsonFlatten
    @JsonProperty
    final LngLat location;

    public FlattenedWithUnwrappedCreator(String name, LngLat location) {
      this.name = name;
      this.location = location;
    }

    @JsonProperty
    public FlattenedWithUnwrappedCreator withName(String name) {
      return new FlattenedWithUnwrappedCreator(name, this.location);
    }

    @JsonProperty
    public FlattenedWithUnwrappedCreator withLocation(LngLat location) {
      return new FlattenedWithUnwrappedCreator(this.name, location);
    }

    @Override
    public boolean equals(@Nullable Object other) {
      if (this == other) {
        return true;
      } else if (other instanceof FlattenedWithUnwrappedCreator that) {
        return Objects.equals(this.name, that.name)
            && Objects.equals(this.location, that.location);
      }
      return false;
    }

    @Override
    public int hashCode() {
      return Murmur3.mash(Murmur3.mix(Murmur3.mix(
          Murmur3.seed(FlattenedWithUnwrappedCreator.class),
          Objects.hashCode(this.name)), Objects.hashCode(this.location)));
    }

    @Override
    public String toString() {
      return Notation.of().beginInvokeNew("FlattenedWithUnwrappedCreator")
                          .appendArgument(this.name)
                          .appendArgument(this.location)
                          .endInvoke()
                          .toString();
    }

    @Creator
    public static FlattenedWithUnwrappedCreator create(@JsonProperty("name") String name,
                                                       @JsonProperty("lng") double lng,
                                                       @JsonProperty("lat") double lat) {
      return new FlattenedWithUnwrappedCreator(name, new LngLat(lng, lat));
    }

  }

  @Test
  public void parseFlattenedWithUnwrappedCreator() throws ParseException {
    assertParses(FlattenedWithUnwrappedCreator.class,
                 new FlattenedWithUnwrappedCreator("place", new LngLat(-2.0, 3.0)),
                 "{\"name\": \"place\", \"lng\": -2.0, \"lat\": 3.0}");
  }

  @Test
  public void writeFlattenedWithUnwrappedCreator() {
    assertWrites(FlattenedWithUnwrappedCreator.class,
                 "{\"name\":\"place\",\"lng\":-2.0,\"lat\":3.0}",
                 new FlattenedWithUnwrappedCreator("place", new LngLat(-2.0, 3.0)));
  }

  public static class FlattenedAndAnnexed {

    @JsonProperty
    final String name;

    @JsonFlatten
    @JsonProperty
    final LngLat location;

    @JsonAnnex
    @JsonProperty
    final ObjectRepr annex;

    @Creator
    public FlattenedAndAnnexed(@JsonProperty("name") String name,
                               @JsonProperty("location") LngLat location,
                               @JsonProperty("annex") ObjectRepr annex) {
      this.name = name;
      this.location = location;
      this.annex = annex;
    }

    @JsonProperty
    public FlattenedAndAnnexed withName(String name) {
      return new FlattenedAndAnnexed(name, this.location, this.annex);
    }

    @JsonProperty
    public FlattenedAndAnnexed withLocation(LngLat location) {
      return new FlattenedAndAnnexed(this.name, location, this.annex);
    }

    @JsonProperty
    public FlattenedAndAnnexed withAnnex(ObjectRepr annex) {
      return new FlattenedAndAnnexed(this.name, this.location, annex);
    }

    @Override
    public boolean equals(@Nullable Object other) {
      if (this == other) {
        return true;
      } else if (other instanceof FlattenedAndAnnexed that) {
        return Objects.equals(this.name, that.name)
            && Objects.equals(this.location, that.location)
            && Objects.equals(this.annex, that.annex);
      }
      return false;
    }

    @Override
    public int hashCode() {
      return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(
          Murmur3.seed(FlattenedAndAnnexed.class),
          Objects.hashCode(this.name)), Objects.hashCode(this.location)),
          Objects.hashCode(this.annex)));
    }

    @Override
    public String toString() {
      return Notation.of().beginInvokeNew("FlattenedAndAnnexed")
                          .appendArgument(this.name)
                          .appendArgument(this.location)
                          .appendArgument(this.annex)
                          .endInvoke()
                          .toString();
    }

  }

  @Test
  public void parseFlattenedAndAnnexed() throws ParseException {
    assertParses(FlattenedAndAnnexed.class,
                 new FlattenedAndAnnexed("place", new LngLat(-2.0, 3.0), ObjectRepr.of("elevation", NumberRepr.of(42), "important", BooleanRepr.of(true))),
                 "{\"name\": \"place\", \"lng\": -2.0, \"lat\": 3.0, \"elevation\": 42, \"important\": true}");
  }

  @Test
  public void writeFlattenedAndAnnexed() {
    assertWrites(FlattenedAndAnnexed.class,
                 "{\"name\":\"place\",\"lng\":-2.0,\"lat\":3.0,\"elevation\":42,\"important\":true}",
                 new FlattenedAndAnnexed("place", new LngLat(-2.0, 3.0), ObjectRepr.of("elevation", NumberRepr.of(42), "important", BooleanRepr.of(true))));
  }

  public static void assertParses(Class<?> valueClass, @Nullable Object expected, String json) {
    JsonAssertions.assertParses(Json.parse(valueClass), expected, json);
  }

  public static void assertWrites(Class<?> valueClass, String expected, @Nullable Object value) {
    final JsonWriter<Object> writer;
    try {
      writer = JsonFormat.get(valueClass);
    } catch (JsonProviderException cause) {
      throw new JUnitException(cause.getMessage(), cause);
    }
    JsonAssertions.assertWrites(expected, () -> writer.write(value, JsonWriterOptions.standard()));
  }

}
