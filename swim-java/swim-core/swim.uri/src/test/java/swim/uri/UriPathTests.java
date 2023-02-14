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

public class UriPathTests {

  @Test
  public void testPathName() {
    assertEquals("", UriPath.parse("").name());
    assertEquals("foo", UriPath.parse("foo").name());
    assertEquals("foo", UriPath.parse("/foo").name());
    assertEquals("", UriPath.parse("/foo/").name());
    assertEquals("bar", UriPath.parse("/foo/bar").name());
    assertEquals("", UriPath.parse("/foo/bar/").name());
  }

  @Test
  public void testParentPath() {
    assertEquals(UriPath.parse(""), UriPath.parse("").parent());
    assertEquals(UriPath.parse(""), UriPath.parse("foo").parent());
    assertEquals(UriPath.parse(""), UriPath.parse("foo/").parent());
    assertEquals(UriPath.parse("foo/"), UriPath.parse("foo/bar").parent());
    assertEquals(UriPath.parse("foo/"), UriPath.parse("foo/bar/").parent());
    assertEquals(UriPath.parse(""), UriPath.parse("/").parent());
    assertEquals(UriPath.parse("/"), UriPath.parse("/foo").parent());
    assertEquals(UriPath.parse("/"), UriPath.parse("/foo/").parent());
    assertEquals(UriPath.parse("/foo/"), UriPath.parse("/foo/bar").parent());
    assertEquals(UriPath.parse("/foo/"), UriPath.parse("/foo/bar/").parent());
  }

  @Test
  public void testBasePath() {
    assertEquals(UriPath.parse(""), UriPath.parse("").base());
    assertEquals(UriPath.parse(""), UriPath.parse("foo").base());
    assertEquals(UriPath.parse("foo/"), UriPath.parse("foo/").base());
    assertEquals(UriPath.parse("foo/"), UriPath.parse("foo/bar").base());
    assertEquals(UriPath.parse("foo/bar/"), UriPath.parse("foo/bar/").base());
    assertEquals(UriPath.parse("/"), UriPath.parse("/").base());
    assertEquals(UriPath.parse("/"), UriPath.parse("/foo").base());
    assertEquals(UriPath.parse("/foo/"), UriPath.parse("/foo/").base());
    assertEquals(UriPath.parse("/foo/"), UriPath.parse("/foo/bar").base());
    assertEquals(UriPath.parse("/foo/bar/"), UriPath.parse("/foo/bar/").base());
  }

  @Test
  public void testBodyPath() {
    assertEquals(UriPath.parse(""), UriPath.parse("").body());
    assertEquals(UriPath.parse(""), UriPath.parse("foo").body());
    assertEquals(UriPath.parse("foo"), UriPath.parse("foo/").body());
    assertEquals(UriPath.parse("foo/"), UriPath.parse("foo/bar").body());
    assertEquals(UriPath.parse("foo/bar"), UriPath.parse("foo/bar/").body());
    assertEquals(UriPath.parse(""), UriPath.parse("/").body());
    assertEquals(UriPath.parse("/"), UriPath.parse("/foo").body());
    assertEquals(UriPath.parse("/foo"), UriPath.parse("/foo/").body());
    assertEquals(UriPath.parse("/foo/"), UriPath.parse("/foo/bar").body());
    assertEquals(UriPath.parse("/foo/bar"), UriPath.parse("/foo/bar/").body());
  }

}
