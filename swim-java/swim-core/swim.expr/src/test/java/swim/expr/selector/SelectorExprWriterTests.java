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
import swim.expr.ContextExpr;
import swim.expr.Expr;
import swim.expr.ExprAssertions;
import swim.expr.ExprWriterOptions;
import swim.expr.GlobalExpr;
import swim.expr.Term;

public class SelectorExprWriterTests {

  @Test
  public void writeInvokeExprs() {
    assertWrites("foo()",
                 InvokeExpr.of(ContextExpr.child(Term.of("foo"))));
    assertWrites("bar(x)",
                 InvokeExpr.of(ContextExpr.child(Term.of("bar")), ContextExpr.child(Term.of("x"))));
    assertWrites("baz(x,y)",
                 InvokeExpr.of(ContextExpr.child(Term.of("baz")), ContextExpr.child(Term.of("x")), ContextExpr.child(Term.of("y"))),
                 ExprWriterOptions.compact());
    assertWrites("baz(x, y)",
                 InvokeExpr.of(ContextExpr.child(Term.of("baz")), ContextExpr.child(Term.of("x")), ContextExpr.child(Term.of("y"))),
                 ExprWriterOptions.readable());
  }

  @Test
  public void writeMemberExprs() {
    assertWrites("foo::children",
                 ContextExpr.child(Term.of("foo")).member("children"));
    assertWrites("foo::first::children",
                 ContextExpr.child(Term.of("foo")).member("first").member("children"));

    assertWrites("%::children",
                 ContextExpr.member("children"));
    assertWrites("%::first::children",
                 ContextExpr.member("first").member("children"));

    assertWrites("$::children",
                 GlobalExpr.member("children"));
    assertWrites("$::first::children",
                 GlobalExpr.member("first").member("children"));
  }

  @Test
  public void writeChildExprs() {
    assertWrites("foo[\"world!\"]",
                 ContextExpr.child(Term.of("foo")).child(Term.of("world!")));
    assertWrites("foo[-42]",
                 ContextExpr.child(Term.of("foo")).child(Term.of(-42)));
    assertWrites("foo[true][false]",
                 ContextExpr.child(Term.of("foo")).child(Term.of(true)).child(Term.of(false)));
    assertWrites("foo[$id]",
                 ContextExpr.child(Term.of("foo")).child(GlobalExpr.child(Term.of("id"))));

    assertWrites("%[\"world!\"]",
                 ContextExpr.child(Term.of("world!")));
    assertWrites("%[-42]",
                 ContextExpr.child(Term.of(-42)));

    assertWrites("$[\"world!\"]",
                 GlobalExpr.child(Term.of("world!")));
    assertWrites("$[-42]",
                 GlobalExpr.child(Term.of(-42)));
  }

  @Test
  public void writeFieldExprs() {
    assertWrites("foo",
                 ContextExpr.child(Term.of("foo")));
    assertWrites("foo.bar",
                 ContextExpr.child(Term.of("foo")).child(Term.of("bar")));
    assertWrites("foo.bar.baz",
                 ContextExpr.child(Term.of("foo")).child(Term.of("bar")).child(Term.of("baz")));

    assertWrites("$foo",
                 GlobalExpr.child(Term.of("foo")));
    assertWrites("$foo.bar",
                 GlobalExpr.child(Term.of("foo")).child(Term.of("bar")));
    assertWrites("$foo.bar.baz",
                 GlobalExpr.child(Term.of("foo")).child(Term.of("bar")).child(Term.of("baz")));
  }

  @Test
  public void writeIndexExprs() {
    assertWrites("foo.0",
                 ContextExpr.child(Term.of("foo")).child(Term.of(0)));
    assertWrites("foo.4.2",
                 ContextExpr.child(Term.of("foo")).child(Term.of(4)).child(Term.of(2)));

    assertWrites("%0",
                 ContextExpr.child(Term.of(0)));
    assertWrites("%4.2",
                 ContextExpr.child(Term.of(4)).child(Term.of(2)));

    assertWrites("$0",
                 GlobalExpr.child(Term.of(0)));
    assertWrites("$4.2",
                 GlobalExpr.child(Term.of(4)).child(Term.of(2)));
  }

  @Test
  public void writeChildrenExprs() {
    assertWrites("foo.*",
                 ContextExpr.child(Term.of("foo")).children());
    assertWrites("foo.*.*",
                 ContextExpr.child(Term.of("foo")).children().children());

    assertWrites("*",
                 ContextExpr.children());
    assertWrites("*.*",
                 ContextExpr.children().children());

    assertWrites("$*",
                 GlobalExpr.children());
    assertWrites("$*.*",
                 GlobalExpr.children().children());
  }

  @Test
  public void writeDescendantsExprs() {
    assertWrites("foo.**",
                 ContextExpr.child(Term.of("foo")).descendants());
    assertWrites("foo.**.**",
                 ContextExpr.child(Term.of("foo")).descendants().descendants());

    assertWrites("**",
                 ContextExpr.descendants());
    assertWrites("**.**",
                 ContextExpr.descendants().descendants());

    assertWrites("$**",
                 GlobalExpr.descendants());
    assertWrites("$**.**",
                 GlobalExpr.descendants().descendants());
  }

  public static void assertWrites(String expected, Term term, ExprWriterOptions options) {
    ExprAssertions.assertWrites(expected, () -> Expr.write(term, options));
  }

  public static void assertWrites(String expected, Term term) {
    ExprAssertions.assertWrites(expected, () -> Expr.write(term, ExprWriterOptions.readable()));
    ExprAssertions.assertWrites(expected, () -> Expr.write(term, ExprWriterOptions.compact()));
  }

}
