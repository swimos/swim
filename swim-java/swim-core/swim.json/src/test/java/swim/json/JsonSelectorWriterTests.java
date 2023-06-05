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
import swim.expr.ContextExpr;
import swim.expr.GlobalExpr;
import swim.expr.InvokeExpr;
import swim.repr.Repr;
import swim.repr.TermRepr;

public class JsonSelectorWriterTests {

  @Test
  public void writeInvokeExprs() {
    assertWrites("foo()",
                 TermRepr.of(InvokeExpr.of(ContextExpr.child(Repr.of("foo")))));
    assertWrites("bar(x)",
                 TermRepr.of(InvokeExpr.of(ContextExpr.child(Repr.of("bar")), ContextExpr.child(Repr.of("x")))));
    assertWrites("baz(x, y)",
                 TermRepr.of(InvokeExpr.of(ContextExpr.child(Repr.of("baz")), ContextExpr.child(Repr.of("x")), ContextExpr.child(Repr.of("y")))),
                 JsonWriterOptions.readable());
    assertWrites("baz(x,y)",
                 TermRepr.of(InvokeExpr.of(ContextExpr.child(Repr.of("baz")), ContextExpr.child(Repr.of("x")), ContextExpr.child(Repr.of("y")))),
                 JsonWriterOptions.standard());
  }

  @Test
  public void writeMemberExprs() {
    assertWrites("foo::children",
                 TermRepr.of(ContextExpr.child(Repr.of("foo")).member("children")));
    assertWrites("foo::first::children",
                 TermRepr.of(ContextExpr.child(Repr.of("foo")).member("first").member("children")));

    assertWrites("%::children",
                 TermRepr.of(ContextExpr.member("children")));
    assertWrites("%::first::children",
                 TermRepr.of(ContextExpr.member("first").member("children")));

    assertWrites("$::children",
                 TermRepr.of(GlobalExpr.member("children")));
    assertWrites("$::first::children",
                 TermRepr.of(GlobalExpr.member("first").member("children")));
  }

  @Test
  public void writeChildExprs() {
    assertWrites("foo[\"world!\"]",
                 TermRepr.of(ContextExpr.child(Repr.of("foo")).child(Repr.of("world!"))));
    assertWrites("foo[-42]",
                 TermRepr.of(ContextExpr.child(Repr.of("foo")).child(Repr.of(-42))));
    assertWrites("foo[true][false]",
                 TermRepr.of(ContextExpr.child(Repr.of("foo")).child(Repr.of(true)).child(Repr.of(false))));
    assertWrites("foo[$id]",
                 TermRepr.of(ContextExpr.child(Repr.of("foo")).child(GlobalExpr.child(Repr.of("id")))));

    assertWrites("%[\"world!\"]",
                 TermRepr.of(ContextExpr.child(Repr.of("world!"))));
    assertWrites("%[-42]",
                 TermRepr.of(ContextExpr.child(Repr.of(-42))));

    assertWrites("$[\"world!\"]",
                 TermRepr.of(GlobalExpr.child(Repr.of("world!"))));
    assertWrites("$[-42]",
                 TermRepr.of(GlobalExpr.child(Repr.of(-42))));
  }

  @Test
  public void writeFieldExprs() {
    assertWrites("foo",
                 TermRepr.of(ContextExpr.child(Repr.of("foo"))));
    assertWrites("foo.bar",
                 TermRepr.of(ContextExpr.child(Repr.of("foo")).child(Repr.of("bar"))));
    assertWrites("foo.bar.baz",
                 TermRepr.of(ContextExpr.child(Repr.of("foo")).child(Repr.of("bar")).child(Repr.of("baz"))));

    assertWrites("$foo",
                 TermRepr.of(GlobalExpr.child(Repr.of("foo"))));
    assertWrites("$foo.bar",
                 TermRepr.of(GlobalExpr.child(Repr.of("foo")).child(Repr.of("bar"))));
    assertWrites("$foo.bar.baz",
                 TermRepr.of(GlobalExpr.child(Repr.of("foo")).child(Repr.of("bar")).child(Repr.of("baz"))));
  }

  @Test
  public void writeIndexExprs() {
    assertWrites("foo.0",
                 TermRepr.of(ContextExpr.child(Repr.of("foo")).child(Repr.of(0))));
    assertWrites("foo.4.2",
                 TermRepr.of(ContextExpr.child(Repr.of("foo")).child(Repr.of(4)).child(Repr.of(2))));

    assertWrites("%0",
                 TermRepr.of(ContextExpr.child(Repr.of(0))));
    assertWrites("%4.2",
                 TermRepr.of(ContextExpr.child(Repr.of(4)).child(Repr.of(2))));

    assertWrites("$0",
                 TermRepr.of(GlobalExpr.child(Repr.of(0))));
    assertWrites("$4.2",
                 TermRepr.of(GlobalExpr.child(Repr.of(4)).child(Repr.of(2))));
  }

  @Test
  public void writeChildrenExprs() {
    assertWrites("foo.*",
                 TermRepr.of(ContextExpr.child(Repr.of("foo")).children()));
    assertWrites("foo.*.*",
                 TermRepr.of(ContextExpr.child(Repr.of("foo")).children().children()));

    assertWrites("*",
                 TermRepr.of(ContextExpr.children()));
    assertWrites("*.*",
                 TermRepr.of(ContextExpr.children().children()));

    assertWrites("$*",
                 TermRepr.of(GlobalExpr.children()));
    assertWrites("$*.*",
                 TermRepr.of(GlobalExpr.children().children()));
  }

  @Test
  public void writeDescendantsExprs() {
    assertWrites("foo.**",
                 TermRepr.of(ContextExpr.child(Repr.of("foo")).descendants()));
    assertWrites("foo.**.**",
                 TermRepr.of(ContextExpr.child(Repr.of("foo")).descendants().descendants()));

    assertWrites("**",
                 TermRepr.of(ContextExpr.descendants()));
    assertWrites("**.**",
                 TermRepr.of(ContextExpr.descendants().descendants()));

    assertWrites("$**",
                 TermRepr.of(GlobalExpr.descendants()));
    assertWrites("$**.**",
                 TermRepr.of(GlobalExpr.descendants().descendants()));
  }

  public static void assertWrites(String expected, Repr value, JsonWriterOptions options) {
    JsonAssertions.assertWrites(expected, () -> JsonReprs.valueFormat().write(value, options));
  }

  public static void assertWrites(String expected, Repr value) {
    JsonAssertions.assertWrites(expected, () -> JsonReprs.valueFormat().write(value, JsonWriterOptions.readable()));
    JsonAssertions.assertWrites(expected, () -> JsonReprs.valueFormat().write(value, JsonWriterOptions.standard()));
  }

}
