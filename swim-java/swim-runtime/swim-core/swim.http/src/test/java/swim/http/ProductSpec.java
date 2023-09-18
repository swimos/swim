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

import org.testng.annotations.Test;
import static swim.http.HttpAssertions.assertWrites;

public class ProductSpec {

  @Test
  public void parseProducts() {
    assertParses("swim", Product.create("swim"));
  }

  @Test
  public void writeProducts() {
    assertWrites(Product.create("swim"), "swim");
  }

  @Test
  public void parseProductsWithVersions() {
    assertParses("swim/1.0", Product.create("swim", "1.0"));
  }

  @Test
  public void writeProductsWithVersions() {
    assertWrites(Product.create("swim", "1.0"), "swim/1.0");
  }

  @Test
  public void parseProductsWithComments() {
    assertParses("swim (beta)", Product.create("swim").comment("beta"));
    assertParses("swim (beta) (debug)", Product.create("swim").comment("beta").comment("debug"));
  }

  @Test
  public void writeProductsWithComments() {
    assertWrites(Product.create("swim").comment("beta"), "swim (beta)");
    assertWrites(Product.create("swim").comment("beta").comment("debug"), "swim (beta) (debug)");
  }

  public static void assertParses(String string, Product product) {
    HttpAssertions.assertParses(Http.standardParser().productParser(), string, product);
  }

}
