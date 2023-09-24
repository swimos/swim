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

package swim.http;

import org.junit.jupiter.api.Test;

public class HttpProductTests {

  @Test
  public void parseProducts() {
    assertParses(HttpProduct.of("swim"), "swim");
  }

  @Test
  public void writeProducts() {
    assertWrites("swim", HttpProduct.of("swim"));
  }

  @Test
  public void parseProductsWithVersions() {
    assertParses(HttpProduct.of("swim", "5.0"), "swim/5.0");
  }

  @Test
  public void writeProductsWithVersions() {
    assertWrites("swim/5.0", HttpProduct.of("swim", "5.0"));
  }

  @Test
  public void parseProductsWithComments() {
    assertParses(HttpProduct.of("swim").withComment("beta"), "swim (beta)");
    assertParses(HttpProduct.of("swim").withComment("beta").withComment("debug"), "swim (beta) (debug)");
  }

  @Test
  public void writeProductsWithComments() {
    assertWrites("swim (beta)", HttpProduct.of("swim").withComment("beta"));
    assertWrites("swim (beta) (debug)", HttpProduct.of("swim").withComment("beta").withComment("debug"));
  }

  @Test
  public void parseProductsWithVersionsComments() {
    assertParses(HttpProduct.of("swim", "5.0").withComment("beta"), "swim/5.0 (beta)");
    assertParses(HttpProduct.of("swim", "5.0").withComment("beta").withComment("debug"), "swim/5.0 (beta) (debug)");
  }

  @Test
  public void writeProductsWithVersionsComments() {
    assertWrites("swim/5.0 (beta)", HttpProduct.of("swim", "5.0").withComment("beta"));
    assertWrites("swim/5.0 (beta) (debug)", HttpProduct.of("swim", "5.0").withComment("beta").withComment("debug"));
  }

  @Test
  public void parseProductsWithNestedComments() {
    assertParses(HttpProduct.of("swim").withComment("()"), "swim (())");
    assertParses(HttpProduct.of("swim").withComment("(())"), "swim ((()))");
    assertParses(HttpProduct.of("swim").withComment("()()"), "swim (()())");
    assertParses(HttpProduct.of("swim").withComment("a(b)c"), "swim (a(b)c)");
    assertParses(HttpProduct.of("swim").withComment("(a)b(c)"), "swim ((a)b(c))");
  }

  @Test
  public void writeProductsWithNestedComments() {
    assertWrites("swim (())", HttpProduct.of("swim").withComment("()"));
    assertWrites("swim ((()))", HttpProduct.of("swim").withComment("(())"));
    assertWrites("swim (()())", HttpProduct.of("swim").withComment("()()"));
    assertWrites("swim (a(b)c)", HttpProduct.of("swim").withComment("a(b)c"));
    assertWrites("swim ((a)b(c))", HttpProduct.of("swim").withComment("(a)b(c)"));
  }

  public static void assertParses(HttpProduct expected, String string) {
    HttpAssertions.assertParses(HttpProduct.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpProduct product) {
    HttpAssertions.assertWrites(expected, product::write);
  }

}
