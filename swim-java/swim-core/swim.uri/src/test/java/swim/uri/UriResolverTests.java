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

package swim.uri;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class UriResolverTests {

  @Test
  public void resolveNormalURIs() {
    final Uri base = Uri.parse("http://a/b/c/d;p?q");
    assertEquals(Uri.parse("g:h"), base.resolve(Uri.parse("g:h")));
    assertEquals(Uri.parse("http://a/b/c/g"), base.resolve(Uri.parse("g")));
    assertEquals(Uri.parse("http://a/b/c/g"), base.resolve(Uri.parse("./g")));
    assertEquals(Uri.parse("http://a/b/c/g/"), base.resolve(Uri.parse("g/")));
    assertEquals(Uri.parse("http://a/g"), base.resolve(Uri.parse("/g")));
    assertEquals(Uri.parse("http://g"), base.resolve(Uri.parse("//g")));
    assertEquals(Uri.parse("http://a/b/c/d;p?y"), base.resolve(Uri.parse("?y")));
    assertEquals(Uri.parse("http://a/b/c/g?y"), base.resolve(Uri.parse("g?y")));
    assertEquals(Uri.parse("http://a/b/c/d;p?q#s"), base.resolve(Uri.parse("#s")));
    assertEquals(Uri.parse("http://a/b/c/g#s"), base.resolve(Uri.parse("g#s")));
    assertEquals(Uri.parse("http://a/b/c/g?y#s"), base.resolve(Uri.parse("g?y#s")));
    assertEquals(Uri.parse("http://a/b/c/;x"), base.resolve(Uri.parse(";x")));
    assertEquals(Uri.parse("http://a/b/c/g;x"), base.resolve(Uri.parse("g;x")));
    assertEquals(Uri.parse("http://a/b/c/g;x?y#s"), base.resolve(Uri.parse("g;x?y#s")));
    assertEquals(Uri.parse("http://a/b/c/d;p?q"), base.resolve(Uri.parse("")));
    assertEquals(Uri.parse("http://a/b/c/"), base.resolve(Uri.parse(".")));
    assertEquals(Uri.parse("http://a/b/c/"), base.resolve(Uri.parse("./")));
    assertEquals(Uri.parse("http://a/b/"), base.resolve(Uri.parse("..")));
    assertEquals(Uri.parse("http://a/b/"), base.resolve(Uri.parse("../")));
    assertEquals(Uri.parse("http://a/b/g"), base.resolve(Uri.parse("../g")));
    assertEquals(Uri.parse("http://a/"), base.resolve(Uri.parse("../..")));
    assertEquals(Uri.parse("http://a/"), base.resolve(Uri.parse("../../")));
    assertEquals(Uri.parse("http://a/g"), base.resolve(Uri.parse("../../g")));
  }

  @Test
  public void resolveAbnormalURIs() {
    final Uri base = Uri.parse("http://a/b/c/d;p?q");

    assertEquals(Uri.parse("http://a/g"), base.resolve(Uri.parse("../../../g")));
    assertEquals(Uri.parse("http://a/g"), base.resolve(Uri.parse("../../../../g")));

    assertEquals(Uri.parse("http://a/g"), base.resolve(Uri.parse("/./g")));
    assertEquals(Uri.parse("http://a/g"), base.resolve(Uri.parse("/../g")));
    assertEquals(Uri.parse("http://a/b/c/g."), base.resolve(Uri.parse("g.")));
    assertEquals(Uri.parse("http://a/b/c/.g"), base.resolve(Uri.parse(".g")));
    assertEquals(Uri.parse("http://a/b/c/g.."), base.resolve(Uri.parse("g..")));
    assertEquals(Uri.parse("http://a/b/c/..g"), base.resolve(Uri.parse("..g")));

    assertEquals(Uri.parse("http://a/b/g"), base.resolve(Uri.parse("./../g")));
    assertEquals(Uri.parse("http://a/b/c/g/"), base.resolve(Uri.parse("./g/.")));
    assertEquals(Uri.parse("http://a/b/c/g/h"), base.resolve(Uri.parse("g/./h")));
    assertEquals(Uri.parse("http://a/b/c/h"), base.resolve(Uri.parse("g/../h")));
    assertEquals(Uri.parse("http://a/b/c/g;x=1/y"), base.resolve(Uri.parse("g;x=1/./y")));
    assertEquals(Uri.parse("http://a/b/c/y"), base.resolve(Uri.parse("g;x=1/../y")));

    assertEquals(Uri.parse("http://a/b/c/g?y/./x"), base.resolve(Uri.parse("g?y/./x")));
    assertEquals(Uri.parse("http://a/b/c/g?y/../x"), base.resolve(Uri.parse("g?y/../x")));
    assertEquals(Uri.parse("http://a/b/c/g#s/./x"), base.resolve(Uri.parse("g#s/./x")));
    assertEquals(Uri.parse("http://a/b/c/g#s/../x"), base.resolve(Uri.parse("g#s/../x")));
  }

  @Test
  public void unresolveRelatedURIs() {
    assertEquals(Uri.parse(""), Uri.parse("http://a").unresolve(Uri.parse("http://a")));
    assertEquals(Uri.parse("/"), Uri.parse("http://a").unresolve(Uri.parse("http://a/")));
    assertEquals(Uri.parse("c"), Uri.parse("http://a").unresolve(Uri.parse("http://a/c")));
    assertEquals(Uri.parse("?y"), Uri.parse("http://a").unresolve(Uri.parse("http://a?y")));
    assertEquals(Uri.parse("#s"), Uri.parse("http://a").unresolve(Uri.parse("http://a#s")));

    assertEquals(Uri.parse("/"), Uri.parse("http://a/").unresolve(Uri.parse("http://a")));
    assertEquals(Uri.parse(""), Uri.parse("http://a/").unresolve(Uri.parse("http://a/")));
    assertEquals(Uri.parse("c"), Uri.parse("http://a/").unresolve(Uri.parse("http://a/c")));
    assertEquals(Uri.parse("/?y"), Uri.parse("http://a/").unresolve(Uri.parse("http://a?y")));
    assertEquals(Uri.parse("/#s"), Uri.parse("http://a/").unresolve(Uri.parse("http://a#s")));

    assertEquals(Uri.parse("/"), Uri.parse("http://a/b").unresolve(Uri.parse("http://a")));
    assertEquals(Uri.parse("/"), Uri.parse("http://a/b").unresolve(Uri.parse("http://a/")));
    assertEquals(Uri.parse("c"), Uri.parse("http://a/b").unresolve(Uri.parse("http://a/c")));
    assertEquals(Uri.parse("/?y"), Uri.parse("http://a/b").unresolve(Uri.parse("http://a?y")));
    assertEquals(Uri.parse("/#s"), Uri.parse("http://a/b").unresolve(Uri.parse("http://a#s")));

    assertEquals(Uri.parse(""), Uri.parse("http://a/b").unresolve(Uri.parse("http://a/b")));
    assertEquals(Uri.parse("/"), Uri.parse("http://a/b").unresolve(Uri.parse("http://a/b/")));
    assertEquals(Uri.parse("c"), Uri.parse("http://a/b").unresolve(Uri.parse("http://a/b/c")));
    assertEquals(Uri.parse("?y"), Uri.parse("http://a/b").unresolve(Uri.parse("http://a/b?y")));
    assertEquals(Uri.parse("#s"), Uri.parse("http://a/b").unresolve(Uri.parse("http://a/b#s")));

    assertEquals(Uri.parse("/b"), Uri.parse("http://a/b/").unresolve(Uri.parse("http://a/b")));
    assertEquals(Uri.parse(""), Uri.parse("http://a/b/").unresolve(Uri.parse("http://a/b/")));
    assertEquals(Uri.parse("c"), Uri.parse("http://a/b/").unresolve(Uri.parse("http://a/b/c")));
    assertEquals(Uri.parse("/b?y"), Uri.parse("http://a/b/").unresolve(Uri.parse("http://a/b?y")));
    assertEquals(Uri.parse("/b#s"), Uri.parse("http://a/b/").unresolve(Uri.parse("http://a/b#s")));
  }

  @Test
  public void unresolveUnrelatedURIs() {
    assertEquals(Uri.parse("https://a"), Uri.parse("http://a").unresolve(Uri.parse("https://a")));
    assertEquals(Uri.parse("http://z"), Uri.parse("http://a").unresolve(Uri.parse("http://z")));
  }

}
