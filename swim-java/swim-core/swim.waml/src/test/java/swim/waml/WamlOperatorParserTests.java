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
import swim.expr.AndExpr;
import swim.expr.BitwiseAndExpr;
import swim.expr.BitwiseNotExpr;
import swim.expr.BitwiseOrExpr;
import swim.expr.BitwiseXorExpr;
import swim.expr.CondExpr;
import swim.expr.ContextExpr;
import swim.expr.DivideExpr;
import swim.expr.EqExpr;
import swim.expr.GeExpr;
import swim.expr.GtExpr;
import swim.expr.LeExpr;
import swim.expr.LtExpr;
import swim.expr.MinusExpr;
import swim.expr.ModuloExpr;
import swim.expr.NeExpr;
import swim.expr.NegativeExpr;
import swim.expr.NotExpr;
import swim.expr.OrExpr;
import swim.expr.PlusExpr;
import swim.expr.PositiveExpr;
import swim.expr.TimesExpr;
import swim.repr.Repr;
import swim.repr.TermRepr;
import swim.term.Term;

public class WamlOperatorParserTests {

  @Test
  public void parseConditionalExprs() {
    assertParses(TermRepr.of(CondExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 "a ? b : c");
    assertParses(TermRepr.of(CondExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 "a?b:c");
    assertParses(TermRepr.of(CondExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")), CondExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")), ContextExpr.child(Term.of("e"))))),
                 "a ? b : c ? d : e");
    assertParses(TermRepr.of(CondExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")), CondExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")), ContextExpr.child(Term.of("e"))))),
                 "a?b:c?d:e");
    assertParses(TermRepr.of(CondExpr.of(ContextExpr.child(Term.of("a")), CondExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))), ContextExpr.child(Term.of("e")))),
                 "a ? b ? c : d : e");
    assertParses(TermRepr.of(CondExpr.of(ContextExpr.child(Term.of("a")), CondExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))), ContextExpr.child(Term.of("e")))),
                 "a?b?c:d:e");
  }

  @Test
  public void parseAssociatedConditionalExprs() {
    assertParses(TermRepr.of(CondExpr.of(CondExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))), ContextExpr.child(Term.of("d")), ContextExpr.child(Term.of("e")))),
                 "(a ? b : c) ? d : e");
    assertParses(TermRepr.of(CondExpr.of(CondExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))), ContextExpr.child(Term.of("d")), ContextExpr.child(Term.of("e")))),
                 "(a?b:c)?d:e");
  }

  @Test
  public void parseLogicalOrExprs() {
    assertParses(TermRepr.of(OrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a || b");
    assertParses(TermRepr.of(OrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a||b");
    assertParses(TermRepr.of(OrExpr.of(OrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "a || b || c");
    assertParses(TermRepr.of(OrExpr.of(OrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "a||b||c");
  }

  @Test
  public void parseLogicalAndExprs() {
    assertParses(TermRepr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a && b");
    assertParses(TermRepr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a&&b");
    assertParses(TermRepr.of(AndExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "a && b && c");
    assertParses(TermRepr.of(AndExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "a&&b&&c");
  }

  @Test
  public void parseLogicalNotExprs() {
    assertParses(TermRepr.of(NotExpr.of(ContextExpr.child(Term.of("a")))),
                 "!a");
  }

  @Test
  public void parseLogicalExprs() {
    assertParses(TermRepr.of(OrExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "a && b || c");
    assertParses(TermRepr.of(OrExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "a&&b||c");
    assertParses(TermRepr.of(OrExpr.of(ContextExpr.child(Term.of("a")), AndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))))),
                 "a || b && c");
    assertParses(TermRepr.of(OrExpr.of(ContextExpr.child(Term.of("a")), AndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))))),
                 "a||b&&c");
    assertParses(TermRepr.of(OrExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), AndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 "a && b || c && d");
    assertParses(TermRepr.of(OrExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), AndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 "a&&b||c&&d");
    assertParses(TermRepr.of(OrExpr.of(OrExpr.of(ContextExpr.child(Term.of("a")), AndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d")))),
                 "a || b && c || d");
    assertParses(TermRepr.of(OrExpr.of(OrExpr.of(ContextExpr.child(Term.of("a")), AndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d")))),
                 "a||b&&c||d");

    assertParses(TermRepr.of(OrExpr.of(NotExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))), AndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 "!(a && b) || c && d");
    assertParses(TermRepr.of(OrExpr.of(NotExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))), AndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 "!(a&&b)||c&&d");
    assertParses(TermRepr.of(OrExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), NotExpr.of(AndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))))),
                 "a && b || !(c && d)");
    assertParses(TermRepr.of(OrExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), NotExpr.of(AndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))))),
                 "a&&b||!(c&&d)");
    assertParses(TermRepr.of(OrExpr.of(NotExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))), NotExpr.of(AndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))))),
                 "!(a && b) || !(c && d)");
    assertParses(TermRepr.of(OrExpr.of(NotExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))), NotExpr.of(AndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))))),
                 "!(a&&b)||!(c&&d)");
    assertParses(TermRepr.of(NotExpr.of(OrExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), AndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))))),
                 "!(a && b || c && d)");
    assertParses(TermRepr.of(NotExpr.of(OrExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), AndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))))),
                 "!(a&&b||c&&d)");
    assertParses(TermRepr.of(AndExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), NotExpr.of(OrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))))), ContextExpr.child(Term.of("d")))),
                 "a && !(b || c) && d");
    assertParses(TermRepr.of(AndExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), NotExpr.of(OrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))))), ContextExpr.child(Term.of("d")))),
                 "a&&!(b||c)&&d");
  }

  @Test
  public void parseAssociatedLogicalExprs() {
    assertParses(TermRepr.of(AndExpr.of(ContextExpr.child(Term.of("a")), OrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))))),
                 "a && (b || c)");
    assertParses(TermRepr.of(AndExpr.of(ContextExpr.child(Term.of("a")), OrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))))),
                 "a&&(b||c)");
    assertParses(TermRepr.of(AndExpr.of(OrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "(a || b) && c");
    assertParses(TermRepr.of(AndExpr.of(OrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "(a||b)&&c");
    assertParses(TermRepr.of(AndExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), OrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d")))),
                 "a && (b || c) && d");
    assertParses(TermRepr.of(AndExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), OrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d")))),
                 "a&&(b||c)&&d");
    assertParses(TermRepr.of(AndExpr.of(OrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), OrExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 "(a || b) && (c || d)");
    assertParses(TermRepr.of(AndExpr.of(OrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), OrExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 "(a||b)&&(c||d)");
  }

  @Test
  public void parseBitwiseOrExprs() {
    assertParses(TermRepr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a | b");
    assertParses(TermRepr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a|b");
    assertParses(TermRepr.of(BitwiseOrExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "a | b | c");
    assertParses(TermRepr.of(BitwiseOrExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "a|b|c");
  }

  @Test
  public void parseBitwiseXorExprs() {
    assertParses(TermRepr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a ^ b");
    assertParses(TermRepr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a^b");
    assertParses(TermRepr.of(BitwiseXorExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "a ^ b ^ c");
    assertParses(TermRepr.of(BitwiseXorExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "a^b^c");
  }

  @Test
  public void parseBitwiseAndExprs() {
    assertParses(TermRepr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a & b");
    assertParses(TermRepr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a&b");
    assertParses(TermRepr.of(BitwiseAndExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "a & b & c");
    assertParses(TermRepr.of(BitwiseAndExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "a&b&c");
  }

  @Test
  public void parseBitwiseNotExprs() {
    assertParses(TermRepr.of(BitwiseNotExpr.of(ContextExpr.child(Term.of("a")))),
                 "~a");
  }

  @Test
  public void parseBitwiseExprs() {
    assertParses(TermRepr.of(BitwiseOrExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "a & b | c");
    assertParses(TermRepr.of(BitwiseOrExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "a&b|c");
    assertParses(TermRepr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), BitwiseAndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))))),
                 "a | b & c");
    assertParses(TermRepr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), BitwiseAndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))))),
                 "a|b&c");
    assertParses(TermRepr.of(BitwiseOrExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseAndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 "a & b | c & d");
    assertParses(TermRepr.of(BitwiseOrExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseAndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 "a&b|c&d");
    assertParses(TermRepr.of(BitwiseOrExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), BitwiseAndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d")))),
                 "a | b & c | d");
    assertParses(TermRepr.of(BitwiseOrExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), BitwiseAndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d")))),
                 "a|b&c|d");

    assertParses(TermRepr.of(BitwiseXorExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "a & b ^ c");
    assertParses(TermRepr.of(BitwiseXorExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "a&b^c");
    assertParses(TermRepr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), BitwiseAndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))))),
                 "a ^ b & c");
    assertParses(TermRepr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), BitwiseAndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))))),
                 "a^b&c");
    assertParses(TermRepr.of(BitwiseXorExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseAndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 "a & b ^ c & d");
    assertParses(TermRepr.of(BitwiseXorExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseAndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 "a&b^c&d");
    assertParses(TermRepr.of(BitwiseXorExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), BitwiseAndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d")))),
                 "a ^ b & c ^ d");
    assertParses(TermRepr.of(BitwiseXorExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), BitwiseAndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d")))),
                 "a^b&c^d");

    assertParses(TermRepr.of(BitwiseOrExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "a ^ b | c");
    assertParses(TermRepr.of(BitwiseOrExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "a^b|c");
    assertParses(TermRepr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), BitwiseXorExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))))),
                 "a | b ^ c");
    assertParses(TermRepr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), BitwiseXorExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))))),
                 "a|b^c");
    assertParses(TermRepr.of(BitwiseOrExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseXorExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 "a ^ b | c ^ d");
    assertParses(TermRepr.of(BitwiseOrExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseXorExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 "a^b|c^d");
    assertParses(TermRepr.of(BitwiseOrExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), BitwiseXorExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d")))),
                 "a | b ^ c | d");
    assertParses(TermRepr.of(BitwiseOrExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), BitwiseXorExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d")))),
                 "a|b^c|d");
  }

  @Test
  public void parseAssociatedBitwiseExprs() {
    assertParses(TermRepr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), BitwiseOrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))))),
                 "a & (b | c)");
    assertParses(TermRepr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), BitwiseOrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))))),
                 "a&(b|c)");
    assertParses(TermRepr.of(BitwiseAndExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "(a | b) & c");
    assertParses(TermRepr.of(BitwiseAndExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "(a|b)&c");
    assertParses(TermRepr.of(BitwiseAndExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), BitwiseOrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d")))),
                 "a & (b | c) & d");
    assertParses(TermRepr.of(BitwiseAndExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), BitwiseOrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d")))),
                 "a&(b|c)&d");
    assertParses(TermRepr.of(BitwiseAndExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseOrExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 "(a | b) & (c | d)");
    assertParses(TermRepr.of(BitwiseAndExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseOrExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 "(a|b)&(c|d)");

    assertParses(TermRepr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), BitwiseXorExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))))),
                 "a & (b ^ c)");
    assertParses(TermRepr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), BitwiseXorExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))))),
                 "a&(b^c)");
    assertParses(TermRepr.of(BitwiseAndExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "(a ^ b) & c");
    assertParses(TermRepr.of(BitwiseAndExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "(a^b)&c");
    assertParses(TermRepr.of(BitwiseAndExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), BitwiseXorExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d")))),
                 "a & (b ^ c) & d");
    assertParses(TermRepr.of(BitwiseAndExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), BitwiseXorExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d")))),
                 "a&(b^c)&d");
    assertParses(TermRepr.of(BitwiseAndExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseXorExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 "(a ^ b) & (c ^ d)");
    assertParses(TermRepr.of(BitwiseAndExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseXorExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 "(a^b)&(c^d)");

    assertParses(TermRepr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), BitwiseOrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))))),
                 "a ^ (b | c)");
    assertParses(TermRepr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), BitwiseOrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))))),
                 "a^(b|c)");
    assertParses(TermRepr.of(BitwiseXorExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "(a | b) ^ c");
    assertParses(TermRepr.of(BitwiseXorExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "(a|b)^c");
    assertParses(TermRepr.of(BitwiseXorExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), BitwiseOrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d")))),
                 "a ^ (b | c) ^ d");
    assertParses(TermRepr.of(BitwiseXorExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), BitwiseOrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d")))),
                 "a^(b|c)^d");
    assertParses(TermRepr.of(BitwiseXorExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseOrExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 "(a | b) ^ (c | d)");
    assertParses(TermRepr.of(BitwiseXorExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseOrExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 "(a|b)^(c|d)");
  }

  @Test
  public void parseBitwiseLogicalExprs() {
    assertParses(TermRepr.of(OrExpr.of(ContextExpr.child(Term.of("a")), AndExpr.of(ContextExpr.child(Term.of("b")), BitwiseOrExpr.of(ContextExpr.child(Term.of("c")), BitwiseXorExpr.of(ContextExpr.child(Term.of("d")), BitwiseAndExpr.of(ContextExpr.child(Term.of("e")), ContextExpr.child(Term.of("f")))))))),
                 "a || b && c | d ^ e & f");
    assertParses(TermRepr.of(OrExpr.of(ContextExpr.child(Term.of("a")), AndExpr.of(ContextExpr.child(Term.of("b")), BitwiseOrExpr.of(ContextExpr.child(Term.of("c")), BitwiseXorExpr.of(ContextExpr.child(Term.of("d")), BitwiseAndExpr.of(ContextExpr.child(Term.of("e")), ContextExpr.child(Term.of("f")))))))),
                 "a||b&&c|d^e&f");
    assertParses(TermRepr.of(OrExpr.of(AndExpr.of(BitwiseOrExpr.of(BitwiseXorExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("f")), ContextExpr.child(Term.of("e"))), ContextExpr.child(Term.of("d"))), ContextExpr.child(Term.of("c"))), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("a")))),
                 "f & e ^ d | c && b || a");
    assertParses(TermRepr.of(OrExpr.of(AndExpr.of(BitwiseOrExpr.of(BitwiseXorExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("f")), ContextExpr.child(Term.of("e"))), ContextExpr.child(Term.of("d"))), ContextExpr.child(Term.of("c"))), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("a")))),
                 "f&e^d|c&&b||a");
  }

  @Test
  public void parseLtExprs() {
    assertParses(TermRepr.of(LtExpr.of(ContextExpr.child(Term.of("a")), Repr.of(42))),
                 "a < 42");
    assertParses(TermRepr.of(LtExpr.of(ContextExpr.child(Term.of("a")), Repr.of(42))),
                 "a<42");
    assertParses(TermRepr.of(LtExpr.of(Repr.of(42), ContextExpr.child(Term.of("b")))),
                 "42 < b");
    assertParses(TermRepr.of(LtExpr.of(Repr.of(42), ContextExpr.child(Term.of("b")))),
                 "42<b");
    assertParses(TermRepr.of(LtExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a < b");
    assertParses(TermRepr.of(LtExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a<b");
  }

  @Test
  public void parseLeExprs() {
    assertParses(TermRepr.of(LeExpr.of(ContextExpr.child(Term.of("a")), Repr.of(42))),
                 "a <= 42");
    assertParses(TermRepr.of(LeExpr.of(ContextExpr.child(Term.of("a")), Repr.of(42))),
                 "a<=42");
    assertParses(TermRepr.of(LeExpr.of(Repr.of(42), ContextExpr.child(Term.of("b")))),
                 "42 <= b");
    assertParses(TermRepr.of(LeExpr.of(Repr.of(42), ContextExpr.child(Term.of("b")))),
                 "42<=b");
    assertParses(TermRepr.of(LeExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a <= b");
    assertParses(TermRepr.of(LeExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a<=b");
  }

  @Test
  public void parseEqExprs() {
    assertParses(TermRepr.of(EqExpr.of(ContextExpr.child(Term.of("a")), Repr.of(42))),
                 "a == 42");
    assertParses(TermRepr.of(EqExpr.of(ContextExpr.child(Term.of("a")), Repr.of(42))),
                 "a==42");
    assertParses(TermRepr.of(EqExpr.of(Repr.of(42), ContextExpr.child(Term.of("b")))),
                 "42 == b");
    assertParses(TermRepr.of(EqExpr.of(Repr.of(42), ContextExpr.child(Term.of("b")))),
                 "42==b");
    assertParses(TermRepr.of(EqExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a == b");
    assertParses(TermRepr.of(EqExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a==b");
  }

  @Test
  public void parseNeExprs() {
    assertParses(TermRepr.of(NeExpr.of(ContextExpr.child(Term.of("a")), Repr.of(42))),
                 "a != 42");
    assertParses(TermRepr.of(NeExpr.of(ContextExpr.child(Term.of("a")), Repr.of(42))),
                 "a!=42");
    assertParses(TermRepr.of(NeExpr.of(Repr.of(42), ContextExpr.child(Term.of("b")))),
                 "42 != b");
    assertParses(TermRepr.of(NeExpr.of(Repr.of(42), ContextExpr.child(Term.of("b")))),
                 "42!=b");
    assertParses(TermRepr.of(NeExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a != b");
    assertParses(TermRepr.of(NeExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a!=b");
  }

  @Test
  public void parseGeExprs() {
    assertParses(TermRepr.of(GeExpr.of(ContextExpr.child(Term.of("a")), Repr.of(42))),
                 "a >= 42");
    assertParses(TermRepr.of(GeExpr.of(ContextExpr.child(Term.of("a")), Repr.of(42))),
                 "a>=42");
    assertParses(TermRepr.of(GeExpr.of(Repr.of(42), ContextExpr.child(Term.of("b")))),
                 "42 >= b");
    assertParses(TermRepr.of(GeExpr.of(Repr.of(42), ContextExpr.child(Term.of("b")))),
                 "42>=b");
    assertParses(TermRepr.of(GeExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a >= b");
    assertParses(TermRepr.of(GeExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a>=b");
  }

  @Test
  public void parseGtExprs() {
    assertParses(TermRepr.of(GtExpr.of(ContextExpr.child(Term.of("a")), Repr.of(42))),
                 "a > 42");
    assertParses(TermRepr.of(GtExpr.of(ContextExpr.child(Term.of("a")), Repr.of(42))),
                 "a>42");
    assertParses(TermRepr.of(GtExpr.of(Repr.of(42), ContextExpr.child(Term.of("b")))),
                 "42 > b");
    assertParses(TermRepr.of(GtExpr.of(Repr.of(42), ContextExpr.child(Term.of("b")))),
                 "42>b");
    assertParses(TermRepr.of(GtExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a > b");
    assertParses(TermRepr.of(GtExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a>b");
  }

  @Test
  public void parsePlusExprs() {
    assertParses(TermRepr.of(PlusExpr.of(ContextExpr.child(Term.of("a")), Repr.of(2))),
                 "a + 2");
    assertParses(TermRepr.of(PlusExpr.of(ContextExpr.child(Term.of("a")), Repr.of(2))),
                 "a+2");
    assertParses(TermRepr.of(PlusExpr.of(Repr.of(2), ContextExpr.child(Term.of("b")))),
                 "2 + b");
    assertParses(TermRepr.of(PlusExpr.of(Repr.of(2), ContextExpr.child(Term.of("b")))),
                 "2+b");
    assertParses(TermRepr.of(PlusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a + b");
    assertParses(TermRepr.of(PlusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a+b");
    assertParses(TermRepr.of(PlusExpr.of(PlusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "a + b + c");
    assertParses(TermRepr.of(PlusExpr.of(PlusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "a+b+c");
  }

  @Test
  public void parseMinusExprs() {
    assertParses(TermRepr.of(MinusExpr.of(ContextExpr.child(Term.of("a")), Repr.of(2))),
                 "a - 2");
    assertParses(TermRepr.of(MinusExpr.of(ContextExpr.child(Term.of("a")), Repr.of(2))),
                 "a-2");
    assertParses(TermRepr.of(MinusExpr.of(Repr.of(2), ContextExpr.child(Term.of("b")))),
                 "2 - b");
    assertParses(TermRepr.of(MinusExpr.of(Repr.of(2), ContextExpr.child(Term.of("b")))),
                 "2-b");
    assertParses(TermRepr.of(MinusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a - b");
    assertParses(TermRepr.of(MinusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a-b");
    assertParses(TermRepr.of(MinusExpr.of(MinusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "a - b - c");
    assertParses(TermRepr.of(MinusExpr.of(MinusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "a-b-c");
  }

  @Test
  public void parseNegativeExprs() {
    assertParses(TermRepr.of(NegativeExpr.of(ContextExpr.child(Term.of("a")))),
                 "-a");
  }

  @Test
  public void parsePositiveExprs() {
    assertParses(TermRepr.of(PositiveExpr.of(ContextExpr.child(Term.of("a")))),
                 "+a");
  }

  @Test
  public void parseTimesExprs() {
    assertParses(TermRepr.of(TimesExpr.of(ContextExpr.child(Term.of("a")), Repr.of(2))),
                 "a * 2");
    assertParses(TermRepr.of(TimesExpr.of(ContextExpr.child(Term.of("a")), Repr.of(2))),
                 "a*2");
    assertParses(TermRepr.of(TimesExpr.of(Repr.of(2), ContextExpr.child(Term.of("b")))),
                 "2 * b");
    assertParses(TermRepr.of(TimesExpr.of(Repr.of(2), ContextExpr.child(Term.of("b")))),
                 "2*b");
    assertParses(TermRepr.of(TimesExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a * b");
    assertParses(TermRepr.of(TimesExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a*b");
    assertParses(TermRepr.of(TimesExpr.of(TimesExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "a * b * c");
    assertParses(TermRepr.of(TimesExpr.of(TimesExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "a*b*c");
  }

  @Test
  public void parseDivideExprs() {
    assertParses(TermRepr.of(DivideExpr.of(ContextExpr.child(Term.of("a")), Repr.of(2))),
                 "a / 2");
    assertParses(TermRepr.of(DivideExpr.of(ContextExpr.child(Term.of("a")), Repr.of(2))),
                 "a/2");
    assertParses(TermRepr.of(DivideExpr.of(Repr.of(2), ContextExpr.child(Term.of("b")))),
                 "2 / b");
    assertParses(TermRepr.of(DivideExpr.of(Repr.of(2), ContextExpr.child(Term.of("b")))),
                 "2/b");
    assertParses(TermRepr.of(DivideExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a / b");
    assertParses(TermRepr.of(DivideExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a/b");
    assertParses(TermRepr.of(DivideExpr.of(DivideExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "a / b / c");
    assertParses(TermRepr.of(DivideExpr.of(DivideExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "a/b/c");
  }

  @Test
  public void parseModuloExprs() {
    assertParses(TermRepr.of(ModuloExpr.of(ContextExpr.child(Term.of("a")), Repr.of(2))),
                 "a % 2");
    assertParses(TermRepr.of(ModuloExpr.of(ContextExpr.child(Term.of("a")), Repr.of(2))),
                 "a%2");
    assertParses(TermRepr.of(ModuloExpr.of(Repr.of(2), ContextExpr.child(Term.of("b")))),
                 "2 % b");
    assertParses(TermRepr.of(ModuloExpr.of(Repr.of(2), ContextExpr.child(Term.of("b")))),
                 "2%b");
    assertParses(TermRepr.of(ModuloExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a % b");
    assertParses(TermRepr.of(ModuloExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))),
                 "a%b");
    assertParses(TermRepr.of(ModuloExpr.of(ModuloExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "a % b % c");
    assertParses(TermRepr.of(ModuloExpr.of(ModuloExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "a%b%c");
  }

  @Test
  public void parseArithmeticExprs() {
    assertParses(TermRepr.of(PlusExpr.of(TimesExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "a * b + c");
    assertParses(TermRepr.of(PlusExpr.of(TimesExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "a*b+c");
    assertParses(TermRepr.of(PlusExpr.of(ContextExpr.child(Term.of("a")), TimesExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))))),
                 "a + b * c");
    assertParses(TermRepr.of(PlusExpr.of(ContextExpr.child(Term.of("a")), TimesExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))))),
                 "a+b*c");
    assertParses(TermRepr.of(PlusExpr.of(TimesExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), TimesExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 "a * b + c * d");
    assertParses(TermRepr.of(PlusExpr.of(TimesExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), TimesExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 "a*b+c*d");
    assertParses(TermRepr.of(PlusExpr.of(PlusExpr.of(ContextExpr.child(Term.of("a")), TimesExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d")))),
                 "a + b * c + d");
    assertParses(TermRepr.of(PlusExpr.of(PlusExpr.of(ContextExpr.child(Term.of("a")), TimesExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d")))),
                 "a+b*c+d");
  }

  @Test
  public void parseAssociatedArithmeticExprs() {
    assertParses(TermRepr.of(TimesExpr.of(ContextExpr.child(Term.of("a")), PlusExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))))),
                 "a * (b + c)");
    assertParses(TermRepr.of(TimesExpr.of(ContextExpr.child(Term.of("a")), PlusExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))))),
                 "a*(b+c)");
    assertParses(TermRepr.of(TimesExpr.of(PlusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "(a + b) * c");
    assertParses(TermRepr.of(TimesExpr.of(PlusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c")))),
                 "(a+b)*c");
    assertParses(TermRepr.of(TimesExpr.of(TimesExpr.of(ContextExpr.child(Term.of("a")), PlusExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d")))),
                 "a * (b + c) * d");
    assertParses(TermRepr.of(TimesExpr.of(TimesExpr.of(ContextExpr.child(Term.of("a")), PlusExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d")))),
                 "a*(b+c)*d");
    assertParses(TermRepr.of(TimesExpr.of(PlusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), PlusExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 "(a + b) * (c + d)");
    assertParses(TermRepr.of(TimesExpr.of(PlusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), PlusExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 "(a+b)*(c+d)");
  }

  public static void assertParses(Repr expected, String waml) {
    WamlAssertions.assertParses(Waml.parse(WamlParserOptions.expressions()), expected, waml);
  }

}
