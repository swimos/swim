// Copyright 2015-2021 Swim inc.
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
import {UriPath} from "@swim/uri";

export class UriPathSpec extends Spec {
  @Test
  testPathName(exam: Exam): void {
    exam.equal(UriPath.parse("").name, "");
    exam.equal(UriPath.parse("foo").name, "foo");
    exam.equal(UriPath.parse("/foo").name, "foo");
    exam.equal(UriPath.parse("/foo/").name, "");
    exam.equal(UriPath.parse("/foo/bar").name, "bar");
    exam.equal(UriPath.parse("/foo/bar/").name, "");
  }

  @Test
  testParentPath(exam: Exam): void {
    exam.equal(UriPath.parse("").parent(), UriPath.parse(""));
    exam.equal(UriPath.parse("foo").parent(), UriPath.parse(""));
    exam.equal(UriPath.parse("foo/").parent(), UriPath.parse(""));
    exam.equal(UriPath.parse("foo/bar").parent(), UriPath.parse("foo/"));
    exam.equal(UriPath.parse("foo/bar/").parent(), UriPath.parse("foo/"));
    exam.equal(UriPath.parse("/").parent(), UriPath.parse(""));
    exam.equal(UriPath.parse("/foo").parent(), UriPath.parse("/"));
    exam.equal(UriPath.parse("/foo/").parent(), UriPath.parse("/"));
    exam.equal(UriPath.parse("/foo/bar").parent(), UriPath.parse("/foo/"));
    exam.equal(UriPath.parse("/foo/bar/").parent(), UriPath.parse("/foo/"));
  }

  @Test
  testBasePath(exam: Exam): void {
    exam.equal(UriPath.parse("").base(), UriPath.parse(""));
    exam.equal(UriPath.parse("foo").base(), UriPath.parse(""));
    exam.equal(UriPath.parse("foo/").base(), UriPath.parse("foo/"));
    exam.equal(UriPath.parse("foo/bar").base(), UriPath.parse("foo/"));
    exam.equal(UriPath.parse("foo/bar/").base(), UriPath.parse("foo/bar/"));
    exam.equal(UriPath.parse("/").base(), UriPath.parse("/"));
    exam.equal(UriPath.parse("/foo").base(), UriPath.parse("/"));
    exam.equal(UriPath.parse("/foo/").base(), UriPath.parse("/foo/"));
    exam.equal(UriPath.parse("/foo/bar").base(), UriPath.parse("/foo/"));
    exam.equal(UriPath.parse("/foo/bar/").base(), UriPath.parse("/foo/bar/"));
  }
}
