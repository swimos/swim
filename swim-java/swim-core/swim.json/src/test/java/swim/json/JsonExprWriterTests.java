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

import org.junit.jupiter.api.Test;
import swim.expr.ChildExpr;
import swim.expr.ChildrenExpr;
import swim.expr.ContextExpr;
import swim.expr.DescendantsExpr;
import swim.expr.GlobalExpr;
import swim.expr.InvokeExpr;
import swim.expr.MemberExpr;
import swim.expr.PlusExpr;
import swim.repr.ArrayRepr;
import swim.repr.ObjectRepr;
import swim.repr.Repr;
import swim.repr.TermRepr;

public class JsonExprWriterTests {

  @Test
  public void writeExprsInArrays() {
    assertWrites("[a]",
                 ArrayRepr.of(TermRepr.of(ContextExpr.child(Repr.of("a")))));
    assertWrites("[a + b]",
                 ArrayRepr.of(TermRepr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))))),
                 JsonWriterOptions.readable());
    assertWrites("[a+b]",
                 ArrayRepr.of(TermRepr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))))),
                 JsonWriterOptions.standard());
    assertWrites("[a, b]",
                 ArrayRepr.of(TermRepr.of(ContextExpr.child(Repr.of("a"))), TermRepr.of(ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.readable());
    assertWrites("[a,b]",
                 ArrayRepr.of(TermRepr.of(ContextExpr.child(Repr.of("a"))), TermRepr.of(ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.standard());
  }

  @Test
  public void writeExprsInObjectValues() {
    assertWrites("{x: a}",
                 ObjectRepr.of("x", TermRepr.of(ContextExpr.child(Repr.of("a")))),
                 JsonWriterOptions.readable());
    assertWrites("{\"x\":a}",
                 ObjectRepr.of("x", TermRepr.of(ContextExpr.child(Repr.of("a")))),
                 JsonWriterOptions.standard());
    assertWrites("{x: a + b}",
                 ObjectRepr.of("x", TermRepr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))))),
                 JsonWriterOptions.readable());
    assertWrites("{\"x\":a+b}",
                 ObjectRepr.of("x", TermRepr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))))),
                 JsonWriterOptions.standard());
    assertWrites("{x: a, y: b}",
                 ObjectRepr.of("x", TermRepr.of(ContextExpr.child(Repr.of("a"))), "y", TermRepr.of(ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.readable());
    assertWrites("{\"x\":a,\"y\":b}",
                 ObjectRepr.of("x", TermRepr.of(ContextExpr.child(Repr.of("a"))), "y", TermRepr.of(ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.standard());
  }

  @Test
  public void writeArrayOperands() {
    assertWrites("[1, 2] + [3, 4]",
                 TermRepr.of(PlusExpr.of(ArrayRepr.of(Repr.of(1), Repr.of(2)), ArrayRepr.of(Repr.of(3), Repr.of(4)))),
                 JsonWriterOptions.readable());
    assertWrites("[1,2]+[3,4]",
                 TermRepr.of(PlusExpr.of(ArrayRepr.of(Repr.of(1), Repr.of(2)), ArrayRepr.of(Repr.of(3), Repr.of(4)))),
                 JsonWriterOptions.standard());
  }

  @Test
  public void writeObjectOperands() {
    assertWrites("{x: 1, y: 2} + {x: 3, y: 4}",
                 TermRepr.of(PlusExpr.of(ObjectRepr.of("x", Repr.of(1), "y", Repr.of(2)), ObjectRepr.of("x", Repr.of(3), "y", Repr.of(4)))),
                 JsonWriterOptions.readable());
    assertWrites("{\"x\":1,\"y\":2}+{\"x\":3,\"y\":4}",
                 TermRepr.of(PlusExpr.of(ObjectRepr.of("x", Repr.of(1), "y", Repr.of(2)), ObjectRepr.of("x", Repr.of(3), "y", Repr.of(4)))),
                 JsonWriterOptions.standard());
  }

  @Test
  public void writeArrayKeyLookups() {
    assertWrites("foo[[1, 2]]",
                 TermRepr.of(ContextExpr.child(Repr.of("foo")).child(ArrayRepr.of(Repr.of(1), Repr.of(2)))),
                 JsonWriterOptions.readable());
    assertWrites("foo[[1,2]]",
                 TermRepr.of(ContextExpr.child(Repr.of("foo")).child(ArrayRepr.of(Repr.of(1), Repr.of(2)))),
                 JsonWriterOptions.standard());
  }

  @Test
  public void writeObjectKeyLookups() {
    assertWrites("foo[{x: 1, y: 2}]",
                 TermRepr.of(ContextExpr.child(Repr.of("foo")).child(ObjectRepr.of("x", Repr.of(1), "y", Repr.of(2)))),
                 JsonWriterOptions.readable());
    assertWrites("foo[{\"x\":1,\"y\":2}]",
                 TermRepr.of(ContextExpr.child(Repr.of("foo")).child(ObjectRepr.of("x", Repr.of(1), "y", Repr.of(2)))),
                 JsonWriterOptions.standard());
  }

  @Test
  public void writeLiteralInvokeArgs() {
    assertWrites("foo([1, 2], {x: 1, y: 2})",
                 TermRepr.of(InvokeExpr.of(ContextExpr.child(Repr.of("foo")), ArrayRepr.of(Repr.of(1), Repr.of(2)), ObjectRepr.of("x", Repr.of(1), "y", Repr.of(2)))),
                 JsonWriterOptions.readable());
    assertWrites("foo([1,2],{\"x\":1,\"y\":2})",
                 TermRepr.of(InvokeExpr.of(ContextExpr.child(Repr.of("foo")), ArrayRepr.of(Repr.of(1), Repr.of(2)), ObjectRepr.of("x", Repr.of(1), "y", Repr.of(2)))),
                 JsonWriterOptions.standard());
  }

  @Test
  public void writeLiteralMemberExprs() {
    assertWrites("[1, 2]::length",
                 TermRepr.of(MemberExpr.of(ArrayRepr.of(Repr.of(1), Repr.of(2)), "length")),
                 JsonWriterOptions.readable());
    assertWrites("[1,2]::length",
                 TermRepr.of(MemberExpr.of(ArrayRepr.of(Repr.of(1), Repr.of(2)), "length")),
                 JsonWriterOptions.standard());
    assertWrites("{x: 1, y: 2}::size",
                 TermRepr.of(MemberExpr.of(ObjectRepr.of("x", Repr.of(1), "y", Repr.of(2)), "size")),
                 JsonWriterOptions.readable());
    assertWrites("{\"x\":1,\"y\":2}::size",
                 TermRepr.of(MemberExpr.of(ObjectRepr.of("x", Repr.of(1), "y", Repr.of(2)), "size")),
                 JsonWriterOptions.standard());
  }

  @Test
  public void writeLiteralChildExprs() {
    assertWrites("[1, 2][\"world!\"]",
                 TermRepr.of(ChildExpr.of(ArrayRepr.of(Repr.of(1), Repr.of(2)), Repr.of("world!"))),
                 JsonWriterOptions.readable());
    assertWrites("[1,2][\"world!\"]",
                 TermRepr.of(ChildExpr.of(ArrayRepr.of(Repr.of(1), Repr.of(2)), Repr.of("world!"))),
                 JsonWriterOptions.standard());
    assertWrites("{x: 1, y: 2}[$id]",
                 TermRepr.of(ChildExpr.of(ObjectRepr.of("x", Repr.of(1), "y", Repr.of(2)), GlobalExpr.child(Repr.of("id")))),
                 JsonWriterOptions.readable());
    assertWrites("{\"x\":1,\"y\":2}[$id]",
                 TermRepr.of(ChildExpr.of(ObjectRepr.of("x", Repr.of(1), "y", Repr.of(2)), GlobalExpr.child(Repr.of("id")))),
                 JsonWriterOptions.standard());
  }

  @Test
  public void writeLiteralFieldExprs() {
    assertWrites("[1, 2].length",
                 TermRepr.of(ChildExpr.of(ArrayRepr.of(Repr.of(1), Repr.of(2)), Repr.of("length"))),
                 JsonWriterOptions.readable());
    assertWrites("[1,2].length",
                 TermRepr.of(ChildExpr.of(ArrayRepr.of(Repr.of(1), Repr.of(2)), Repr.of("length"))),
                 JsonWriterOptions.standard());
    assertWrites("{x: 1, y: 2}.x",
                 TermRepr.of(ChildExpr.of(ObjectRepr.of("x", Repr.of(1), "y", Repr.of(2)), Repr.of("x"))),
                 JsonWriterOptions.readable());
    assertWrites("{\"x\":1,\"y\":2}.x",
                 TermRepr.of(ChildExpr.of(ObjectRepr.of("x", Repr.of(1), "y", Repr.of(2)), Repr.of("x"))),
                 JsonWriterOptions.standard());
  }

  @Test
  public void writeLiteralIndexExprs() {
    assertWrites("[1, 2].0",
                 TermRepr.of(ChildExpr.of(ArrayRepr.of(Repr.of(1), Repr.of(2)), Repr.of(0))),
                 JsonWriterOptions.readable());
    assertWrites("[1,2].0",
                 TermRepr.of(ChildExpr.of(ArrayRepr.of(Repr.of(1), Repr.of(2)), Repr.of(0))),
                 JsonWriterOptions.standard());
    assertWrites("{x: 1, y: 2}.1",
                 TermRepr.of(ChildExpr.of(ObjectRepr.of("x", Repr.of(1), "y", Repr.of(2)), Repr.of(1))),
                 JsonWriterOptions.readable());
    assertWrites("{\"x\":1,\"y\":2}.1",
                 TermRepr.of(ChildExpr.of(ObjectRepr.of("x", Repr.of(1), "y", Repr.of(2)), Repr.of(1))),
                 JsonWriterOptions.standard());
  }

  @Test
  public void writeLiteralChildrenExprs() {
    assertWrites("[1, 2].*",
                 TermRepr.of(ChildrenExpr.of(ArrayRepr.of(Repr.of(1), Repr.of(2)))),
                 JsonWriterOptions.readable());
    assertWrites("[1,2].*",
                 TermRepr.of(ChildrenExpr.of(ArrayRepr.of(Repr.of(1), Repr.of(2)))),
                 JsonWriterOptions.standard());
    assertWrites("{x: 1, y: 2}.*",
                 TermRepr.of(ChildrenExpr.of(ObjectRepr.of("x", Repr.of(1), "y", Repr.of(2)))),
                 JsonWriterOptions.readable());
    assertWrites("{\"x\":1,\"y\":2}.*",
                 TermRepr.of(ChildrenExpr.of(ObjectRepr.of("x", Repr.of(1), "y", Repr.of(2)))),
                 JsonWriterOptions.standard());
  }

  @Test
  public void writeLiteralDescendantsExprs() {
    assertWrites("[1, 2].**",
                 TermRepr.of(DescendantsExpr.of(ArrayRepr.of(Repr.of(1), Repr.of(2)))),
                 JsonWriterOptions.readable());
    assertWrites("[1,2].**",
                 TermRepr.of(DescendantsExpr.of(ArrayRepr.of(Repr.of(1), Repr.of(2)))),
                 JsonWriterOptions.standard());
    assertWrites("{x: 1, y: 2}.**",
                 TermRepr.of(DescendantsExpr.of(ObjectRepr.of("x", Repr.of(1), "y", Repr.of(2)))),
                 JsonWriterOptions.readable());
    assertWrites("{\"x\":1,\"y\":2}.**",
                 TermRepr.of(DescendantsExpr.of(ObjectRepr.of("x", Repr.of(1), "y", Repr.of(2)))),
                 JsonWriterOptions.standard());
  }

  public static void assertWrites(String expected, Repr value, JsonWriterOptions options) {
    JsonAssertions.assertWrites(expected, () -> JsonReprs.valueFormat().write(value, options));
  }

  public static void assertWrites(String expected, Repr value) {
    JsonAssertions.assertWrites(expected, () -> JsonReprs.valueFormat().write(value, JsonWriterOptions.readable()));
    JsonAssertions.assertWrites(expected, () -> JsonReprs.valueFormat().write(value, JsonWriterOptions.standard()));
  }

}
