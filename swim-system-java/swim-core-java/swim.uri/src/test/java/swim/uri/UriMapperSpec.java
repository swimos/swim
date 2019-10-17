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

import java.util.Iterator;
import org.testng.annotations.Test;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertNull;
import static org.testng.Assert.assertTrue;

public class UriMapperSpec {
  @Test
  public void mapUriPathMatches() {
    assertEquals(UriMapper.from("path", "test").get("path"), "test");
    assertEquals(UriMapper.from("a/", "test").get("a/"), "test");
    assertEquals(UriMapper.from("a/b", "test").get("a/b"), "test");
    assertEquals(UriMapper.from("a/b/", "test").get("a/b/"), "test");
    assertEquals(UriMapper.from("a/b/c", "test").get("a/b/c"), "test");
  }

  @Test
  public void notMapUriPathMismatches() {
    assertNull(UriMapper.from("foo", "test").get("path"));
    assertNull(UriMapper.from("x/", "test").get("a/"));
    assertNull(UriMapper.from("x/b", "test").get("a/b"));
    assertNull(UriMapper.from("a/x", "test").get("a/b"));
    assertNull(UriMapper.from("x/b/", "test").get("a/b/"));
    assertNull(UriMapper.from("a/x/", "test").get("a/b/"));
    assertNull(UriMapper.from("x/b/c", "test").get("a/b/c"));
    assertNull(UriMapper.from("a/x/c", "test").get("a/b/c"));
    assertNull(UriMapper.from("a/b/x", "test").get("a/b/c"));
  }

  @Test
  public void notMapUriPathPrefixes() {
    assertNull(UriMapper.from("a/b/c/", "test").get("a"));
    assertNull(UriMapper.from("a/b/c/", "test").get("a/"));
    assertNull(UriMapper.from("a/b/c/", "test").get("a/b"));
    assertNull(UriMapper.from("a/b/c/", "test").get("a/b/"));
    assertNull(UriMapper.from("a/b/c/", "test").get("a/b/c"));
  }

  @Test
  public void mapUriPathVariableMatches() {
    assertEquals(UriMapper.from("/:path", "test").get("/foo"), "test");
    assertEquals(UriMapper.from("/:path", "test").get("/bar"), "test");
    assertEquals(UriMapper.from("/:path/", "test").get("/a/"), "test");
    assertEquals(UriMapper.from("/:path/", "test").get("/b/"), "test");
    assertEquals(UriMapper.from("/:name/b", "test").get("/a/b"), "test");
    assertEquals(UriMapper.from("/:name/b", "test").get("/x/b"), "test");
    assertEquals(UriMapper.from("/a/:name", "test").get("/a/b"), "test");
    assertEquals(UriMapper.from("/a/:name", "test").get("/a/y"), "test");
    assertEquals(UriMapper.from("/:name/b/", "test").get("/a/b/"), "test");
    assertEquals(UriMapper.from("/:name/b/", "test").get("/x/b/"), "test");
    assertEquals(UriMapper.from("/a/:name/", "test").get("/a/b/"), "test");
    assertEquals(UriMapper.from("/a/:name/", "test").get("/a/y/"), "test");
    assertEquals(UriMapper.from("/:name/b/c", "test").get("/a/b/c"), "test");
    assertEquals(UriMapper.from("/:name/b/c", "test").get("/x/b/c"), "test");
    assertEquals(UriMapper.from("/a/:name/c", "test").get("/a/b/c"), "test");
    assertEquals(UriMapper.from("/a/:name/c", "test").get("/a/y/c"), "test");
    assertEquals(UriMapper.from("/a/b/:name", "test").get("/a/b/c"), "test");
    assertEquals(UriMapper.from("/a/b/:name", "test").get("/a/b/x"), "test");
  }

  @Test
  public void notMapUriPathVariableMismatches() {
    assertNull(UriMapper.from("/:name/b", "test").get("/a/x"));
    assertNull(UriMapper.from("/a/:name", "test").get("/x/b"));
    assertNull(UriMapper.from("/:name/b/", "test").get("/a/x/"));
    assertNull(UriMapper.from("/a/:name/", "test").get("/x/b/"));
  }

  @Test
  public void mapMultipleUriPaths() {
    UriMapper<String> mapper = UriMapper.empty();

    mapper = mapper.updated("/a/b", "B");
    assertEquals(mapper.get("/a/b"), "B");
    assertNull(mapper.get("/a/c"));
    assertNull(mapper.get("/x/y"));

    mapper = mapper.updated("/x/y", "Y");
    assertEquals(mapper.get("/a/b"), "B");
    assertNull(mapper.get("/a/c"));
    assertEquals(mapper.get("/x/y"), "Y");

    mapper = mapper.updated("/a/c", "C");
    assertEquals(mapper.get("/a/b"), "B");
    assertEquals(mapper.get("/a/c"), "C");
    assertEquals(mapper.get("/x/y"), "Y");
  }

  @Test
  public void mapMultipleUriVariablePaths() {
    UriMapper<String> mapper = UriMapper.empty();

    mapper = mapper.updated("/:a", "A");
    assertEquals(mapper.get("/a"), "A");
    assertEquals(mapper.get("/x"), "A");
    assertNull(mapper.get("/x/"));

    mapper = mapper.updated("/:a/b", "B");
    assertEquals(mapper.get("/a"), "A");
    assertEquals(mapper.get("/x"), "A");
    assertNull(mapper.get("/x/"));
    assertEquals(mapper.get("/a/b"), "B");
    assertEquals(mapper.get("/x/b"), "B");

    mapper = mapper.updated("/:a/c", "C");
    assertEquals(mapper.get("/a"), "A");
    assertEquals(mapper.get("/x"), "A");
    assertNull(mapper.get("/x/"));
    assertEquals(mapper.get("/a/b"), "B");
    assertEquals(mapper.get("/x/b"), "B");
    assertEquals(mapper.get("/a/c"), "C");
    assertEquals(mapper.get("/x/c"), "C");

    mapper = mapper.updated("/:a/:b", "Y");
    assertEquals(mapper.get("/a"), "A");
    assertEquals(mapper.get("/x"), "A");
    assertNull(mapper.get("/x/"));
    assertEquals(mapper.get("/a/b"), "B");
    assertEquals(mapper.get("/x/b"), "B");
    assertEquals(mapper.get("/a/c"), "C");
    assertEquals(mapper.get("/x/c"), "C");
    assertEquals(mapper.get("/x/y"), "Y");
  }

  @Test
  public void removeUriMappings() {
    UriMapper<String> mapper = UriMapper.<String>empty()
        .updated("/a/b", "B")
        .updated("/x/y", "Y")
        .updated("/a/c", "C");
    assertEquals(mapper.get("/a/b"), "B");
    assertEquals(mapper.get("/a/c"), "C");
    assertEquals(mapper.get("/x/y"), "Y");

    mapper = mapper.removed("/a/c");
    assertEquals(mapper.get("/a/b"), "B");
    assertNull(mapper.get("/a/c"));
    assertEquals(mapper.get("/x/y"), "Y");

    mapper = mapper.removed("/x/y");
    assertEquals(mapper.get("/a/b"), "B");
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
    assertEquals(mapper.get("/x"), "A");
    assertNull(mapper.get("/x/"));
    assertEquals(mapper.get("/x/b"), "B");
    assertEquals(mapper.get("/x/c"), "C");
    assertEquals(mapper.get("/x/y"), "Y");

    mapper = mapper.removed("/:a/:b");
    assertEquals(mapper.get("/x"), "A");
    assertNull(mapper.get("/x/"));
    assertEquals(mapper.get("/x/b"), "B");
    assertEquals(mapper.get("/x/c"), "C");
    assertNull(mapper.get("/x/y"));

    mapper = mapper.removed("/:a/c");
    assertEquals(mapper.get("/x"), "A");
    assertNull(mapper.get("/x/"));
    assertEquals(mapper.get("/x/b"), "B");
    assertNull(mapper.get("/x/c"));
    assertNull(mapper.get("/x/y"));

    mapper = mapper.removed("/:a");
    assertNull(mapper.get("/x"));
    assertNull(mapper.get("/x/"));
    assertEquals(mapper.get("/x/b"), "B");
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
    assertEquals(mapper.get("/a/b"), "B");
    assertEquals(mapper.get("/a/c"), "C");
    assertEquals(mapper.get("/x/y"), "Y");

    final UriMapper<String> submapper = UriMapper.<String>empty()
        .updated("/a/b", "B")
        .updated("/x/y", "Y");

    mapper = mapper.unmerged(submapper);
    assertNull(mapper.get("/a/b"));
    assertEquals(mapper.get("/a/c"), "C");
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
    assertEquals(slash.size(), 4);
    assertEquals(slash.get("a/1"), "1");
    assertEquals(slash.get("b/2"), "2");
    assertEquals(slash.get("b/3"), "3");
    assertEquals(slash.get("c/4"), "4");

    final UriMapper<String> slashA = mapper.getSuffix("/a");
    assertEquals(slashA.size(), 1);
    assertEquals(slashA.get("/1"), "1");

    final UriMapper<String> slashASlash1 = mapper.getSuffix("/a/1");
    assertEquals(slashASlash1.size(), 1);
    assertEquals(slashASlash1.get(Uri.empty()), "1");

    final UriMapper<String> slashB = mapper.getSuffix("/b");
    assertEquals(slashB.size(), 2);
    assertEquals(slashB.get("/2"), "2");
    assertEquals(slashB.get("/3"), "3");

    final UriMapper<String> slashC = mapper.getSuffix("/c");
    assertEquals(slashC.size(), 1);
    assertEquals(slashC.get("/4"), "4");

    final UriMapper<String> slashCSlash1 = mapper.getSuffix("/c/1");
    assertEquals(slashCSlash1.size(), 0);
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
    assertEquals(childIterator.next(), UriPath.segment("2"));
    assertTrue(childIterator.hasNext());
    assertEquals(childIterator.next(), UriPath.segment("3"));
    assertFalse(childIterator.hasNext());
  }
}
