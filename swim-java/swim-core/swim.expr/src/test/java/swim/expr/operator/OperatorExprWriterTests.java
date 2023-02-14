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
import swim.expr.ContextExpr;
import swim.expr.Expr;
import swim.expr.ExprAssertions;
import swim.expr.ExprWriterOptions;
import swim.expr.Term;

public class OperatorExprWriterTests {

  @Test
  public void writeConditionalExprs() {
    assertWrites("a ? b : c",
                 CondExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.readable());
    assertWrites("a?b:c",
                 CondExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.compact());
    assertWrites("a ? b : c ? d : e",
                 CondExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")), CondExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")), ContextExpr.child(Term.of("e")))),
                 ExprWriterOptions.readable());
    assertWrites("a?b:c?d:e",
                 CondExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")), CondExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")), ContextExpr.child(Term.of("e")))),
                 ExprWriterOptions.compact());
  }

  @Test
  public void writeAssociatedConditionalExprs() {
    assertWrites("(a ? b : c) ? d : e",
                 CondExpr.of(CondExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))), ContextExpr.child(Term.of("d")), ContextExpr.child(Term.of("e"))),
                 ExprWriterOptions.readable());
    assertWrites("(a?b:c)?d:e",
                 CondExpr.of(CondExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))), ContextExpr.child(Term.of("d")), ContextExpr.child(Term.of("e"))),
                 ExprWriterOptions.compact());
  }

  @Test
  public void writeLogicalOrExprs() {
    assertWrites("a || b",
                 OrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.readable());
    assertWrites("a||b",
                 OrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.compact());
    assertWrites("a || b || c",
                 OrExpr.of(OrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.readable());
    assertWrites("a||b||c",
                 OrExpr.of(OrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.compact());
  }

  @Test
  public void writeLogicalAndExprs() {
    assertWrites("a && b",
                 AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.readable());
    assertWrites("a&&b",
                 AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.compact());
    assertWrites("a && b && c",
                 AndExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.readable());
    assertWrites("a&&b&&c",
                 AndExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.compact());
  }

  @Test
  public void writeLogicalNotExprs() {
    assertWrites("!a",
                 NotExpr.of(ContextExpr.child(Term.of("a"))));
  }

  @Test
  public void writeLogicalExprs() {
    assertWrites("a && b || c",
                 OrExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.readable());
    assertWrites("a&&b||c",
                 OrExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.compact());
    assertWrites("a || b && c",
                 OrExpr.of(ContextExpr.child(Term.of("a")), AndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 ExprWriterOptions.readable());
    assertWrites("a||b&&c",
                 OrExpr.of(ContextExpr.child(Term.of("a")), AndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 ExprWriterOptions.compact());
    assertWrites("a && b || c && d",
                 OrExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), AndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 ExprWriterOptions.readable());
    assertWrites("a&&b||c&&d",
                 OrExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), AndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 ExprWriterOptions.compact());
    assertWrites("a || b && c || d",
                 OrExpr.of(OrExpr.of(ContextExpr.child(Term.of("a")), AndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 ExprWriterOptions.readable());
    assertWrites("a||b&&c||d",
                 OrExpr.of(OrExpr.of(ContextExpr.child(Term.of("a")), AndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 ExprWriterOptions.compact());

    assertWrites("!(a && b) || c && d",
                 OrExpr.of(NotExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))), AndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 ExprWriterOptions.readable());
    assertWrites("!(a&&b)||c&&d",
                 OrExpr.of(NotExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))), AndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 ExprWriterOptions.compact());
    assertWrites("a && b || !(c && d)",
                 OrExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), NotExpr.of(AndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 ExprWriterOptions.readable());
    assertWrites("a&&b||!(c&&d)",
                 OrExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), NotExpr.of(AndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 ExprWriterOptions.compact());
    assertWrites("!(a && b) || !(c && d)",
                 OrExpr.of(NotExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))), NotExpr.of(AndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 ExprWriterOptions.readable());
    assertWrites("!(a&&b)||!(c&&d)",
                 OrExpr.of(NotExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b")))), NotExpr.of(AndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 ExprWriterOptions.compact());
    assertWrites("!(a && b || c && d)",
                 NotExpr.of(OrExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), AndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 ExprWriterOptions.readable());
    assertWrites("!(a&&b||c&&d)",
                 NotExpr.of(OrExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), AndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d"))))),
                 ExprWriterOptions.compact());
    assertWrites("a && !(b || c) && d",
                 AndExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), NotExpr.of(OrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))))), ContextExpr.child(Term.of("d"))),
                 ExprWriterOptions.readable());
    assertWrites("a&&!(b||c)&&d",
                 AndExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), NotExpr.of(OrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c"))))), ContextExpr.child(Term.of("d"))),
                 ExprWriterOptions.compact());
  }

  @Test
  public void writeAssociatedLogicalExprs() {
    assertWrites("a && (b || c)",
                 AndExpr.of(ContextExpr.child(Term.of("a")), OrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 ExprWriterOptions.readable());
    assertWrites("a&&(b||c)",
                 AndExpr.of(ContextExpr.child(Term.of("a")), OrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 ExprWriterOptions.compact());
    assertWrites("(a || b) && c",
                 AndExpr.of(OrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.readable());
    assertWrites("(a||b)&&c",
                 AndExpr.of(OrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.compact());
    assertWrites("a && (b || c) && d",
                 AndExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), OrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 ExprWriterOptions.readable());
    assertWrites("a&&(b||c)&&d",
                 AndExpr.of(AndExpr.of(ContextExpr.child(Term.of("a")), OrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 ExprWriterOptions.compact());
    assertWrites("(a || b) && (c || d)",
                 AndExpr.of(OrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), OrExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 ExprWriterOptions.readable());
    assertWrites("(a||b)&&(c||d)",
                 AndExpr.of(OrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), OrExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 ExprWriterOptions.compact());
  }

  @Test
  public void writeBitwiseOrExprs() {
    assertWrites("a | b",
                 BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.readable());
    assertWrites("a|b",
                 BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.compact());
    assertWrites("a | b | c",
                 BitwiseOrExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.readable());
    assertWrites("a|b|c",
                 BitwiseOrExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.compact());
  }

  @Test
  public void writeBitwiseXorExprs() {
    assertWrites("a ^ b",
                 BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.readable());
    assertWrites("a^b",
                 BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.compact());
    assertWrites("a ^ b ^ c",
                 BitwiseXorExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.readable());
    assertWrites("a^b^c",
                 BitwiseXorExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.compact());
  }

  @Test
  public void writeBitwiseAndExprs() {
    assertWrites("a & b",
                 BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.readable());
    assertWrites("a&b",
                 BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.compact());
    assertWrites("a & b & c",
                 BitwiseAndExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.readable());
    assertWrites("a&b&c",
                 BitwiseAndExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.compact());
  }

  @Test
  public void writeBitwiseNotExprs() {
    assertWrites("~a",
                 BitwiseNotExpr.of(ContextExpr.child(Term.of("a"))));
  }

  @Test
  public void writeBitwiseExprs() {
    assertWrites("a & b | c",
                 BitwiseOrExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.readable());
    assertWrites("a&b|c",
                 BitwiseOrExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.compact());
    assertWrites("a | b & c",
                 BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), BitwiseAndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 ExprWriterOptions.readable());
    assertWrites("a|b&c",
                 BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), BitwiseAndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 ExprWriterOptions.compact());
    assertWrites("a & b | c & d",
                 BitwiseOrExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseAndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 ExprWriterOptions.readable());
    assertWrites("a&b|c&d",
                 BitwiseOrExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseAndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 ExprWriterOptions.compact());
    assertWrites("a | b & c | d",
                 BitwiseOrExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), BitwiseAndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 ExprWriterOptions.readable());
    assertWrites("a|b&c|d",
                 BitwiseOrExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), BitwiseAndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 ExprWriterOptions.compact());

    assertWrites("a & b ^ c",
                 BitwiseXorExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.readable());
    assertWrites("a&b^c",
                 BitwiseXorExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.compact());
    assertWrites("a ^ b & c",
                 BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), BitwiseAndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 ExprWriterOptions.readable());
    assertWrites("a^b&c",
                 BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), BitwiseAndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 ExprWriterOptions.compact());
    assertWrites("a & b ^ c & d",
                 BitwiseXorExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseAndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 ExprWriterOptions.readable());
    assertWrites("a&b^c&d",
                 BitwiseXorExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseAndExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 ExprWriterOptions.compact());
    assertWrites("a ^ b & c ^ d",
                 BitwiseXorExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), BitwiseAndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 ExprWriterOptions.readable());
    assertWrites("a^b&c^d",
                 BitwiseXorExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), BitwiseAndExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 ExprWriterOptions.compact());

    assertWrites("a ^ b | c",
                 BitwiseOrExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.readable());
    assertWrites("a^b|c",
                 BitwiseOrExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.compact());
    assertWrites("a | b ^ c",
                 BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), BitwiseXorExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 ExprWriterOptions.readable());
    assertWrites("a|b^c",
                 BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), BitwiseXorExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 ExprWriterOptions.compact());
    assertWrites("a ^ b | c ^ d",
                 BitwiseOrExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseXorExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 ExprWriterOptions.readable());
    assertWrites("a^b|c^d",
                 BitwiseOrExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseXorExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 ExprWriterOptions.compact());
    assertWrites("a | b ^ c | d",
                 BitwiseOrExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), BitwiseXorExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 ExprWriterOptions.readable());
    assertWrites("a|b^c|d",
                 BitwiseOrExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), BitwiseXorExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 ExprWriterOptions.compact());
  }

  @Test
  public void writeAssociatedBitwiseExprs() {
    assertWrites("a & (b | c)",
                 BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), BitwiseOrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 ExprWriterOptions.readable());
    assertWrites("a&(b|c)",
                 BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), BitwiseOrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 ExprWriterOptions.compact());
    assertWrites("(a | b) & c",
                 BitwiseAndExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.readable());
    assertWrites("(a|b)&c",
                 BitwiseAndExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.compact());
    assertWrites("a & (b | c) & d",
                 BitwiseAndExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), BitwiseOrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 ExprWriterOptions.readable());
    assertWrites("a&(b|c)&d",
                 BitwiseAndExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), BitwiseOrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 ExprWriterOptions.compact());
    assertWrites("(a | b) & (c | d)",
                 BitwiseAndExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseOrExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 ExprWriterOptions.readable());
    assertWrites("(a|b)&(c|d)",
                 BitwiseAndExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseOrExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 ExprWriterOptions.compact());

    assertWrites("a & (b ^ c)",
                 BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), BitwiseXorExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 ExprWriterOptions.readable());
    assertWrites("a&(b^c)",
                 BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), BitwiseXorExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 ExprWriterOptions.compact());
    assertWrites("(a ^ b) & c",
                 BitwiseAndExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.readable());
    assertWrites("(a^b)&c",
                 BitwiseAndExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.compact());
    assertWrites("a & (b ^ c) & d",
                 BitwiseAndExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), BitwiseXorExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 ExprWriterOptions.readable());
    assertWrites("a&(b^c)&d",
                 BitwiseAndExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("a")), BitwiseXorExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 ExprWriterOptions.compact());
    assertWrites("(a ^ b) & (c ^ d)",
                 BitwiseAndExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseXorExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 ExprWriterOptions.readable());
    assertWrites("(a^b)&(c^d)",
                 BitwiseAndExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseXorExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 ExprWriterOptions.compact());

    assertWrites("a ^ (b | c)",
                 BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), BitwiseOrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 ExprWriterOptions.readable());
    assertWrites("a^(b|c)",
                 BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), BitwiseOrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 ExprWriterOptions.compact());
    assertWrites("(a | b) ^ c",
                 BitwiseXorExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.readable());
    assertWrites("(a|b)^c",
                 BitwiseXorExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.compact());
    assertWrites("a ^ (b | c) ^ d",
                 BitwiseXorExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), BitwiseOrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 ExprWriterOptions.readable());
    assertWrites("a^(b|c)^d",
                 BitwiseXorExpr.of(BitwiseXorExpr.of(ContextExpr.child(Term.of("a")), BitwiseOrExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 ExprWriterOptions.compact());
    assertWrites("(a | b) ^ (c | d)",
                 BitwiseXorExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseOrExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 ExprWriterOptions.readable());
    assertWrites("(a|b)^(c|d)",
                 BitwiseXorExpr.of(BitwiseOrExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), BitwiseOrExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 ExprWriterOptions.compact());
  }

  @Test
  public void writeBitwiseLogicalExprs() {
    assertWrites("a || b && c | d ^ e & f",
                 OrExpr.of(ContextExpr.child(Term.of("a")), AndExpr.of(ContextExpr.child(Term.of("b")), BitwiseOrExpr.of(ContextExpr.child(Term.of("c")), BitwiseXorExpr.of(ContextExpr.child(Term.of("d")), BitwiseAndExpr.of(ContextExpr.child(Term.of("e")), ContextExpr.child(Term.of("f"))))))),
                 ExprWriterOptions.readable());
    assertWrites("a||b&&c|d^e&f",
                 OrExpr.of(ContextExpr.child(Term.of("a")), AndExpr.of(ContextExpr.child(Term.of("b")), BitwiseOrExpr.of(ContextExpr.child(Term.of("c")), BitwiseXorExpr.of(ContextExpr.child(Term.of("d")), BitwiseAndExpr.of(ContextExpr.child(Term.of("e")), ContextExpr.child(Term.of("f"))))))),
                 ExprWriterOptions.compact());
    assertWrites("f & e ^ d | c && b || a",
                 OrExpr.of(AndExpr.of(BitwiseOrExpr.of(BitwiseXorExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("f")), ContextExpr.child(Term.of("e"))), ContextExpr.child(Term.of("d"))), ContextExpr.child(Term.of("c"))), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("a"))),
                 ExprWriterOptions.readable());
    assertWrites("f&e^d|c&&b||a",
                 OrExpr.of(AndExpr.of(BitwiseOrExpr.of(BitwiseXorExpr.of(BitwiseAndExpr.of(ContextExpr.child(Term.of("f")), ContextExpr.child(Term.of("e"))), ContextExpr.child(Term.of("d"))), ContextExpr.child(Term.of("c"))), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("a"))),
                 ExprWriterOptions.compact());
  }

  @Test
  public void writeLtExprs() {
    assertWrites("a < 42",
                 LtExpr.of(ContextExpr.child(Term.of("a")), Term.of(42)),
                 ExprWriterOptions.readable());
    assertWrites("a<42",
                 LtExpr.of(ContextExpr.child(Term.of("a")), Term.of(42)),
                 ExprWriterOptions.compact());
    assertWrites("42 < b",
                 LtExpr.of(Term.of(42), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.readable());
    assertWrites("42<b",
                 LtExpr.of(Term.of(42), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.compact());
    assertWrites("a < b",
                 LtExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.readable());
    assertWrites("a<b",
                 LtExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.compact());
  }

  @Test
  public void writeLeExprs() {
    assertWrites("a <= 42",
                 LeExpr.of(ContextExpr.child(Term.of("a")), Term.of(42)),
                 ExprWriterOptions.readable());
    assertWrites("a<=42",
                 LeExpr.of(ContextExpr.child(Term.of("a")), Term.of(42)),
                 ExprWriterOptions.compact());
    assertWrites("42 <= b",
                 LeExpr.of(Term.of(42), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.readable());
    assertWrites("42<=b",
                 LeExpr.of(Term.of(42), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.compact());
    assertWrites("a <= b",
                 LeExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.readable());
    assertWrites("a<=b",
                 LeExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.compact());
  }

  @Test
  public void writeEqExprs() {
    assertWrites("a == 42",
                 EqExpr.of(ContextExpr.child(Term.of("a")), Term.of(42)),
                 ExprWriterOptions.readable());
    assertWrites("a==42",
                 EqExpr.of(ContextExpr.child(Term.of("a")), Term.of(42)),
                 ExprWriterOptions.compact());
    assertWrites("42 == b",
                 EqExpr.of(Term.of(42), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.readable());
    assertWrites("42==b",
                 EqExpr.of(Term.of(42), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.compact());
    assertWrites("a == b",
                 EqExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.readable());
    assertWrites("a==b",
                 EqExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.compact());
  }

  @Test
  public void writeNeExprs() {
    assertWrites("a != 42",
                 NeExpr.of(ContextExpr.child(Term.of("a")), Term.of(42)),
                 ExprWriterOptions.readable());
    assertWrites("a!=42",
                 NeExpr.of(ContextExpr.child(Term.of("a")), Term.of(42)),
                 ExprWriterOptions.compact());
    assertWrites("42 != b",
                 NeExpr.of(Term.of(42), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.readable());
    assertWrites("42!=b",
                 NeExpr.of(Term.of(42), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.compact());
    assertWrites("a != b",
                 NeExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.readable());
    assertWrites("a!=b",
                 NeExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.compact());
  }

  @Test
  public void writeGeExprs() {
    assertWrites("a >= 42",
                 GeExpr.of(ContextExpr.child(Term.of("a")), Term.of(42)),
                 ExprWriterOptions.readable());
    assertWrites("a>=42",
                 GeExpr.of(ContextExpr.child(Term.of("a")), Term.of(42)),
                 ExprWriterOptions.compact());
    assertWrites("42 >= b",
                 GeExpr.of(Term.of(42), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.readable());
    assertWrites("42>=b",
                 GeExpr.of(Term.of(42), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.compact());
    assertWrites("a >= b",
                 GeExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.readable());
    assertWrites("a>=b",
                 GeExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.compact());
  }

  @Test
  public void writeGtExprs() {
    assertWrites("a > 42",
                 GtExpr.of(ContextExpr.child(Term.of("a")), Term.of(42)),
                 ExprWriterOptions.readable());
    assertWrites("a>42",
                 GtExpr.of(ContextExpr.child(Term.of("a")), Term.of(42)),
                 ExprWriterOptions.compact());
    assertWrites("42 > b",
                 GtExpr.of(Term.of(42), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.readable());
    assertWrites("42>b",
                 GtExpr.of(Term.of(42), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.compact());
    assertWrites("a > b",
                 GtExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.readable());
    assertWrites("a>b",
                 GtExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.compact());
  }

  @Test
  public void writePlusExprs() {
    assertWrites("a + 2",
                 PlusExpr.of(ContextExpr.child(Term.of("a")), Term.of(2)),
                 ExprWriterOptions.readable());
    assertWrites("a+2",
                 PlusExpr.of(ContextExpr.child(Term.of("a")), Term.of(2)),
                 ExprWriterOptions.compact());
    assertWrites("2 + b",
                 PlusExpr.of(Term.of(2), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.readable());
    assertWrites("2+b",
                 PlusExpr.of(Term.of(2), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.compact());
    assertWrites("a + b",
                 PlusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.readable());
    assertWrites("a+b",
                 PlusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.compact());
    assertWrites("a + b + c",
                 PlusExpr.of(PlusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.readable());
    assertWrites("a+b+c",
                 PlusExpr.of(PlusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.compact());
  }

  @Test
  public void writeMinusExprs() {
    assertWrites("a - 2",
                 MinusExpr.of(ContextExpr.child(Term.of("a")), Term.of(2)),
                 ExprWriterOptions.readable());
    assertWrites("a-2",
                 MinusExpr.of(ContextExpr.child(Term.of("a")), Term.of(2)),
                 ExprWriterOptions.compact());
    assertWrites("2 - b",
                 MinusExpr.of(Term.of(2), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.readable());
    assertWrites("2-b",
                 MinusExpr.of(Term.of(2), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.compact());
    assertWrites("a - b",
                 MinusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.readable());
    assertWrites("a-b",
                 MinusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.compact());
    assertWrites("a - b - c",
                 MinusExpr.of(MinusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.readable());
    assertWrites("a-b-c",
                 MinusExpr.of(MinusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.compact());
  }

  @Test
  public void writeNegativeExprs() {
    assertWrites("-a",
                 NegativeExpr.of(ContextExpr.child(Term.of("a"))));
  }

  @Test
  public void writePositiveExprs() {
    assertWrites("+a",
                 PositiveExpr.of(ContextExpr.child(Term.of("a"))));
  }

  @Test
  public void writeTimesExprs() {
    assertWrites("a * 2",
                 TimesExpr.of(ContextExpr.child(Term.of("a")), Term.of(2)),
                 ExprWriterOptions.readable());
    assertWrites("a*2",
                 TimesExpr.of(ContextExpr.child(Term.of("a")), Term.of(2)),
                 ExprWriterOptions.compact());
    assertWrites("2 * b",
                 TimesExpr.of(Term.of(2), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.readable());
    assertWrites("2*b",
                 TimesExpr.of(Term.of(2), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.compact());
    assertWrites("a * b",
                 TimesExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.readable());
    assertWrites("a*b",
                 TimesExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.compact());
    assertWrites("a * b * c",
                 TimesExpr.of(TimesExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.readable());
    assertWrites("a*b*c",
                 TimesExpr.of(TimesExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.compact());
  }

  @Test
  public void writeDivideExprs() {
    assertWrites("a / 2",
                 DivideExpr.of(ContextExpr.child(Term.of("a")), Term.of(2)),
                 ExprWriterOptions.readable());
    assertWrites("a/2",
                 DivideExpr.of(ContextExpr.child(Term.of("a")), Term.of(2)),
                 ExprWriterOptions.compact());
    assertWrites("2 / b",
                 DivideExpr.of(Term.of(2), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.readable());
    assertWrites("2/b",
                 DivideExpr.of(Term.of(2), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.compact());
    assertWrites("a / b",
                 DivideExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.readable());
    assertWrites("a/b",
                 DivideExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.compact());
    assertWrites("a / b / c",
                 DivideExpr.of(DivideExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.readable());
    assertWrites("a/b/c",
                 DivideExpr.of(DivideExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.compact());
  }

  @Test
  public void writeModuloExprs() {
    assertWrites("a % 2",
                 ModuloExpr.of(ContextExpr.child(Term.of("a")), Term.of(2)),
                 ExprWriterOptions.readable());
    assertWrites("a%2",
                 ModuloExpr.of(ContextExpr.child(Term.of("a")), Term.of(2)),
                 ExprWriterOptions.compact());
    assertWrites("2 % b",
                 ModuloExpr.of(Term.of(2), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.readable());
    assertWrites("2%b",
                 ModuloExpr.of(Term.of(2), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.compact());
    assertWrites("a % b",
                 ModuloExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.readable());
    assertWrites("a%b",
                 ModuloExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))),
                 ExprWriterOptions.compact());
    assertWrites("a % b % c",
                 ModuloExpr.of(ModuloExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.readable());
    assertWrites("a%b%c",
                 ModuloExpr.of(ModuloExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.compact());
  }

  @Test
  public void writeArithmeticExprs() {
    assertWrites("a * b + c",
                 PlusExpr.of(TimesExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.readable());
    assertWrites("a*b+c",
                 PlusExpr.of(TimesExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.compact());
    assertWrites("a + b * c",
                 PlusExpr.of(ContextExpr.child(Term.of("a")), TimesExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 ExprWriterOptions.readable());
    assertWrites("a+b*c",
                 PlusExpr.of(ContextExpr.child(Term.of("a")), TimesExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 ExprWriterOptions.compact());
    assertWrites("a * b + c * d",
                 PlusExpr.of(TimesExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), TimesExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 ExprWriterOptions.readable());
    assertWrites("a*b+c*d",
                 PlusExpr.of(TimesExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), TimesExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 ExprWriterOptions.compact());
    assertWrites("a + b * c + d",
                 PlusExpr.of(PlusExpr.of(ContextExpr.child(Term.of("a")), TimesExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 ExprWriterOptions.readable());
    assertWrites("a+b*c+d",
                 PlusExpr.of(PlusExpr.of(ContextExpr.child(Term.of("a")), TimesExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 ExprWriterOptions.compact());
  }

  @Test
  public void writeAssociatedArithmeticExprs() {
    assertWrites("a * (b + c)",
                 TimesExpr.of(ContextExpr.child(Term.of("a")), PlusExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 ExprWriterOptions.readable());
    assertWrites("a*(b+c)",
                 TimesExpr.of(ContextExpr.child(Term.of("a")), PlusExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))),
                 ExprWriterOptions.compact());
    assertWrites("(a + b) * c",
                 TimesExpr.of(PlusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.readable());
    assertWrites("(a+b)*c",
                 TimesExpr.of(PlusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), ContextExpr.child(Term.of("c"))),
                 ExprWriterOptions.compact());
    assertWrites("a * (b + c) * d",
                 TimesExpr.of(TimesExpr.of(ContextExpr.child(Term.of("a")), PlusExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 ExprWriterOptions.readable());
    assertWrites("a*(b+c)*d",
                 TimesExpr.of(TimesExpr.of(ContextExpr.child(Term.of("a")), PlusExpr.of(ContextExpr.child(Term.of("b")), ContextExpr.child(Term.of("c")))), ContextExpr.child(Term.of("d"))),
                 ExprWriterOptions.compact());
    assertWrites("(a + b) * (c + d)",
                 TimesExpr.of(PlusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), PlusExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 ExprWriterOptions.readable());
    assertWrites("(a+b)*(c+d)",
                 TimesExpr.of(PlusExpr.of(ContextExpr.child(Term.of("a")), ContextExpr.child(Term.of("b"))), PlusExpr.of(ContextExpr.child(Term.of("c")), ContextExpr.child(Term.of("d")))),
                 ExprWriterOptions.compact());
  }

  public static void assertWrites(String expected, Term term, ExprWriterOptions options) {
    ExprAssertions.assertWrites(expected, () -> Expr.write(term, options));
  }

  public static void assertWrites(String expected, Term term) {
    ExprAssertions.assertWrites(expected, () -> Expr.write(term, ExprWriterOptions.readable()));
    ExprAssertions.assertWrites(expected, () -> Expr.write(term, ExprWriterOptions.compact()));
  }

}
