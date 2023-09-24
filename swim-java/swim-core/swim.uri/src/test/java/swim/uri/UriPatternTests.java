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

import java.util.Map;
import org.junit.jupiter.api.Test;
import swim.codec.ParseException;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class UriPatternTests {

  @Test
  public void applyPathSegments() throws ParseException {
    assertEquals(Uri.parse("/foo").getNonNull(),
                 UriPattern.parse("/:entity").getNonNull()
                           .apply("foo"));
    assertEquals(Uri.parse("/test/bar").getNonNull(),
                 UriPattern.parse("/test/:id").getNonNull()
                           .apply("bar"));
    assertEquals(Uri.parse("/foo/bar").getNonNull(),
                 UriPattern.parse("/:entity/:id").getNonNull()
                           .apply("foo", "bar"));
    assertEquals(Uri.parse("http://example.com/foo/info").getNonNull(),
                 UriPattern.parse("http://example.com/:entity/info").getNonNull()
                            .apply("foo"));
  }

  @Test
  public void unapplyPathSegments() throws ParseException {
    assertEquals(Map.of("entity", "foo"),
                 UriPattern.parse("/:entity").getNonNull()
                           .unapply(Uri.parse("/foo").getNonNull()));
    assertEquals(Map.of("id", "bar"),
                 UriPattern.parse("/test/:id").getNonNull()
                           .unapply(Uri.parse("/test/bar").getNonNull()));
    assertEquals(Map.of("entity", "foo", "id", "bar"),
                 UriPattern.parse("/:entity/:id").getNonNull()
                           .unapply(Uri.parse("/foo/bar").getNonNull()));
    assertEquals(Map.of("entity", "foo"),
                 UriPattern.parse("http://example.com/:entity/info").getNonNull()
                           .unapply(Uri.parse("http://example.com/foo/info").getNonNull()));
  }

  @Test
  public void partiallyUnapplyPathSegments() throws ParseException {
    assertEquals(Map.of("entity", "foo"),
                 UriPattern.parse("/:entity/:id").getNonNull()
                           .unapply(Uri.parse("/foo").getNonNull()));
    assertEquals(Map.of("entity", "foo"),
                 UriPattern.parse("/:entity/:id").getNonNull()
                           .unapply(Uri.parse("/foo/").getNonNull()));
  }

  @Test
  public void notUnapplyDifferingPathPrefixes() throws ParseException {
    assertEquals(Map.of(),
                 UriPattern.parse("/a/:id").getNonNull()
                           .unapply(Uri.parse("/b/c").getNonNull()));
  }

  @Test
  public void partiallyUnapplyDifferingPathSuffixes() throws ParseException {
    assertEquals(Map.of("id", "b"),
                 UriPattern.parse("/a/:id/b/:prop").getNonNull()
                           .unapply(Uri.parse("/a/b/c/d").getNonNull()));
  }

  @Test
  public void unapplyUndefinedParts() throws ParseException {
    assertEquals(Map.of("entity", "foo"),
                 UriPattern.parse("/:entity").getNonNull()
                           .unapply(Uri.parse("http://example.com/foo/bar?q#f").getNonNull()));
  }

  @Test
  public void notUnapplyDifferenPartPrefixes() throws ParseException {
    assertEquals(Map.of(),
                 UriPattern.parse("http://example.com/:entity").getNonNull()
                           .unapply(Uri.parse("/foo").getNonNull()));
  }

  @Test
  public void matchPathSegments() throws ParseException {
    assertTrue(UriPattern.parse("/:entity").getNonNull()
                         .matches(Uri.parse("/foo").getNonNull()));
    assertTrue(UriPattern.parse("/test/:id").getNonNull()
                         .matches(Uri.parse("/test/bar").getNonNull()));
    assertTrue(UriPattern.parse("/:entity/:id").getNonNull()
                         .matches(Uri.parse("/foo/bar").getNonNull()));
    assertTrue(UriPattern.parse("http://example.com/:entity/info").getNonNull()
                         .matches(Uri.parse("http://example.com/foo/info").getNonNull()));
  }

  @Test
  public void matchAllParts() throws ParseException {
    assertTrue(UriPattern.parse("http://example.com/:entity/info?q#f").getNonNull()
                         .matches(Uri.parse("http://example.com/foo/info?q#f").getNonNull()));
  }

  @Test
  public void notMatchDifferingPathSegments() throws ParseException {
    assertFalse(UriPattern.parse("/:entity/:id").getNonNull()
                          .matches(Uri.parse("/foo").getNonNull()));
    assertFalse(UriPattern.parse("/:entity/:id").getNonNull()
                          .matches(Uri.parse("/foo/").getNonNull()));
    assertFalse(UriPattern.parse("/a/:id").getNonNull()
                          .matches(Uri.parse("/b/c").getNonNull()));
    assertFalse(UriPattern.parse("/a/:id/b/:prop").getNonNull()
                          .matches(Uri.parse("/a/b/c/d").getNonNull()));
  }

  @Test
  public void notMatchDifferingParts() throws ParseException {
    assertFalse(UriPattern.parse("http://example.com/:entity").getNonNull()
                          .matches(Uri.parse("/foo").getNonNull()));
    assertFalse(UriPattern.parse("http://example.com/:entity").getNonNull()
                          .matches(Uri.parse("https://example.com/foo").getNonNull()));
    assertFalse(UriPattern.parse("http://example.com/:entity").getNonNull()
                          .matches(Uri.parse("http://www.example.com/foo").getNonNull()));
    assertFalse(UriPattern.parse("http://example.com/:entity?q1").getNonNull()
                          .matches(Uri.parse("http://example.com/foo?q2").getNonNull()));
    assertFalse(UriPattern.parse("http://example.com/:entity#f1").getNonNull()
                          .matches(Uri.parse("http://example.com/foo#f2").getNonNull()));
    assertFalse(UriPattern.parse("http://example.com/:entity?q1#f1").getNonNull()
                          .matches(Uri.parse("http://example.com/foo?q1#f2").getNonNull()));
    assertFalse(UriPattern.parse("http://example.com/:entity?q1#f1").getNonNull()
                          .matches(Uri.parse("http://example.com/foo?q2#f1").getNonNull()));
  }

  @Test
  public void notMatchMissingParts() throws ParseException {
    assertFalse(UriPattern.parse("http://example.com/:entity").getNonNull()
                          .matches(Uri.parse("http:/foo").getNonNull()));
    assertFalse(UriPattern.parse("http://example.com/").getNonNull()
                          .matches(Uri.parse("http://example.com").getNonNull()));
    assertFalse(UriPattern.parse("http://example.com/:entity?q").getNonNull()
                          .matches(Uri.parse("http://example.com/foo").getNonNull()));
    assertFalse(UriPattern.parse("http://example.com/:entity#f").getNonNull()
                          .matches(Uri.parse("http://example.com/foo").getNonNull()));
    assertFalse(UriPattern.parse("http://example.com/:entity?q#f").getNonNull()
                          .matches(Uri.parse("http://example.com/foo?q").getNonNull()));
    assertFalse(UriPattern.parse("http://example.com/:entity?q#f").getNonNull()
                          .matches(Uri.parse("http://example.com/foo#f").getNonNull()));
  }

}
