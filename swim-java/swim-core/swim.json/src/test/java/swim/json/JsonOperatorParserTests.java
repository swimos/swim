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
import swim.expr.operator.AndExpr;
import swim.expr.operator.BitwiseAndExpr;
import swim.expr.operator.BitwiseNotExpr;
import swim.expr.operator.BitwiseOrExpr;
import swim.expr.operator.BitwiseXorExpr;
import swim.expr.operator.CondExpr;
import swim.expr.operator.DivideExpr;
import swim.expr.operator.EqExpr;
import swim.expr.operator.GeExpr;
import swim.expr.operator.GtExpr;
import swim.expr.operator.LeExpr;
import swim.expr.operator.LtExpr;
import swim.expr.operator.MinusExpr;
import swim.expr.operator.ModuloExpr;
import swim.expr.operator.NeExpr;
import swim.expr.operator.NegativeExpr;
import swim.expr.operator.NotExpr;
import swim.expr.operator.OrExpr;
import swim.expr.operator.PlusExpr;
import swim.expr.operator.PositiveExpr;
import swim.expr.operator.TimesExpr;
import swim.repr.Repr;
import swim.repr.TermRepr;

public class JsonOperatorParserTests {

  @Test
  public void parseConditionalExprs() {
    assertParses(TermRepr.of(CondExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))),
                 "a ? b : c");
    assertParses(TermRepr.of(CondExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))),
                 "a?b:c");
    assertParses(TermRepr.of(CondExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")), CondExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d")), ContextExpr.child(Repr.of("e"))))),
                 "a ? b : c ? d : e");
    assertParses(TermRepr.of(CondExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")), CondExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d")), ContextExpr.child(Repr.of("e"))))),
                 "a?b:c?d:e");
    assertParses(TermRepr.of(CondExpr.of(ContextExpr.child(Repr.of("a")), CondExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))), ContextExpr.child(Repr.of("e")))),
                 "a ? b ? c : d : e");
    assertParses(TermRepr.of(CondExpr.of(ContextExpr.child(Repr.of("a")), CondExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))), ContextExpr.child(Repr.of("e")))),
                 "a?b?c:d:e");
  }

  @Test
  public void parseAssociatedConditionalExprs() {
    assertParses(TermRepr.of(CondExpr.of(CondExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))), ContextExpr.child(Repr.of("d")), ContextExpr.child(Repr.of("e")))),
                 "(a ? b : c) ? d : e");
    assertParses(TermRepr.of(CondExpr.of(CondExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))), ContextExpr.child(Repr.of("d")), ContextExpr.child(Repr.of("e")))),
                 "(a?b:c)?d:e");
  }

  @Test
  public void parseLogicalOrExprs() {
    assertParses(TermRepr.of(OrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a || b");
    assertParses(TermRepr.of(OrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a||b");
    assertParses(TermRepr.of(OrExpr.of(OrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "a || b || c");
    assertParses(TermRepr.of(OrExpr.of(OrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "a||b||c");
  }

  @Test
  public void parseLogicalAndExprs() {
    assertParses(TermRepr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a && b");
    assertParses(TermRepr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a&&b");
    assertParses(TermRepr.of(AndExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "a && b && c");
    assertParses(TermRepr.of(AndExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "a&&b&&c");
  }

  @Test
  public void parseLogicalNotExprs() {
    assertParses(TermRepr.of(NotExpr.of(ContextExpr.child(Repr.of("a")))),
                 "!a");
  }

  @Test
  public void parseLogicalExprs() {
    assertParses(TermRepr.of(OrExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "a && b || c");
    assertParses(TermRepr.of(OrExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "a&&b||c");
    assertParses(TermRepr.of(OrExpr.of(ContextExpr.child(Repr.of("a")), AndExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 "a || b && c");
    assertParses(TermRepr.of(OrExpr.of(ContextExpr.child(Repr.of("a")), AndExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 "a||b&&c");
    assertParses(TermRepr.of(OrExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), AndExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 "a && b || c && d");
    assertParses(TermRepr.of(OrExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), AndExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 "a&&b||c&&d");
    assertParses(TermRepr.of(OrExpr.of(OrExpr.of(ContextExpr.child(Repr.of("a")), AndExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 "a || b && c || d");
    assertParses(TermRepr.of(OrExpr.of(OrExpr.of(ContextExpr.child(Repr.of("a")), AndExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 "a||b&&c||d");

    assertParses(TermRepr.of(OrExpr.of(NotExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))), AndExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 "!(a && b) || c && d");
    assertParses(TermRepr.of(OrExpr.of(NotExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))), AndExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 "!(a&&b)||c&&d");
    assertParses(TermRepr.of(OrExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), NotExpr.of(AndExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d")))))),
                 "a && b || !(c && d)");
    assertParses(TermRepr.of(OrExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), NotExpr.of(AndExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d")))))),
                 "a&&b||!(c&&d)");
    assertParses(TermRepr.of(OrExpr.of(NotExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))), NotExpr.of(AndExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d")))))),
                 "!(a && b) || !(c && d)");
    assertParses(TermRepr.of(OrExpr.of(NotExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))), NotExpr.of(AndExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d")))))),
                 "!(a&&b)||!(c&&d)");
    assertParses(TermRepr.of(NotExpr.of(OrExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), AndExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d")))))),
                 "!(a && b || c && d)");
    assertParses(TermRepr.of(NotExpr.of(OrExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), AndExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d")))))),
                 "!(a&&b||c&&d)");
    assertParses(TermRepr.of(AndExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), NotExpr.of(OrExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))), ContextExpr.child(Repr.of("d")))),
                 "a && !(b || c) && d");
    assertParses(TermRepr.of(AndExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), NotExpr.of(OrExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))), ContextExpr.child(Repr.of("d")))),
                 "a&&!(b||c)&&d");
  }

  @Test
  public void parseAssociatedLogicalExprs() {
    assertParses(TermRepr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), OrExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 "a && (b || c)");
    assertParses(TermRepr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), OrExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 "a&&(b||c)");
    assertParses(TermRepr.of(AndExpr.of(OrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "(a || b) && c");
    assertParses(TermRepr.of(AndExpr.of(OrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "(a||b)&&c");
    assertParses(TermRepr.of(AndExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), OrExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 "a && (b || c) && d");
    assertParses(TermRepr.of(AndExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), OrExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 "a&&(b||c)&&d");
    assertParses(TermRepr.of(AndExpr.of(OrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), OrExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 "(a || b) && (c || d)");
    assertParses(TermRepr.of(AndExpr.of(OrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), OrExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 "(a||b)&&(c||d)");
  }

  @Test
  public void parseBitwiseOrExprs() {
    assertParses(TermRepr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a | b");
    assertParses(TermRepr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a|b");
    assertParses(TermRepr.of(BitwiseOrExpr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "a | b | c");
    assertParses(TermRepr.of(BitwiseOrExpr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "a|b|c");
  }

  @Test
  public void parseBitwiseXorExprs() {
    assertParses(TermRepr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a ^ b");
    assertParses(TermRepr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a^b");
    assertParses(TermRepr.of(BitwiseXorExpr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "a ^ b ^ c");
    assertParses(TermRepr.of(BitwiseXorExpr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "a^b^c");
  }

  @Test
  public void parseBitwiseAndExprs() {
    assertParses(TermRepr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a & b");
    assertParses(TermRepr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a&b");
    assertParses(TermRepr.of(BitwiseAndExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "a & b & c");
    assertParses(TermRepr.of(BitwiseAndExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "a&b&c");
  }

  @Test
  public void parseBitwiseNotExprs() {
    assertParses(TermRepr.of(BitwiseNotExpr.of(ContextExpr.child(Repr.of("a")))),
                 "~a");
  }

  @Test
  public void parseBitwiseExprs() {
    assertParses(TermRepr.of(BitwiseOrExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "a & b | c");
    assertParses(TermRepr.of(BitwiseOrExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "a&b|c");
    assertParses(TermRepr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), BitwiseAndExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 "a | b & c");
    assertParses(TermRepr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), BitwiseAndExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 "a|b&c");
    assertParses(TermRepr.of(BitwiseOrExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), BitwiseAndExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 "a & b | c & d");
    assertParses(TermRepr.of(BitwiseOrExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), BitwiseAndExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 "a&b|c&d");
    assertParses(TermRepr.of(BitwiseOrExpr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), BitwiseAndExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 "a | b & c | d");
    assertParses(TermRepr.of(BitwiseOrExpr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), BitwiseAndExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 "a|b&c|d");

    assertParses(TermRepr.of(BitwiseXorExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "a & b ^ c");
    assertParses(TermRepr.of(BitwiseXorExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "a&b^c");
    assertParses(TermRepr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), BitwiseAndExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 "a ^ b & c");
    assertParses(TermRepr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), BitwiseAndExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 "a^b&c");
    assertParses(TermRepr.of(BitwiseXorExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), BitwiseAndExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 "a & b ^ c & d");
    assertParses(TermRepr.of(BitwiseXorExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), BitwiseAndExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 "a&b^c&d");
    assertParses(TermRepr.of(BitwiseXorExpr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), BitwiseAndExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 "a ^ b & c ^ d");
    assertParses(TermRepr.of(BitwiseXorExpr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), BitwiseAndExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 "a^b&c^d");

    assertParses(TermRepr.of(BitwiseOrExpr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "a ^ b | c");
    assertParses(TermRepr.of(BitwiseOrExpr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "a^b|c");
    assertParses(TermRepr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), BitwiseXorExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 "a | b ^ c");
    assertParses(TermRepr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), BitwiseXorExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 "a|b^c");
    assertParses(TermRepr.of(BitwiseOrExpr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), BitwiseXorExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 "a ^ b | c ^ d");
    assertParses(TermRepr.of(BitwiseOrExpr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), BitwiseXorExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 "a^b|c^d");
    assertParses(TermRepr.of(BitwiseOrExpr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), BitwiseXorExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 "a | b ^ c | d");
    assertParses(TermRepr.of(BitwiseOrExpr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), BitwiseXorExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 "a|b^c|d");
  }

  @Test
  public void parseAssociatedBitwiseExprs() {
    assertParses(TermRepr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), BitwiseOrExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 "a & (b | c)");
    assertParses(TermRepr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), BitwiseOrExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 "a&(b|c)");
    assertParses(TermRepr.of(BitwiseAndExpr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "(a | b) & c");
    assertParses(TermRepr.of(BitwiseAndExpr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "(a|b)&c");
    assertParses(TermRepr.of(BitwiseAndExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), BitwiseOrExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 "a & (b | c) & d");
    assertParses(TermRepr.of(BitwiseAndExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), BitwiseOrExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 "a&(b|c)&d");
    assertParses(TermRepr.of(BitwiseAndExpr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), BitwiseOrExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 "(a | b) & (c | d)");
    assertParses(TermRepr.of(BitwiseAndExpr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), BitwiseOrExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 "(a|b)&(c|d)");

    assertParses(TermRepr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), BitwiseXorExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 "a & (b ^ c)");
    assertParses(TermRepr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), BitwiseXorExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 "a&(b^c)");
    assertParses(TermRepr.of(BitwiseAndExpr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "(a ^ b) & c");
    assertParses(TermRepr.of(BitwiseAndExpr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "(a^b)&c");
    assertParses(TermRepr.of(BitwiseAndExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), BitwiseXorExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 "a & (b ^ c) & d");
    assertParses(TermRepr.of(BitwiseAndExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), BitwiseXorExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 "a&(b^c)&d");
    assertParses(TermRepr.of(BitwiseAndExpr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), BitwiseXorExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 "(a ^ b) & (c ^ d)");
    assertParses(TermRepr.of(BitwiseAndExpr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), BitwiseXorExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 "(a^b)&(c^d)");

    assertParses(TermRepr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), BitwiseOrExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 "a ^ (b | c)");
    assertParses(TermRepr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), BitwiseOrExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 "a^(b|c)");
    assertParses(TermRepr.of(BitwiseXorExpr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "(a | b) ^ c");
    assertParses(TermRepr.of(BitwiseXorExpr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "(a|b)^c");
    assertParses(TermRepr.of(BitwiseXorExpr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), BitwiseOrExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 "a ^ (b | c) ^ d");
    assertParses(TermRepr.of(BitwiseXorExpr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), BitwiseOrExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 "a^(b|c)^d");
    assertParses(TermRepr.of(BitwiseXorExpr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), BitwiseOrExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 "(a | b) ^ (c | d)");
    assertParses(TermRepr.of(BitwiseXorExpr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), BitwiseOrExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 "(a|b)^(c|d)");
  }

  @Test
  public void parseBitwiseLogicalExprs() {
    assertParses(TermRepr.of(OrExpr.of(ContextExpr.child(Repr.of("a")), AndExpr.of(ContextExpr.child(Repr.of("b")), BitwiseOrExpr.of(ContextExpr.child(Repr.of("c")), BitwiseXorExpr.of(ContextExpr.child(Repr.of("d")), BitwiseAndExpr.of(ContextExpr.child(Repr.of("e")), ContextExpr.child(Repr.of("f")))))))),
                 "a || b && c | d ^ e & f");
    assertParses(TermRepr.of(OrExpr.of(ContextExpr.child(Repr.of("a")), AndExpr.of(ContextExpr.child(Repr.of("b")), BitwiseOrExpr.of(ContextExpr.child(Repr.of("c")), BitwiseXorExpr.of(ContextExpr.child(Repr.of("d")), BitwiseAndExpr.of(ContextExpr.child(Repr.of("e")), ContextExpr.child(Repr.of("f")))))))),
                 "a||b&&c|d^e&f");
    assertParses(TermRepr.of(OrExpr.of(AndExpr.of(BitwiseOrExpr.of(BitwiseXorExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("f")), ContextExpr.child(Repr.of("e"))), ContextExpr.child(Repr.of("d"))), ContextExpr.child(Repr.of("c"))), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("a")))),
                 "f & e ^ d | c && b || a");
    assertParses(TermRepr.of(OrExpr.of(AndExpr.of(BitwiseOrExpr.of(BitwiseXorExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("f")), ContextExpr.child(Repr.of("e"))), ContextExpr.child(Repr.of("d"))), ContextExpr.child(Repr.of("c"))), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("a")))),
                 "f&e^d|c&&b||a");
  }

  @Test
  public void parseLtExprs() {
    assertParses(TermRepr.of(LtExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(42))),
                 "a < 42");
    assertParses(TermRepr.of(LtExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(42))),
                 "a<42");
    assertParses(TermRepr.of(LtExpr.of(Repr.of(42), ContextExpr.child(Repr.of("b")))),
                 "42 < b");
    assertParses(TermRepr.of(LtExpr.of(Repr.of(42), ContextExpr.child(Repr.of("b")))),
                 "42<b");
    assertParses(TermRepr.of(LtExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a < b");
    assertParses(TermRepr.of(LtExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a<b");
  }

  @Test
  public void parseLeExprs() {
    assertParses(TermRepr.of(LeExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(42))),
                 "a <= 42");
    assertParses(TermRepr.of(LeExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(42))),
                 "a<=42");
    assertParses(TermRepr.of(LeExpr.of(Repr.of(42), ContextExpr.child(Repr.of("b")))),
                 "42 <= b");
    assertParses(TermRepr.of(LeExpr.of(Repr.of(42), ContextExpr.child(Repr.of("b")))),
                 "42<=b");
    assertParses(TermRepr.of(LeExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a <= b");
    assertParses(TermRepr.of(LeExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a<=b");
  }

  @Test
  public void parseEqExprs() {
    assertParses(TermRepr.of(EqExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(42))),
                 "a == 42");
    assertParses(TermRepr.of(EqExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(42))),
                 "a==42");
    assertParses(TermRepr.of(EqExpr.of(Repr.of(42), ContextExpr.child(Repr.of("b")))),
                 "42 == b");
    assertParses(TermRepr.of(EqExpr.of(Repr.of(42), ContextExpr.child(Repr.of("b")))),
                 "42==b");
    assertParses(TermRepr.of(EqExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a == b");
    assertParses(TermRepr.of(EqExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a==b");
  }

  @Test
  public void parseNeExprs() {
    assertParses(TermRepr.of(NeExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(42))),
                 "a != 42");
    assertParses(TermRepr.of(NeExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(42))),
                 "a!=42");
    assertParses(TermRepr.of(NeExpr.of(Repr.of(42), ContextExpr.child(Repr.of("b")))),
                 "42 != b");
    assertParses(TermRepr.of(NeExpr.of(Repr.of(42), ContextExpr.child(Repr.of("b")))),
                 "42!=b");
    assertParses(TermRepr.of(NeExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a != b");
    assertParses(TermRepr.of(NeExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a!=b");
  }

  @Test
  public void parseGeExprs() {
    assertParses(TermRepr.of(GeExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(42))),
                 "a >= 42");
    assertParses(TermRepr.of(GeExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(42))),
                 "a>=42");
    assertParses(TermRepr.of(GeExpr.of(Repr.of(42), ContextExpr.child(Repr.of("b")))),
                 "42 >= b");
    assertParses(TermRepr.of(GeExpr.of(Repr.of(42), ContextExpr.child(Repr.of("b")))),
                 "42>=b");
    assertParses(TermRepr.of(GeExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a >= b");
    assertParses(TermRepr.of(GeExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a>=b");
  }

  @Test
  public void parseGtExprs() {
    assertParses(TermRepr.of(GtExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(42))),
                 "a > 42");
    assertParses(TermRepr.of(GtExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(42))),
                 "a>42");
    assertParses(TermRepr.of(GtExpr.of(Repr.of(42), ContextExpr.child(Repr.of("b")))),
                 "42 > b");
    assertParses(TermRepr.of(GtExpr.of(Repr.of(42), ContextExpr.child(Repr.of("b")))),
                 "42>b");
    assertParses(TermRepr.of(GtExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a > b");
    assertParses(TermRepr.of(GtExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a>b");
  }

  @Test
  public void parsePlusExprs() {
    assertParses(TermRepr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(2))),
                 "a + 2");
    assertParses(TermRepr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(2))),
                 "a+2");
    assertParses(TermRepr.of(PlusExpr.of(Repr.of(2), ContextExpr.child(Repr.of("b")))),
                 "2 + b");
    assertParses(TermRepr.of(PlusExpr.of(Repr.of(2), ContextExpr.child(Repr.of("b")))),
                 "2+b");
    assertParses(TermRepr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a + b");
    assertParses(TermRepr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a+b");
    assertParses(TermRepr.of(PlusExpr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "a + b + c");
    assertParses(TermRepr.of(PlusExpr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "a+b+c");
  }

  @Test
  public void parseMinusExprs() {
    assertParses(TermRepr.of(MinusExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(2))),
                 "a - 2");
    assertParses(TermRepr.of(MinusExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(2))),
                 "a-2");
    assertParses(TermRepr.of(MinusExpr.of(Repr.of(2), ContextExpr.child(Repr.of("b")))),
                 "2 - b");
    assertParses(TermRepr.of(MinusExpr.of(Repr.of(2), ContextExpr.child(Repr.of("b")))),
                 "2-b");
    assertParses(TermRepr.of(MinusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a - b");
    assertParses(TermRepr.of(MinusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a-b");
    assertParses(TermRepr.of(MinusExpr.of(MinusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "a - b - c");
    assertParses(TermRepr.of(MinusExpr.of(MinusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "a-b-c");
  }

  @Test
  public void parseNegativeExprs() {
    assertParses(TermRepr.of(NegativeExpr.of(ContextExpr.child(Repr.of("a")))),
                 "-a");
  }

  @Test
  public void parsePositiveExprs() {
    assertParses(TermRepr.of(PositiveExpr.of(ContextExpr.child(Repr.of("a")))),
                 "+a");
  }

  @Test
  public void parseTimesExprs() {
    assertParses(TermRepr.of(TimesExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(2))),
                 "a * 2");
    assertParses(TermRepr.of(TimesExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(2))),
                 "a*2");
    assertParses(TermRepr.of(TimesExpr.of(Repr.of(2), ContextExpr.child(Repr.of("b")))),
                 "2 * b");
    assertParses(TermRepr.of(TimesExpr.of(Repr.of(2), ContextExpr.child(Repr.of("b")))),
                 "2*b");
    assertParses(TermRepr.of(TimesExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a * b");
    assertParses(TermRepr.of(TimesExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a*b");
    assertParses(TermRepr.of(TimesExpr.of(TimesExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "a * b * c");
    assertParses(TermRepr.of(TimesExpr.of(TimesExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "a*b*c");
  }

  @Test
  public void parseDivideExprs() {
    assertParses(TermRepr.of(DivideExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(2))),
                 "a / 2");
    assertParses(TermRepr.of(DivideExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(2))),
                 "a/2");
    assertParses(TermRepr.of(DivideExpr.of(Repr.of(2), ContextExpr.child(Repr.of("b")))),
                 "2 / b");
    assertParses(TermRepr.of(DivideExpr.of(Repr.of(2), ContextExpr.child(Repr.of("b")))),
                 "2/b");
    assertParses(TermRepr.of(DivideExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a / b");
    assertParses(TermRepr.of(DivideExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a/b");
    assertParses(TermRepr.of(DivideExpr.of(DivideExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "a / b / c");
    assertParses(TermRepr.of(DivideExpr.of(DivideExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "a/b/c");
  }

  @Test
  public void parseModuloExprs() {
    assertParses(TermRepr.of(ModuloExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(2))),
                 "a % 2");
    assertParses(TermRepr.of(ModuloExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(2))),
                 "a%2");
    assertParses(TermRepr.of(ModuloExpr.of(Repr.of(2), ContextExpr.child(Repr.of("b")))),
                 "2 % b");
    assertParses(TermRepr.of(ModuloExpr.of(Repr.of(2), ContextExpr.child(Repr.of("b")))),
                 "2%b");
    assertParses(TermRepr.of(ModuloExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a % b");
    assertParses(TermRepr.of(ModuloExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 "a%b");
    assertParses(TermRepr.of(ModuloExpr.of(ModuloExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "a % b % c");
    assertParses(TermRepr.of(ModuloExpr.of(ModuloExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "a%b%c");
  }

  @Test
  public void parseArithmeticExprs() {
    assertParses(TermRepr.of(PlusExpr.of(TimesExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "a * b + c");
    assertParses(TermRepr.of(PlusExpr.of(TimesExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "a*b+c");
    assertParses(TermRepr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), TimesExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 "a + b * c");
    assertParses(TermRepr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), TimesExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 "a+b*c");
    assertParses(TermRepr.of(PlusExpr.of(TimesExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), TimesExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 "a * b + c * d");
    assertParses(TermRepr.of(PlusExpr.of(TimesExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), TimesExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 "a*b+c*d");
    assertParses(TermRepr.of(PlusExpr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), TimesExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 "a + b * c + d");
    assertParses(TermRepr.of(PlusExpr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), TimesExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 "a+b*c+d");
  }

  @Test
  public void parseAssociatedArithmeticExprs() {
    assertParses(TermRepr.of(TimesExpr.of(ContextExpr.child(Repr.of("a")), PlusExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 "a * (b + c)");
    assertParses(TermRepr.of(TimesExpr.of(ContextExpr.child(Repr.of("a")), PlusExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 "a*(b+c)");
    assertParses(TermRepr.of(TimesExpr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "(a + b) * c");
    assertParses(TermRepr.of(TimesExpr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 "(a+b)*c");
    assertParses(TermRepr.of(TimesExpr.of(TimesExpr.of(ContextExpr.child(Repr.of("a")), PlusExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 "a * (b + c) * d");
    assertParses(TermRepr.of(TimesExpr.of(TimesExpr.of(ContextExpr.child(Repr.of("a")), PlusExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 "a*(b+c)*d");
    assertParses(TermRepr.of(TimesExpr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), PlusExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 "(a + b) * (c + d)");
    assertParses(TermRepr.of(TimesExpr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), PlusExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 "(a+b)*(c+d)");
  }

  public static void assertParses(Repr expected, String json) {
    JsonAssertions.assertParses(Json.parse(JsonParserOptions.expressions()), expected, json);
  }

}
