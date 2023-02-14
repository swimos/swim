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

import java.util.Iterator;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class UriMapperTests {

  @Test
  public void mapUriPathMatches() {
    assertEquals("test", UriMapper.mapping("path", "test").get("path"));
    assertEquals("test", UriMapper.mapping("a/", "test").get("a/"));
    assertEquals("test", UriMapper.mapping("a/b", "test").get("a/b"));
    assertEquals("test", UriMapper.mapping("a/b/", "test").get("a/b/"));
    assertEquals("test", UriMapper.mapping("a/b/c", "test").get("a/b/c"));
  }

  @Test
  public void notMapUriPathMismatches() {
    assertNull(UriMapper.mapping("foo", "test").get("path"));
    assertNull(UriMapper.mapping("x/", "test").get("a/"));
    assertNull(UriMapper.mapping("x/b", "test").get("a/b"));
    assertNull(UriMapper.mapping("a/x", "test").get("a/b"));
    assertNull(UriMapper.mapping("x/b/", "test").get("a/b/"));
    assertNull(UriMapper.mapping("a/x/", "test").get("a/b/"));
    assertNull(UriMapper.mapping("x/b/c", "test").get("a/b/c"));
    assertNull(UriMapper.mapping("a/x/c", "test").get("a/b/c"));
    assertNull(UriMapper.mapping("a/b/x", "test").get("a/b/c"));
  }

  @Test
  public void notMapUriPathPrefixes() {
    assertNull(UriMapper.mapping("a/b/c/", "test").get("a"));
    assertNull(UriMapper.mapping("a/b/c/", "test").get("a/"));
    assertNull(UriMapper.mapping("a/b/c/", "test").get("a/b"));
    assertNull(UriMapper.mapping("a/b/c/", "test").get("a/b/"));
    assertNull(UriMapper.mapping("a/b/c/", "test").get("a/b/c"));
  }

  @Test
  public void mapUriPathVariableMatches() {
    assertEquals("test", UriMapper.mapping("/:path", "test").get("/foo"));
    assertEquals("test", UriMapper.mapping("/:path", "test").get("/bar"));
    assertEquals("test", UriMapper.mapping("/:path/", "test").get("/a/"));
    assertEquals("test", UriMapper.mapping("/:path/", "test").get("/b/"));
    assertEquals("test", UriMapper.mapping("/:name/b", "test").get("/a/b"));
    assertEquals("test", UriMapper.mapping("/:name/b", "test").get("/x/b"));
    assertEquals("test", UriMapper.mapping("/a/:name", "test").get("/a/b"));
    assertEquals("test", UriMapper.mapping("/a/:name", "test").get("/a/y"));
    assertEquals("test", UriMapper.mapping("/:name/b/", "test").get("/a/b/"));
    assertEquals("test", UriMapper.mapping("/:name/b/", "test").get("/x/b/"));
    assertEquals("test", UriMapper.mapping("/a/:name/", "test").get("/a/b/"));
    assertEquals("test", UriMapper.mapping("/a/:name/", "test").get("/a/y/"));
    assertEquals("test", UriMapper.mapping("/:name/b/c", "test").get("/a/b/c"));
    assertEquals("test", UriMapper.mapping("/:name/b/c", "test").get("/x/b/c"));
    assertEquals("test", UriMapper.mapping("/a/:name/c", "test").get("/a/b/c"));
    assertEquals("test", UriMapper.mapping("/a/:name/c", "test").get("/a/y/c"));
    assertEquals("test", UriMapper.mapping("/a/b/:name", "test").get("/a/b/c"));
    assertEquals("test", UriMapper.mapping("/a/b/:name", "test").get("/a/b/x"));
  }

  @Test
  public void notMapUriPathVariableMismatches() {
    assertNull(UriMapper.mapping("/:name/b", "test").get("/a/x"));
    assertNull(UriMapper.mapping("/a/:name", "test").get("/x/b"));
    assertNull(UriMapper.mapping("/:name/b/", "test").get("/a/x/"));
    assertNull(UriMapper.mapping("/a/:name/", "test").get("/x/b/"));
  }

  @Test
  public void mapMultipleUriPaths() {
    UriMapper<String> mapper = UriMapper.empty();

    mapper = mapper.updated("/a/b", "B");
    assertEquals("B", mapper.get("/a/b"));
    assertNull(mapper.get("/a/c"));
    assertNull(mapper.get("/x/y"));

    mapper = mapper.updated("/x/y", "Y");
    assertEquals("B", mapper.get("/a/b"));
    assertNull(mapper.get("/a/c"));
    assertEquals("Y", mapper.get("/x/y"));

    mapper = mapper.updated("/a/c", "C");
    assertEquals("B", mapper.get("/a/b"));
    assertEquals("C", mapper.get("/a/c"));
    assertEquals("Y", mapper.get("/x/y"));
  }

  @Test
  public void mapMultipleUriVariablePaths() {
    UriMapper<String> mapper = UriMapper.empty();

    mapper = mapper.updated("/:a", "A");
    assertEquals("A", mapper.get("/a"));
    assertEquals("A", mapper.get("/x"));
    assertNull(mapper.get("/x/"));

    mapper = mapper.updated("/:a/b", "B");
    assertEquals("A", mapper.get("/a"));
    assertEquals("A", mapper.get("/x"));
    assertNull(mapper.get("/x/"));
    assertEquals("B", mapper.get("/a/b"));
    assertEquals("B", mapper.get("/x/b"));

    mapper = mapper.updated("/:a/c", "C");
    assertEquals("A", mapper.get("/a"));
    assertEquals("A", mapper.get("/x"));
    assertNull(mapper.get("/x/"));
    assertEquals("B", mapper.get("/a/b"));
    assertEquals("B", mapper.get("/x/b"));
    assertEquals("C", mapper.get("/a/c"));
    assertEquals("C", mapper.get("/x/c"));

    mapper = mapper.updated("/:a/:b", "Y");
    assertEquals("A", mapper.get("/a"));
    assertEquals("A", mapper.get("/x"));
    assertNull(mapper.get("/x/"));
    assertEquals("B", mapper.get("/a/b"));
    assertEquals("B", mapper.get("/x/b"));
    assertEquals("C", mapper.get("/a/c"));
    assertEquals("C", mapper.get("/x/c"));
    assertEquals("Y", mapper.get("/x/y"));
  }

  @Test
  public void removeUriMappings() {
    UriMapper<String> mapper = UriMapper.<String>empty()
                                        .updated("/a/b", "B")
                                        .updated("/x/y", "Y")
                                        .updated("/a/c", "C");
    assertEquals("B", mapper.get("/a/b"));
    assertEquals("C", mapper.get("/a/c"));
    assertEquals("Y", mapper.get("/x/y"));

    mapper = mapper.removed("/a/c");
    assertEquals("B", mapper.get("/a/b"));
    assertNull(mapper.get("/a/c"));
    assertEquals("Y", mapper.get("/x/y"));

    mapper = mapper.removed("/x/y");
    assertEquals("B", mapper.get("/a/b"));
    assertNull(mapper.get("/a/c"));
    assertNull(mapper.get("/x/y"));

    mapper = mapper.removed("/a/b");
    assertNull(mapper.get("/a/b"));
    assertNull(mapper.get("/a/c"));
    assertNull(mapper.get("/x/y"));

    assertTrue(mapper.isEmpty());
  }

  @Test
  public void removeUriVariableMappings() {
    UriMapper<String> mapper = UriMapper.<String>empty()
                                        .updated("/:a/b", "B")
                                        .updated("/:a", "A")
                                        .updated("/:a/c", "C")
                                        .updated("/:a/:b", "Y");
    assertEquals("A", mapper.get("/x"));
    assertNull(mapper.get("/x/"));
    assertEquals("B", mapper.get("/x/b"));
    assertEquals("C", mapper.get("/x/c"));
    assertEquals("Y", mapper.get("/x/y"));

    mapper = mapper.removed("/:a/:b");
    assertEquals("A", mapper.get("/x"));
    assertNull(mapper.get("/x/"));
    assertEquals("B", mapper.get("/x/b"));
    assertEquals("C", mapper.get("/x/c"));
    assertNull(mapper.get("/x/y"));

    mapper = mapper.removed("/:a/c");
    assertEquals("A", mapper.get("/x"));
    assertNull(mapper.get("/x/"));
    assertEquals("B", mapper.get("/x/b"));
    assertNull(mapper.get("/x/c"));
    assertNull(mapper.get("/x/y"));

    mapper = mapper.removed("/:a");
    assertNull(mapper.get("/x"));
    assertNull(mapper.get("/x/"));
    assertEquals("B", mapper.get("/x/b"));
    assertNull(mapper.get("/x/c"));
    assertNull(mapper.get("/x/y"));

    mapper = mapper.removed("/:a/b");
    assertNull(mapper.get("/x"));
    assertNull(mapper.get("/x/"));
    assertNull(mapper.get("/x/b"));
    assertNull(mapper.get("/x/c"));
    assertNull(mapper.get("/x/y"));

    assertTrue(mapper.isEmpty());
  }

  @Test
  public void unmergeUriMappings() {
    UriMapper<String> mapper = UriMapper.<String>empty()
                                        .updated("/a/b", "B")
                                        .updated("/x/y", "Y")
                                        .updated("/a/c", "C");
    assertEquals("B", mapper.get("/a/b"));
    assertEquals("C", mapper.get("/a/c"));
    assertEquals("Y", mapper.get("/x/y"));

    final UriMapper<String> submapper = UriMapper.<String>empty()
                                                 .updated("/a/b", "B")
                                                 .updated("/x/y", "Y");

    mapper = mapper.unmerged(submapper);
    assertNull(mapper.get("/a/b"));
    assertEquals("C", mapper.get("/a/c"));
    assertNull(mapper.get("/x/y"));
  }

  @Test
  public void suffixMappings() {
    final UriMapper<String> mapper = UriMapper.<String>empty()
                                              .updated("/a/1", "1")
                                              .updated("/b/2", "2")
                                              .updated("/b/3", "3")
                                              .updated("/c/4", "4");

    final UriMapper<String> slash = mapper.getSuffix("/");
    assertEquals(4, slash.size());
    assertEquals("1", slash.get("a/1"));
    assertEquals("2", slash.get("b/2"));
    assertEquals("3", slash.get("b/3"));
    assertEquals("4", slash.get("c/4"));

    final UriMapper<String> slashA = mapper.getSuffix("/a");
    assertEquals(1, slashA.size());
    assertEquals("1", slashA.get("/1"));

    final UriMapper<String> slashASlash1 = mapper.getSuffix("/a/1");
    assertEquals(1, slashASlash1.size());
    assertEquals("1", slashASlash1.get(Uri.empty()));

    final UriMapper<String> slashB = mapper.getSuffix("/b");
    assertEquals(2, slashB.size());
    assertEquals("2", slashB.get("/2"));
    assertEquals("3", slashB.get("/3"));

    final UriMapper<String> slashC = mapper.getSuffix("/c");
    assertEquals(1, slashC.size());
    assertEquals("4", slashC.get("/4"));

    final UriMapper<String> slashCSlash1 = mapper.getSuffix("/c/1");
    assertEquals(0, slashCSlash1.size());
  }

  @Test
  public void childIterators() {
    final UriMapper<String> mapper = UriMapper.<String>empty()
                                              .updated("/a/1", "1")
                                              .updated("/b/2", "2")
                                              .updated("/b/3", "3")
                                              .updated("/c/4", "4");

    final Iterator<UriPart> childIterator = mapper.getSuffix("/b/").childIterator();
    assertTrue(childIterator.hasNext());
    assertEquals(UriPath.segment("2"), childIterator.next());
    assertTrue(childIterator.hasNext());
    assertEquals(UriPath.segment("3"), childIterator.next());
    assertFalse(childIterator.hasNext());
  }

}
