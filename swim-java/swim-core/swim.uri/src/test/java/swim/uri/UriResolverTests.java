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

package swim.uri;

import org.junit.jupiter.api.Test;
import swim.codec.ParseException;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class UriResolverTests {

  @Test
  public void resolveNormalURIs() throws ParseException {
    final Uri base = Uri.parse("http://a/b/c/d;p?q").getNonNull();
    assertEquals(Uri.parse("g:h").getNonNull(),
                 base.resolve(Uri.parse("g:h").getNonNull()));
    assertEquals(Uri.parse("http://a/b/c/g").getNonNull(),
                 base.resolve(Uri.parse("g").getNonNull()));
    assertEquals(Uri.parse("http://a/b/c/g").getNonNull(),
                 base.resolve(Uri.parse("./g").getNonNull()));
    assertEquals(Uri.parse("http://a/b/c/g/").getNonNull(),
                 base.resolve(Uri.parse("g/").getNonNull()));
    assertEquals(Uri.parse("http://a/g").getNonNull(),
                 base.resolve(Uri.parse("/g").getNonNull()));
    assertEquals(Uri.parse("http://g").getNonNull(),
                 base.resolve(Uri.parse("//g").getNonNull()));
    assertEquals(Uri.parse("http://a/b/c/d;p?y").getNonNull(),
                 base.resolve(Uri.parse("?y").getNonNull()));
    assertEquals(Uri.parse("http://a/b/c/g?y").getNonNull(),
                 base.resolve(Uri.parse("g?y").getNonNull()));
    assertEquals(Uri.parse("http://a/b/c/d;p?q#s").getNonNull(),
                 base.resolve(Uri.parse("#s").getNonNull()));
    assertEquals(Uri.parse("http://a/b/c/g#s").getNonNull(),
                 base.resolve(Uri.parse("g#s").getNonNull()));
    assertEquals(Uri.parse("http://a/b/c/g?y#s").getNonNull(),
                 base.resolve(Uri.parse("g?y#s").getNonNull()));
    assertEquals(Uri.parse("http://a/b/c/;x").getNonNull(),
                 base.resolve(Uri.parse(";x").getNonNull()));
    assertEquals(Uri.parse("http://a/b/c/g;x").getNonNull(),
                 base.resolve(Uri.parse("g;x").getNonNull()));
    assertEquals(Uri.parse("http://a/b/c/g;x?y#s").getNonNull(),
                 base.resolve(Uri.parse("g;x?y#s").getNonNull()));
    assertEquals(Uri.parse("http://a/b/c/d;p?q").getNonNull(),
                 base.resolve(Uri.parse("").getNonNull()));
    assertEquals(Uri.parse("http://a/b/c/").getNonNull(),
                 base.resolve(Uri.parse(".").getNonNull()));
    assertEquals(Uri.parse("http://a/b/c/").getNonNull(),
                 base.resolve(Uri.parse("./").getNonNull()));
    assertEquals(Uri.parse("http://a/b/").getNonNull(),
                 base.resolve(Uri.parse("..").getNonNull()));
    assertEquals(Uri.parse("http://a/b/").getNonNull(),
                 base.resolve(Uri.parse("../").getNonNull()));
    assertEquals(Uri.parse("http://a/b/g").getNonNull(),
                 base.resolve(Uri.parse("../g").getNonNull()));
    assertEquals(Uri.parse("http://a/").getNonNull(),
                 base.resolve(Uri.parse("../..").getNonNull()));
    assertEquals(Uri.parse("http://a/").getNonNull(),
                 base.resolve(Uri.parse("../../").getNonNull()));
    assertEquals(Uri.parse("http://a/g").getNonNull(),
                 base.resolve(Uri.parse("../../g").getNonNull()));
  }

  @Test
  public void resolveAbnormalURIs() throws ParseException {
    final Uri base = Uri.parse("http://a/b/c/d;p?q").getNonNull();

    assertEquals(Uri.parse("http://a/g").getNonNull(),
                 base.resolve(Uri.parse("../../../g").getNonNull()));
    assertEquals(Uri.parse("http://a/g").getNonNull(),
                 base.resolve(Uri.parse("../../../../g").getNonNull()));

    assertEquals(Uri.parse("http://a/g").getNonNull(),
                 base.resolve(Uri.parse("/./g").getNonNull()));
    assertEquals(Uri.parse("http://a/g").getNonNull(),
                 base.resolve(Uri.parse("/../g").getNonNull()));
    assertEquals(Uri.parse("http://a/b/c/g.").getNonNull(),
                 base.resolve(Uri.parse("g.").getNonNull()));
    assertEquals(Uri.parse("http://a/b/c/.g").getNonNull(),
                 base.resolve(Uri.parse(".g").getNonNull()));
    assertEquals(Uri.parse("http://a/b/c/g..").getNonNull(),
                 base.resolve(Uri.parse("g..").getNonNull()));
    assertEquals(Uri.parse("http://a/b/c/..g").getNonNull(),
                 base.resolve(Uri.parse("..g").getNonNull()));

    assertEquals(Uri.parse("http://a/b/g").getNonNull(),
                 base.resolve(Uri.parse("./../g").getNonNull()));
    assertEquals(Uri.parse("http://a/b/c/g/").getNonNull(),
                 base.resolve(Uri.parse("./g/.").getNonNull()));
    assertEquals(Uri.parse("http://a/b/c/g/h").getNonNull(),
                 base.resolve(Uri.parse("g/./h").getNonNull()));
    assertEquals(Uri.parse("http://a/b/c/h").getNonNull(),
                 base.resolve(Uri.parse("g/../h").getNonNull()));
    assertEquals(Uri.parse("http://a/b/c/g;x=1/y").getNonNull(),
                 base.resolve(Uri.parse("g;x=1/./y").getNonNull()));
    assertEquals(Uri.parse("http://a/b/c/y").getNonNull(),
                 base.resolve(Uri.parse("g;x=1/../y").getNonNull()));

    assertEquals(Uri.parse("http://a/b/c/g?y/./x").getNonNull(),
                 base.resolve(Uri.parse("g?y/./x").getNonNull()));
    assertEquals(Uri.parse("http://a/b/c/g?y/../x").getNonNull(),
                 base.resolve(Uri.parse("g?y/../x").getNonNull()));
    assertEquals(Uri.parse("http://a/b/c/g#s/./x").getNonNull(),
                 base.resolve(Uri.parse("g#s/./x").getNonNull()));
    assertEquals(Uri.parse("http://a/b/c/g#s/../x").getNonNull(),
                 base.resolve(Uri.parse("g#s/../x").getNonNull()));
  }

  @Test
  public void unresolveRelatedURIs() throws ParseException {
    assertEquals(Uri.parse("").getNonNull(),
                 Uri.parse("http://a").getNonNull()
                    .unresolve(Uri.parse("http://a").getNonNull()));
    assertEquals(Uri.parse("/").getNonNull(),
                 Uri.parse("http://a").getNonNull()
                    .unresolve(Uri.parse("http://a/").getNonNull()));
    assertEquals(Uri.parse("/c").getNonNull(),
                 Uri.parse("http://a").getNonNull()
                    .unresolve(Uri.parse("http://a/c").getNonNull()));
    assertEquals(Uri.parse("?y").getNonNull(),
                 Uri.parse("http://a").getNonNull()
                    .unresolve(Uri.parse("http://a?y").getNonNull()));
    assertEquals(Uri.parse("#s").getNonNull(),
                 Uri.parse("http://a").getNonNull()
                    .unresolve(Uri.parse("http://a#s").getNonNull()));

    assertEquals(Uri.parse("/").getNonNull(),
                 Uri.parse("http://a/").getNonNull()
                    .unresolve(Uri.parse("http://a").getNonNull()));
    assertEquals(Uri.parse("").getNonNull(),
                 Uri.parse("http://a/").getNonNull()
                    .unresolve(Uri.parse("http://a/").getNonNull()));
    assertEquals(Uri.parse("c").getNonNull(),
                 Uri.parse("http://a/").getNonNull()
                    .unresolve(Uri.parse("http://a/c").getNonNull()));
    assertEquals(Uri.parse("/?y").getNonNull(),
                 Uri.parse("http://a/").getNonNull()
                    .unresolve(Uri.parse("http://a?y").getNonNull()));
    assertEquals(Uri.parse("/#s").getNonNull(),
                 Uri.parse("http://a/").getNonNull()
                    .unresolve(Uri.parse("http://a#s").getNonNull()));

    assertEquals(Uri.parse("/").getNonNull(),
                 Uri.parse("http://a/b").getNonNull()
                    .unresolve(Uri.parse("http://a").getNonNull()));
    assertEquals(Uri.parse("/").getNonNull(),
                 Uri.parse("http://a/b").getNonNull()
                    .unresolve(Uri.parse("http://a/").getNonNull()));
    assertEquals(Uri.parse("c").getNonNull(),
                 Uri.parse("http://a/b").getNonNull()
                    .unresolve(Uri.parse("http://a/c").getNonNull()));
    assertEquals(Uri.parse("/?y").getNonNull(),
                 Uri.parse("http://a/b").getNonNull()
                    .unresolve(Uri.parse("http://a?y").getNonNull()));
    assertEquals(Uri.parse("/#s").getNonNull(),
                 Uri.parse("http://a/b").getNonNull()
                    .unresolve(Uri.parse("http://a#s").getNonNull()));

    assertEquals(Uri.parse("").getNonNull(),
                 Uri.parse("http://a/b").getNonNull()
                    .unresolve(Uri.parse("http://a/b").getNonNull()));
    assertEquals(Uri.parse("/").getNonNull(),
                 Uri.parse("http://a/b").getNonNull()
                    .unresolve(Uri.parse("http://a/b/").getNonNull()));
    assertEquals(Uri.parse("c").getNonNull(),
                 Uri.parse("http://a/b").getNonNull()
                    .unresolve(Uri.parse("http://a/b/c").getNonNull()));
    assertEquals(Uri.parse("?y").getNonNull(),
                 Uri.parse("http://a/b").getNonNull()
                    .unresolve(Uri.parse("http://a/b?y").getNonNull()));
    assertEquals(Uri.parse("#s").getNonNull(),
                 Uri.parse("http://a/b").getNonNull()
                    .unresolve(Uri.parse("http://a/b#s").getNonNull()));

    assertEquals(Uri.parse("/b").getNonNull(),
                 Uri.parse("http://a/b/").getNonNull()
                    .unresolve(Uri.parse("http://a/b").getNonNull()));
    assertEquals(Uri.parse("").getNonNull(),
                 Uri.parse("http://a/b/").getNonNull()
                    .unresolve(Uri.parse("http://a/b/").getNonNull()));
    assertEquals(Uri.parse("c").getNonNull(),
                 Uri.parse("http://a/b/").getNonNull()
                    .unresolve(Uri.parse("http://a/b/c").getNonNull()));
    assertEquals(Uri.parse("/b?y").getNonNull(),
                 Uri.parse("http://a/b/").getNonNull()
                    .unresolve(Uri.parse("http://a/b?y").getNonNull()));
    assertEquals(Uri.parse("/b#s").getNonNull(),
                 Uri.parse("http://a/b/").getNonNull()
                    .unresolve(Uri.parse("http://a/b#s").getNonNull()));
  }

  @Test
  public void unresolveUnrelatedURIs() throws ParseException {
    assertEquals(Uri.parse("https://a").getNonNull(),
                 Uri.parse("http://a").getNonNull()
                    .unresolve(Uri.parse("https://a").getNonNull()));
    assertEquals(Uri.parse("http://z").getNonNull(),
                 Uri.parse("http://a").getNonNull()
                    .unresolve(Uri.parse("http://z").getNonNull()));
  }

}
