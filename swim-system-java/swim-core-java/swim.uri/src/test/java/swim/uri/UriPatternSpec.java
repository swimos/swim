// Copyright 2015-2020 SWIM.AI inc.
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
import swim.collections.HashTrieMap;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

public class UriPatternSpec {

  @Test
  public void applyPathSegments() {
    assertEquals(UriPattern.parse("/:entity").apply("foo"), Uri.parse("/foo"));
    assertEquals(UriPattern.parse("/test/:id").apply("bar"), Uri.parse("/test/bar"));
    assertEquals(UriPattern.parse("/:entity/:id").apply("foo", "bar"), Uri.parse("/foo/bar"));
    assertEquals(UriPattern.parse("http://example.com/:entity/info").apply("foo"), Uri.parse("http://example.com/foo/info"));
  }

  @Test
  public void unapplyPathSegments() {
    assertEquals(UriPattern.parse("/:entity").unapply("/foo"), (Object) HashTrieMap.of("entity", "foo"));
    assertEquals(UriPattern.parse("/test/:id").unapply("/test/bar"), (Object) HashTrieMap.of("id", "bar"));
    assertEquals(UriPattern.parse("/:entity/:id").unapply("/foo/bar"), (Object) HashTrieMap.of("entity", "foo").updated("id", "bar"));
    assertEquals(UriPattern.parse("http://example.com/:entity/info").unapply("http://example.com/foo/info"), (Object) HashTrieMap.of("entity", "foo"));
  }

  @Test
  public void partiallyUnapplyPathSegments() {
    assertEquals(UriPattern.parse("/:entity/:id").unapply("/foo"), (Object) HashTrieMap.of("entity", "foo"));
    assertEquals(UriPattern.parse("/:entity/:id").unapply("/foo/"), (Object) HashTrieMap.of("entity", "foo"));
  }

  @Test
  public void notUnapplyDifferingPathPrefixes() {
    assertEquals(UriPattern.parse("/a/:id").unapply("/b/c"), (Object) HashTrieMap.empty());
  }

  @Test
  public void partiallyUnapplyDifferingPathSuffixes() {
    assertEquals(UriPattern.parse("/a/:id/b/:prop").unapply("/a/b/c/d"), (Object) HashTrieMap.of("id", "b"));
  }

  @Test
  public void unapplyUndefinedParts() {
    assertEquals(UriPattern.parse("/:entity").unapply("http://example.com/foo/bar?q#f"), (Object) HashTrieMap.of("entity", "foo"));
  }

  @Test
  public void notUnapplyDifferenPartPrefixes() {
    assertEquals(UriPattern.parse("http://example.com/:entity").unapply("/foo"), (Object) HashTrieMap.empty());
  }

  @Test
  public void matchPathSegments() {
    assertTrue(UriPattern.parse("/:entity").matches("/foo"));
    assertTrue(UriPattern.parse("/test/:id").matches("/test/bar"));
    assertTrue(UriPattern.parse("/:entity/:id").matches("/foo/bar"));
    assertTrue(UriPattern.parse("http://example.com/:entity/info").matches("http://example.com/foo/info"));
  }

  @Test
  public void matchPrefixPathSegments() {
    assertTrue(UriPattern.parse("/:entity").matchesPrefix("/foo"));
    assertTrue(UriPattern.parse("/:entity").matchesPrefix("/foo/bar"));
    assertTrue(UriPattern.parse("/test/:id").matchesPrefix("/test/bar"));
    assertTrue(UriPattern.parse("/test/:id").matchesPrefix("/test/bar/baz"));
    assertTrue(UriPattern.parse("/:entity/:id").matchesPrefix("/foo/bar"));
    assertTrue(UriPattern.parse("/:entity/:id").matchesPrefix("/foo/bar/baz"));
    assertTrue(UriPattern.parse("http://example.com/:entity/info").matches("http://example.com/foo/info"));
  }

  @Test
  public void matchPrefixScheme() {
    assertTrue(UriPattern.parse("http:").matchesPrefix("http://swimos.org"));
  }

  @Test
  public void matchAllParts() {
    assertTrue(UriPattern.parse("http://example.com/:entity/info?q#f").matches("http://example.com/foo/info?q#f"));

    assertTrue(UriPattern.parse("http://example.com/:entity/info?q#f").matchesPrefix("http://example.com/foo/info?q#f"));
  }

  @Test
  public void notMatchDifferingPathSegments() {
    assertFalse(UriPattern.parse("/:entity/:id").matches("/foo"));
    assertFalse(UriPattern.parse("/:entity/:id").matches("/foo/"));
    assertFalse(UriPattern.parse("/a/:id").matches("/b/c"));
    assertFalse(UriPattern.parse("/a/:id/b/:prop").matches("/a/b/c/d"));

    assertFalse(UriPattern.parse("/:entity/:id").matchesPrefix("/foo"));
    assertFalse(UriPattern.parse("/:entity/:id").matchesPrefix("/foo/"));
    assertFalse(UriPattern.parse("/a/:id").matchesPrefix("/b/c"));
    assertFalse(UriPattern.parse("/a/:id/b/:prop").matchesPrefix("/a/b/c/d"));
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

    assertFalse(UriPattern.parse("http://example.com/:entity").matchesPrefix("/foo"));
    assertFalse(UriPattern.parse("http://example.com/:entity").matchesPrefix("https://example.com/foo"));
    assertFalse(UriPattern.parse("http://example.com/:entity").matchesPrefix("http://www.example.com/foo"));
    assertFalse(UriPattern.parse("http://example.com/:entity?q1").matchesPrefix("http://example.com/foo?q2"));
    assertFalse(UriPattern.parse("http://example.com/:entity#f1").matchesPrefix("http://example.com/foo#f2"));
    assertFalse(UriPattern.parse("http://example.com/:entity?q1#f1").matchesPrefix("http://example.com/foo?q1#f2"));
    assertFalse(UriPattern.parse("http://example.com/:entity?q1#f1").matchesPrefix("http://example.com/foo?q2#f1"));
    assertFalse(UriPattern.parse("http://").matchesPrefix("http://swimos.org")); // scheme, empty path
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
