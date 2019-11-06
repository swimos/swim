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

public class UriPathSpec {
  @Test
  public void testPathName() {
    assertEquals(UriPath.parse("").name(), "");
    assertEquals(UriPath.parse("foo").name(), "foo");
    assertEquals(UriPath.parse("/foo").name(), "foo");
    assertEquals(UriPath.parse("/foo/").name(), "");
    assertEquals(UriPath.parse("/foo/bar").name(), "bar");
    assertEquals(UriPath.parse("/foo/bar/").name(), "");
  }

  @Test
  public void testParentPath() {
    assertEquals(UriPath.parse("").parent(), UriPath.parse(""));
    assertEquals(UriPath.parse("foo").parent(), UriPath.parse(""));
    assertEquals(UriPath.parse("foo/").parent(), UriPath.parse(""));
    assertEquals(UriPath.parse("foo/bar").parent(), UriPath.parse("foo/"));
    assertEquals(UriPath.parse("foo/bar/").parent(), UriPath.parse("foo/"));
    assertEquals(UriPath.parse("/").parent(), UriPath.parse(""));
    assertEquals(UriPath.parse("/foo").parent(), UriPath.parse("/"));
    assertEquals(UriPath.parse("/foo/").parent(), UriPath.parse("/"));
    assertEquals(UriPath.parse("/foo/bar").parent(), UriPath.parse("/foo/"));
    assertEquals(UriPath.parse("/foo/bar/").parent(), UriPath.parse("/foo/"));
  }

  @Test
  public void testBasePath() {
    assertEquals(UriPath.parse("").base(), UriPath.parse(""));
    assertEquals(UriPath.parse("foo").base(), UriPath.parse(""));
    assertEquals(UriPath.parse("foo/").base(), UriPath.parse("foo/"));
    assertEquals(UriPath.parse("foo/bar").base(), UriPath.parse("foo/"));
    assertEquals(UriPath.parse("foo/bar/").base(), UriPath.parse("foo/bar/"));
    assertEquals(UriPath.parse("/").base(), UriPath.parse("/"));
    assertEquals(UriPath.parse("/foo").base(), UriPath.parse("/"));
    assertEquals(UriPath.parse("/foo/").base(), UriPath.parse("/foo/"));
    assertEquals(UriPath.parse("/foo/bar").base(), UriPath.parse("/foo/"));
    assertEquals(UriPath.parse("/foo/bar/").base(), UriPath.parse("/foo/bar/"));
  }

  @Test
  public void testBodyPath() {
    assertEquals(UriPath.parse("").body(), UriPath.parse(""));
    assertEquals(UriPath.parse("foo").body(), UriPath.parse(""));
    assertEquals(UriPath.parse("foo/").body(), UriPath.parse("foo"));
    assertEquals(UriPath.parse("foo/bar").body(), UriPath.parse("foo/"));
    assertEquals(UriPath.parse("foo/bar/").body(), UriPath.parse("foo/bar"));
    assertEquals(UriPath.parse("/").body(), UriPath.parse(""));
    assertEquals(UriPath.parse("/foo").body(), UriPath.parse("/"));
    assertEquals(UriPath.parse("/foo/").body(), UriPath.parse("/foo"));
    assertEquals(UriPath.parse("/foo/bar").body(), UriPath.parse("/foo/"));
    assertEquals(UriPath.parse("/foo/bar/").body(), UriPath.parse("/foo/bar"));
  }
}
