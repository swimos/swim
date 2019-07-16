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

import {Spec, Test, Exam} from "@swim/unit";
import {Uri} from "@swim/uri";

export class UriResolverSpec extends Spec {
  @Test
  resolveNormalURIs(exam: Exam): void {
    const base = Uri.parse("http://a/b/c/d;p?q");
    exam.equal(base.resolve(Uri.parse("g:h")), Uri.parse("g:h"));
    exam.equal(base.resolve(Uri.parse("g")), Uri.parse("http://a/b/c/g"));
    exam.equal(base.resolve(Uri.parse("./g")), Uri.parse("http://a/b/c/g"));
    exam.equal(base.resolve(Uri.parse("g/")), Uri.parse("http://a/b/c/g/"));
    exam.equal(base.resolve(Uri.parse("/g")), Uri.parse("http://a/g"));
    exam.equal(base.resolve(Uri.parse("//g")), Uri.parse("http://g"));
    exam.equal(base.resolve(Uri.parse("?y")), Uri.parse("http://a/b/c/d;p?y"));
    exam.equal(base.resolve(Uri.parse("g?y")), Uri.parse("http://a/b/c/g?y"));
    exam.equal(base.resolve(Uri.parse("#s")), Uri.parse("http://a/b/c/d;p?q#s"));
    exam.equal(base.resolve(Uri.parse("g#s")), Uri.parse("http://a/b/c/g#s"));
    exam.equal(base.resolve(Uri.parse("g?y#s")), Uri.parse("http://a/b/c/g?y#s"));
    exam.equal(base.resolve(Uri.parse(";x")), Uri.parse("http://a/b/c/;x"));
    exam.equal(base.resolve(Uri.parse("g;x")), Uri.parse("http://a/b/c/g;x"));
    exam.equal(base.resolve(Uri.parse("g;x?y#s")), Uri.parse("http://a/b/c/g;x?y#s"));
    exam.equal(base.resolve(Uri.parse("")), Uri.parse("http://a/b/c/d;p?q"));
    exam.equal(base.resolve(Uri.parse(".")), Uri.parse("http://a/b/c/"));
    exam.equal(base.resolve(Uri.parse("./")), Uri.parse("http://a/b/c/"));
    exam.equal(base.resolve(Uri.parse("..")), Uri.parse("http://a/b/"));
    exam.equal(base.resolve(Uri.parse("../")), Uri.parse("http://a/b/"));
    exam.equal(base.resolve(Uri.parse("../g")), Uri.parse("http://a/b/g"));
    exam.equal(base.resolve(Uri.parse("../..")), Uri.parse("http://a/"));
    exam.equal(base.resolve(Uri.parse("../../")), Uri.parse("http://a/"));
    exam.equal(base.resolve(Uri.parse("../../g")), Uri.parse("http://a/g"));
  }

  @Test
  resolveAbnormalURIs(exam: Exam): void {
    const base = Uri.parse("http://a/b/c/d;p?q");

    exam.equal(base.resolve(Uri.parse("../../../g")), Uri.parse("http://a/g"));
    exam.equal(base.resolve(Uri.parse("../../../../g")), Uri.parse("http://a/g"));

    exam.equal(base.resolve(Uri.parse("/./g")), Uri.parse("http://a/g"));
    exam.equal(base.resolve(Uri.parse("/../g")), Uri.parse("http://a/g"));
    exam.equal(base.resolve(Uri.parse("g.")), Uri.parse("http://a/b/c/g."));
    exam.equal(base.resolve(Uri.parse(".g")), Uri.parse("http://a/b/c/.g"));
    exam.equal(base.resolve(Uri.parse("g..")), Uri.parse("http://a/b/c/g.."));
    exam.equal(base.resolve(Uri.parse("..g")), Uri.parse("http://a/b/c/..g"));

    exam.equal(base.resolve(Uri.parse("./../g")), Uri.parse("http://a/b/g"));
    exam.equal(base.resolve(Uri.parse("./g/.")), Uri.parse("http://a/b/c/g/"));
    exam.equal(base.resolve(Uri.parse("g/./h")), Uri.parse("http://a/b/c/g/h"));
    exam.equal(base.resolve(Uri.parse("g/../h")), Uri.parse("http://a/b/c/h"));
    exam.equal(base.resolve(Uri.parse("g;x=1/./y")), Uri.parse("http://a/b/c/g;x=1/y"));
    exam.equal(base.resolve(Uri.parse("g;x=1/../y")), Uri.parse("http://a/b/c/y"));

    exam.equal(base.resolve(Uri.parse("g?y/./x")), Uri.parse("http://a/b/c/g?y/./x"));
    exam.equal(base.resolve(Uri.parse("g?y/../x")), Uri.parse("http://a/b/c/g?y/../x"));
    exam.equal(base.resolve(Uri.parse("g#s/./x")), Uri.parse("http://a/b/c/g#s/./x"));
    exam.equal(base.resolve(Uri.parse("g#s/../x")), Uri.parse("http://a/b/c/g#s/../x"));
  }

  @Test
  unresolveRelatedURIs(exam: Exam): void {
    exam.equal(Uri.parse("http://a").unresolve(Uri.parse("http://a")), Uri.parse(""));
    exam.equal(Uri.parse("http://a").unresolve(Uri.parse("http://a/")), Uri.parse("/"));
    exam.equal(Uri.parse("http://a").unresolve(Uri.parse("http://a/c")), Uri.parse("c"));
    exam.equal(Uri.parse("http://a").unresolve(Uri.parse("http://a?y")), Uri.parse("?y"));
    exam.equal(Uri.parse("http://a").unresolve(Uri.parse("http://a#s")), Uri.parse("#s"));

    exam.equal(Uri.parse("http://a/").unresolve(Uri.parse("http://a")), Uri.parse("/"));
    exam.equal(Uri.parse("http://a/").unresolve(Uri.parse("http://a/")), Uri.parse(""));
    exam.equal(Uri.parse("http://a/").unresolve(Uri.parse("http://a/c")), Uri.parse("c"));
    exam.equal(Uri.parse("http://a/").unresolve(Uri.parse("http://a?y")), Uri.parse("/?y"));
    exam.equal(Uri.parse("http://a/").unresolve(Uri.parse("http://a#s")), Uri.parse("/#s"));

    exam.equal(Uri.parse("http://a/b").unresolve(Uri.parse("http://a")), Uri.parse("/"));
    exam.equal(Uri.parse("http://a/b").unresolve(Uri.parse("http://a/")), Uri.parse("/"));
    exam.equal(Uri.parse("http://a/b").unresolve(Uri.parse("http://a/c")), Uri.parse("c"));
    exam.equal(Uri.parse("http://a/b").unresolve(Uri.parse("http://a?y")), Uri.parse("/?y"));
    exam.equal(Uri.parse("http://a/b").unresolve(Uri.parse("http://a#s")), Uri.parse("/#s"));

    exam.equal(Uri.parse("http://a/b").unresolve(Uri.parse("http://a/b")), Uri.parse(""));
    exam.equal(Uri.parse("http://a/b").unresolve(Uri.parse("http://a/b/")), Uri.parse("/"));
    exam.equal(Uri.parse("http://a/b").unresolve(Uri.parse("http://a/b/c")), Uri.parse("c"));
    exam.equal(Uri.parse("http://a/b").unresolve(Uri.parse("http://a/b?y")), Uri.parse("?y"));
    exam.equal(Uri.parse("http://a/b").unresolve(Uri.parse("http://a/b#s")), Uri.parse("#s"));

    exam.equal(Uri.parse("http://a/b/").unresolve(Uri.parse("http://a/b")), Uri.parse("/b"));
    exam.equal(Uri.parse("http://a/b/").unresolve(Uri.parse("http://a/b/")), Uri.parse(""));
    exam.equal(Uri.parse("http://a/b/").unresolve(Uri.parse("http://a/b/c")), Uri.parse("c"));
    exam.equal(Uri.parse("http://a/b/").unresolve(Uri.parse("http://a/b?y")), Uri.parse("/b?y"));
    exam.equal(Uri.parse("http://a/b/").unresolve(Uri.parse("http://a/b#s")), Uri.parse("/b#s"));
  }

  @Test
  unresolveUnrelatedURIs(exam: Exam): void {
    exam.equal(Uri.parse("http://a").unresolve(Uri.parse("https://a")), Uri.parse("https://a"));
    exam.equal(Uri.parse("http://a").unresolve(Uri.parse("http://z")), Uri.parse("http://z"));
  }
}
