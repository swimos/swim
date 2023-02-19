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

import org.junit.jupiter.api.Test;
import swim.expr.ContextExpr;
import swim.expr.GlobalExpr;
import swim.expr.operator.PlusExpr;
import swim.expr.selector.ChildExpr;
import swim.expr.selector.ChildrenExpr;
import swim.expr.selector.DescendantsExpr;
import swim.expr.selector.InvokeExpr;
import swim.expr.selector.MemberExpr;
import swim.repr.ArrayRepr;
import swim.repr.ObjectRepr;
import swim.repr.Repr;
import swim.repr.TermRepr;

public class WamlExprWriterTests {

  @Test
  public void writeAttributedIdentifiers() {
    assertWrites("@hello test",
                 TermRepr.of(ContextExpr.child(Repr.of("test"))).withAttr("hello"));
  }

  @Test
  public void writeExprsInArrays() {
    assertWrites("[a]",
                 ArrayRepr.of(TermRepr.of(ContextExpr.child(Repr.of("a")))));
    assertWrites("[a + b]",
                 ArrayRepr.of(TermRepr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))))),
                 WamlWriterOptions.readable());
    assertWrites("[a+b]",
                 ArrayRepr.of(TermRepr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))))),
                 WamlWriterOptions.compact());
    assertWrites("[a, b]",
                 ArrayRepr.of(TermRepr.of(ContextExpr.child(Repr.of("a"))), TermRepr.of(ContextExpr.child(Repr.of("b")))),
                 WamlWriterOptions.readable());
    assertWrites("[a,b]",
                 ArrayRepr.of(TermRepr.of(ContextExpr.child(Repr.of("a"))), TermRepr.of(ContextExpr.child(Repr.of("b")))),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeExprsInObjectValues() {
    assertWrites("{x: a}",
                 ObjectRepr.of("x", TermRepr.of(ContextExpr.child(Repr.of("a")))),
                 WamlWriterOptions.readable());
    assertWrites("{x:a}",
                 ObjectRepr.of("x", TermRepr.of(ContextExpr.child(Repr.of("a")))),
                 WamlWriterOptions.compact());
    assertWrites("{x: a + b}",
                 ObjectRepr.of("x", TermRepr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))))),
                 WamlWriterOptions.readable());
    assertWrites("{x:a+b}",
                 ObjectRepr.of("x", TermRepr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))))),
                 WamlWriterOptions.compact());
    assertWrites("{x: a, y: b}",
                 ObjectRepr.of("x", TermRepr.of(ContextExpr.child(Repr.of("a"))), "y", TermRepr.of(ContextExpr.child(Repr.of("b")))),
                 WamlWriterOptions.readable());
    assertWrites("{x:a,y:b}",
                 ObjectRepr.of("x", TermRepr.of(ContextExpr.child(Repr.of("a"))), "y", TermRepr.of(ContextExpr.child(Repr.of("b")))),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeExprsInMarkup() {
    assertWrites("<<Hello, {audience}!>>",
                 ArrayRepr.of("Hello, ", ContextExpr.child(Repr.of("audience")), "!").asMarkup());
  }

  @Test
  public void writeArrayOperands() {
    assertWrites("[1, 2] + [3, 4]",
                 TermRepr.of(PlusExpr.of(ArrayRepr.of(1, 2), ArrayRepr.of(3, 4))),
                 WamlWriterOptions.readable());
    assertWrites("[1,2]+[3,4]",
                 TermRepr.of(PlusExpr.of(ArrayRepr.of(1, 2), ArrayRepr.of(3, 4))),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeAttributedArrayOperands() {
    assertWrites("@vec [1, 2] + @vec [3, 4]",
                 TermRepr.of(PlusExpr.of(ArrayRepr.of(1, 2).withAttr("vec"), ArrayRepr.of(3, 4).withAttr("vec"))),
                 WamlWriterOptions.readable());
    assertWrites("@vec[1,2]+@vec[3,4]",
                 TermRepr.of(PlusExpr.of(ArrayRepr.of(1, 2).withAttr("vec"), ArrayRepr.of(3, 4).withAttr("vec"))),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeObjectOperands() {
    assertWrites("{x: 1, y: 2} + {x: 3, y: 4}",
                 TermRepr.of(PlusExpr.of(ObjectRepr.of("x", 1, "y", 2), ObjectRepr.of("x", 3, "y", 4))),
                 WamlWriterOptions.readable());
    assertWrites("{x:1,y:2}+{x:3,y:4}",
                 TermRepr.of(PlusExpr.of(ObjectRepr.of("x", 1, "y", 2), ObjectRepr.of("x", 3, "y", 4))),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeAttributedObjectOperands() {
    assertWrites("@vec {x: 1, y: 2} + @vec {x: 3, y: 4}",
                 TermRepr.of(PlusExpr.of(ObjectRepr.of("x", 1, "y", 2).withAttr("vec"), ObjectRepr.of("x", 3, "y", 4).withAttr("vec"))),
                 WamlWriterOptions.readable());
    assertWrites("@vec{x:1,y:2}+@vec{x:3,y:4}",
                 TermRepr.of(PlusExpr.of(ObjectRepr.of("x", 1, "y", 2).withAttr("vec"), ObjectRepr.of("x", 3, "y", 4).withAttr("vec"))),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeSingleUnitAttrOperands() {
    assertWrites("@a + @b",
                 TermRepr.of(PlusExpr.of(Repr.unit().withAttr("a"), Repr.unit().withAttr("b"))),
                 WamlWriterOptions.readable());
    assertWrites("@a+@b",
                 TermRepr.of(PlusExpr.of(Repr.unit().withAttr("a"), Repr.unit().withAttr("b"))),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeMultipleUnitAttrOperands() {
    assertWrites("@a @b + @c @d",
                 TermRepr.of(PlusExpr.of(Repr.unit().withAttr("a").withAttr("b"), Repr.unit().withAttr("c").withAttr("d"))),
                 WamlWriterOptions.readable());
    assertWrites("@a@b+@c@d",
                 TermRepr.of(PlusExpr.of(Repr.unit().withAttr("a").withAttr("b"), Repr.unit().withAttr("c").withAttr("d"))),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeArrayKeyLookups() {
    assertWrites("foo[[1, 2]]",
                 TermRepr.of(ContextExpr.child(Repr.of("foo")).child(ArrayRepr.of(1, 2))),
                 WamlWriterOptions.readable());
    assertWrites("foo[[1,2]]",
                 TermRepr.of(ContextExpr.child(Repr.of("foo")).child(ArrayRepr.of(1, 2))),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeObjectKeyLookups() {
    assertWrites("foo[{x: 1, y: 2}]",
                 TermRepr.of(ContextExpr.child(Repr.of("foo")).child(ObjectRepr.of("x", 1, "y", 2))),
                 WamlWriterOptions.readable());
    assertWrites("foo[{x:1,y:2}]",
                 TermRepr.of(ContextExpr.child(Repr.of("foo")).child(ObjectRepr.of("x", 1, "y", 2))),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeLiteralInvokeArgs() {
    assertWrites("foo([1, 2], {x: 1, y: 2})",
                 TermRepr.of(InvokeExpr.of(ContextExpr.child(Repr.of("foo")), ArrayRepr.of(1, 2), ObjectRepr.of("x", 1, "y", 2))),
                 WamlWriterOptions.readable());
    assertWrites("foo([1,2],{x:1,y:2})",
                 TermRepr.of(InvokeExpr.of(ContextExpr.child(Repr.of("foo")), ArrayRepr.of(1, 2), ObjectRepr.of("x", 1, "y", 2))),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeLiteralMemberExprs() {
    assertWrites("[1, 2]::length",
                 TermRepr.of(MemberExpr.of(ArrayRepr.of(1, 2), "length")),
                 WamlWriterOptions.readable());
    assertWrites("[1,2]::length",
                 TermRepr.of(MemberExpr.of(ArrayRepr.of(1, 2), "length")),
                 WamlWriterOptions.compact());
    assertWrites("{x: 1, y: 2}::size",
                 TermRepr.of(MemberExpr.of(ObjectRepr.of("x", 1, "y", 2), "size")),
                 WamlWriterOptions.readable());
    assertWrites("{x:1,y:2}::size",
                 TermRepr.of(MemberExpr.of(ObjectRepr.of("x", 1, "y", 2), "size")),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeLiteralChildExprs() {
    assertWrites("[1, 2][\"world!\"]",
                 TermRepr.of(ChildExpr.of(ArrayRepr.of(1, 2), Repr.of("world!"))),
                 WamlWriterOptions.readable());
    assertWrites("[1,2][\"world!\"]",
                 TermRepr.of(ChildExpr.of(ArrayRepr.of(1, 2), Repr.of("world!"))),
                 WamlWriterOptions.compact());
    assertWrites("{x: 1, y: 2}[$id]",
                 TermRepr.of(ChildExpr.of(ObjectRepr.of("x", 1, "y", 2), GlobalExpr.child(Repr.of("id")))),
                 WamlWriterOptions.readable());
    assertWrites("{x:1,y:2}[$id]",
                 TermRepr.of(ChildExpr.of(ObjectRepr.of("x", 1, "y", 2), GlobalExpr.child(Repr.of("id")))),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeLiteralFieldExprs() {
    assertWrites("[1, 2].length",
                 TermRepr.of(ChildExpr.of(ArrayRepr.of(1, 2), Repr.of("length"))),
                 WamlWriterOptions.readable());
    assertWrites("[1,2].length",
                 TermRepr.of(ChildExpr.of(ArrayRepr.of(1, 2), Repr.of("length"))),
                 WamlWriterOptions.compact());
    assertWrites("{x: 1, y: 2}.x",
                 TermRepr.of(ChildExpr.of(ObjectRepr.of("x", 1, "y", 2), Repr.of("x"))),
                 WamlWriterOptions.readable());
    assertWrites("{x:1,y:2}.x",
                 TermRepr.of(ChildExpr.of(ObjectRepr.of("x", 1, "y", 2), Repr.of("x"))),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeLiteralIndexExprs() {
    assertWrites("[1, 2].0",
                 TermRepr.of(ChildExpr.of(ArrayRepr.of(1, 2), Repr.of(0))),
                 WamlWriterOptions.readable());
    assertWrites("[1,2].0",
                 TermRepr.of(ChildExpr.of(ArrayRepr.of(1, 2), Repr.of(0))),
                 WamlWriterOptions.compact());
    assertWrites("{x: 1, y: 2}.1",
                 TermRepr.of(ChildExpr.of(ObjectRepr.of("x", 1, "y", 2), Repr.of(1))),
                 WamlWriterOptions.readable());
    assertWrites("{x:1,y:2}.1",
                 TermRepr.of(ChildExpr.of(ObjectRepr.of("x", 1, "y", 2), Repr.of(1))),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeLiteralChildrenExprs() {
    assertWrites("[1, 2].*",
                 TermRepr.of(ChildrenExpr.of(ArrayRepr.of(1, 2))),
                 WamlWriterOptions.readable());
    assertWrites("[1,2].*",
                 TermRepr.of(ChildrenExpr.of(ArrayRepr.of(1, 2))),
                 WamlWriterOptions.compact());
    assertWrites("{x: 1, y: 2}.*",
                 TermRepr.of(ChildrenExpr.of(ObjectRepr.of("x", 1, "y", 2))),
                 WamlWriterOptions.readable());
    assertWrites("{x:1,y:2}.*",
                 TermRepr.of(ChildrenExpr.of(ObjectRepr.of("x", 1, "y", 2))),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeLiteralDescendantsExprs() {
    assertWrites("[1, 2].**",
                 TermRepr.of(DescendantsExpr.of(ArrayRepr.of(1, 2))),
                 WamlWriterOptions.readable());
    assertWrites("[1,2].**",
                 TermRepr.of(DescendantsExpr.of(ArrayRepr.of(1, 2))),
                 WamlWriterOptions.compact());
    assertWrites("{x: 1, y: 2}.**",
                 TermRepr.of(DescendantsExpr.of(ObjectRepr.of("x", 1, "y", 2))),
                 WamlWriterOptions.readable());
    assertWrites("{x:1,y:2}.**",
                 TermRepr.of(DescendantsExpr.of(ObjectRepr.of("x", 1, "y", 2))),
                 WamlWriterOptions.compact());
  }

  public static void assertWrites(String expected, Repr value, WamlWriterOptions options) {
    WamlAssertions.assertWrites(expected, () -> Waml.forType(Repr.class).write(value, Waml.writer(options)));
  }

  public static void assertWrites(String expected, Repr value) {
    WamlAssertions.assertWrites(expected, () -> Waml.forType(Repr.class).write(value, Waml.writer(WamlWriterOptions.readable())));
    WamlAssertions.assertWrites(expected, () -> Waml.forType(Repr.class).write(value, Waml.writer(WamlWriterOptions.compact())));
  }

}
