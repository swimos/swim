// Copyright 2015-2019 SWIM.AI inc.
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

package swim.http.header;

import org.testng.annotations.Test;
import swim.http.Http;
import swim.http.HttpAssertions;
import swim.http.HttpHeader;
import swim.http.Product;
import static swim.http.HttpAssertions.assertWrites;

public class ServerSpec {
  public void assertParses(String string, HttpHeader header) {
    HttpAssertions.assertParses(Http.standardParser().headerParser(), string, header);
  }

  @Test
  public void parseServerHeaders() {
    assertParses("Server: swim", Server.from(Product.from("swim")));
    assertParses("Server: swim/1.0", Server.from(Product.from("swim", "1.0")));
    assertParses("Server: swim/1.0 (beta) (debug) recon (xml/json)",
                 Server.from(Product.from("swim", "1.0").comment("beta").comment("debug"),
                             Product.from("recon").comment("xml/json")));
  }

  @Test
  public void writeServerHeaders() {
    assertWrites(Server.from(Product.from("swim")), "Server: swim");
    assertWrites(Server.from(Product.from("swim", "1.0")), "Server: swim/1.0");
    assertWrites(Server.from(Product.from("swim", "1.0").comment("beta").comment("debug"),
                             Product.from("recon").comment("xml/json")),
                 "Server: swim/1.0 (beta) (debug) recon (xml/json)");
  }
}
