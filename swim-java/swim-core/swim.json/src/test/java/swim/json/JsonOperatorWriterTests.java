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

public class JsonOperatorWriterTests {

  @Test
  public void writeConditionalExprs() {
    assertWrites("a ? b : c",
                 TermRepr.of(CondExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.readable());
    assertWrites("a?b:c",
                 TermRepr.of(CondExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.compact());
    assertWrites("a ? b : c ? d : e",
                 TermRepr.of(CondExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")), CondExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d")), ContextExpr.child(Repr.of("e"))))),
                 JsonWriterOptions.readable());
    assertWrites("a?b:c?d:e",
                 TermRepr.of(CondExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")), CondExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d")), ContextExpr.child(Repr.of("e"))))),
                 JsonWriterOptions.compact());
  }

  @Test
  public void writeAssociatedConditionalExprs() {
    assertWrites("(a ? b : c) ? d : e",
                 TermRepr.of(CondExpr.of(CondExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))), ContextExpr.child(Repr.of("d")), ContextExpr.child(Repr.of("e")))),
                 JsonWriterOptions.readable());
    assertWrites("(a?b:c)?d:e",
                 TermRepr.of(CondExpr.of(CondExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))), ContextExpr.child(Repr.of("d")), ContextExpr.child(Repr.of("e")))),
                 JsonWriterOptions.compact());
  }

  @Test
  public void writeLogicalOrExprs() {
    assertWrites("a || b",
                 TermRepr.of(OrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.readable());
    assertWrites("a||b",
                 TermRepr.of(OrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.compact());
    assertWrites("a || b || c",
                 TermRepr.of(OrExpr.of(OrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.readable());
    assertWrites("a||b||c",
                 TermRepr.of(OrExpr.of(OrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.compact());
  }

  @Test
  public void writeLogicalAndExprs() {
    assertWrites("a && b",
                 TermRepr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.readable());
    assertWrites("a&&b",
                 TermRepr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.compact());
    assertWrites("a && b && c",
                 TermRepr.of(AndExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.readable());
    assertWrites("a&&b&&c",
                 TermRepr.of(AndExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.compact());
  }

  @Test
  public void writeLogicalNotExprs() {
    assertWrites("!a",
                 TermRepr.of(NotExpr.of(ContextExpr.child(Repr.of("a")))));
  }

  @Test
  public void writeLogicalExprs() {
    assertWrites("a && b || c",
                 TermRepr.of(OrExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.readable());
    assertWrites("a&&b||c",
                 TermRepr.of(OrExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.compact());
    assertWrites("a || b && c",
                 TermRepr.of(OrExpr.of(ContextExpr.child(Repr.of("a")), AndExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 JsonWriterOptions.readable());
    assertWrites("a||b&&c",
                 TermRepr.of(OrExpr.of(ContextExpr.child(Repr.of("a")), AndExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 JsonWriterOptions.compact());
    assertWrites("a && b || c && d",
                 TermRepr.of(OrExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), AndExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 JsonWriterOptions.readable());
    assertWrites("a&&b||c&&d",
                 TermRepr.of(OrExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), AndExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 JsonWriterOptions.compact());
    assertWrites("a || b && c || d",
                 TermRepr.of(OrExpr.of(OrExpr.of(ContextExpr.child(Repr.of("a")), AndExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 JsonWriterOptions.readable());
    assertWrites("a||b&&c||d",
                 TermRepr.of(OrExpr.of(OrExpr.of(ContextExpr.child(Repr.of("a")), AndExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 JsonWriterOptions.compact());

    assertWrites("!(a && b) || c && d",
                 TermRepr.of(OrExpr.of(NotExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))), AndExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 JsonWriterOptions.readable());
    assertWrites("!(a&&b)||c&&d",
                 TermRepr.of(OrExpr.of(NotExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))), AndExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 JsonWriterOptions.compact());
    assertWrites("a && b || !(c && d)",
                 TermRepr.of(OrExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), NotExpr.of(AndExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d")))))),
                 JsonWriterOptions.readable());
    assertWrites("a&&b||!(c&&d)",
                 TermRepr.of(OrExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), NotExpr.of(AndExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d")))))),
                 JsonWriterOptions.compact());
    assertWrites("!(a && b) || !(c && d)",
                 TermRepr.of(OrExpr.of(NotExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))), NotExpr.of(AndExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d")))))),
                 JsonWriterOptions.readable());
    assertWrites("!(a&&b)||!(c&&d)",
                 TermRepr.of(OrExpr.of(NotExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))), NotExpr.of(AndExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d")))))),
                 JsonWriterOptions.compact());
    assertWrites("!(a && b || c && d)",
                 TermRepr.of(NotExpr.of(OrExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), AndExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d")))))),
                 JsonWriterOptions.readable());
    assertWrites("!(a&&b||c&&d)",
                 TermRepr.of(NotExpr.of(OrExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), AndExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d")))))),
                 JsonWriterOptions.compact());
    assertWrites("a && !(b || c) && d",
                 TermRepr.of(AndExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), NotExpr.of(OrExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))), ContextExpr.child(Repr.of("d")))),
                 JsonWriterOptions.readable());
    assertWrites("a&&!(b||c)&&d",
                 TermRepr.of(AndExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), NotExpr.of(OrExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))), ContextExpr.child(Repr.of("d")))),
                 JsonWriterOptions.compact());
  }

  @Test
  public void writeAssociatedLogicalExprs() {
    assertWrites("a && (b || c)",
                 TermRepr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), OrExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 JsonWriterOptions.readable());
    assertWrites("a&&(b||c)",
                 TermRepr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), OrExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 JsonWriterOptions.compact());
    assertWrites("(a || b) && c",
                 TermRepr.of(AndExpr.of(OrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.readable());
    assertWrites("(a||b)&&c",
                 TermRepr.of(AndExpr.of(OrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.compact());
    assertWrites("a && (b || c) && d",
                 TermRepr.of(AndExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), OrExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 JsonWriterOptions.readable());
    assertWrites("a&&(b||c)&&d",
                 TermRepr.of(AndExpr.of(AndExpr.of(ContextExpr.child(Repr.of("a")), OrExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 JsonWriterOptions.compact());
    assertWrites("(a || b) && (c || d)",
                 TermRepr.of(AndExpr.of(OrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), OrExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 JsonWriterOptions.readable());
    assertWrites("(a||b)&&(c||d)",
                 TermRepr.of(AndExpr.of(OrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), OrExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 JsonWriterOptions.compact());
  }

  @Test
  public void writeBitwiseOrExprs() {
    assertWrites("a | b",
                 TermRepr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.readable());
    assertWrites("a|b",
                 TermRepr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.compact());
    assertWrites("a | b | c",
                 TermRepr.of(BitwiseOrExpr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.readable());
    assertWrites("a|b|c",
                 TermRepr.of(BitwiseOrExpr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.compact());
  }

  @Test
  public void writeBitwiseXorExprs() {
    assertWrites("a ^ b",
                 TermRepr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.readable());
    assertWrites("a^b",
                 TermRepr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.compact());
    assertWrites("a ^ b ^ c",
                 TermRepr.of(BitwiseXorExpr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.readable());
    assertWrites("a^b^c",
                 TermRepr.of(BitwiseXorExpr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.compact());
  }

  @Test
  public void writeBitwiseAndExprs() {
    assertWrites("a & b",
                 TermRepr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.readable());
    assertWrites("a&b",
                 TermRepr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.compact());
    assertWrites("a & b & c",
                 TermRepr.of(BitwiseAndExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.readable());
    assertWrites("a&b&c",
                 TermRepr.of(BitwiseAndExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.compact());
  }

  @Test
  public void writeBitwiseNotExprs() {
    assertWrites("~a",
                 TermRepr.of(BitwiseNotExpr.of(ContextExpr.child(Repr.of("a")))));
  }

  @Test
  public void writeBitwiseExprs() {
    assertWrites("a & b | c",
                 TermRepr.of(BitwiseOrExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.readable());
    assertWrites("a&b|c",
                 TermRepr.of(BitwiseOrExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.compact());
    assertWrites("a | b & c",
                 TermRepr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), BitwiseAndExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 JsonWriterOptions.readable());
    assertWrites("a|b&c",
                 TermRepr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), BitwiseAndExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 JsonWriterOptions.compact());
    assertWrites("a & b | c & d",
                 TermRepr.of(BitwiseOrExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), BitwiseAndExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 JsonWriterOptions.readable());
    assertWrites("a&b|c&d",
                 TermRepr.of(BitwiseOrExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), BitwiseAndExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 JsonWriterOptions.compact());
    assertWrites("a | b & c | d",
                 TermRepr.of(BitwiseOrExpr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), BitwiseAndExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 JsonWriterOptions.readable());
    assertWrites("a|b&c|d",
                 TermRepr.of(BitwiseOrExpr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), BitwiseAndExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 JsonWriterOptions.compact());

    assertWrites("a & b ^ c",
                 TermRepr.of(BitwiseXorExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.readable());
    assertWrites("a&b^c",
                 TermRepr.of(BitwiseXorExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.compact());
    assertWrites("a ^ b & c",
                 TermRepr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), BitwiseAndExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 JsonWriterOptions.readable());
    assertWrites("a^b&c",
                 TermRepr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), BitwiseAndExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 JsonWriterOptions.compact());
    assertWrites("a & b ^ c & d",
                 TermRepr.of(BitwiseXorExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), BitwiseAndExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 JsonWriterOptions.readable());
    assertWrites("a&b^c&d",
                 TermRepr.of(BitwiseXorExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), BitwiseAndExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 JsonWriterOptions.compact());
    assertWrites("a ^ b & c ^ d",
                 TermRepr.of(BitwiseXorExpr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), BitwiseAndExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 JsonWriterOptions.readable());
    assertWrites("a^b&c^d",
                 TermRepr.of(BitwiseXorExpr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), BitwiseAndExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 JsonWriterOptions.compact());

    assertWrites("a ^ b | c",
                 TermRepr.of(BitwiseOrExpr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.readable());
    assertWrites("a^b|c",
                 TermRepr.of(BitwiseOrExpr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.compact());
    assertWrites("a | b ^ c",
                 TermRepr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), BitwiseXorExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 JsonWriterOptions.readable());
    assertWrites("a|b^c",
                 TermRepr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), BitwiseXorExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 JsonWriterOptions.compact());
    assertWrites("a ^ b | c ^ d",
                 TermRepr.of(BitwiseOrExpr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), BitwiseXorExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 JsonWriterOptions.readable());
    assertWrites("a^b|c^d",
                 TermRepr.of(BitwiseOrExpr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), BitwiseXorExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 JsonWriterOptions.compact());
    assertWrites("a | b ^ c | d",
                 TermRepr.of(BitwiseOrExpr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), BitwiseXorExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 JsonWriterOptions.readable());
    assertWrites("a|b^c|d",
                 TermRepr.of(BitwiseOrExpr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), BitwiseXorExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 JsonWriterOptions.compact());
  }

  @Test
  public void writeAssociatedBitwiseExprs() {
    assertWrites("a & (b | c)",
                 TermRepr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), BitwiseOrExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 JsonWriterOptions.readable());
    assertWrites("a&(b|c)",
                 TermRepr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), BitwiseOrExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 JsonWriterOptions.compact());
    assertWrites("(a | b) & c",
                 TermRepr.of(BitwiseAndExpr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.readable());
    assertWrites("(a|b)&c",
                 TermRepr.of(BitwiseAndExpr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.compact());
    assertWrites("a & (b | c) & d",
                 TermRepr.of(BitwiseAndExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), BitwiseOrExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 JsonWriterOptions.readable());
    assertWrites("a&(b|c)&d",
                 TermRepr.of(BitwiseAndExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), BitwiseOrExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 JsonWriterOptions.compact());
    assertWrites("(a | b) & (c | d)",
                 TermRepr.of(BitwiseAndExpr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), BitwiseOrExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 JsonWriterOptions.readable());
    assertWrites("(a|b)&(c|d)",
                 TermRepr.of(BitwiseAndExpr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), BitwiseOrExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 JsonWriterOptions.compact());

    assertWrites("a & (b ^ c)",
                 TermRepr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), BitwiseXorExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 JsonWriterOptions.readable());
    assertWrites("a&(b^c)",
                 TermRepr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), BitwiseXorExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 JsonWriterOptions.compact());
    assertWrites("(a ^ b) & c",
                 TermRepr.of(BitwiseAndExpr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.readable());
    assertWrites("(a^b)&c",
                 TermRepr.of(BitwiseAndExpr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.compact());
    assertWrites("a & (b ^ c) & d",
                 TermRepr.of(BitwiseAndExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), BitwiseXorExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 JsonWriterOptions.readable());
    assertWrites("a&(b^c)&d",
                 TermRepr.of(BitwiseAndExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("a")), BitwiseXorExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 JsonWriterOptions.compact());
    assertWrites("(a ^ b) & (c ^ d)",
                 TermRepr.of(BitwiseAndExpr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), BitwiseXorExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 JsonWriterOptions.readable());
    assertWrites("(a^b)&(c^d)",
                 TermRepr.of(BitwiseAndExpr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), BitwiseXorExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 JsonWriterOptions.compact());

    assertWrites("a ^ (b | c)",
                 TermRepr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), BitwiseOrExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 JsonWriterOptions.readable());
    assertWrites("a^(b|c)",
                 TermRepr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), BitwiseOrExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 JsonWriterOptions.compact());
    assertWrites("(a | b) ^ c",
                 TermRepr.of(BitwiseXorExpr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.readable());
    assertWrites("(a|b)^c",
                 TermRepr.of(BitwiseXorExpr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.compact());
    assertWrites("a ^ (b | c) ^ d",
                 TermRepr.of(BitwiseXorExpr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), BitwiseOrExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 JsonWriterOptions.readable());
    assertWrites("a^(b|c)^d",
                 TermRepr.of(BitwiseXorExpr.of(BitwiseXorExpr.of(ContextExpr.child(Repr.of("a")), BitwiseOrExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 JsonWriterOptions.compact());
    assertWrites("(a | b) ^ (c | d)",
                 TermRepr.of(BitwiseXorExpr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), BitwiseOrExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 JsonWriterOptions.readable());
    assertWrites("(a|b)^(c|d)",
                 TermRepr.of(BitwiseXorExpr.of(BitwiseOrExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), BitwiseOrExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 JsonWriterOptions.compact());
  }

  @Test
  public void writeBitwiseLogicalExprs() {
    assertWrites("a || b && c | d ^ e & f",
                 TermRepr.of(OrExpr.of(ContextExpr.child(Repr.of("a")), AndExpr.of(ContextExpr.child(Repr.of("b")), BitwiseOrExpr.of(ContextExpr.child(Repr.of("c")), BitwiseXorExpr.of(ContextExpr.child(Repr.of("d")), BitwiseAndExpr.of(ContextExpr.child(Repr.of("e")), ContextExpr.child(Repr.of("f")))))))),
                 JsonWriterOptions.readable());
    assertWrites("a||b&&c|d^e&f",
                 TermRepr.of(OrExpr.of(ContextExpr.child(Repr.of("a")), AndExpr.of(ContextExpr.child(Repr.of("b")), BitwiseOrExpr.of(ContextExpr.child(Repr.of("c")), BitwiseXorExpr.of(ContextExpr.child(Repr.of("d")), BitwiseAndExpr.of(ContextExpr.child(Repr.of("e")), ContextExpr.child(Repr.of("f")))))))),
                 JsonWriterOptions.compact());
    assertWrites("f & e ^ d | c && b || a",
                 TermRepr.of(OrExpr.of(AndExpr.of(BitwiseOrExpr.of(BitwiseXorExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("f")), ContextExpr.child(Repr.of("e"))), ContextExpr.child(Repr.of("d"))), ContextExpr.child(Repr.of("c"))), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("a")))),
                 JsonWriterOptions.readable());
    assertWrites("f&e^d|c&&b||a",
                 TermRepr.of(OrExpr.of(AndExpr.of(BitwiseOrExpr.of(BitwiseXorExpr.of(BitwiseAndExpr.of(ContextExpr.child(Repr.of("f")), ContextExpr.child(Repr.of("e"))), ContextExpr.child(Repr.of("d"))), ContextExpr.child(Repr.of("c"))), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("a")))),
                 JsonWriterOptions.compact());
  }

  @Test
  public void writeLtExprs() {
    assertWrites("a < 42",
                 TermRepr.of(LtExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(42))),
                 JsonWriterOptions.readable());
    assertWrites("a<42",
                 TermRepr.of(LtExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(42))),
                 JsonWriterOptions.compact());
    assertWrites("42 < b",
                 TermRepr.of(LtExpr.of(Repr.of(42), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.readable());
    assertWrites("42<b",
                 TermRepr.of(LtExpr.of(Repr.of(42), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.compact());
    assertWrites("a < b",
                 TermRepr.of(LtExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.readable());
    assertWrites("a<b",
                 TermRepr.of(LtExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.compact());
  }

  @Test
  public void writeLeExprs() {
    assertWrites("a <= 42",
                 TermRepr.of(LeExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(42))),
                 JsonWriterOptions.readable());
    assertWrites("a<=42",
                 TermRepr.of(LeExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(42))),
                 JsonWriterOptions.compact());
    assertWrites("42 <= b",
                 TermRepr.of(LeExpr.of(Repr.of(42), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.readable());
    assertWrites("42<=b",
                 TermRepr.of(LeExpr.of(Repr.of(42), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.compact());
    assertWrites("a <= b",
                 TermRepr.of(LeExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.readable());
    assertWrites("a<=b",
                 TermRepr.of(LeExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.compact());
  }

  @Test
  public void writeEqExprs() {
    assertWrites("a == 42",
                 TermRepr.of(EqExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(42))),
                 JsonWriterOptions.readable());
    assertWrites("a==42",
                 TermRepr.of(EqExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(42))),
                 JsonWriterOptions.compact());
    assertWrites("42 == b",
                 TermRepr.of(EqExpr.of(Repr.of(42), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.readable());
    assertWrites("42==b",
                 TermRepr.of(EqExpr.of(Repr.of(42), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.compact());
    assertWrites("a == b",
                 TermRepr.of(EqExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.readable());
    assertWrites("a==b",
                 TermRepr.of(EqExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.compact());
  }

  @Test
  public void writeNeExprs() {
    assertWrites("a != 42",
                 TermRepr.of(NeExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(42))),
                 JsonWriterOptions.readable());
    assertWrites("a!=42",
                 TermRepr.of(NeExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(42))),
                 JsonWriterOptions.compact());
    assertWrites("42 != b",
                 TermRepr.of(NeExpr.of(Repr.of(42), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.readable());
    assertWrites("42!=b",
                 TermRepr.of(NeExpr.of(Repr.of(42), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.compact());
    assertWrites("a != b",
                 TermRepr.of(NeExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.readable());
    assertWrites("a!=b",
                 TermRepr.of(NeExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.compact());
  }

  @Test
  public void writeGeExprs() {
    assertWrites("a >= 42",
                 TermRepr.of(GeExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(42))),
                 JsonWriterOptions.readable());
    assertWrites("a>=42",
                 TermRepr.of(GeExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(42))),
                 JsonWriterOptions.compact());
    assertWrites("42 >= b",
                 TermRepr.of(GeExpr.of(Repr.of(42), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.readable());
    assertWrites("42>=b",
                 TermRepr.of(GeExpr.of(Repr.of(42), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.compact());
    assertWrites("a >= b",
                 TermRepr.of(GeExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.readable());
    assertWrites("a>=b",
                 TermRepr.of(GeExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.compact());
  }

  @Test
  public void writeGtExprs() {
    assertWrites("a > 42",
                 TermRepr.of(GtExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(42))),
                 JsonWriterOptions.readable());
    assertWrites("a>42",
                 TermRepr.of(GtExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(42))),
                 JsonWriterOptions.compact());
    assertWrites("42 > b",
                 TermRepr.of(GtExpr.of(Repr.of(42), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.readable());
    assertWrites("42>b",
                 TermRepr.of(GtExpr.of(Repr.of(42), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.compact());
    assertWrites("a > b",
                 TermRepr.of(GtExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.readable());
    assertWrites("a>b",
                 TermRepr.of(GtExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.compact());
  }

  @Test
  public void writePlusExprs() {
    assertWrites("a + 2",
                 TermRepr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(2))),
                 JsonWriterOptions.readable());
    assertWrites("a+2",
                 TermRepr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(2))),
                 JsonWriterOptions.compact());
    assertWrites("2 + b",
                 TermRepr.of(PlusExpr.of(Repr.of(2), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.readable());
    assertWrites("2+b",
                 TermRepr.of(PlusExpr.of(Repr.of(2), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.compact());
    assertWrites("a + b",
                 TermRepr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.readable());
    assertWrites("a+b",
                 TermRepr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.compact());
    assertWrites("a + b + c",
                 TermRepr.of(PlusExpr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.readable());
    assertWrites("a+b+c",
                 TermRepr.of(PlusExpr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.compact());
  }

  @Test
  public void writeMinusExprs() {
    assertWrites("a - 2",
                 TermRepr.of(MinusExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(2))),
                 JsonWriterOptions.readable());
    assertWrites("a-2",
                 TermRepr.of(MinusExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(2))),
                 JsonWriterOptions.compact());
    assertWrites("2 - b",
                 TermRepr.of(MinusExpr.of(Repr.of(2), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.readable());
    assertWrites("2-b",
                 TermRepr.of(MinusExpr.of(Repr.of(2), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.compact());
    assertWrites("a - b",
                 TermRepr.of(MinusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.readable());
    assertWrites("a-b",
                 TermRepr.of(MinusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.compact());
    assertWrites("a - b - c",
                 TermRepr.of(MinusExpr.of(MinusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.readable());
    assertWrites("a-b-c",
                 TermRepr.of(MinusExpr.of(MinusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.compact());
  }

  @Test
  public void writeNegativeExprs() {
    assertWrites("-a",
                 TermRepr.of(NegativeExpr.of(ContextExpr.child(Repr.of("a")))));
  }

  @Test
  public void writePositiveExprs() {
    assertWrites("+a",
                 TermRepr.of(PositiveExpr.of(ContextExpr.child(Repr.of("a")))));
  }

  @Test
  public void writeTimesExprs() {
    assertWrites("a * 2",
                 TermRepr.of(TimesExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(2))),
                 JsonWriterOptions.readable());
    assertWrites("a*2",
                 TermRepr.of(TimesExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(2))),
                 JsonWriterOptions.compact());
    assertWrites("2 * b",
                 TermRepr.of(TimesExpr.of(Repr.of(2), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.readable());
    assertWrites("2*b",
                 TermRepr.of(TimesExpr.of(Repr.of(2), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.compact());
    assertWrites("a * b",
                 TermRepr.of(TimesExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.readable());
    assertWrites("a*b",
                 TermRepr.of(TimesExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.compact());
    assertWrites("a * b * c",
                 TermRepr.of(TimesExpr.of(TimesExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.readable());
    assertWrites("a*b*c",
                 TermRepr.of(TimesExpr.of(TimesExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.compact());
  }

  @Test
  public void writeDivideExprs() {
    assertWrites("a / 2",
                 TermRepr.of(DivideExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(2))),
                 JsonWriterOptions.readable());
    assertWrites("a/2",
                 TermRepr.of(DivideExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(2))),
                 JsonWriterOptions.compact());
    assertWrites("2 / b",
                 TermRepr.of(DivideExpr.of(Repr.of(2), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.readable());
    assertWrites("2/b",
                 TermRepr.of(DivideExpr.of(Repr.of(2), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.compact());
    assertWrites("a / b",
                 TermRepr.of(DivideExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.readable());
    assertWrites("a/b",
                 TermRepr.of(DivideExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.compact());
    assertWrites("a / b / c",
                 TermRepr.of(DivideExpr.of(DivideExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.readable());
    assertWrites("a/b/c",
                 TermRepr.of(DivideExpr.of(DivideExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.compact());
  }

  @Test
  public void writeModuloExprs() {
    assertWrites("a % 2",
                 TermRepr.of(ModuloExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(2))),
                 JsonWriterOptions.readable());
    assertWrites("a%2",
                 TermRepr.of(ModuloExpr.of(ContextExpr.child(Repr.of("a")), Repr.of(2))),
                 JsonWriterOptions.compact());
    assertWrites("2 % b",
                 TermRepr.of(ModuloExpr.of(Repr.of(2), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.readable());
    assertWrites("2%b",
                 TermRepr.of(ModuloExpr.of(Repr.of(2), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.compact());
    assertWrites("a % b",
                 TermRepr.of(ModuloExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.readable());
    assertWrites("a%b",
                 TermRepr.of(ModuloExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b")))),
                 JsonWriterOptions.compact());
    assertWrites("a % b % c",
                 TermRepr.of(ModuloExpr.of(ModuloExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.readable());
    assertWrites("a%b%c",
                 TermRepr.of(ModuloExpr.of(ModuloExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.compact());
  }

  @Test
  public void writeArithmeticExprs() {
    assertWrites("a * b + c",
                 TermRepr.of(PlusExpr.of(TimesExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.readable());
    assertWrites("a*b+c",
                 TermRepr.of(PlusExpr.of(TimesExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.compact());
    assertWrites("a + b * c",
                 TermRepr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), TimesExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 JsonWriterOptions.readable());
    assertWrites("a+b*c",
                 TermRepr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), TimesExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 JsonWriterOptions.compact());
    assertWrites("a * b + c * d",
                 TermRepr.of(PlusExpr.of(TimesExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), TimesExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 JsonWriterOptions.readable());
    assertWrites("a*b+c*d",
                 TermRepr.of(PlusExpr.of(TimesExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), TimesExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 JsonWriterOptions.compact());
    assertWrites("a + b * c + d",
                 TermRepr.of(PlusExpr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), TimesExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 JsonWriterOptions.readable());
    assertWrites("a+b*c+d",
                 TermRepr.of(PlusExpr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), TimesExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 JsonWriterOptions.compact());
  }

  @Test
  public void writeAssociatedArithmeticExprs() {
    assertWrites("a * (b + c)",
                 TermRepr.of(TimesExpr.of(ContextExpr.child(Repr.of("a")), PlusExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 JsonWriterOptions.readable());
    assertWrites("a*(b+c)",
                 TermRepr.of(TimesExpr.of(ContextExpr.child(Repr.of("a")), PlusExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c"))))),
                 JsonWriterOptions.compact());
    assertWrites("(a + b) * c",
                 TermRepr.of(TimesExpr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.readable());
    assertWrites("(a+b)*c",
                 TermRepr.of(TimesExpr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), ContextExpr.child(Repr.of("c")))),
                 JsonWriterOptions.compact());
    assertWrites("a * (b + c) * d",
                 TermRepr.of(TimesExpr.of(TimesExpr.of(ContextExpr.child(Repr.of("a")), PlusExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 JsonWriterOptions.readable());
    assertWrites("a*(b+c)*d",
                 TermRepr.of(TimesExpr.of(TimesExpr.of(ContextExpr.child(Repr.of("a")), PlusExpr.of(ContextExpr.child(Repr.of("b")), ContextExpr.child(Repr.of("c")))), ContextExpr.child(Repr.of("d")))),
                 JsonWriterOptions.compact());
    assertWrites("(a + b) * (c + d)",
                 TermRepr.of(TimesExpr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), PlusExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 JsonWriterOptions.readable());
    assertWrites("(a+b)*(c+d)",
                 TermRepr.of(TimesExpr.of(PlusExpr.of(ContextExpr.child(Repr.of("a")), ContextExpr.child(Repr.of("b"))), PlusExpr.of(ContextExpr.child(Repr.of("c")), ContextExpr.child(Repr.of("d"))))),
                 JsonWriterOptions.compact());
  }

  public static void assertWrites(String expected, Repr value, JsonWriterOptions options) {
    JsonAssertions.assertWrites(expected, () -> Json.forType(Repr.class).write(value, Json.writer(options)));
  }

  public static void assertWrites(String expected, Repr value) {
    JsonAssertions.assertWrites(expected, () -> Json.forType(Repr.class).write(value, Json.writer(JsonWriterOptions.readable())));
    JsonAssertions.assertWrites(expected, () -> Json.forType(Repr.class).write(value, Json.writer(JsonWriterOptions.compact())));
  }

}
