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

import java.util.Map;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class UriPatternTests {

  @Test
  public void applyPathSegments() {
    assertEquals(Uri.parse("/foo"), UriPattern.parse("/:entity").apply("foo"));
    assertEquals(Uri.parse("/test/bar"), UriPattern.parse("/test/:id").apply("bar"));
    assertEquals(Uri.parse("/foo/bar"), UriPattern.parse("/:entity/:id").apply("foo", "bar"));
    assertEquals(Uri.parse("http://example.com/foo/info"), UriPattern.parse("http://example.com/:entity/info").apply("foo"));
  }

  @Test
  public void unapplyPathSegments() {
    assertEquals(Map.of("entity", "foo"), UriPattern.parse("/:entity").unapply("/foo"));
    assertEquals(Map.of("id", "bar"), UriPattern.parse("/test/:id").unapply("/test/bar"));
    assertEquals(Map.of("entity", "foo", "id", "bar"), UriPattern.parse("/:entity/:id").unapply("/foo/bar"));
    assertEquals(Map.of("entity", "foo"), UriPattern.parse("http://example.com/:entity/info").unapply("http://example.com/foo/info"));
  }

  @Test
  public void partiallyUnapplyPathSegments() {
    assertEquals(Map.of("entity", "foo"), UriPattern.parse("/:entity/:id").unapply("/foo"));
    assertEquals(Map.of("entity", "foo"), UriPattern.parse("/:entity/:id").unapply("/foo/"));
  }

  @Test
  public void notUnapplyDifferingPathPrefixes() {
    assertEquals(Map.of(), UriPattern.parse("/a/:id").unapply("/b/c"));
  }

  @Test
  public void partiallyUnapplyDifferingPathSuffixes() {
    assertEquals(Map.of("id", "b"), UriPattern.parse("/a/:id/b/:prop").unapply("/a/b/c/d"));
  }

  @Test
  public void unapplyUndefinedParts() {
    assertEquals(Map.of("entity", "foo"), UriPattern.parse("/:entity").unapply("http://example.com/foo/bar?q#f"));
  }

  @Test
  public void notUnapplyDifferenPartPrefixes() {
    assertEquals(Map.of(), UriPattern.parse("http://example.com/:entity").unapply("/foo"));
  }

  @Test
  public void matchPathSegments() {
    assertTrue(UriPattern.parse("/:entity").matches("/foo"));
    assertTrue(UriPattern.parse("/test/:id").matches("/test/bar"));
    assertTrue(UriPattern.parse("/:entity/:id").matches("/foo/bar"));
    assertTrue(UriPattern.parse("http://example.com/:entity/info").matches("http://example.com/foo/info"));
  }

  @Test
  public void matchAllParts() {
    assertTrue(UriPattern.parse("http://example.com/:entity/info?q#f").matches("http://example.com/foo/info?q#f"));
  }

  @Test
  public void notMatchDifferingPathSegments() {
    assertFalse(UriPattern.parse("/:entity/:id").matches("/foo"));
    assertFalse(UriPattern.parse("/:entity/:id").matches("/foo/"));
    assertFalse(UriPattern.parse("/a/:id").matches("/b/c"));
    assertFalse(UriPattern.parse("/a/:id/b/:prop").matches("/a/b/c/d"));
  }

  @Test
  public void notMatchDifferingParts() {
    assertFalse(UriPattern.parse("http://example.com/:entity").matches("/foo"));
    assertFalse(UriPattern.parse("http://example.com/:entity").matches("https://example.com/foo"));
    assertFalse(UriPattern.parse("http://example.com/:entity").matches("http://www.example.com/foo"));
    assertFalse(UriPattern.parse("http://example.com/:entity?q1").matches("http://example.com/foo?q2"));
    assertFalse(UriPattern.parse("http://example.com/:entity#f1").matches("http://example.com/foo#f2"));
    assertFalse(UriPattern.parse("http://example.com/:entity?q1#f1").matches("http://example.com/foo?q1#f2"));
    assertFalse(UriPattern.parse("http://example.com/:entity?q1#f1").matches("http://example.com/foo?q2#f1"));
  }

  @Test
  public void notMatchMissingParts() {
    assertFalse(UriPattern.parse("http://example.com/:entity").matches("http:/foo"));
    assertFalse(UriPattern.parse("http://example.com/").matches("http://example.com"));
    assertFalse(UriPattern.parse("http://example.com/:entity?q").matches("http://example.com/foo"));
    assertFalse(UriPattern.parse("http://example.com/:entity#f").matches("http://example.com/foo"));
    assertFalse(UriPattern.parse("http://example.com/:entity?q#f").matches("http://example.com/foo?q"));
    assertFalse(UriPattern.parse("http://example.com/:entity?q#f").matches("http://example.com/foo#f"));
  }

}
