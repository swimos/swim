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

package swim.waml;

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
import swim.repr.BooleanRepr;
import swim.repr.NumberRepr;
import swim.repr.ObjectRepr;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.waml.decl.WamlAnnex;
import swim.waml.decl.WamlCreator;
import swim.waml.decl.WamlFlatten;
import swim.waml.decl.WamlGetter;
import swim.waml.decl.WamlMarshal;
import swim.waml.decl.WamlProperty;
import swim.waml.decl.WamlSetter;
import swim.waml.decl.WamlUnmarshal;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class WamlReflectionsTests {

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

    @WamlUnmarshal
    static StringWrapper wrap(String value) {
      return new StringWrapper(value);
    }

    @WamlMarshal
    static String unwrap(StringWrapper wrapper) {
      return wrapper.value;
    }

  }

  @Test
  public void parseStringWrapper() throws ParseException {
    assertEquals(new StringWrapper("foo"),
                 Waml.parse(StringWrapper.class, "\"foo\"").getNonNull());
  }

  @Test
  public void writeStringWrapper() {
    assertEquals("\"foo\"",
                 Waml.toString(new StringWrapper("foo")));
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

    @WamlUnmarshal
    static IntWrapper wrap(int value) {
      return new IntWrapper(value);
    }

    @WamlMarshal
    static int unwrap(IntWrapper wrapper) {
      return wrapper.value;
    }

  }

  @Test
  public void parseIntWrapper() throws ParseException {
    assertEquals(new IntWrapper(42),
                 Waml.parse(IntWrapper.class, "42").getNonNull());
  }

  @Test
  public void writeIntWrapper() {
    assertEquals("42",
                 Waml.toString(new IntWrapper(42)));
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

    @WamlMarshal
    public List<Number> unwrap() {
      return this.value;
    }

    @WamlUnmarshal
    static ListWrapper wrap(List<Number> value) {
      return new ListWrapper(value);
    }

  }

  @Test
  public void parseListWrapper() throws ParseException {
    assertEquals(new ListWrapper(List.of(3, 3.14, 4)),
                 Waml.parse(ListWrapper.class, "[3, 3.14, 4]").getNonNull());
    assertEquals(new ListWrapper(List.of(3, 3.14, 4)),
                 Waml.parse(ListWrapper.class, "[3,3.14,4]").getNonNull());
  }

  @Test
  public void writeListWrapper() {
    assertEquals("[3, 3.14, 4]",
                 Waml.toString(new ListWrapper(List.of(3, 3.14, 4)),
                 WamlWriterOptions.readable()));
    assertEquals("[3,3.14,4]",
                 Waml.toString(new ListWrapper(List.of(3, 3.14, 4)),
                 WamlWriterOptions.compact()));
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
                 Waml.parse(OpaqueWrapper.class, "()").getNonNull());
    assertEquals(new OpaqueWrapper(42),
                 Waml.parse(OpaqueWrapper.class, "42").getNonNull());
    assertEquals(new OpaqueWrapper("foo"),
                 Waml.parse(OpaqueWrapper.class, "\"foo\"").getNonNull());
  }

  @Test
  public void writeOpaqueWrapper() {
    assertEquals("()",
                 Waml.toString(new OpaqueWrapper(null)));
    assertEquals("42",
                 Waml.toString(new OpaqueWrapper(42)));
    assertEquals("\"foo\"",
                 Waml.toString(new OpaqueWrapper("foo")));
  }

  public static class ImmutableWithConstructorAndGetters {

    final double x;
    final double y;

    @WamlCreator
    ImmutableWithConstructorAndGetters(@WamlProperty("x") double x,
                                       @Property("y") double y) {
      this.x = x;
      this.y = y;
    }

    @Getter
    public double x() {
      return this.x;
    }

    @WamlGetter
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
  public void parseImmutableWithConstructorAndGetters() {
    assertParses(ImmutableWithConstructorAndGetters.class,
                 new ImmutableWithConstructorAndGetters(-2.0, 3.0),
                 "{x: -2.0, y: 3.0}");
  }

  @Test
  public void writeImmutableWithConstructorAndGetters() {
    assertWrites(ImmutableWithConstructorAndGetters.class,
                 "{x: -2.0, y: 3.0}",
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

    @WamlGetter
    public double y() {
      return this.y;
    }

    @WamlSetter
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
  public void parseMutableWithNoArgConstructorAndSetters() {
    assertParses(MutableWithNoArgConstructorAndSetters.class,
                 new MutableWithNoArgConstructorAndSetters(-2.0, 3.0),
                 "{x: -2.0, y: 3.0}");
  }

  @Test
  public void writeMutableWithNoArgConstructorAndSetters() {
    assertWrites(MutableWithNoArgConstructorAndSetters.class,
                 "{x: -2.0, y: 3.0}",
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

    @WamlProperty
    final String name;

    @WamlFlatten
    @WamlProperty
    final LngLat location;

    @Creator
    public FlattenedWithWrappedCreator(@WamlProperty("name") String name,
                                       @WamlProperty("location") LngLat location) {
      this.name = name;
      this.location = location;
    }

    @WamlProperty
    public FlattenedWithWrappedCreator withName(String name) {
      return new FlattenedWithWrappedCreator(name, this.location);
    }

    @WamlProperty
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
                 "{name: \"place\", lng: -2.0, lat: 3.0}");
  }

  @Test
  public void writeFlattenedWithWrappedCreator() {
    assertWrites(FlattenedWithWrappedCreator.class,
                 "{name: \"place\", lng: -2.0, lat: 3.0}",
                 new FlattenedWithWrappedCreator("place", new LngLat(-2.0, 3.0)));
  }

  public static class FlattenedWithUnwrappedCreator {

    @WamlProperty
    final String name;

    @WamlFlatten
    @WamlProperty
    final LngLat location;

    public FlattenedWithUnwrappedCreator(String name, LngLat location) {
      this.name = name;
      this.location = location;
    }

    @WamlProperty
    public FlattenedWithUnwrappedCreator withName(String name) {
      return new FlattenedWithUnwrappedCreator(name, this.location);
    }

    @WamlProperty
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
    public static FlattenedWithUnwrappedCreator create(@WamlProperty("name") String name,
                                                       @WamlProperty("lng") double lng,
                                                       @WamlProperty("lat") double lat) {
      return new FlattenedWithUnwrappedCreator(name, new LngLat(lng, lat));
    }

  }

  @Test
  public void parseFlattenedWithUnwrappedCreator() throws ParseException {
    assertParses(FlattenedWithUnwrappedCreator.class,
                 new FlattenedWithUnwrappedCreator("place", new LngLat(-2.0, 3.0)),
                 "{name: \"place\", lng: -2.0, lat: 3.0}");
  }

  @Test
  public void writeFlattenedWithUnwrappedCreator() {
    assertWrites(FlattenedWithUnwrappedCreator.class,
                 "{name: \"place\", lng: -2.0, lat: 3.0}",
                 new FlattenedWithUnwrappedCreator("place", new LngLat(-2.0, 3.0)));
  }

  public static class FlattenedAndAnnexed {

    @WamlProperty
    final String name;

    @WamlFlatten
    @WamlProperty
    final LngLat location;

    @WamlAnnex
    @WamlProperty
    final ObjectRepr annex;

    @Creator
    public FlattenedAndAnnexed(@WamlProperty("name") String name,
                               @WamlProperty("location") LngLat location,
                               @WamlProperty("annex") ObjectRepr annex) {
      this.name = name;
      this.location = location;
      this.annex = annex;
    }

    @WamlProperty
    public FlattenedAndAnnexed withName(String name) {
      return new FlattenedAndAnnexed(name, this.location, this.annex);
    }

    @WamlProperty
    public FlattenedAndAnnexed withLocation(LngLat location) {
      return new FlattenedAndAnnexed(this.name, location, this.annex);
    }

    @WamlProperty
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
                 "{name: \"place\", lng: -2.0, lat: 3.0, elevation: 42, important: true}");
  }

  @Test
  public void writeFlattenedAndAnnexed() {
    assertWrites(FlattenedAndAnnexed.class,
                 "{name: \"place\", lng: -2.0, lat: 3.0, elevation: 42, important: true}",
                 new FlattenedAndAnnexed("place", new LngLat(-2.0, 3.0), ObjectRepr.of("elevation", NumberRepr.of(42), "important", BooleanRepr.of(true))));
  }

  public static void assertParses(Class<?> valueClass, @Nullable Object expected, String waml) {
    WamlAssertions.assertParses(Waml.parse(valueClass), expected, waml);
  }

  public static void assertWrites(Class<?> valueClass, String expected, @Nullable Object value) {
    final WamlWriter<Object> writer;
    try {
      writer = WamlFormat.get(valueClass);
    } catch (WamlProviderException cause) {
      throw new JUnitException(cause.getMessage(), cause);
    }
    WamlAssertions.assertWrites(expected, () -> writer.write(value, WamlWriterOptions.readable()));
  }

}
