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
import swim.codec.ParseException;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class UriPathTests {

  @Test
  public void testPathName() throws ParseException {
    assertEquals("", UriPath.parse("").getNonNull().name());
    assertEquals("foo", UriPath.parse("foo").getNonNull().name());
    assertEquals("foo", UriPath.parse("/foo").getNonNull().name());
    assertEquals("", UriPath.parse("/foo/").getNonNull().name());
    assertEquals("bar", UriPath.parse("/foo/bar").getNonNull().name());
    assertEquals("", UriPath.parse("/foo/bar/").getNonNull().name());
  }

  @Test
  public void testParentPath() throws ParseException {
    assertEquals(UriPath.parse("").getNonNull(),
                 UriPath.parse("").getNonNull().parent());
    assertEquals(UriPath.parse("").getNonNull(),
                 UriPath.parse("foo").getNonNull().parent());
    assertEquals(UriPath.parse("").getNonNull(),
                 UriPath.parse("foo/").getNonNull().parent());
    assertEquals(UriPath.parse("foo/").getNonNull(),
                 UriPath.parse("foo/bar").getNonNull().parent());
    assertEquals(UriPath.parse("foo/").getNonNull(),
                 UriPath.parse("foo/bar/").getNonNull().parent());
    assertEquals(UriPath.parse("").getNonNull(),
                 UriPath.parse("/").getNonNull().parent());
    assertEquals(UriPath.parse("/").getNonNull(),
                 UriPath.parse("/foo").getNonNull().parent());
    assertEquals(UriPath.parse("/").getNonNull(),
                 UriPath.parse("/foo/").getNonNull().parent());
    assertEquals(UriPath.parse("/foo/").getNonNull(),
                 UriPath.parse("/foo/bar").getNonNull().parent());
    assertEquals(UriPath.parse("/foo/").getNonNull(),
                 UriPath.parse("/foo/bar/").getNonNull().parent());
  }

  @Test
  public void testBasePath() throws ParseException {
    assertEquals(UriPath.parse("").getNonNull(),
                 UriPath.parse("").getNonNull().base());
    assertEquals(UriPath.parse("").getNonNull(),
                 UriPath.parse("foo").getNonNull().base());
    assertEquals(UriPath.parse("foo/").getNonNull(),
                 UriPath.parse("foo/").getNonNull().base());
    assertEquals(UriPath.parse("foo/").getNonNull(),
                 UriPath.parse("foo/bar").getNonNull().base());
    assertEquals(UriPath.parse("foo/bar/").getNonNull(),
                 UriPath.parse("foo/bar/").getNonNull().base());
    assertEquals(UriPath.parse("/").getNonNull(),
                 UriPath.parse("/").getNonNull().base());
    assertEquals(UriPath.parse("/").getNonNull(),
                 UriPath.parse("/foo").getNonNull().base());
    assertEquals(UriPath.parse("/foo/").getNonNull(),
                 UriPath.parse("/foo/").getNonNull().base());
    assertEquals(UriPath.parse("/foo/").getNonNull(),
                 UriPath.parse("/foo/bar").getNonNull().base());
    assertEquals(UriPath.parse("/foo/bar/").getNonNull(),
                 UriPath.parse("/foo/bar/").getNonNull().base());
  }

  @Test
  public void testBodyPath() throws ParseException {
    assertEquals(UriPath.parse("").getNonNull(),
                 UriPath.parse("").getNonNull().body());
    assertEquals(UriPath.parse("").getNonNull(),
                 UriPath.parse("foo").getNonNull().body());
    assertEquals(UriPath.parse("foo").getNonNull(),
                 UriPath.parse("foo/").getNonNull().body());
    assertEquals(UriPath.parse("foo/").getNonNull(),
                 UriPath.parse("foo/bar").getNonNull().body());
    assertEquals(UriPath.parse("foo/bar").getNonNull(),
                 UriPath.parse("foo/bar/").getNonNull().body());
    assertEquals(UriPath.parse("").getNonNull(),
                 UriPath.parse("/").getNonNull().body());
    assertEquals(UriPath.parse("/").getNonNull(),
                 UriPath.parse("/foo").getNonNull().body());
    assertEquals(UriPath.parse("/foo").getNonNull(),
                 UriPath.parse("/foo/").getNonNull().body());
    assertEquals(UriPath.parse("/foo/").getNonNull(),
                 UriPath.parse("/foo/bar").getNonNull().body());
    assertEquals(UriPath.parse("/foo/bar").getNonNull(),
                 UriPath.parse("/foo/bar/").getNonNull().body());
  }

}
