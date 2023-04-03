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

package swim.expr.selector;

import org.junit.jupiter.api.Test;
import swim.codec.ParseException;
import swim.expr.ContextExpr;
import swim.expr.Expr;
import swim.expr.ExprAssertions;
import swim.expr.GlobalExpr;
import swim.expr.Term;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class SelectorExprParserTests {

  @Test
  public void parseInvokeExprs() {
    assertParses(InvokeExpr.of(ContextExpr.child(Term.of("foo"))),
                 "foo()");
    assertParses(InvokeExpr.of(ContextExpr.child(Term.of("bar")), ContextExpr.child(Term.of("x"))),
                 "bar(x)");
    assertParses(InvokeExpr.of(ContextExpr.child(Term.of("baz")), ContextExpr.child(Term.of("x")), ContextExpr.child(Term.of("y"))),
                 "baz(x, y)");
    assertParses(InvokeExpr.of(ContextExpr.child(Term.of("baz")), ContextExpr.child(Term.of("x")), ContextExpr.child(Term.of("y"))),
                 "baz(x,y)");
  }

  @Test
  public void parseMemberExprs() {
    assertParses(ContextExpr.child(Term.of("foo")).member("children"),
                 "foo::children");
    assertParses(ContextExpr.child(Term.of("foo")).member("first").member("children"),
                 "foo::first::children");

    assertParses(ContextExpr.member("children"),
                 "%::children");
    assertParses(ContextExpr.member("first").member("children"),
                 "%::first::children");

    assertParses(GlobalExpr.member("children"),
                 "$::children");
    assertParses(GlobalExpr.member("first").member("children"),
                 "$::first::children");
  }

  @Test
  public void parseChildExprs() {
    assertParses(ContextExpr.child(Term.of("foo")).child(Term.of("world!")),
                 "foo[\"world!\"]");
    assertParses(ContextExpr.child(Term.of("foo")).child(Term.of(-42)),
                 "foo[-42]");
    assertParses(ContextExpr.child(Term.of("foo")).child(Term.of(true)).child(Term.of(false)),
                 "foo[true][false]");
    assertParses(ContextExpr.child(Term.of("foo")).child(GlobalExpr.child(Term.of("id"))),
                 "foo[$id]");

    assertParses(ContextExpr.child(Term.of("world!")),
                 "%[\"world!\"]");
    assertParses(ContextExpr.child(Term.of(-42)),
                 "%[-42]");

    assertParses(GlobalExpr.child(Term.of("world!")),
                 "$[\"world!\"]");
    assertParses(GlobalExpr.child(Term.of(-42)),
                 "$[-42]");
  }

  @Test
  public void parseFieldExprs() {
    assertParses(ContextExpr.child(Term.of("foo")),
                 "foo");
    assertParses(ContextExpr.child(Term.of("foo")).child(Term.of("bar")),
                 "foo.bar");
    assertParses(ContextExpr.child(Term.of("foo")).child(Term.of("bar")).child(Term.of("baz")),
                 "foo.bar.baz");

    assertParses(ContextExpr.child(Term.of("foo")),
                 "%foo");
    assertParses(ContextExpr.child(Term.of("foo")).child(Term.of("bar")),
                 "%foo.bar");
    assertParses(ContextExpr.child(Term.of("foo")).child(Term.of("bar")).child(Term.of("baz")),
                 "%foo.bar.baz");

    assertParses(ContextExpr.child(Term.of("foo")),
                 "%.foo");
    assertParses(ContextExpr.child(Term.of("foo")).child(Term.of("bar")),
                 "%.foo.bar");
    assertParses(ContextExpr.child(Term.of("foo")).child(Term.of("bar")).child(Term.of("baz")),
                 "%.foo.bar.baz");

    assertParses(GlobalExpr.child(Term.of("foo")),
                 "$foo");
    assertParses(GlobalExpr.child(Term.of("foo")).child(Term.of("bar")),
                 "$foo.bar");
    assertParses(GlobalExpr.child(Term.of("foo")).child(Term.of("bar")).child(Term.of("baz")),
                 "$foo.bar.baz");

    assertParses(GlobalExpr.child(Term.of("foo")),
                 "$.foo");
    assertParses(GlobalExpr.child(Term.of("foo")).child(Term.of("bar")),
                 "$.foo.bar");
    assertParses(GlobalExpr.child(Term.of("foo")).child(Term.of("bar")).child(Term.of("baz")),
                 "$.foo.bar.baz");
  }

  @Test
  public void parseIndexExprs() {
    assertParses(ContextExpr.child(Term.of("foo")).child(Term.of(0)),
                 "foo.0");
    assertParses(ContextExpr.child(Term.of("foo")).child(Term.of(4)).child(Term.of(2)),
                 "foo.4.2");

    assertParses(ContextExpr.child(Term.of(0)),
                 "%0");
    assertParses(ContextExpr.child(Term.of(4)).child(Term.of(2)),
                 "%4.2");

    assertParses(ContextExpr.child(Term.of(0)),
                 "%.0");
    assertParses(ContextExpr.child(Term.of(4)).child(Term.of(2)),
                 "%.4.2");

    assertParses(GlobalExpr.child(Term.of(0)),
                 "$0");
    assertParses(GlobalExpr.child(Term.of(4)).child(Term.of(2)),
                 "$4.2");

    assertParses(GlobalExpr.child(Term.of(0)),
                 "$.0");
    assertParses(GlobalExpr.child(Term.of(4)).child(Term.of(2)),
                 "$.4.2");
  }

  @Test
  public void parseChildrenExprs() {
    assertParses(ContextExpr.child(Term.of("foo")).children(),
                 "foo.*");
    assertParses(ContextExpr.child(Term.of("foo")).children().children(),
                 "foo.*.*");

    assertParses(ContextExpr.children(),
                 "*");
    assertParses(ContextExpr.children().children(),
                 "*.*");

    assertParses(ContextExpr.children(),
                 "%*");
    assertParses(ContextExpr.children().children(),
                 "%*.*");

    assertParses(ContextExpr.children(),
                 "%.*");
    assertParses(ContextExpr.children().children(),
                 "%.*.*");

    assertParses(GlobalExpr.children(),
                 "$*");
    assertParses(GlobalExpr.children().children(),
                 "$*.*");

    assertParses(GlobalExpr.children(),
                 "$.*");
    assertParses(GlobalExpr.children().children(),
                 "$.*.*");
  }

  @Test
  public void parseDescendantsExprs() {
    assertParses(ContextExpr.child(Term.of("foo")).descendants(),
                 "foo.**");
    assertParses(ContextExpr.child(Term.of("foo")).descendants().descendants(),
                 "foo.**.**");

    assertParses(ContextExpr.descendants(),
                 "**");
    assertParses(ContextExpr.descendants().descendants(),
                 "**.**");

    assertParses(ContextExpr.descendants(),
                 "%**");
    assertParses(ContextExpr.descendants().descendants(),
                 "%**.**");

    assertParses(ContextExpr.descendants(),
                 "%.**");
    assertParses(ContextExpr.descendants().descendants(),
                 "%.**.**");

    assertParses(GlobalExpr.descendants(),
                 "$**");
    assertParses(GlobalExpr.descendants().descendants(),
                 "$**.**");

    assertParses(GlobalExpr.descendants(),
                 "$.**");
    assertParses(GlobalExpr.descendants().descendants(),
                 "$.**.**");
  }

  public static void assertParses(Term expected, String string) {
    ExprAssertions.assertParses(Expr.parse(), expected, string);
    ExprAssertions.assertParses(Expr.parse(), expected, " " + string + " ");
  }

  public static void assertParseFails(final String string) {
    assertThrows(ParseException.class, () -> {
      Expr.parse(string).checkDone();
    });
  }

}
