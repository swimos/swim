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

package swim.structure.form;

import java.util.Arrays;
import java.util.Map;
import java.util.TreeMap;
import org.testng.annotations.Test;
import swim.structure.Attr;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Value;
import swim.structure.form.classes.AnnotatedPerson;
import swim.structure.form.classes.Constant;
import swim.structure.form.classes.Generic;
import swim.structure.form.classes.GenericArray;
import swim.structure.form.classes.GenericList;
import swim.structure.form.classes.GenericMap;
import swim.structure.form.classes.HollowPerson;
import swim.structure.form.classes.Line2D;
import swim.structure.form.classes.Person;
import swim.structure.form.classes.Point;
import swim.structure.form.classes.Point2D;
import swim.structure.form.classes.PointArray;
import swim.structure.form.classes.PointList;
import swim.structure.form.classes.PointMap;
import swim.structure.form.classes.PrivatePerson;
import swim.util.Murmur3;
import static org.testng.Assert.assertEquals;

public class ClassFormSpec {
  public void assertMolds(Object object, Item item, PolyForm scope) {
    final Form<Object> form = Form.forClass(object.getClass(), scope);
    assertEquals(form.mold(object), (Object) item);
  }

  public void assertMolds(Object object, Item item) {
    assertMolds(object, item, null);
  }

  public void assertCasts(Item item, Object object, PolyForm scope) {
    final Form<Object> form = Form.forClass(object.getClass(), scope);
    assertEquals(form.cast(item), object);
  }

  public void assertCasts(Item item, Object object) {
    assertCasts(item, object, null);
  }

  @Test
  public void moldsNullToExtant() {
    final Form<Person> form = Form.forClass(Person.class);
    assertEquals(form.mold(null), Value.extant());
  }

  @Test
  public void castsExtantToNull() {
    final Form<Person> form = Form.forClass(Person.class);
    assertEquals(form.cast(Value.extant()), null);
  }

  @Test
  public void moldsClassWithStringFields() {
    assertMolds(new Person("Humpty", "Dumpty"),
                Record.of(Attr.of("Person"), Slot.of("first", "Humpty"), Slot.of("last", "Dumpty")));
  }

  @Test
  public void castsClassWithStringFields() {
    assertCasts(Record.of(Attr.of("Person"), Slot.of("first", "Humpty"), Slot.of("last", "Dumpty")),
                new Person("Humpty", "Dumpty"));
  }

  @Test
  public void moldsAnnotatedClassWithAnnotatedStringFields() {
    assertMolds(new AnnotatedPerson("Humpty", "Dumpty"),
                Record.of(Attr.of("person"), Slot.of("firstName", "Humpty"), Slot.of("lastName", "Dumpty")));
  }

  @Test
  public void castsAnnotatedClassWithAnnotatedStringFields() {
    assertCasts(Record.of(Attr.of("person"), Slot.of("firstName", "Humpty"), Slot.of("lastName", "Dumpty")),
                new AnnotatedPerson("Humpty", "Dumpty"));
  }

  @Test
  public void moldsClassWithPrivateFields() {
    assertMolds(new PrivatePerson("Humpty", "Dumpty"),
                Record.of(Attr.of("PrivatePerson"), Slot.of("first", "Humpty"), Slot.of("last", "Dumpty")));
  }

  @Test
  public void castsClassWithPrivateFields() {
    assertCasts(Record.of(Attr.of("PrivatePerson"), Slot.of("first", "Humpty"), Slot.of("last", "Dumpty")),
                new PrivatePerson("Humpty", "Dumpty"));
  }

  @Test
  @SuppressWarnings("unchecked")
  public void ignoresTransientStatic() {
    final Value v = Record.of(Attr.of("HollowPerson"), Slot.of("middle", "Fading"), Slot.of("last", "Ghost"));
    final HollowPerson hp = new HollowPerson("The", "Fading", "Ghost");
    assertMolds(hp, v);
    final HollowPerson chp = (HollowPerson) Form.forClass(HollowPerson.class).cast(v);
    assertEquals(chp.first, null);
    assertEquals(chp.getMiddle(), hp.getMiddle());
    assertEquals(chp.getLast(), hp.getLast());
  }

  @Test
  public void moldsClassWithPrimitiveHeaderFields() {
    assertMolds(new Point(2.5, 3.5),
                Record.of(Attr.of("Point", Record.of(Slot.of("x", 2.5), Slot.of("y", 3.5)))));
  }

  @Test
  public void castsClassWithPrimitiveHeaderFields() {
    assertCasts(Record.of(Attr.of("Point", Record.of(Slot.of("x", 2.5), Slot.of("y", 3.5)))),
                new Point(2.5, 3.5));
  }

  @Test
  public void moldsClassWithPrimitiveFields() {
    assertMolds(new Point2D(2.5, 3.5),
                Record.of(Attr.of("Point2D"), Slot.of("x", 2.5), Slot.of("y", 3.5)));
  }

  @Test
  public void castsClassWithPrimitiveFields() {
    assertCasts(Record.of(Attr.of("Point2D"), Slot.of("x", 2.5), Slot.of("y", 3.5)),
                new Point2D(2.5, 3.5));
  }

  @Test
  public void moldsClassWithObjectFields() {
    assertMolds(
        new Line2D(new Point2D(2.0, 3.0), new Point2D(5.0, 7.0)),
        Record.of(Attr.of("Line2D"),
                  Slot.of("p0", Record.of(Attr.of("Point2D"), Slot.of("x", 2.0), Slot.of("y", 3.0))),
                  Slot.of("p1", Record.of(Attr.of("Point2D"), Slot.of("x", 5.0), Slot.of("y", 7.0)))));
  }

  @Test
  public void castsClassWithObjectFields() {
    assertCasts(
        Record.of(Attr.of("Line2D"),
                  Slot.of("p0", Record.of(Attr.of("Point2D"), Slot.of("x", 2.0), Slot.of("y", 3.0))),
                  Slot.of("p1", Record.of(Attr.of("Point2D"), Slot.of("x", 5.0), Slot.of("y", 7.0)))),
        new Line2D(new Point2D(2.0, 3.0), new Point2D(5.0, 7.0)));
  }

  @Test
  public void moldsClassWithGenericFields() {
    assertMolds(new Generic<String>("string"),
                Record.of(Attr.of("Generic", Record.of(Slot.of("value", "string")))));
    assertMolds(new Generic<Integer>(2),
                Record.of(Attr.of("Generic", Record.of(Slot.of("value", 2)))));
  }

  @Test
  public void castsClassWithGenericFields() {
    assertCasts(Record.of(Attr.of("Generic", Record.of(Slot.of("value", "string")))),
                new Generic<String>("string"));
    assertCasts(Record.of(Attr.of("Generic", Record.of(Slot.of("value", 2)))),
                new Generic<Integer>(2));
  }

  @Test
  public void moldsClassWithFinalFields() {
    assertMolds(new Constant<String>("string"),
                Record.of(Attr.of("Constant", Record.of(Slot.of("value", "string")))));
    assertMolds(new Constant<Integer>(2),
                Record.of(Attr.of("Constant", Record.of(Slot.of("value", 2)))));
  }

  @Test
  public void castsClassWithFinalFields() {
    assertCasts(Record.of(Attr.of("Constant", Record.of(Slot.of("value", "string")))),
                new Constant<String>("string"));
    assertCasts(Record.of(Attr.of("Constant", Record.of(Slot.of("value", 2)))),
                new Constant<Integer>(2));
  }

  @Test
  public void moldsClassWithObjectArrayFields() {
    final Point2D[] array = {new Point2D(1.0, -1.0), new Point2D(-1.0, 1.0)};
    assertMolds(new PointArray(array),
                Record.of(Attr.of("PointArray"),
                          Slot.of("array", Record.of(Record.of(Attr.of("Point2D"),
                                                               Slot.of("x", 1.0), Slot.of("y", -1.0)),
                                                     Record.of(Attr.of("Point2D"),
                                                               Slot.of("x", -1.0), Slot.of("y", 1.0))))));
  }

  @Test
  public void castsClassWithObjectArrayFields() {
    final Point2D[] array = {new Point2D(1.0, -1.0), new Point2D(-1.0, 1.0)};
    assertCasts(Record.of(Attr.of("PointArray"),
                          Slot.of("array", Record.of(Record.of(Attr.of("Point2D"),
                                                               Slot.of("x", 1.0), Slot.of("y", -1.0)),
                                                     Record.of(Attr.of("Point2D"),
                                                               Slot.of("x", -1.0), Slot.of("y", 1.0))))),
                new PointArray(array));
  }

  @Test
  public void moldsClassWithGenericArrayFields() {
    assertMolds(new GenericArray<Point2D>(new Point2D[] {new Point2D(1.0, -1.0), new Point2D(-1.0, 1.0)}),
                Record.of(Attr.of("GenericArray"),
                          Slot.of("array", Record.of(Record.of(Attr.of("Point2D"),
                                                               Slot.of("x", 1.0), Slot.of("y", -1.0)),
                                                     Record.of(Attr.of("Point2D"),
                                                               Slot.of("x", -1.0), Slot.of("y", 1.0))))),
                new PolyForm().addClass(Point2D.class));
  }

  @Test
  public void castsClassWithGenericArrayFields() {
    assertCasts(Record.of(Attr.of("GenericArray"),
                          Slot.of("array", Record.of(Record.of(Attr.of("Point2D"),
                                                               Slot.of("x", 1.0), Slot.of("y", -1.0)),
                                                     Record.of(Attr.of("Point2D"),
                                                               Slot.of("x", -1.0), Slot.of("y", 1.0))))),
                new GenericArray<Point2D>(new Point2D[] {new Point2D(1.0, -1.0), new Point2D(-1.0, 1.0)}),
                new PolyForm().addClass(Point2D.class));
  }

  @Test
  public void moldsClassWithObjectCollectionFields() {
    assertMolds(new PointList(Arrays.asList(new Point2D(1.0, -1.0), new Point2D(-1.0, 1.0))),
                Record.of(Attr.of("PointList"),
                          Slot.of("list", Record.of(Record.of(Attr.of("Point2D"),
                                                              Slot.of("x", 1.0), Slot.of("y", -1.0)),
                                                    Record.of(Attr.of("Point2D"),
                                                              Slot.of("x", -1.0), Slot.of("y", 1.0))))));
  }

  @Test
  public void castsClassWithObjectCollectionFields() {
    assertCasts(Record.of(Attr.of("PointList"),
                          Slot.of("list", Record.of(Record.of(Attr.of("Point2D"),
                                                              Slot.of("x", 1.0), Slot.of("y", -1.0)),
                                                    Record.of(Attr.of("Point2D"),
                                                              Slot.of("x", -1.0), Slot.of("y", 1.0))))),
                new PointList(Arrays.asList(new Point2D(1.0, -1.0), new Point2D(-1.0, 1.0))));
  }

  @Test
  public void moldsClassWithGenericCollectionFields() {
    assertMolds(new GenericList<Point2D>(Arrays.asList(new Point2D(1.0, -1.0), new Point2D(-1.0, 1.0))),
                Record.of(Attr.of("GenericList"),
                          Slot.of("list", Record.of(Record.of(Attr.of("Point2D"),
                                                              Slot.of("x", 1.0), Slot.of("y", -1.0)),
                                                    Record.of(Attr.of("Point2D"),
                                                              Slot.of("x", -1.0), Slot.of("y", 1.0))))),
                new PolyForm().addClass(Point2D.class));
  }

  @Test
  public void castsClassWithGenericCollectionFields() {
    assertCasts(Record.of(Attr.of("GenericList"),
                          Slot.of("list", Record.of(Record.of(Attr.of("Point2D"),
                                                              Slot.of("x", 1.0), Slot.of("y", -1.0)),
                                                    Record.of(Attr.of("Point2D"),
                                                              Slot.of("x", -1.0), Slot.of("y", 1.0))))),
                new GenericList<Point2D>(Arrays.asList(new Point2D(1.0, -1.0), new Point2D(-1.0, 1.0))),
                new PolyForm().addClass(Point2D.class));
  }

  @Test
  public void moldsClassWithObjectMapFields() {
    final Map<String, Point2D> map = new TreeMap<String, Point2D>();
    map.put("p", new Point2D(1.0, 0.0));
    map.put("q", new Point2D(0.0, 1.0));
    assertMolds(new PointMap(map),
                Record.of(Attr.of("PointMap"),
                          Slot.of("map", Record.of(Slot.of("p", Record.of(Attr.of("Point2D"),
                                                                          Slot.of("x", 1.0),
                                                                          Slot.of("y", 0.0))),
                                                   Slot.of("q", Record.of(Attr.of("Point2D"),
                                                                          Slot.of("x", 0.0),
                                                                          Slot.of("y", 1.0)))))));
  }

  @Test
  public void castsClassWithObjectMapFields() {
    final Map<String, Point2D> map = new TreeMap<String, Point2D>();
    map.put("p", new Point2D(1.0, 0.0));
    map.put("q", new Point2D(0.0, 1.0));
    assertCasts(Record.of(Attr.of("PointMap"),
                          Slot.of("map", Record.of(Slot.of("p", Record.of(Attr.of("Point2D"),
                                                                          Slot.of("x", 1.0),
                                                                          Slot.of("y", 0.0))),
                                                   Slot.of("q", Record.of(Attr.of("Point2D"),
                                                                          Slot.of("x", 0.0),
                                                                          Slot.of("y", 1.0)))))),
                new PointMap(map));
  }

  @Test
  public void moldsClassWithGenericMapFields() {
    final Map<String, Point2D> map = new TreeMap<String, Point2D>();
    map.put("p", new Point2D(1.0, 0.0));
    map.put("q", new Point2D(0.0, 1.0));
    assertMolds(new GenericMap<String, Point2D>(map),
                Record.of(Attr.of("GenericMap"),
                          Slot.of("map", Record.of(Slot.of("p", Record.of(Attr.of("Point2D"),
                                                                          Slot.of("x", 1.0),
                                                                          Slot.of("y", 0.0))),
                                                   Slot.of("q", Record.of(Attr.of("Point2D"),
                                                                          Slot.of("x", 0.0),
                                                                          Slot.of("y", 1.0)))))),
                new PolyForm().addClass(Point2D.class));
  }

  @Test
  public void castsClassWithGenericMapFields() {
    final Map<String, Point2D> map = new TreeMap<String, Point2D>();
    map.put("p", new Point2D(1.0, 0.0));
    map.put("q", new Point2D(0.0, 1.0));
    assertCasts(Record.of(Attr.of("GenericMap"),
                          Slot.of("map", Record.of(Slot.of("p", Record.of(Attr.of("Point2D"),
                                                                          Slot.of("x", 1.0),
                                                                          Slot.of("y", 0.0))),
                                                   Slot.of("q", Record.of(Attr.of("Point2D"),
                                                                          Slot.of("x", 0.0),
                                                                          Slot.of("y", 1.0)))))),
                new GenericMap<String, Point2D>(map),
                new PolyForm().addClass(Point2D.class));
  }

  public static class HeadTail<T> {
    public final T head;
    public final HeadTail<T> tail;
    public HeadTail(T head, HeadTail<T> tail) {
      this.head = head;
      this.tail = tail;
    }
    HeadTail() {
      // Form.cast constructor
      this.head = null;
      this.tail = null;
    }
    @Override
    public boolean equals(Object other) {
      if (other instanceof HeadTail<?>) {
        final HeadTail<?> that = (HeadTail<?>) other;
        return (this.head == null ? that.head == null : this.head.equals(that.head))
            && (this.tail == null ? that.tail == null : this.tail.equals(that.tail));
      }
      return false;
    }
    @Override
    public int hashCode() {
      return Murmur3.mash(Murmur3.mix(Murmur3.hash(this.head), Murmur3.hash(this.tail)));
    }
    @Override
    public String toString() {
      return "HeadTail(" + this.head + ", " + this.tail + ")";
    }
  }

  @Test
  public void moldsClassWithRecursiveFields() {
    assertMolds(new HeadTail<String>("a", new HeadTail<String>("b", null)),
                Record.of(Attr.of("HeadTail"),
                          Slot.of("head", "a"),
                          Slot.of("tail", Record.of(Attr.of("HeadTail"),
                                                    Slot.of("head", "b"),
                                                    Slot.of("tail")))));
  }

  @Test
  public void castsClassWithRecursiveFields() {
    assertCasts(Record.of(Attr.of("HeadTail"),
                          Slot.of("head", "a"),
                          Slot.of("tail", Record.of(Attr.of("HeadTail"),
                                                    Slot.of("head", "b"),
                                                    Slot.of("tail")))),
                new HeadTail<String>("a", new HeadTail<String>("b", null)));
  }

  @Test
  public void moldsClassArray() {
    final PrivatePerson[] arr = {new PrivatePerson("Humpty", "Dumpty"), new PrivatePerson("Satona", "Wall")};
    assertMolds(arr, Record.of(
                        Record.of(Attr.of("PrivatePerson"),
                                  Slot.of("first", "Humpty"),
                                  Slot.of("last", "Dumpty")),
                        Record.of(Attr.of("PrivatePerson"),
                                  Slot.of("first", "Satona"),
                                  Slot.of("last", "Wall"))));
  }

  @Test
  public void castsClassArray() {
    final PrivatePerson[] arr = {new PrivatePerson("Humpty", "Dumpty"), new PrivatePerson("Satona", "Wall")};
    assertCasts(Record.of(
                    Record.of(Attr.of("PrivatePerson"),
                              Slot.of("first", "Humpty"),
                              Slot.of("last", "Dumpty")),
                    Record.of(Attr.of("PrivatePerson"),
                              Slot.of("first", "Satona"),
                              Slot.of("last", "Wall"))),
                arr);
  }
}
