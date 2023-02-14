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
import swim.codec.ParseException;
import swim.expr.ContextExpr;
import swim.expr.GlobalExpr;
import swim.expr.selector.InvokeExpr;
import swim.repr.Repr;
import swim.repr.TermRepr;

public class JsonSelectorParserTests {

  @Test
  public void parseInvokeExprs() {
    assertParses(TermRepr.of(InvokeExpr.of(ContextExpr.child(Repr.of("foo")))),
                 "foo()");
    assertParses(TermRepr.of(InvokeExpr.of(ContextExpr.child(Repr.of("bar")), ContextExpr.child(Repr.of("x")))),
                 "bar(x)");
    assertParses(TermRepr.of(InvokeExpr.of(ContextExpr.child(Repr.of("baz")), ContextExpr.child(Repr.of("x")), ContextExpr.child(Repr.of("y")))),
                 "baz(x, y)");
  }

  @Test
  public void parseMemberExprs() {
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("foo")).member("children")),
                 "foo::children");
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("foo")).member("first").member("children")),
                 "foo::first::children");

    assertParses(TermRepr.of(ContextExpr.member("children")),
                 "%::children");
    assertParses(TermRepr.of(ContextExpr.member("first").member("children")),
                 "%::first::children");

    assertParses(TermRepr.of(GlobalExpr.member("children")),
                 "$::children");
    assertParses(TermRepr.of(GlobalExpr.member("first").member("children")),
                 "$::first::children");
  }

  @Test
  public void parseChildExprs() {
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("foo")).child(Repr.of("world!"))),
                 "foo[\"world!\"]");
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("foo")).child(Repr.of(-42))),
                 "foo[-42]");
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("foo")).child(Repr.of(true)).child(Repr.of(false))),
                 "foo[true][false]");
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("foo")).child(GlobalExpr.child(Repr.of("id")))),
                 "foo[$id]");

    assertParses(TermRepr.of(ContextExpr.child(Repr.of("world!"))),
                 "%[\"world!\"]");
    assertParses(TermRepr.of(ContextExpr.child(Repr.of(-42))),
                 "%[-42]");

    assertParses(TermRepr.of(GlobalExpr.child(Repr.of("world!"))),
                 "$[\"world!\"]");
    assertParses(TermRepr.of(GlobalExpr.child(Repr.of(-42))),
                 "$[-42]");
  }

  @Test
  public void parseFieldExprs() {
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("foo"))),
                 "foo");
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("foo")).child(Repr.of("bar"))),
                 "foo.bar");
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("foo")).child(Repr.of("bar")).child(Repr.of("baz"))),
                 "foo.bar.baz");

    assertParses(TermRepr.of(ContextExpr.child(Repr.of("foo"))),
                 "%foo");
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("foo")).child(Repr.of("bar"))),
                 "%foo.bar");
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("foo")).child(Repr.of("bar")).child(Repr.of("baz"))),
                 "%foo.bar.baz");

    assertParses(TermRepr.of(ContextExpr.child(Repr.of("foo"))),
                 "%.foo");
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("foo")).child(Repr.of("bar"))),
                 "%.foo.bar");
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("foo")).child(Repr.of("bar")).child(Repr.of("baz"))),
                 "%.foo.bar.baz");

    assertParses(TermRepr.of(GlobalExpr.child(Repr.of("foo"))),
                 "$foo");
    assertParses(TermRepr.of(GlobalExpr.child(Repr.of("foo")).child(Repr.of("bar"))),
                 "$foo.bar");
    assertParses(TermRepr.of(GlobalExpr.child(Repr.of("foo")).child(Repr.of("bar")).child(Repr.of("baz"))),
                 "$foo.bar.baz");

    assertParses(TermRepr.of(GlobalExpr.child(Repr.of("foo"))),
                 "$.foo");
    assertParses(TermRepr.of(GlobalExpr.child(Repr.of("foo")).child(Repr.of("bar"))),
                 "$.foo.bar");
    assertParses(TermRepr.of(GlobalExpr.child(Repr.of("foo")).child(Repr.of("bar")).child(Repr.of("baz"))),
                 "$.foo.bar.baz");
  }

  @Test
  public void parseIndexExprs() {
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("foo")).child(Repr.of(0))),
                 "foo.0");
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("foo")).child(Repr.of(4)).child(Repr.of(2))),
                 "foo.4.2");

    assertParses(TermRepr.of(ContextExpr.child(Repr.of(0))),
                 "%0");
    assertParses(TermRepr.of(ContextExpr.child(Repr.of(4)).child(Repr.of(2))),
                 "%4.2");

    assertParses(TermRepr.of(ContextExpr.child(Repr.of(0))),
                 "%.0");
    assertParses(TermRepr.of(ContextExpr.child(Repr.of(4)).child(Repr.of(2))),
                 "%.4.2");

    assertParses(TermRepr.of(GlobalExpr.child(Repr.of(0))),
                 "$0");
    assertParses(TermRepr.of(GlobalExpr.child(Repr.of(4)).child(Repr.of(2))),
                 "$4.2");

    assertParses(TermRepr.of(GlobalExpr.child(Repr.of(0))),
                 "$.0");
    assertParses(TermRepr.of(GlobalExpr.child(Repr.of(4)).child(Repr.of(2))),
                 "$.4.2");
  }

  @Test
  public void parseChildrenExprs() {
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("foo")).children()),
                 "foo.*");
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("foo")).children().children()),
                 "foo.*.*");

    assertParses(TermRepr.of(ContextExpr.children()),
                 "*");
    assertParses(TermRepr.of(ContextExpr.children().children()),
                 "*.*");

    assertParses(TermRepr.of(ContextExpr.children()),
                 "%*");
    assertParses(TermRepr.of(ContextExpr.children().children()),
                 "%*.*");

    assertParses(TermRepr.of(ContextExpr.children()),
                 "%.*");
    assertParses(TermRepr.of(ContextExpr.children().children()),
                 "%.*.*");

    assertParses(TermRepr.of(GlobalExpr.children()),
                 "$*");
    assertParses(TermRepr.of(GlobalExpr.children().children()),
                 "$*.*");

    assertParses(TermRepr.of(GlobalExpr.children()),
                 "$.*");
    assertParses(TermRepr.of(GlobalExpr.children().children()),
                 "$.*.*");
  }

  @Test
  public void parseDescendantsExprs() {
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("foo")).descendants()),
                 "foo.**");
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("foo")).descendants().descendants()),
                 "foo.**.**");

    assertParses(TermRepr.of(ContextExpr.descendants()),
                 "**");
    assertParses(TermRepr.of(ContextExpr.descendants().descendants()),
                 "**.**");

    assertParses(TermRepr.of(ContextExpr.descendants()),
                 "%**");
    assertParses(TermRepr.of(ContextExpr.descendants().descendants()),
                 "%**.**");

    assertParses(TermRepr.of(ContextExpr.descendants()),
                 "%.**");
    assertParses(TermRepr.of(ContextExpr.descendants().descendants()),
                 "%.**.**");

    assertParses(TermRepr.of(GlobalExpr.descendants()),
                 "$**");
    assertParses(TermRepr.of(GlobalExpr.descendants().descendants()),
                 "$**.**");

    assertParses(TermRepr.of(GlobalExpr.descendants()),
                 "$.**");
    assertParses(TermRepr.of(GlobalExpr.descendants().descendants()),
                 "$.**.**");
  }

  public static void assertParses(Repr expected, String json) {
    JsonAssertions.assertParses(Json.parse(JsonParserOptions.expressions()), expected, json);
  }

}
