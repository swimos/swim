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

import java.util.Iterator;
import org.junit.jupiter.api.Test;
import swim.codec.ParseException;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class UriMapperTests {

  @Test
  public void mapUriPathMatches() throws ParseException {
    assertEquals("test",
                 UriMapper.mapping(Uri.parse("path").getNonNull(), "test")
                          .get(Uri.parse("path").getNonNull()));
    assertEquals("test",
                 UriMapper.mapping(Uri.parse("a/").getNonNull(), "test")
                          .get(Uri.parse("a/").getNonNull()));
    assertEquals("test",
                 UriMapper.mapping(Uri.parse("a/b").getNonNull(), "test")
                          .get(Uri.parse("a/b").getNonNull()));
    assertEquals("test",
                 UriMapper.mapping(Uri.parse("a/b/").getNonNull(), "test")
                          .get(Uri.parse("a/b/").getNonNull()));
    assertEquals("test",
                 UriMapper.mapping(Uri.parse("a/b/c").getNonNull(), "test")
                          .get(Uri.parse("a/b/c").getNonNull()));
  }

  @Test
  public void notMapUriPathMismatches() throws ParseException {
    assertNull(UriMapper.mapping(Uri.parse("foo").getNonNull(), "test")
                        .get(Uri.parse("path").getNonNull()));
    assertNull(UriMapper.mapping(Uri.parse("x/").getNonNull(), "test")
                        .get(Uri.parse("a/").getNonNull()));
    assertNull(UriMapper.mapping(Uri.parse("x/b").getNonNull(), "test")
                        .get(Uri.parse("a/b").getNonNull()));
    assertNull(UriMapper.mapping(Uri.parse("a/x").getNonNull(), "test")
                        .get(Uri.parse("a/b").getNonNull()));
    assertNull(UriMapper.mapping(Uri.parse("x/b/").getNonNull(), "test")
                        .get(Uri.parse("a/b/").getNonNull()));
    assertNull(UriMapper.mapping(Uri.parse("a/x/").getNonNull(), "test")
                        .get(Uri.parse("a/b/").getNonNull()));
    assertNull(UriMapper.mapping(Uri.parse("x/b/c").getNonNull(), "test")
                        .get(Uri.parse("a/b/c").getNonNull()));
    assertNull(UriMapper.mapping(Uri.parse("a/x/c").getNonNull(), "test")
                        .get(Uri.parse("a/b/c").getNonNull()));
    assertNull(UriMapper.mapping(Uri.parse("a/b/x").getNonNull(), "test")
                        .get(Uri.parse("a/b/c").getNonNull()));
  }

  @Test
  public void notMapUriPathPrefixes() throws ParseException {
    assertNull(UriMapper.mapping(Uri.parse("a/b/c/").getNonNull(), "test")
                        .get(Uri.parse("a").getNonNull()));
    assertNull(UriMapper.mapping(Uri.parse("a/b/c/").getNonNull(), "test")
                        .get(Uri.parse("a/").getNonNull()));
    assertNull(UriMapper.mapping(Uri.parse("a/b/c/").getNonNull(), "test")
                        .get(Uri.parse("a/b").getNonNull()));
    assertNull(UriMapper.mapping(Uri.parse("a/b/c/").getNonNull(), "test")
                        .get(Uri.parse("a/b/").getNonNull()));
    assertNull(UriMapper.mapping(Uri.parse("a/b/c/").getNonNull(), "test")
                        .get(Uri.parse("a/b/c").getNonNull()));
  }

  @Test
  public void mapUriPathVariableMatches() throws ParseException {
    assertEquals("test",
                 UriMapper.mapping(Uri.parse("/:path").getNonNull(), "test")
                          .get(Uri.parse("/foo").getNonNull()));
    assertEquals("test",
                 UriMapper.mapping(Uri.parse("/:path").getNonNull(), "test")
                          .get(Uri.parse("/bar").getNonNull()));
    assertEquals("test",
                 UriMapper.mapping(Uri.parse("/:path/").getNonNull(), "test")
                          .get(Uri.parse("/a/").getNonNull()));
    assertEquals("test",
                 UriMapper.mapping(Uri.parse("/:path/").getNonNull(), "test")
                          .get(Uri.parse("/b/").getNonNull()));
    assertEquals("test",
                 UriMapper.mapping(Uri.parse("/:name/b").getNonNull(), "test")
                          .get(Uri.parse("/a/b").getNonNull()));
    assertEquals("test",
                 UriMapper.mapping(Uri.parse("/:name/b").getNonNull(), "test")
                          .get(Uri.parse("/x/b").getNonNull()));
    assertEquals("test",
                 UriMapper.mapping(Uri.parse("/a/:name").getNonNull(), "test")
                          .get(Uri.parse("/a/b").getNonNull()));
    assertEquals("test",
                 UriMapper.mapping(Uri.parse("/a/:name").getNonNull(), "test")
                          .get(Uri.parse("/a/y").getNonNull()));
    assertEquals("test",
                 UriMapper.mapping(Uri.parse("/:name/b/").getNonNull(), "test")
                          .get(Uri.parse("/a/b/").getNonNull()));
    assertEquals("test",
                 UriMapper.mapping(Uri.parse("/:name/b/").getNonNull(), "test")
                          .get(Uri.parse("/x/b/").getNonNull()));
    assertEquals("test",
                 UriMapper.mapping(Uri.parse("/a/:name/").getNonNull(), "test")
                          .get(Uri.parse("/a/b/").getNonNull()));
    assertEquals("test",
                 UriMapper.mapping(Uri.parse("/a/:name/").getNonNull(), "test")
                          .get(Uri.parse("/a/y/").getNonNull()));
    assertEquals("test",
                 UriMapper.mapping(Uri.parse("/:name/b/c").getNonNull(), "test")
                          .get(Uri.parse("/a/b/c").getNonNull()));
    assertEquals("test",
                 UriMapper.mapping(Uri.parse("/:name/b/c").getNonNull(), "test")
                          .get(Uri.parse("/x/b/c").getNonNull()));
    assertEquals("test",
                 UriMapper.mapping(Uri.parse("/a/:name/c").getNonNull(), "test")
                          .get(Uri.parse("/a/b/c").getNonNull()));
    assertEquals("test",
                 UriMapper.mapping(Uri.parse("/a/:name/c").getNonNull(), "test")
                          .get(Uri.parse("/a/y/c").getNonNull()));
    assertEquals("test",
                 UriMapper.mapping(Uri.parse("/a/b/:name").getNonNull(), "test")
                          .get(Uri.parse("/a/b/c").getNonNull()));
    assertEquals("test",
                 UriMapper.mapping(Uri.parse("/a/b/:name").getNonNull(), "test")
                          .get(Uri.parse("/a/b/x").getNonNull()));
  }

  @Test
  public void notMapUriPathVariableMismatches() throws ParseException {
    assertNull(UriMapper.mapping(Uri.parse("/:name/b").getNonNull(), "test")
                        .get(Uri.parse("/a/x").getNonNull()));
    assertNull(UriMapper.mapping(Uri.parse("/a/:name").getNonNull(), "test")
                        .get(Uri.parse("/x/b").getNonNull()));
    assertNull(UriMapper.mapping(Uri.parse("/:name/b/").getNonNull(), "test")
                        .get(Uri.parse("/a/x/").getNonNull()));
    assertNull(UriMapper.mapping(Uri.parse("/a/:name/").getNonNull(), "test")
                        .get(Uri.parse("/x/b/").getNonNull()));
  }

  @Test
  public void mapMultipleUriPaths() throws ParseException {
    UriMapper<String> mapper = UriMapper.empty();

    mapper = mapper.updated(Uri.parse("/a/b").getNonNull(), "B");
    assertEquals("B", mapper.get(Uri.parse("/a/b").getNonNull()));
    assertNull(mapper.get(Uri.parse("/a/c").getNonNull()));
    assertNull(mapper.get(Uri.parse("/x/y").getNonNull()));

    mapper = mapper.updated(Uri.parse("/x/y").getNonNull(), "Y");
    assertEquals("B", mapper.get(Uri.parse("/a/b").getNonNull()));
    assertNull(mapper.get(Uri.parse("/a/c").getNonNull()));
    assertEquals("Y", mapper.get(Uri.parse("/x/y").getNonNull()));

    mapper = mapper.updated(Uri.parse("/a/c").getNonNull(), "C");
    assertEquals("B", mapper.get(Uri.parse("/a/b").getNonNull()));
    assertEquals("C", mapper.get(Uri.parse("/a/c").getNonNull()));
    assertEquals("Y", mapper.get(Uri.parse("/x/y").getNonNull()));
  }

  @Test
  public void mapMultipleUriVariablePaths() throws ParseException {
    UriMapper<String> mapper = UriMapper.empty();

    mapper = mapper.updated(Uri.parse("/:a").getNonNull(), "A");
    assertEquals("A", mapper.get(Uri.parse("/a").getNonNull()));
    assertEquals("A", mapper.get(Uri.parse("/x").getNonNull()));
    assertNull(mapper.get(Uri.parse("/x/").getNonNull()));

    mapper = mapper.updated(Uri.parse("/:a/b").getNonNull(), "B");
    assertEquals("A", mapper.get(Uri.parse("/a").getNonNull()));
    assertEquals("A", mapper.get(Uri.parse("/x").getNonNull()));
    assertNull(mapper.get(Uri.parse("/x/").getNonNull()));
    assertEquals("B", mapper.get(Uri.parse("/a/b").getNonNull()));
    assertEquals("B", mapper.get(Uri.parse("/x/b").getNonNull()));

    mapper = mapper.updated(Uri.parse("/:a/c").getNonNull(), "C");
    assertEquals("A", mapper.get(Uri.parse("/a").getNonNull()));
    assertEquals("A", mapper.get(Uri.parse("/x").getNonNull()));
    assertNull(mapper.get(Uri.parse("/x/").getNonNull()));
    assertEquals("B", mapper.get(Uri.parse("/a/b").getNonNull()));
    assertEquals("B", mapper.get(Uri.parse("/x/b").getNonNull()));
    assertEquals("C", mapper.get(Uri.parse("/a/c").getNonNull()));
    assertEquals("C", mapper.get(Uri.parse("/x/c").getNonNull()));

    mapper = mapper.updated(Uri.parse("/:a/:b").getNonNull(), "Y");
    assertEquals("A", mapper.get(Uri.parse("/a").getNonNull()));
    assertEquals("A", mapper.get(Uri.parse("/x").getNonNull()));
    assertNull(mapper.get(Uri.parse("/x/").getNonNull()));
    assertEquals("B", mapper.get(Uri.parse("/a/b").getNonNull()));
    assertEquals("B", mapper.get(Uri.parse("/x/b").getNonNull()));
    assertEquals("C", mapper.get(Uri.parse("/a/c").getNonNull()));
    assertEquals("C", mapper.get(Uri.parse("/x/c").getNonNull()));
    assertEquals("Y", mapper.get(Uri.parse("/x/y").getNonNull()));
  }

  @Test
  public void removeUriMappings() throws ParseException {
    UriMapper<String> mapper = UriMapper.<String>empty();
    mapper = mapper.updated(Uri.parse("/a/b").getNonNull(), "B");
    mapper = mapper.updated(Uri.parse("/x/y").getNonNull(), "Y");
    mapper = mapper.updated(Uri.parse("/a/c").getNonNull(), "C");
    assertEquals("B", mapper.get(Uri.parse("/a/b").getNonNull()));
    assertEquals("C", mapper.get(Uri.parse("/a/c").getNonNull()));
    assertEquals("Y", mapper.get(Uri.parse("/x/y").getNonNull()));

    mapper = mapper.removed(Uri.parse("/a/c").getNonNull());
    assertEquals("B", mapper.get(Uri.parse("/a/b").getNonNull()));
    assertNull(mapper.get(Uri.parse("/a/c").getNonNull()));
    assertEquals("Y", mapper.get(Uri.parse("/x/y").getNonNull()));

    mapper = mapper.removed(Uri.parse("/x/y").getNonNull());
    assertEquals("B", mapper.get(Uri.parse("/a/b").getNonNull()));
    assertNull(mapper.get(Uri.parse("/a/c").getNonNull()));
    assertNull(mapper.get(Uri.parse("/x/y").getNonNull()));

    mapper = mapper.removed(Uri.parse("/a/b").getNonNull());
    assertNull(mapper.get(Uri.parse("/a/b").getNonNull()));
    assertNull(mapper.get(Uri.parse("/a/c").getNonNull()));
    assertNull(mapper.get(Uri.parse("/x/y").getNonNull()));

    assertTrue(mapper.isEmpty());
  }

  @Test
  public void removeUriVariableMappings() throws ParseException {
    UriMapper<String> mapper = UriMapper.<String>empty();
    mapper = mapper.updated(Uri.parse("/:a/b").getNonNull(), "B");
    mapper = mapper.updated(Uri.parse("/:a").getNonNull(), "A");
    mapper = mapper.updated(Uri.parse("/:a/c").getNonNull(), "C");
    mapper = mapper.updated(Uri.parse("/:a/:b").getNonNull(), "Y");
    assertEquals("A", mapper.get(Uri.parse("/x").getNonNull()));
    assertNull(mapper.get(Uri.parse("/x/").getNonNull()));
    assertEquals("B", mapper.get(Uri.parse("/x/b").getNonNull()));
    assertEquals("C", mapper.get(Uri.parse("/x/c").getNonNull()));
    assertEquals("Y", mapper.get(Uri.parse("/x/y").getNonNull()));

    mapper = mapper.removed(Uri.parse("/:a/:b").getNonNull());
    assertEquals("A", mapper.get(Uri.parse("/x").getNonNull()));
    assertNull(mapper.get(Uri.parse("/x/").getNonNull()));
    assertEquals("B", mapper.get(Uri.parse("/x/b").getNonNull()));
    assertEquals("C", mapper.get(Uri.parse("/x/c").getNonNull()));
    assertNull(mapper.get(Uri.parse("/x/y").getNonNull()));

    mapper = mapper.removed(Uri.parse("/:a/c").getNonNull());
    assertEquals("A", mapper.get(Uri.parse("/x").getNonNull()));
    assertNull(mapper.get(Uri.parse("/x/").getNonNull()));
    assertEquals("B", mapper.get(Uri.parse("/x/b").getNonNull()));
    assertNull(mapper.get(Uri.parse("/x/c").getNonNull()));
    assertNull(mapper.get(Uri.parse("/x/y").getNonNull()));

    mapper = mapper.removed(Uri.parse("/:a").getNonNull());
    assertNull(mapper.get(Uri.parse("/x").getNonNull()));
    assertNull(mapper.get(Uri.parse("/x/").getNonNull()));
    assertEquals("B", mapper.get(Uri.parse("/x/b").getNonNull()));
    assertNull(mapper.get(Uri.parse("/x/c").getNonNull()));
    assertNull(mapper.get(Uri.parse("/x/y").getNonNull()));

    mapper = mapper.removed(Uri.parse("/:a/b").getNonNull());
    assertNull(mapper.get(Uri.parse("/x").getNonNull()));
    assertNull(mapper.get(Uri.parse("/x/").getNonNull()));
    assertNull(mapper.get(Uri.parse("/x/b").getNonNull()));
    assertNull(mapper.get(Uri.parse("/x/c").getNonNull()));
    assertNull(mapper.get(Uri.parse("/x/y").getNonNull()));

    assertTrue(mapper.isEmpty());
  }

  @Test
  public void unmergeUriMappings() throws ParseException {
    UriMapper<String> mapper = UriMapper.<String>empty();
    mapper = mapper.updated(Uri.parse("/a/b").getNonNull(), "B");
    mapper = mapper.updated(Uri.parse("/x/y").getNonNull(), "Y");
    mapper = mapper.updated(Uri.parse("/a/c").getNonNull(), "C");
    assertEquals("B", mapper.get(Uri.parse("/a/b").getNonNull()));
    assertEquals("C", mapper.get(Uri.parse("/a/c").getNonNull()));
    assertEquals("Y", mapper.get(Uri.parse("/x/y").getNonNull()));

    UriMapper<String> submapper = UriMapper.<String>empty();
    submapper = submapper.updated(Uri.parse("/a/b").getNonNull(), "B");
    submapper = submapper.updated(Uri.parse("/x/y").getNonNull(), "Y");

    mapper = mapper.unmerged(submapper);
    assertNull(mapper.get(Uri.parse("/a/b").getNonNull()));
    assertEquals("C", mapper.get(Uri.parse("/a/c").getNonNull()));
    assertNull(mapper.get(Uri.parse("/x/y").getNonNull()));
  }

  @Test
  public void suffixMappings() throws ParseException {
    UriMapper<String> mapper = UriMapper.<String>empty();
    mapper = mapper.updated(Uri.parse("/a/1").getNonNull(), "1");
    mapper = mapper.updated(Uri.parse("/b/2").getNonNull(), "2");
    mapper = mapper.updated(Uri.parse("/b/3").getNonNull(), "3");
    mapper = mapper.updated(Uri.parse("/c/4").getNonNull(), "4");

    final UriMapper<String> slash = mapper.getSuffix(Uri.parse("/").getNonNull());
    assertEquals(4, slash.size());
    assertEquals("1", slash.get(Uri.parse("a/1").getNonNull()));
    assertEquals("2", slash.get(Uri.parse("b/2").getNonNull()));
    assertEquals("3", slash.get(Uri.parse("b/3").getNonNull()));
    assertEquals("4", slash.get(Uri.parse("c/4").getNonNull()));

    final UriMapper<String> slashA = mapper.getSuffix(Uri.parse("/a").getNonNull());
    assertEquals(1, slashA.size());
    assertEquals("1", slashA.get(Uri.parse("/1").getNonNull()));

    final UriMapper<String> slashASlash1 = mapper.getSuffix(Uri.parse("/a/1").getNonNull());
    assertEquals(1, slashASlash1.size());
    assertEquals("1", slashASlash1.get(Uri.empty()));

    final UriMapper<String> slashB = mapper.getSuffix(Uri.parse("/b").getNonNull());
    assertEquals(2, slashB.size());
    assertEquals("2", slashB.get(Uri.parse("/2").getNonNull()));
    assertEquals("3", slashB.get(Uri.parse("/3").getNonNull()));

    final UriMapper<String> slashC = mapper.getSuffix(Uri.parse("/c").getNonNull());
    assertEquals(1, slashC.size());
    assertEquals("4", slashC.get(Uri.parse("/4").getNonNull()));

    final UriMapper<String> slashCSlash1 = mapper.getSuffix(Uri.parse("/c/1").getNonNull());
    assertEquals(0, slashCSlash1.size());
  }

  @Test
  public void childIterators() throws ParseException {
    UriMapper<String> mapper = UriMapper.<String>empty();
    mapper = mapper.updated(Uri.parse("/a/1").getNonNull(), "1");
    mapper = mapper.updated(Uri.parse("/b/2").getNonNull(), "2");
    mapper = mapper.updated(Uri.parse("/b/3").getNonNull(), "3");
    mapper = mapper.updated(Uri.parse("/c/4").getNonNull(), "4");

    final UriMapper<String> childMapper = mapper.getSuffix(Uri.parse("/b/").getNonNull());
    final Iterator<UriPart> childIterator = childMapper.childIterator();
    assertTrue(childIterator.hasNext());
    assertEquals(UriPath.segment("2"), childIterator.next());
    assertTrue(childIterator.hasNext());
    assertEquals(UriPath.segment("3"), childIterator.next());
    assertFalse(childIterator.hasNext());
  }

}
