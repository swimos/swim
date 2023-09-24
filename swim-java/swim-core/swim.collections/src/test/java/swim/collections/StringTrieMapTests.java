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

package swim.collections;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class StringTrieMapTests {

  @Test
  public void testEmpty() {
    final StringTrieMap<String> trie = StringTrieMap.empty();
    assertTrue(trie.isEmpty());
    assertEquals(0, trie.size());
    assertFalse(trie.isDefined());
    assertEquals("", trie.prefix());
    assertNull(trie.value());
  }

  @Test
  public void testRoot() {
    StringTrieMap<String> trie = StringTrieMap.empty();
    trie = trie.updated("", "blank");
    assertFalse(trie.isEmpty());
    assertEquals(1, trie.size());
    assertTrue(trie.isDefined());
    assertEquals("", trie.prefix());
    assertEquals("blank", trie.value());
    trie = trie.removed("");
    assertTrue(trie.isEmpty());
    assertEquals(0, trie.size());
    assertFalse(trie.isDefined());
    assertEquals("", trie.prefix());
    assertNull(trie.value());
  }

  @Test
  public void testDepth1() {
    StringTrieMap<String> trie = StringTrieMap.empty();
    trie = trie.updated("a", "letter a");
    assertFalse(trie.isEmpty());
    assertEquals(1, trie.size());
    assertEquals("letter a", trie.get("a"));
    assertNull(trie.get("z"));
    trie = trie.updated("z", "letter z");
    assertFalse(trie.isEmpty());
    assertEquals(2, trie.size());
    assertEquals("letter a", trie.get("a"));
    assertEquals("letter z", trie.get("z"));
  }

  @Test
  public void testRootDepth1() {
    StringTrieMap<String> trie = StringTrieMap.empty();
    trie = trie.updated("", "blank");
    trie = trie.updated("a", "letter a");
    trie = trie.updated("z", "letter z");
    assertFalse(trie.isEmpty());
    assertEquals(3, trie.size());
    assertEquals("blank", trie.get(""));
    assertEquals("letter a", trie.get("a"));
    assertEquals("letter z", trie.get("z"));
  }

  @Test
  public void testUnicode() {
    StringTrieMap<String> trie = StringTrieMap.empty();
    trie = trie.updated("\0", "U+00");
    trie = trie.updated("À", "U+C0");
    trie = trie.updated("Ö", "U+D6");
    trie = trie.updated("Ø", "U+D8");
    trie = trie.updated("ö", "U+F6");
    trie = trie.updated("ø", "U+F8");
    trie = trie.updated("˿", "U+2FF");
    trie = trie.updated("Ͱ", "U+370");
    trie = trie.updated("ͽ", "U+37D");
    trie = trie.updated("Ϳ", "U+37F");
    trie = trie.updated("῿", "U+1FFF");
    trie = trie.updated("⁰", "U+2070");
    trie = trie.updated("↏", "U+218F");
    trie = trie.updated("Ⰰ", "U+2C00");
    trie = trie.updated("⿯", "U+2FEF");
    trie = trie.updated("、", "U+3001");
    trie = trie.updated("퟿", "U+D7FF");
    trie = trie.updated("豈", "U+F900");
    trie = trie.updated("﷏", "U+FDCF");
    trie = trie.updated("ﷰ", "U+FDF0");
    trie = trie.updated("𐀀", "U+10000");
    trie = trie.updated("󯿿", "U+EFFFF");
    assertEquals(22, trie.size());
    assertEquals("U+00", trie.get("\0"));
    assertEquals("U+C0", trie.get("À"));
    assertEquals("U+D6", trie.get("Ö"));
    assertEquals("U+D8", trie.get("Ø"));
    assertEquals("U+F6", trie.get("ö"));
    assertEquals("U+F8", trie.get("ø"));
    assertEquals("U+2FF", trie.get("˿"));
    assertEquals("U+370", trie.get("Ͱ"));
    assertEquals("U+37D", trie.get("ͽ"));
    assertEquals("U+37F", trie.get("Ϳ"));
    assertEquals("U+1FFF", trie.get("῿"));
    assertEquals("U+2070", trie.get("⁰"));
    assertEquals("U+218F", trie.get("↏"));
    assertEquals("U+2C00", trie.get("Ⰰ"));
    assertEquals("U+2FEF", trie.get("⿯"));
    assertEquals("U+3001", trie.get("、"));
    assertEquals("U+D7FF", trie.get("퟿"));
    assertEquals("U+F900", trie.get("豈"));
    assertEquals("U+FDCF", trie.get("﷏"));
    assertEquals("U+FDF0", trie.get("ﷰ"));
    assertEquals("U+10000", trie.get("𐀀"));
    assertEquals("U+EFFFF", trie.get("󯿿"));
  }

  @Test
  public void testCaseSensitive() {
    StringTrieMap<String> trie = StringTrieMap.caseSensitive();
    trie = trie.updated("foo", "lowercase foo");
    assertEquals("lowercase foo", trie.get("foo"));
    trie = trie.updated("FOO", "uppercase FOO");
    assertEquals("uppercase FOO", trie.get("FOO"));
    trie = trie.updated("bar", "lowercase bar");
    assertEquals("lowercase bar", trie.get("bar"));
    trie = trie.updated("BAR", "uppercase BAR");
    assertEquals("uppercase BAR", trie.get("BAR"));
    trie = trie.updated("baz", "lowercase baz");
    assertEquals("lowercase baz", trie.get("baz"));
    trie = trie.updated("BAZ", "uppercase BAZ");
    assertEquals("uppercase BAZ", trie.get("BAZ"));
    assertEquals(6, trie.size());
    assertEquals("lowercase foo", trie.get("foo"));
    assertEquals("uppercase FOO", trie.get("FOO"));
    assertEquals("lowercase bar", trie.get("bar"));
    assertEquals("uppercase BAR", trie.get("BAR"));
    assertEquals("lowercase baz", trie.get("baz"));
    assertEquals("uppercase BAZ", trie.get("BAZ"));
  }

  @Test
  public void testCaseInsensitive() {
    StringTrieMap<String> trie = StringTrieMap.caseInsensitive();
    trie = trie.updated("foo", "lowercase foo");
    assertEquals("lowercase foo", trie.get("foo"));
    trie = trie.updated("FOO", "uppercase FOO");
    assertEquals("uppercase FOO", trie.get("FOO"));
    trie = trie.updated("bar", "lowercase bar");
    assertEquals("lowercase bar", trie.get("bar"));
    trie = trie.updated("BAR", "uppercase BAR");
    assertEquals("uppercase BAR", trie.get("BAR"));
    trie = trie.updated("baz", "lowercase baz");
    assertEquals("lowercase baz", trie.get("baz"));
    trie = trie.updated("BAZ", "uppercase BAZ");
    assertEquals("uppercase BAZ", trie.get("BAZ"));
    assertEquals(3, trie.size());
    assertEquals("uppercase FOO", trie.get("foo"));
    assertEquals("uppercase FOO", trie.get("FOO"));
    assertEquals("uppercase BAR", trie.get("bar"));
    assertEquals("uppercase BAR", trie.get("BAR"));
    assertEquals("uppercase BAZ", trie.get("baz"));
    assertEquals("uppercase BAZ", trie.get("BAZ"));
  }

}
