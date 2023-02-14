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
import swim.expr.operator.PlusExpr;
import swim.expr.selector.ChildExpr;
import swim.expr.selector.ChildrenExpr;
import swim.expr.selector.DescendantsExpr;
import swim.expr.selector.InvokeExpr;
import swim.expr.selector.MemberExpr;
import swim.repr.ArrayRepr;
import swim.repr.Repr;
import swim.repr.ObjectRepr;
import swim.repr.TermRepr;
import swim.repr.TupleRepr;

public class JsonExprParserTests {

  @Test
  public void parseUnicodeIdentifiers() {
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("À"))), "À"); // U+C0
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("Ö"))), "Ö"); // U+D6
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("Ø"))), "Ø"); // U+D8
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("ö"))), "ö"); // U+F6
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("ø"))), "ø"); // U+F8
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("˿"))), "˿"); // U+2FF
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("Ͱ"))), "Ͱ"); // U+370
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("ͽ"))), "ͽ"); // U+37D
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("Ϳ"))), "Ϳ"); // U+37F
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("῿"))), "῿"); // U+1FFF
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("⁰"))), "⁰"); // U+2070
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("↏"))), "↏"); // U+218F
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("Ⰰ"))), "Ⰰ"); // U+2C00
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("⿯"))), "⿯"); // U+2FEF
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("、"))), "、"); // U+3001
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("퟿"))), "퟿"); // U+D7FF
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("豈"))), "豈"); // U+F900
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("﷏"))), "﷏"); // U+FDCF
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("ﷰ"))), "ﷰ"); // U+FDF0
    //assertParses(TermRepr.of(ContextExpr.child(Repr.of("𐀀"))), "𐀀"); // U+10000
    //assertParses(TermRepr.of(ContextExpr.child(Repr.of("󯿿"))), "󯿿"); // U+EFFFF

    assertParses(TermRepr.of(ContextExpr.child(Repr.of("_À"))), "_À"); // U+C0
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("_Ö"))), "_Ö"); // U+D6
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("_Ø"))), "_Ø"); // U+D8
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("_ö"))), "_ö"); // U+F6
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("_ø"))), "_ø"); // U+F8
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("_˿"))), "_˿"); // U+2FF
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("_Ͱ"))), "_Ͱ"); // U+370
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("_ͽ"))), "_ͽ"); // U+37D
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("_Ϳ"))), "_Ϳ"); // U+37F
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("_῿"))), "_῿"); // U+1FFF
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("_⁰"))), "_⁰"); // U+2070
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("_↏"))), "_↏"); // U+218F
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("_Ⰰ"))), "_Ⰰ"); // U+2C00
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("_⿯"))), "_⿯"); // U+2FEF
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("_、"))), "_、"); // U+3001
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("_퟿"))), "_퟿"); // U+D7FF
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("_豈"))), "_豈"); // U+F900
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("_﷏"))), "_﷏"); // U+FDCF
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("_ﷰ"))), "_ﷰ"); // U+FDF0
    //assertParses(TermRepr.of(ContextExpr.child(Repr.of("_𐀀"))), "_𐀀"); // U+10000
    //assertParses(TermRepr.of(ContextExpr.child(Repr.of("_󯿿"))), "_󯿿"); // U+EFFFF
  }

  @Test
  public void parseExprsInArrays() {
    assertParses(ArrayRepr.of(TermRepr.of(ContextExpr.child(Repr.of("a")))),
                 "[a]");
    assertParses(ArrayRepr.of(TermRepr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))))),
                 "[a + b]");
    assertParses(ArrayRepr.of(TermRepr.of(ContextExpr.child(Repr.of("a"))), TermRepr.of(ContextExpr.child(Repr.of("b")))),
                 "[a, b]");
  }

  @Test
  public void parseExprsInObjectValues() {
    assertParses(ObjectRepr.of("x", TermRepr.of(ContextExpr.child(Repr.of("a")))),
                 "{x: a}");
    assertParses(ObjectRepr.of("x", TermRepr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))))),
                 "{x: a + b}");
    assertParses(ObjectRepr.of("x", TermRepr.of(ContextExpr.child(Repr.of("a"))), "y", TermRepr.of(ContextExpr.child(Repr.of("b")))),
                 "{x: a, y: b}");
  }

  @Test
  public void parseArrayOperands() {
    assertParses(TermRepr.of(PlusExpr.of(ArrayRepr.of(1, 2), ArrayRepr.of(3, 4))),
                 "[1, 2] + [3, 4]");
  }

  @Test
  public void parseObjectOperands() {
    assertParses(TermRepr.of(PlusExpr.of(ObjectRepr.of("x", 1, "y", 2), ObjectRepr.of("x", 3, "y", 4))),
                 "{x: 1, y: 2} + {x: 3, y: 4}");
  }

  @Test
  public void parseArrayKeyLookups() {
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("foo")).child(ArrayRepr.of(1, 2))),
                 "foo[[1, 2]]");
  }

  @Test
  public void parseObjectKeyLookups() {
    assertParses(TermRepr.of(ContextExpr.child(Repr.of("foo")).child(ObjectRepr.of("x", 1, "y", 2))),
                 "foo[{x: 1, y: 2}]");
  }

  @Test
  public void parseLiteralInvokeArgs() {
    assertParses(TermRepr.of(InvokeExpr.of(ContextExpr.child(Repr.of("foo")), ArrayRepr.of(1, 2), ObjectRepr.of("x", 1, "y", 2))),
                 "foo([1, 2], {x: 1, y: 2})");
  }

  @Test
  public void parseLiteralMemberExprs() {
    assertParses(TermRepr.of(MemberExpr.of(ArrayRepr.of(1, 2), "length")),
                 "[1, 2]::length");
    assertParses(TermRepr.of(MemberExpr.of(ObjectRepr.of("x", 1, "y", 2), "size")),
                 "{x: 1, y: 2}::size");
  }

  @Test
  public void parseLiteralChildExprs() {
    assertParses(TermRepr.of(ChildExpr.of(ArrayRepr.of(1, 2), Repr.of("world!"))),
                 "[1, 2][\"world!\"]");
    assertParses(TermRepr.of(ChildExpr.of(ObjectRepr.of("x", 1, "y", 2), GlobalExpr.child(Repr.of("id")))),
                 "{x: 1, y: 2}[$id]");
  }

  @Test
  public void parseLiteralFieldExprs() {
    assertParses(TermRepr.of(ChildExpr.of(ArrayRepr.of(1, 2), Repr.of("length"))),
                 "[1, 2].length");
    assertParses(TermRepr.of(ChildExpr.of(ObjectRepr.of("x", 1, "y", 2), Repr.of("x"))),
                 "{x: 1, y: 2}.x");
  }

  @Test
  public void parseLiteralIndexExprs() {
    assertParses(TermRepr.of(ChildExpr.of(ArrayRepr.of(1, 2), Repr.of(0))),
                 "[1, 2].0");
    assertParses(TermRepr.of(ChildExpr.of(ObjectRepr.of("x", 1, "y", 2), Repr.of(1))),
                 "{x: 1, y: 2}.1");
  }

  @Test
  public void parseLiteralChildrenExprs() {
    assertParses(TermRepr.of(ChildrenExpr.of(ArrayRepr.of(1, 2))),
                 "[1, 2].*");
    assertParses(TermRepr.of(ChildrenExpr.of(ObjectRepr.of("x", 1, "y", 2))),
                 "{x: 1, y: 2}.*");
  }

  @Test
  public void parseLiteralDescendantsExprs() {
    assertParses(TermRepr.of(DescendantsExpr.of(ArrayRepr.of(1, 2))),
                 "[1, 2].**");
    assertParses(TermRepr.of(DescendantsExpr.of(ObjectRepr.of("x", 1, "y", 2))),
                 "{x: 1, y: 2}.**");
  }

  public static void assertParses(Repr expected, String json) {
    JsonAssertions.assertParses(Json.parse(JsonParserOptions.expressions()), expected, json);
  }

}
