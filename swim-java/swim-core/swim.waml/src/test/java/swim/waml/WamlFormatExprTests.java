// Copyright 2015-2023 Nstream, inc.
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
import swim.expr.ContextExpr;
import swim.expr.FormatExpr;
import swim.term.Evaluator;
import swim.term.Term;
import swim.term.TermException;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class WamlFormatExprTests {

  static class AudienceContext {

    String first;
    String second;

    AudienceContext(String first, String second) {
      this.first = first;
      this.second = second;
    }

  }

  static class FormatContext {

    String greeting;
    AudienceContext audience;

    FormatContext(String greeting, AudienceContext audience) {
      this.greeting = greeting;
      this.audience = audience;
    }

  }

  @Test
  public void parseFormatExprs() {
    assertParses(FormatExpr.of(ContextExpr.child(Term.of("greeting")), ", ", ContextExpr.child(Term.of("audience")).child(Term.of("second")), "!"),
                 "{greeting}, {audience.second}!");
  }

  @Test
  public void writeFormatExprs() {
    assertWrites("{greeting}, {audience.second}!",
                 FormatExpr.of(ContextExpr.child(Term.of("greeting")), ", ", ContextExpr.child(Term.of("audience")).child(Term.of("second")), "!"));
  }

  @Test
  public void evaluateFormatExprs() throws TermException {
    final Term context = Term.from(new FormatContext("Hello", new AudienceContext("there", "world")));
    final FormatExpr expr = FormatExpr.parse("{greeting}, {audience.second}!", Waml.metaCodec(), WamlParserOptions.expressions()).getNonNullUnchecked();
    final Evaluator evaluator = new Evaluator();
    final Term result = evaluator.evaluateInContext(expr, context);
    assertEquals("Hello, world!", result.stringValue());
  }

  public static void assertParses(FormatExpr expected, String string) {
    WamlAssertions.assertParses(FormatExpr.parse(Waml.metaCodec(), WamlParserOptions.expressions()), expected, string);
  }

  public static void assertWrites(String expected, FormatExpr expr) {
    WamlAssertions.assertWrites(expected, () -> {
      return expr.write(Waml.metaCodec(), WamlWriterOptions.readable());
    });
  }

}
