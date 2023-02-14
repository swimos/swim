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

package swim.expr.operator;

import org.junit.jupiter.api.Test;
import swim.codec.ParseException;
import swim.expr.ContextExpr;
import swim.expr.Expr;
import swim.expr.ExprAssertions;
import swim.expr.Term;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class OperatorExprParserTests {

  @Test
  public void parseConditionalExprs() {
    assertParses(CondExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))),
                 "a ? b : c");
    assertParses(CondExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))),
                 "a?b:c");
    assertParses(CondExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")), CondExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")), ContextExpr.child(Term.of("e")))),
                 "a ? b : c ? d : e");
    assertParses(CondExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")), CondExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")), ContextExpr.child(Term.of("e")))),
                 "a?b:c?d:e");
    assertParses(CondExpr.of(ContextExpr.child(Term.of("a")), CondExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))), ContextExpr.child(Term.of("e"))),
                 "a ? b ? c : d : e");
    assertParses(CondExpr.of(ContextExpr.child(Term.of("a")), CondExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))), ContextExpr.child(Term.of("e"))),
                 "a?b?c:d:e");
  }

  @Test
  public void parseAssociatedConditionalExprs() {
    assertParses(CondExpr.of(CondExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))), ContextExpr.child(Term.of("d")), ContextExpr.child(Term.of("e"))),
                 "(a ? b : c) ? d : e");
    assertParses(CondExpr.of(CondExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))), ContextExpr.child(Term.of("d")), ContextExpr.child(Term.of("e"))),
                 "(a?b:c)?d:e");
  }

  @Test
  public void parseLogicalOrExprs() {
    assertParses(OrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a || b");
    assertParses(OrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a||b");
    assertParses(OrExpr.of(OrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "a || b || c");
    assertParses(OrExpr.of(OrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "a||b||c");
  }

  @Test
  public void parseLogicalAndExprs() {
    assertParses(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a && b");
    assertParses(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a&&b");
    assertParses(AndExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "a && b && c");
    assertParses(AndExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "a&&b&&c");
  }

  @Test
  public void parseLogicalNotExprs() {
    assertParses(NotExpr.of(ContextExpr.child(Term.of("a"))),
                 "!a");
  }

  @Test
  public void parseLogicalExprs() {
    assertParses(OrExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "a && b || c");
    assertParses(OrExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "a&&b||c");
    assertParses(OrExpr.of(ContextExpr.child(Term.of("a")), AndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 "a || b && c");
    assertParses(OrExpr.of(ContextExpr.child(Term.of("a")), AndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 "a||b&&c");
    assertParses(OrExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), AndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 "a && b || c && d");
    assertParses(OrExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), AndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 "a&&b||c&&d");
    assertParses(OrExpr.of(OrExpr.of(ContextExpr.child(Term.of("a")), AndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 "a || b && c || d");
    assertParses(OrExpr.of(OrExpr.of(ContextExpr.child(Term.of("a")), AndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 "a||b&&c||d");

    assertParses(OrExpr.of(NotExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))), AndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 "!(a && b) || c && d");
    assertParses(OrExpr.of(NotExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))), AndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 "!(a&&b)||c&&d");
    assertParses(OrExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), NotExpr.of(AndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 "a && b || !(c && d)");
    assertParses(OrExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), NotExpr.of(AndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 "a&&b||!(c&&d)");
    assertParses(OrExpr.of(NotExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))), NotExpr.of(AndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 "!(a && b) || !(c && d)");
    assertParses(OrExpr.of(NotExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))), NotExpr.of(AndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 "!(a&&b)||!(c&&d)");
    assertParses(NotExpr.of(OrExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), AndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 "!(a && b || c && d)");
    assertParses(NotExpr.of(OrExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), AndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 "!(a&&b||c&&d)");
    assertParses(AndExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), NotExpr.of(OrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))))), ContextExpr.child(Term.of("d"))),
                 "a && !(b || c) && d");
    assertParses(AndExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), NotExpr.of(OrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))))), ContextExpr.child(Term.of("d"))),
                 "a&&!(b||c)&&d");
  }

  @Test
  public void parseAssociatedLogicalExprs() {
    assertParses(AndExpr.of(ContextExpr.child(Term.of("a")), OrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 "a && (b || c)");
    assertParses(AndExpr.of(ContextExpr.child(Term.of("a")), OrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 "a&&(b||c)");
    assertParses(AndExpr.of(OrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "(a || b) && c");
    assertParses(AndExpr.of(OrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "(a||b)&&c");
    assertParses(AndExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), OrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 "a && (b || c) && d");
    assertParses(AndExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), OrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 "a&&(b||c)&&d");
    assertParses(AndExpr.of(OrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), OrExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 "(a || b) && (c || d)");
    assertParses(AndExpr.of(OrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), OrExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 "(a||b)&&(c||d)");
  }

  @Test
  public void parseBitwiseOrExprs() {
    assertParses(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a | b");
    assertParses(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a|b");
    assertParses(BitwiseOrExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "a | b | c");
    assertParses(BitwiseOrExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "a|b|c");
  }

  @Test
  public void parseBitwiseXorExprs() {
    assertParses(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a ^ b");
    assertParses(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a^b");
    assertParses(BitwiseXorExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "a ^ b ^ c");
    assertParses(BitwiseXorExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "a^b^c");
  }

  @Test
  public void parseBitwiseAndExprs() {
    assertParses(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a & b");
    assertParses(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a&b");
    assertParses(BitwiseAndExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "a & b & c");
    assertParses(BitwiseAndExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "a&b&c");
  }

  @Test
  public void parseBitwiseNotExprs() {
    assertParses(BitwiseNotExpr.of(ContextExpr.child(Term.of("a"))),
                 "~a");
  }

  @Test
  public void parseBitwiseExprs() {
    assertParses(BitwiseOrExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "a & b | c");
    assertParses(BitwiseOrExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "a&b|c");
    assertParses(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), BitwiseAndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 "a | b & c");
    assertParses(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), BitwiseAndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 "a|b&c");
    assertParses(BitwiseOrExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseAndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 "a & b | c & d");
    assertParses(BitwiseOrExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseAndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 "a&b|c&d");
    assertParses(BitwiseOrExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), BitwiseAndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 "a | b & c | d");
    assertParses(BitwiseOrExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), BitwiseAndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 "a|b&c|d");

    assertParses(BitwiseXorExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "a & b ^ c");
    assertParses(BitwiseXorExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "a&b^c");
    assertParses(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), BitwiseAndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 "a ^ b & c");
    assertParses(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), BitwiseAndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 "a^b&c");
    assertParses(BitwiseXorExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseAndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 "a & b ^ c & d");
    assertParses(BitwiseXorExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseAndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 "a&b^c&d");
    assertParses(BitwiseXorExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), BitwiseAndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 "a ^ b & c ^ d");
    assertParses(BitwiseXorExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), BitwiseAndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 "a^b&c^d");

    assertParses(BitwiseOrExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "a ^ b | c");
    assertParses(BitwiseOrExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "a^b|c");
    assertParses(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), BitwiseXorExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 "a | b ^ c");
    assertParses(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), BitwiseXorExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 "a|b^c");
    assertParses(BitwiseOrExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseXorExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 "a ^ b | c ^ d");
    assertParses(BitwiseOrExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseXorExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 "a^b|c^d");
    assertParses(BitwiseOrExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), BitwiseXorExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 "a | b ^ c | d");
    assertParses(BitwiseOrExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), BitwiseXorExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 "a|b^c|d");
  }

  @Test
  public void parseAssociatedBitwiseExprs() {
    assertParses(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), BitwiseOrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 "a & (b | c)");
    assertParses(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), BitwiseOrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 "a&(b|c)");
    assertParses(BitwiseAndExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "(a | b) & c");
    assertParses(BitwiseAndExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "(a|b)&c");
    assertParses(BitwiseAndExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), BitwiseOrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 "a & (b | c) & d");
    assertParses(BitwiseAndExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), BitwiseOrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 "a&(b|c)&d");
    assertParses(BitwiseAndExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseOrExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 "(a | b) & (c | d)");
    assertParses(BitwiseAndExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseOrExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 "(a|b)&(c|d)");

    assertParses(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), BitwiseXorExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 "a & (b ^ c)");
    assertParses(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), BitwiseXorExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 "a&(b^c)");
    assertParses(BitwiseAndExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "(a ^ b) & c");
    assertParses(BitwiseAndExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "(a^b)&c");
    assertParses(BitwiseAndExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), BitwiseXorExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 "a & (b ^ c) & d");
    assertParses(BitwiseAndExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), BitwiseXorExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 "a&(b^c)&d");
    assertParses(BitwiseAndExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseXorExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 "(a ^ b) & (c ^ d)");
    assertParses(BitwiseAndExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseXorExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 "(a^b)&(c^d)");

    assertParses(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), BitwiseOrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 "a ^ (b | c)");
    assertParses(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), BitwiseOrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 "a^(b|c)");
    assertParses(BitwiseXorExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "(a | b) ^ c");
    assertParses(BitwiseXorExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "(a|b)^c");
    assertParses(BitwiseXorExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), BitwiseOrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 "a ^ (b | c) ^ d");
    assertParses(BitwiseXorExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), BitwiseOrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 "a^(b|c)^d");
    assertParses(BitwiseXorExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseOrExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 "(a | b) ^ (c | d)");
    assertParses(BitwiseXorExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseOrExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 "(a|b)^(c|d)");
  }

  @Test
  public void parseBitwiseLogicalExprs() {
    assertParses(OrExpr.of(ContextExpr.child(Term.of("a")), AndExpr.of(ContextExpr.child(Term.of("b")), BitwiseOrExpr.of(ContextExpr.child(Term.of("c")), BitwiseXorExpr.of(ContextExpr.child(Term.of("d")), BitwiseAndExpr.of(ContextExpr.child(Term.of("e")), ContextExpr.child(Term.of("f"))))))),
                 "a || b && c | d ^ e & f");
    assertParses(OrExpr.of(ContextExpr.child(Term.of("a")), AndExpr.of(ContextExpr.child(Term.of("b")), BitwiseOrExpr.of(ContextExpr.child(Term.of("c")), BitwiseXorExpr.of(ContextExpr.child(Term.of("d")), BitwiseAndExpr.of(ContextExpr.child(Term.of("e")), ContextExpr.child(Term.of("f"))))))),
                 "a||b&&c|d^e&f");
    assertParses(OrExpr.of(AndExpr.of(BitwiseOrExpr.of(BitwiseXorExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("f")), ContextExpr.child(Term.of("e"))), ContextExpr.child(Term.of("d"))), ContextExpr.child(Term.of("c"))), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("a"))),
                 "f & e ^ d | c && b || a");
    assertParses(OrExpr.of(AndExpr.of(BitwiseOrExpr.of(BitwiseXorExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("f")), ContextExpr.child(Term.of("e"))), ContextExpr.child(Term.of("d"))), ContextExpr.child(Term.of("c"))), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("a"))),
                 "f&e^d|c&&b||a");
  }

  @Test
  public void parseLtExprs() {
    assertParses(LtExpr.of(ContextExpr.child(Term.of("a")), Term.of(42)),
                 "a < 42");
    assertParses(LtExpr.of(ContextExpr.child(Term.of("a")), Term.of(42)),
                 "a<42");
    assertParses(LtExpr.of(Term.of(42), ContextExpr.child(Term.of("b"))),
                 "42 < b");
    assertParses(LtExpr.of(Term.of(42), ContextExpr.child(Term.of("b"))),
                 "42<b");
    assertParses(LtExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a < b");
    assertParses(LtExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a<b");
  }

  @Test
  public void parseLeExprs() {
    assertParses(LeExpr.of(ContextExpr.child(Term.of("a")), Term.of(42)),
                 "a <= 42");
    assertParses(LeExpr.of(ContextExpr.child(Term.of("a")), Term.of(42)),
                 "a<=42");
    assertParses(LeExpr.of(Term.of(42), ContextExpr.child(Term.of("b"))),
                 "42 <= b");
    assertParses(LeExpr.of(Term.of(42), ContextExpr.child(Term.of("b"))),
                 "42<=b");
    assertParses(LeExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a <= b");
    assertParses(LeExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a<=b");
  }

  @Test
  public void parseEqExprs() {
    assertParses(EqExpr.of(ContextExpr.child(Term.of("a")), Term.of(42)),
                 "a == 42");
    assertParses(EqExpr.of(ContextExpr.child(Term.of("a")), Term.of(42)),
                 "a==42");
    assertParses(EqExpr.of(Term.of(42), ContextExpr.child(Term.of("b"))),
                 "42 == b");
    assertParses(EqExpr.of(Term.of(42), ContextExpr.child(Term.of("b"))),
                 "42==b");
    assertParses(EqExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a == b");
    assertParses(EqExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a==b");
  }

  @Test
  public void parseNeExprs() {
    assertParses(NeExpr.of(ContextExpr.child(Term.of("a")), Term.of(42)),
                 "a != 42");
    assertParses(NeExpr.of(ContextExpr.child(Term.of("a")), Term.of(42)),
                 "a!=42");
    assertParses(NeExpr.of(Term.of(42), ContextExpr.child(Term.of("b"))),
                 "42 != b");
    assertParses(NeExpr.of(Term.of(42), ContextExpr.child(Term.of("b"))),
                 "42!=b");
    assertParses(NeExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a != b");
    assertParses(NeExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a!=b");
  }

  @Test
  public void parseGeExprs() {
    assertParses(GeExpr.of(ContextExpr.child(Term.of("a")), Term.of(42)),
                 "a >= 42");
    assertParses(GeExpr.of(ContextExpr.child(Term.of("a")), Term.of(42)),
                 "a>=42");
    assertParses(GeExpr.of(Term.of(42), ContextExpr.child(Term.of("b"))),
                 "42 >= b");
    assertParses(GeExpr.of(Term.of(42), ContextExpr.child(Term.of("b"))),
                 "42>=b");
    assertParses(GeExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a >= b");
    assertParses(GeExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a>=b");
  }

  @Test
  public void parseGtExprs() {
    assertParses(GtExpr.of(ContextExpr.child(Term.of("a")), Term.of(42)),
                 "a > 42");
    assertParses(GtExpr.of(ContextExpr.child(Term.of("a")), Term.of(42)),
                 "a>42");
    assertParses(GtExpr.of(Term.of(42), ContextExpr.child(Term.of("b"))),
                 "42 > b");
    assertParses(GtExpr.of(Term.of(42), ContextExpr.child(Term.of("b"))),
                 "42>b");
    assertParses(GtExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a > b");
    assertParses(GtExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a>b");
  }

  @Test
  public void parsePlusExprs() {
    assertParses(PlusExpr.of(ContextExpr.child(Term.of("b")), Term.of(2)),
                 "b + 2");
    assertParses(PlusExpr.of(ContextExpr.child(Term.of("b")), Term.of(2)),
                 "b+2");
    assertParses(PlusExpr.of(Term.of(2), ContextExpr.child(Term.of("b"))),
                 "2 + b");
    assertParses(PlusExpr.of(Term.of(2), ContextExpr.child(Term.of("b"))),
                 "2+b");
    assertParses(PlusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a + b");
    assertParses(PlusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a+b");
    assertParses(PlusExpr.of(PlusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "a + b + c");
    assertParses(PlusExpr.of(PlusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "a+b+c");
  }

  @Test
  public void parseMinusExprs() {
    assertParses(MinusExpr.of(ContextExpr.child(Term.of("a")), Term.of(2)),
                 "a - 2");
    assertParses(MinusExpr.of(ContextExpr.child(Term.of("a")), Term.of(2)),
                 "a-2");
    assertParses(MinusExpr.of(Term.of(2), ContextExpr.child(Term.of("b"))),
                 "2 - b");
    assertParses(MinusExpr.of(Term.of(2), ContextExpr.child(Term.of("b"))),
                 "2-b");
    assertParses(MinusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a - b");
    assertParses(MinusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a-b");
    assertParses(MinusExpr.of(MinusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "a - b - c");
    assertParses(MinusExpr.of(MinusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "a-b-c");
  }

  @Test
  public void parseNegativeExprs() {
    assertParses(NegativeExpr.of(ContextExpr.child(Term.of("a"))),
                 "-a");
  }

  @Test
  public void parsePositiveExprs() {
    assertParses(PositiveExpr.of(ContextExpr.child(Term.of("a"))),
                 "+a");
  }

  @Test
  public void parseTimesExprs() {
    assertParses(TimesExpr.of(ContextExpr.child(Term.of("a")), Term.of(2)),
                 "a * 2");
    assertParses(TimesExpr.of(ContextExpr.child(Term.of("a")), Term.of(2)),
                 "a*2");
    assertParses(TimesExpr.of(Term.of(2), ContextExpr.child(Term.of("b"))),
                 "2 * b");
    assertParses(TimesExpr.of(Term.of(2), ContextExpr.child(Term.of("b"))),
                 "2*b");
    assertParses(TimesExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a * b");
    assertParses(TimesExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a*b");
    assertParses(TimesExpr.of(TimesExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "a * b * c");
    assertParses(TimesExpr.of(TimesExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "a*b*c");
  }

  @Test
  public void parseDivideExprs() {
    assertParses(DivideExpr.of(ContextExpr.child(Term.of("a")), Term.of(2)),
                 "a / 2");
    assertParses(DivideExpr.of(ContextExpr.child(Term.of("a")), Term.of(2)),
                 "a/2");
    assertParses(DivideExpr.of(Term.of(2), ContextExpr.child(Term.of("b"))),
                 "2 / b");
    assertParses(DivideExpr.of(Term.of(2), ContextExpr.child(Term.of("b"))),
                 "2/b");
    assertParses(DivideExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a / b");
    assertParses(DivideExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a/b");
    assertParses(DivideExpr.of(DivideExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "a / b / c");
    assertParses(DivideExpr.of(DivideExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "a/b/c");
  }

  @Test
  public void parseModuloExprs() {
    assertParses(ModuloExpr.of(ContextExpr.child(Term.of("a")), Term.of(2)),
                 "a % 2");
    assertParses(ModuloExpr.of(ContextExpr.child(Term.of("a")), Term.of(2)),
                 "a%2");
    assertParses(ModuloExpr.of(Term.of(2), ContextExpr.child(Term.of("b"))),
                 "2 % b");
    assertParses(ModuloExpr.of(Term.of(2), ContextExpr.child(Term.of("b"))),
                 "2%b");
    assertParses(ModuloExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a % b");
    assertParses(ModuloExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 "a%b");
    assertParses(ModuloExpr.of(ModuloExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "a % b % c");
    assertParses(ModuloExpr.of(ModuloExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "a%b%c");
  }

  @Test
  public void parseArithmeticExprs() {
    assertParses(PlusExpr.of(TimesExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "a * b + c");
    assertParses(PlusExpr.of(TimesExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "a*b+c");
    assertParses(PlusExpr.of(ContextExpr.child(Term.of("a")), TimesExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 "a + b * c");
    assertParses(PlusExpr.of(ContextExpr.child(Term.of("a")), TimesExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 "a+b*c");
    assertParses(PlusExpr.of(TimesExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), TimesExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 "a * b + c * d");
    assertParses(PlusExpr.of(TimesExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), TimesExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 "a*b+c*d");
    assertParses(PlusExpr.of(PlusExpr.of(ContextExpr.child(Term.of("a")), TimesExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 "a + b * c + d");
    assertParses(PlusExpr.of(PlusExpr.of(ContextExpr.child(Term.of("a")), TimesExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 "a+b*c+d");
  }

  @Test
  public void parseAssociatedArithmeticExprs() {
    assertParses(TimesExpr.of(ContextExpr.child(Term.of("a")), PlusExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 "a * (b + c)");
    assertParses(TimesExpr.of(ContextExpr.child(Term.of("a")), PlusExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 "a*(b+c)");
    assertParses(TimesExpr.of(PlusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "(a + b) * c");
    assertParses(TimesExpr.of(PlusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 "(a+b)*c");
    assertParses(TimesExpr.of(TimesExpr.of(ContextExpr.child(Term.of("a")), PlusExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 "a * (b + c) * d");
    assertParses(TimesExpr.of(TimesExpr.of(ContextExpr.child(Term.of("a")), PlusExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 "a*(b+c)*d");
    assertParses(TimesExpr.of(PlusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), PlusExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 "(a + b) * (c + d)");
    assertParses(TimesExpr.of(PlusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), PlusExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 "(a+b)*(c+d)");
  }

  public static void assertParses(Term expected, String string) {
    ExprAssertions.assertParses(Expr.parse(), expected, string);
    ExprAssertions.assertParses(Expr.parse(), expected, " " + string + " ");
  }

  public static void assertParseFails(final String string) {
    assertThrows(ParseException.class, () -> {
      Expr.parse(string);
    });
  }

}
