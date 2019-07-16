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

package swim.uri;

import org.testng.annotations.Test;
import static org.testng.Assert.assertEquals;

public class UriResolverSpec {
  @Test
  public void resolveNormalURIs() {
    final Uri base = Uri.parse("http://a/b/c/d;p?q");
    assertEquals(base.resolve(Uri.parse("g:h")), Uri.parse("g:h"));
    assertEquals(base.resolve(Uri.parse("g")), Uri.parse("http://a/b/c/g"));
    assertEquals(base.resolve(Uri.parse("./g")), Uri.parse("http://a/b/c/g"));
    assertEquals(base.resolve(Uri.parse("g/")), Uri.parse("http://a/b/c/g/"));
    assertEquals(base.resolve(Uri.parse("/g")), Uri.parse("http://a/g"));
    assertEquals(base.resolve(Uri.parse("//g")), Uri.parse("http://g"));
    assertEquals(base.resolve(Uri.parse("?y")), Uri.parse("http://a/b/c/d;p?y"));
    assertEquals(base.resolve(Uri.parse("g?y")), Uri.parse("http://a/b/c/g?y"));
    assertEquals(base.resolve(Uri.parse("#s")), Uri.parse("http://a/b/c/d;p?q#s"));
    assertEquals(base.resolve(Uri.parse("g#s")), Uri.parse("http://a/b/c/g#s"));
    assertEquals(base.resolve(Uri.parse("g?y#s")), Uri.parse("http://a/b/c/g?y#s"));
    assertEquals(base.resolve(Uri.parse(";x")), Uri.parse("http://a/b/c/;x"));
    assertEquals(base.resolve(Uri.parse("g;x")), Uri.parse("http://a/b/c/g;x"));
    assertEquals(base.resolve(Uri.parse("g;x?y#s")), Uri.parse("http://a/b/c/g;x?y#s"));
    assertEquals(base.resolve(Uri.parse("")), Uri.parse("http://a/b/c/d;p?q"));
    assertEquals(base.resolve(Uri.parse(".")), Uri.parse("http://a/b/c/"));
    assertEquals(base.resolve(Uri.parse("./")), Uri.parse("http://a/b/c/"));
    assertEquals(base.resolve(Uri.parse("..")), Uri.parse("http://a/b/"));
    assertEquals(base.resolve(Uri.parse("../")), Uri.parse("http://a/b/"));
    assertEquals(base.resolve(Uri.parse("../g")), Uri.parse("http://a/b/g"));
    assertEquals(base.resolve(Uri.parse("../..")), Uri.parse("http://a/"));
    assertEquals(base.resolve(Uri.parse("../../")), Uri.parse("http://a/"));
    assertEquals(base.resolve(Uri.parse("../../g")), Uri.parse("http://a/g"));
  }

  @Test
  public void resolveAbnormalURIs() {
    final Uri base = Uri.parse("http://a/b/c/d;p?q");

    assertEquals(base.resolve(Uri.parse("../../../g")), Uri.parse("http://a/g"));
    assertEquals(base.resolve(Uri.parse("../../../../g")), Uri.parse("http://a/g"));

    assertEquals(base.resolve(Uri.parse("/./g")), Uri.parse("http://a/g"));
    assertEquals(base.resolve(Uri.parse("/../g")), Uri.parse("http://a/g"));
    assertEquals(base.resolve(Uri.parse("g.")), Uri.parse("http://a/b/c/g."));
    assertEquals(base.resolve(Uri.parse(".g")), Uri.parse("http://a/b/c/.g"));
    assertEquals(base.resolve(Uri.parse("g..")), Uri.parse("http://a/b/c/g.."));
    assertEquals(base.resolve(Uri.parse("..g")), Uri.parse("http://a/b/c/..g"));

    assertEquals(base.resolve(Uri.parse("./../g")), Uri.parse("http://a/b/g"));
    assertEquals(base.resolve(Uri.parse("./g/.")), Uri.parse("http://a/b/c/g/"));
    assertEquals(base.resolve(Uri.parse("g/./h")), Uri.parse("http://a/b/c/g/h"));
    assertEquals(base.resolve(Uri.parse("g/../h")), Uri.parse("http://a/b/c/h"));
    assertEquals(base.resolve(Uri.parse("g;x=1/./y")), Uri.parse("http://a/b/c/g;x=1/y"));
    assertEquals(base.resolve(Uri.parse("g;x=1/../y")), Uri.parse("http://a/b/c/y"));

    assertEquals(base.resolve(Uri.parse("g?y/./x")), Uri.parse("http://a/b/c/g?y/./x"));
    assertEquals(base.resolve(Uri.parse("g?y/../x")), Uri.parse("http://a/b/c/g?y/../x"));
    assertEquals(base.resolve(Uri.parse("g#s/./x")), Uri.parse("http://a/b/c/g#s/./x"));
    assertEquals(base.resolve(Uri.parse("g#s/../x")), Uri.parse("http://a/b/c/g#s/../x"));
  }

  @Test
  public void unresolveRelatedURIs() {
    assertEquals(Uri.parse("http://a").unresolve(Uri.parse("http://a")), Uri.parse(""));
    assertEquals(Uri.parse("http://a").unresolve(Uri.parse("http://a/")), Uri.parse("/"));
    assertEquals(Uri.parse("http://a").unresolve(Uri.parse("http://a/c")), Uri.parse("c"));
    assertEquals(Uri.parse("http://a").unresolve(Uri.parse("http://a?y")), Uri.parse("?y"));
    assertEquals(Uri.parse("http://a").unresolve(Uri.parse("http://a#s")), Uri.parse("#s"));

    assertEquals(Uri.parse("http://a/").unresolve(Uri.parse("http://a")), Uri.parse("/"));
    assertEquals(Uri.parse("http://a/").unresolve(Uri.parse("http://a/")), Uri.parse(""));
    assertEquals(Uri.parse("http://a/").unresolve(Uri.parse("http://a/c")), Uri.parse("c"));
    assertEquals(Uri.parse("http://a/").unresolve(Uri.parse("http://a?y")), Uri.parse("/?y"));
    assertEquals(Uri.parse("http://a/").unresolve(Uri.parse("http://a#s")), Uri.parse("/#s"));

    assertEquals(Uri.parse("http://a/b").unresolve(Uri.parse("http://a")), Uri.parse("/"));
    assertEquals(Uri.parse("http://a/b").unresolve(Uri.parse("http://a/")), Uri.parse("/"));
    assertEquals(Uri.parse("http://a/b").unresolve(Uri.parse("http://a/c")), Uri.parse("c"));
    assertEquals(Uri.parse("http://a/b").unresolve(Uri.parse("http://a?y")), Uri.parse("/?y"));
    assertEquals(Uri.parse("http://a/b").unresolve(Uri.parse("http://a#s")), Uri.parse("/#s"));

    assertEquals(Uri.parse("http://a/b").unresolve(Uri.parse("http://a/b")), Uri.parse(""));
    assertEquals(Uri.parse("http://a/b").unresolve(Uri.parse("http://a/b/")), Uri.parse("/"));
    assertEquals(Uri.parse("http://a/b").unresolve(Uri.parse("http://a/b/c")), Uri.parse("c"));
    assertEquals(Uri.parse("http://a/b").unresolve(Uri.parse("http://a/b?y")), Uri.parse("?y"));
    assertEquals(Uri.parse("http://a/b").unresolve(Uri.parse("http://a/b#s")), Uri.parse("#s"));

    assertEquals(Uri.parse("http://a/b/").unresolve(Uri.parse("http://a/b")), Uri.parse("/b"));
    assertEquals(Uri.parse("http://a/b/").unresolve(Uri.parse("http://a/b/")), Uri.parse(""));
    assertEquals(Uri.parse("http://a/b/").unresolve(Uri.parse("http://a/b/c")), Uri.parse("c"));
    assertEquals(Uri.parse("http://a/b/").unresolve(Uri.parse("http://a/b?y")), Uri.parse("/b?y"));
    assertEquals(Uri.parse("http://a/b/").unresolve(Uri.parse("http://a/b#s")), Uri.parse("/b#s"));
  }

  @Test
  public void unresolveUnrelatedURIs() {
    assertEquals(Uri.parse("http://a").unresolve(Uri.parse("https://a")), Uri.parse("https://a"));
    assertEquals(Uri.parse("http://a").unresolve(Uri.parse("http://z")), Uri.parse("http://z"));
  }
}
