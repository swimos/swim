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

package swim.collections;

import java.util.AbstractCollection;
import java.util.AbstractMap.SimpleImmutableEntry;
import java.util.AbstractSet;
import java.util.Collection;
import java.util.Iterator;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Set;
import java.util.function.BiConsumer;
import java.util.function.Consumer;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToMarkup;
import swim.util.UpdatableMap;

@Public
@Since("5.0")
public final class StringTrieMap<V> implements Iterable<Map.Entry<String, V>>, UpdatableMap<String, V>, ToMarkup {

  final long branchMap0;
  final long branchMap1;
  final long branchMap2;
  final long branchMap3;
  final int size;
  final int flags;
  final StringTrieMap<V>[] branches;
  final String prefix;
  final @Nullable V value;

  StringTrieMap(long branchMap0, long branchMap1, long branchMap2, long branchMap3,
                int size, int flags, StringTrieMap<V>[] branches,
                String prefix, @Nullable V value) {
    this.branchMap0 = branchMap0;
    this.branchMap1 = branchMap1;
    this.branchMap2 = branchMap2;
    this.branchMap3 = branchMap3;
    this.size = size;
    this.flags = flags;
    this.branches = branches;
    this.prefix = prefix;
    this.value = value;
  }

  public boolean isDefined() {
    return (this.flags & DEFINED_FLAG) != 0;
  }

  public String prefix() {
    return this.prefix;
  }

  public @Nullable V value() {
    return this.value;
  }

  public int normalized(int c) {
    if ((this.flags & CASE_INSENSITIVE_FLAG) != 0) {
      c = Character.toLowerCase(c);
    }
    return c;
  }

  @Override
  public boolean isEmpty() {
    return this.size == 0;
  }

  @Override
  public int size() {
    return this.size;
  }

  @Override
  public boolean containsKey(@Nullable Object key) {
    if (key instanceof String) {
      final StringTrieMap<V> suffix = this.getSuffix((String) key);
      return suffix != null && suffix.isDefined();
    }
    return false;
  }

  @Override
  public boolean containsValue(@Nullable Object value) {
    if (this.isDefined() && Objects.equals(value, this.value)) {
      return true;
    }
    for (int i = 0; i < this.branches.length; i += 1) {
      if (this.branches[i].containsValue(value)) {
        return true;
      }
    }
    return false;
  }

  @Override
  public @Nullable V get(@Nullable Object key) {
    if (key instanceof String) {
      final StringTrieMap<V> suffix = this.getSuffix((String) key);
      if (suffix != null && suffix.isDefined()) {
        return suffix.value;
      }
    }
    return null;
  }

  @Override
  public V put(@Nullable String key, @Nullable V value) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void putAll(Map<? extends String, ? extends V> map) {
    throw new UnsupportedOperationException();
  }

  @Override
  public V remove(@Nullable Object key) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void clear() {
    throw new UnsupportedOperationException();
  }

  @Override
  public StringTrieMap<V> updated(@Nullable String prefix, @Nullable V value) {
    Objects.requireNonNull(prefix, "prefix");
    return this.updated(prefix, 0, value);
  }

  private StringTrieMap<V> updated(String prefix, int index, @Nullable V value) {
    if (index < prefix.length()) {
      final int c = this.normalized(prefix.codePointAt(index));
      StringTrieMap<V> oldBranch = this.getBranch(c);
      if (oldBranch == null) {
        oldBranch = StringTrieMap.emptyBranch(this.flags & INHERITED_MASK,
                                              prefix.substring(0, index + 1));
      }
      final StringTrieMap<V> newBranch = oldBranch.updated(prefix, prefix.offsetByCodePoints(index, 1), value);
      return this.updatedBranch(c, newBranch);
    } else if (!prefix.equals(this.prefix) || !Objects.equals(value, this.value)) {
      final int newSize = this.isDefined() ? this.size : this.size + 1;
      return new StringTrieMap<V>(this.branchMap0, this.branchMap1,
                                  this.branchMap2, this.branchMap3,
                                  newSize, this.flags | DEFINED_FLAG,
                                  this.branches, prefix, value);
    }
    return this;
  }

  @Override
  public StringTrieMap<V> removed(@Nullable Object prefix) {
    if (prefix instanceof String) {
      return this.removed((String) prefix, 0);
    }
    return this;
  }

  private StringTrieMap<V> removed(String prefix, int index) {
    if (index < prefix.length()) {
      final int c = this.normalized(prefix.codePointAt(index));
      final StringTrieMap<V> oldBranch = this.getBranch(c);
      if (oldBranch != null) {
        final StringTrieMap<V> newBranch = oldBranch.removed(prefix, prefix.offsetByCodePoints(index, 1));
        if (newBranch.isEmpty()) {
          return this.removedBranch(c);
        } else {
          return this.updatedBranch(c, newBranch);
        }
      }
    } else if (this.isDefined()) {
      final int newSize = this.size - 1;
      return new StringTrieMap<V>(this.branchMap0, this.branchMap1,
                                  this.branchMap2, this.branchMap3,
                                  newSize, this.flags & ~DEFINED_FLAG,
                                  this.branches, this.prefix, null);
    }
    return this;
  }

  public @Nullable StringTrieMap<V> getSuffix(String prefix) {
    StringTrieMap<V> node = this;
    for (int i = 0, n = prefix.length(); i < n; i = prefix.offsetByCodePoints(i, 1)) {
      node = node.getBranch(this.normalized(prefix.codePointAt(i)));
      if (node == null) {
        break;
      }
    }
    return node;
  }

  int getBranchIndex(byte b) {
    final int x = b & 0xFF;
    if (x < 64) {
      if ((this.branchMap0 & (1L << x)) != 0L) {
        return Long.bitCount(this.branchMap0 & ((1L << x) - 1L));
      }
    } else if (x < 128) {
      if ((this.branchMap1 & (1L << (x - 64))) != 0L) {
        return Long.bitCount(this.branchMap0)
             + Long.bitCount(this.branchMap1 & ((1L << (x - 64)) - 1L));
      }
    } else if (x < 192) {
      if ((this.branchMap2 & (1L << (x - 128))) != 0L) {
        return Long.bitCount(this.branchMap0)
             + Long.bitCount(this.branchMap1)
             + Long.bitCount(this.branchMap2 & ((1L << (x - 128)) - 1L));
      }
    } else {
      if ((this.branchMap3 & (1L << (x - 192))) != 0L) {
        return Long.bitCount(this.branchMap0)
             + Long.bitCount(this.branchMap1)
             + Long.bitCount(this.branchMap2)
             + Long.bitCount(this.branchMap3 & ((1L << (x - 192)) - 1L));
      }
    }
    return -1;
  }

  public @Nullable StringTrieMap<V> getBranch(byte b) {
    final int index = this.getBranchIndex(b);
    return index < 0 ? null : this.branches[index];
  }

  public @Nullable StringTrieMap<V> getBranch(int c) {
    StringTrieMap<V> branch;
    if (c >= 0 && c <= 0x7F) { // U+0000..U+007F
      branch = this.getBranch((byte) c);
    } else if (c >= 0x80 && c <= 0x7FF) { // U+0080..U+07FF
      branch = this.getBranch((byte) (0xC0 | (c >>> 6)));
      if (branch != null) {
        branch = branch.getBranch((byte) (0x80 | (c & 0x3F)));
      }
    } else if ((c >= 0x0800 && c <= 0xFFFF) // U+0800..U+D7FF
            || (c >= 0xE000 && c <= 0xFFFF)) { // U+E000..U+FFFF
      branch = this.getBranch((byte) (0xE0 | (c >>> 12)));
      if (branch != null) {
        branch = branch.getBranch((byte) (0x80 | ((c >>> 6) & 0x3F)));
        if (branch != null) {
          branch = branch.getBranch((byte) (0x80 | (c & 0x3F)));
        }
      }
    } else if (c >= 0x10000 && c <= 0x10FFFF) { // U+10000..U+10FFFF
      branch = this.getBranch((byte) (0xF0 | (c >>> 18)));
      if (branch != null) {
        branch = branch.getBranch((byte) (0x80 | ((c >>> 12) & 0x3F)));
        if (branch != null) {
          branch = branch.getBranch((byte) (0x80 | ((c >>> 6) & 0x3F)));
          if (branch != null) {
            branch = branch.getBranch((byte) (0x80 | (c & 0x3F)));
          }
        }
      }
    } else { // surrogate or invalid code point
      branch = null;
    }
    return branch;
  }

  @SuppressWarnings("ReferenceEquality")
  public StringTrieMap<V> updatedBranch(byte b, StringTrieMap<V> newBranch) {
    final int oldBranchIndex = this.getBranchIndex(b);
    if (oldBranchIndex < 0) { // insert
      long branchMap0 = this.branchMap0;
      long branchMap1 = this.branchMap1;
      long branchMap2 = this.branchMap2;
      long branchMap3 = this.branchMap3;
      long oldBranchMap0 = branchMap0;
      long oldBranchMap1 = branchMap1;
      long oldBranchMap2 = branchMap2;
      long oldBranchMap3 = branchMap3;
      final int x = b & 0xFF;
      if (x < 64) {
        branchMap0 |= 1L << x;
      } else if (x < 128) {
        branchMap1 |= 1L << (x - 64);
      } else if (x < 192) {
        branchMap2 |= 1L << (x - 128);
      } else {
        branchMap3 |= 1L << (x - 192);
      }
      long newBranchMap0 = branchMap0;
      long newBranchMap1 = branchMap1;
      long newBranchMap2 = branchMap2;
      long newBranchMap3 = branchMap3;
      final StringTrieMap<V>[] oldBranches = this.branches;
      final StringTrieMap<V>[] newBranches =
          Assume.conforms(new StringTrieMap<?>[Long.bitCount(branchMap0)
                                             + Long.bitCount(branchMap1)
                                             + Long.bitCount(branchMap2)
                                             + Long.bitCount(branchMap3)]);
      int i = 0;
      int j = 0;
      int bit = 0;
      int newSize = this.isDefined() ? 1 : 0;
      while (newBranchMap0 != 0) {
        if (bit == x) {
          assert (oldBranchMap0 & 1) == 0;
          assert (newBranchMap0 & 1) != 0;
          newBranches[j] = newBranch;
          newSize += newBranch.size;
          j += 1;
        } else if (((oldBranchMap0 & newBranchMap0) & 1) != 0) {
          final StringTrieMap<V> branch = oldBranches[i];
          newBranches[j] = branch;
          newSize += branch.size;
          i += 1;
          j += 1;
        } else {
          assert (oldBranchMap0 & 1) == 0;
          assert (newBranchMap0 & 1) == 0;
        }
        oldBranchMap0 >>>= 1;
        newBranchMap0 >>>= 1;
        bit += 1;
      }
      bit = 64;
      while (newBranchMap1 != 0) {
        if (bit == x) {
          assert (oldBranchMap1 & 1) == 0;
          assert (newBranchMap1 & 1) != 0;
          newBranches[j] = newBranch;
          newSize += newBranch.size;
          j += 1;
        } else if (((oldBranchMap1 & newBranchMap1) & 1) != 0) {
          final StringTrieMap<V> branch = oldBranches[i];
          newBranches[j] = branch;
          newSize += branch.size;
          i += 1;
          j += 1;
        } else {
          assert (oldBranchMap1 & 1) == 0;
          assert (newBranchMap1 & 1) == 0;
        }
        oldBranchMap1 >>>= 1;
        newBranchMap1 >>>= 1;
        bit += 1;
      }
      bit = 128;
      while (newBranchMap2 != 0) {
        if (bit == x) {
          assert (oldBranchMap2 & 1) == 0;
          assert (newBranchMap2 & 1) != 0;
          newBranches[j] = newBranch;
          newSize += newBranch.size;
          j += 1;
        } else if (((oldBranchMap2 & newBranchMap2) & 1) != 0) {
          final StringTrieMap<V> branch = oldBranches[i];
          newBranches[j] = branch;
          newSize += branch.size;
          i += 1;
          j += 1;
        } else {
          assert (oldBranchMap2 & 1) == 0;
          assert (newBranchMap2 & 1) == 0;
        }
        oldBranchMap2 >>>= 1;
        newBranchMap2 >>>= 1;
        bit += 1;
      }
      bit = 192;
      while (newBranchMap3 != 0) {
        if (bit == x) {
          assert (oldBranchMap3 & 1) == 0;
          assert (newBranchMap3 & 1) != 0;
          newBranches[j] = newBranch;
          newSize += newBranch.size;
          j += 1;
        } else if (((oldBranchMap3 & newBranchMap3) & 1) != 0) {
          final StringTrieMap<V> branch = oldBranches[i];
          newBranches[j] = branch;
          newSize += branch.size;
          i += 1;
          j += 1;
        } else {
          assert (oldBranchMap3 & 1) == 0;
          assert (newBranchMap3 & 1) == 0;
        }
        oldBranchMap3 >>>= 1;
        newBranchMap3 >>>= 1;
        bit += 1;
      }
      return new StringTrieMap<V>(branchMap0, branchMap1,
                                  branchMap2, branchMap3,
                                  newSize, this.flags, newBranches,
                                  this.prefix, this.value);
    } else { // update
      final StringTrieMap<V>[] oldBranches = this.branches;
      final StringTrieMap<V> oldBranch = oldBranches[oldBranchIndex];
      if (oldBranch == newBranch) {
        return this;
      }
      final int branchCount = oldBranches.length;
      final StringTrieMap<V>[] newBranches =
          Assume.conforms(new StringTrieMap<?>[branchCount]);
      int newSize = this.isDefined() ? 1 : 0;
      for (int i = 0; i < branchCount; i += 1) {
        final StringTrieMap<V> branch = i != oldBranchIndex ? oldBranches[i] : newBranch;
        newBranches[i] = branch;
        newSize += branch.size;
      }
      return new StringTrieMap<V>(this.branchMap0, this.branchMap1,
                                  this.branchMap2, this.branchMap3,
                                  newSize, this.flags, newBranches,
                                  this.prefix, this.value);
    }
  }

  public StringTrieMap<V> updatedBranch(int c, StringTrieMap<V> newBranch) {
    if (c >= 0 && c <= 0x7F) { // U+0000..U+007F
      return this.updatedBranch((byte) c, newBranch);
    } else if (c >= 0x80 && c <= 0x7FF) { // U+0080..U+07FF
      final byte b0 = (byte) (0xC0 | (c >>> 6));
      final byte b1 = (byte) (0x80 | (c & 0x3F));
      StringTrieMap<V> branch0 = this.getBranch(b0);
      if (branch0 == null) {
        branch0 = StringTrieMap.emptyBranch(this.flags & INHERITED_MASK, this.prefix);
      }
      branch0 = branch0.updatedBranch(b1, newBranch);
      return this.updatedBranch(b0, branch0);
    } else if ((c >= 0x0800 && c <= 0xFFFF) // U+0800..U+D7FF
            || (c >= 0xE000 && c <= 0xFFFF)) { // U+E000..U+FFFF
      final byte b0 = (byte) (0xE0 | (c >>> 12));
      final byte b1 = (byte) (0x80 | ((c >>> 6) & 0x3F));
      final byte b2 = (byte) (0x80 | (c & 0x3F));
      StringTrieMap<V> branch0 = this.getBranch(b0);
      if (branch0 == null) {
        branch0 = StringTrieMap.emptyBranch(this.flags & INHERITED_MASK, this.prefix);
      }
      StringTrieMap<V> branch1 = branch0.getBranch(b1);
      if (branch1 == null) {
        branch1 = StringTrieMap.emptyBranch(this.flags & INHERITED_MASK, this.prefix);
      }
      branch1 = branch1.updatedBranch(b2, newBranch);
      branch0 = branch0.updatedBranch(b1, branch1);
      return this.updatedBranch(b0, branch0);
    } else if (c >= 0x10000 && c <= 0x10FFFF) { // U+10000..U+10FFFF
      final byte b0 = (byte) (0xF0 | (c >>> 18));
      final byte b1 = (byte) (0x80 | ((c >>> 12) & 0x3F));
      final byte b2 = (byte) (0x80 | ((c >>> 6) & 0x3F));
      final byte b3 = (byte) (0x80 | (c & 0x3F));
      StringTrieMap<V> branch0 = this.getBranch(b0);
      if (branch0 == null) {
        branch0 = StringTrieMap.emptyBranch(this.flags & INHERITED_MASK, this.prefix);
      }
      StringTrieMap<V> branch1 = branch0.getBranch(b1);
      if (branch1 == null) {
        branch1 = StringTrieMap.emptyBranch(this.flags & INHERITED_MASK, this.prefix);
      }
      StringTrieMap<V> branch2 = branch1.getBranch(b2);
      if (branch2 == null) {
        branch2 = StringTrieMap.emptyBranch(this.flags & INHERITED_MASK, this.prefix);
      }
      branch2 = branch2.updatedBranch(b3, newBranch);
      branch1 = branch1.updatedBranch(b2, branch2);
      branch0 = branch0.updatedBranch(b1, branch1);
      return this.updatedBranch(b0, branch0);
    } else { // surrogate or invalid code point
      throw new IllegalArgumentException("invalid code point: U+" + Integer.toHexString(c));
    }
  }

  public StringTrieMap<V> removedBranch(byte b) {
    final int oldBranchIndex = this.getBranchIndex(b);
    if (oldBranchIndex < 0) {
      return this;
    }
    long branchMap0 = this.branchMap0;
    long branchMap1 = this.branchMap1;
    long branchMap2 = this.branchMap2;
    long branchMap3 = this.branchMap3;
    long oldBranchMap0 = this.branchMap0;
    long oldBranchMap1 = this.branchMap1;
    long oldBranchMap2 = this.branchMap2;
    long oldBranchMap3 = this.branchMap3;
    final int x = b & 0xFF;
    if (x < 64) {
      branchMap0 ^= 1L << x;
    } else if (x < 128) {
      branchMap1 ^= 1L << (x - 64);
    } else if (x < 192) {
      branchMap2 ^= 1L << (x - 128);
    } else {
      branchMap3 ^= 1L << (x - 192);
    }
    long newBranchMap0 = branchMap0;
    long newBranchMap1 = branchMap1;
    long newBranchMap2 = branchMap2;
    long newBranchMap3 = branchMap3;
    final StringTrieMap<V>[] oldBranches = this.branches;
    final StringTrieMap<V>[] newBranches =
        Assume.conforms(new StringTrieMap<?>[Long.bitCount(branchMap0)
                                           + Long.bitCount(branchMap1)
                                           + Long.bitCount(branchMap2)
                                           + Long.bitCount(branchMap3)]);
    int i = 0;
    int j = 0;
    final int newSize = this.isDefined() ? 1 : 0;
    while (newBranchMap0 != 0) {
      if (((oldBranchMap0 & newBranchMap0) & 1) != 0) {
        newBranches[j] = oldBranches[i];
        i += 1;
        j += 1;
      } else if ((oldBranchMap0 & 1) != 0) {
        i += 1;
      } else {
        assert (newBranchMap0 & 1) == 0;
      }
      oldBranchMap0 >>>= 1;
      newBranchMap0 >>>= 1;
    }
    while (newBranchMap1 != 0) {
      if (((oldBranchMap1 & newBranchMap1) & 1) != 0) {
        newBranches[j] = oldBranches[i];
        i += 1;
        j += 1;
      } else if ((oldBranchMap1 & 1) != 0) {
        i += 1;
      } else {
        assert (newBranchMap0 & 1) == 0;
      }
      oldBranchMap1 >>>= 1;
      newBranchMap1 >>>= 1;
    }
    while (newBranchMap2 != 0) {
      if (((oldBranchMap2 & newBranchMap2) & 1) != 0) {
        newBranches[j] = oldBranches[i];
        i += 1;
        j += 1;
      } else if ((oldBranchMap2 & 1) != 0) {
        i += 1;
      } else {
        assert (newBranchMap0 & 1) == 0;
      }
      oldBranchMap2 >>>= 1;
      newBranchMap2 >>>= 1;
    }
    while (newBranchMap3 != 0) {
      if (((oldBranchMap3 & newBranchMap3) & 1) != 0) {
        newBranches[j] = oldBranches[i];
        i += 1;
        j += 1;
      } else if ((oldBranchMap3 & 1) != 0) {
        i += 1;
      } else {
        assert (newBranchMap0 & 1) == 0;
      }
      oldBranchMap3 >>>= 1;
      newBranchMap3 >>>= 1;
    }
    return new StringTrieMap<V>(branchMap0, branchMap1,
                                branchMap2, branchMap3,
                                newSize, this.flags, newBranches,
                                this.prefix, this.value);
  }

  public StringTrieMap<V> removedBranch(int c) {
    if (c >= 0 && c <= 0x7F) { // U+0000..U+007F
      return this.removedBranch((byte) c);
    } else if (c >= 0x80 && c <= 0x7FF) { // U+0080..U+07FF
      final byte b0 = (byte) (0xC0 | (c >>> 6));
      final byte b1 = (byte) (0x80 | (c & 0x3F));
      StringTrieMap<V> branch0 = this.getBranch(b0);
      if (branch0 == null) {
        return this;
      }
      branch0 = branch0.removedBranch(b1);
      if (branch0.isEmpty()) {
        return this.removedBranch(b0);
      } else {
        return this.updatedBranch(b0, branch0);
      }
    } else if ((c >= 0x0800 && c <= 0xFFFF) // U+0800..U+D7FF
            || (c >= 0xE000 && c <= 0xFFFF)) { // U+E000..U+FFFF
      final byte b0 = (byte) (0xE0 | (c >>> 12));
      final byte b1 = (byte) (0x80 | ((c >>> 6) & 0x3F));
      final byte b2 = (byte) (0x80 | (c & 0x3F));
      StringTrieMap<V> branch0 = this.getBranch(b0);
      if (branch0 == null) {
        return this;
      }
      StringTrieMap<V> branch1 = branch0.getBranch(b1);
      if (branch1 == null) {
        return this;
      }
      branch1 = branch1.removedBranch(b2);
      if (branch1.isEmpty()) {
        branch0 = branch0.removedBranch(b1);
      } else {
        branch0 = branch0.updatedBranch(b1, branch1);
      }
      if (branch0.isEmpty()) {
        return this.removedBranch(b0);
      } else {
        return this.updatedBranch(b0, branch0);
      }
    } else if (c >= 0x10000 && c <= 0x10FFFF) { // U+10000..U+10FFFF
      final byte b0 = (byte) (0xF0 | (c >>> 18));
      final byte b1 = (byte) (0x80 | ((c >>> 12) & 0x3F));
      final byte b2 = (byte) (0x80 | ((c >>> 6) & 0x3F));
      final byte b3 = (byte) (0x80 | (c & 0x3F));
      StringTrieMap<V> branch0 = this.getBranch(b0);
      if (branch0 == null) {
        return this;
      }
      StringTrieMap<V> branch1 = branch0.getBranch(b1);
      if (branch1 == null) {
        return this;
      }
      StringTrieMap<V> branch2 = branch1.getBranch(b2);
      if (branch2 == null) {
        return this;
      }
      branch2 = branch2.removedBranch(b3);
      if (branch2.isEmpty()) {
        branch1 = branch1.removedBranch(b2);
      } else {
        branch1 = branch1.updatedBranch(b2, branch2);
      }
      if (branch1.isEmpty()) {
        branch0 = branch0.removedBranch(b1);
      } else {
        branch0 = branch0.updatedBranch(b1, branch1);
      }
      if (branch0.isEmpty()) {
        return this.removedBranch(b0);
      } else {
        return this.updatedBranch(b0, branch0);
      }
    } else { // surrogate or invalid code point
      throw new IllegalArgumentException("invalid code point: U+" + Integer.toHexString(c));
    }
  }

  @Override
  public Set<Map.Entry<String, V>> entrySet() {
    return new StringTrieMapEntrySet<V>(this);
  }

  @Override
  public Set<String> keySet() {
    return new StringTrieMapKeySet<V>(this);
  }

  @Override
  public Collection<V> values() {
    return new StringTrieMapValues<V>(this);
  }

  @Override
  public Iterator<Map.Entry<String, V>> iterator() {
    return new StringTrieMapEntryIterator<V>(this);
  }

  public Iterator<String> keyIterator() {
    return new StringTrieMapKeyIterator<V>(this);
  }

  public Iterator<V> valueIterator() {
    return new StringTrieMapValueIterator<V>(this);
  }

  @Override
  public void forEach(BiConsumer<? super String, ? super V> action) {
    if (this.isDefined()) {
      action.accept(this.prefix, this.value);
    }
    for (int i = 0; i < this.branches.length; i += 1) {
      this.branches[i].forEach(action);
    }
  }

  @Override
  public void forEach(Consumer<? super Map.Entry<String, V>> action) {
    if (this.isDefined()) {
      action.accept(new SimpleImmutableEntry<String, V>(this.prefix, this.value));
    }
    for (int i = 0; i < this.branches.length; i += 1) {
      this.branches[i].forEach(action);
    }
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Map<?, ?> that) {
      return this.entrySet().equals(that.entrySet());
    }
    return false;
  }

  @Override
  public int hashCode() {
    int code = 0;
    if (this.isDefined()) {
      code += Objects.hashCode(this.prefix) ^ Objects.hashCode(this.value);
    }
    for (int i = 0; i < this.branches.length; i += 1) {
      code += this.branches[i].hashCode();
    }
    return code;
  }

  @Override
  public void writeMarkup(Appendable output) {
    final Notation notation = Notation.from(output);
    if (notation.options().verbose()) {
      notation.beginObject("StringTrieMap");
      notation.appendField("prefix", this.prefix);
      notation.appendField("value", this.value);
      long branchMap0 = this.branchMap0;
      long branchMap1 = this.branchMap1;
      long branchMap2 = this.branchMap2;
      long branchMap3 = this.branchMap3;
      notation.appendKey("branchMap0")
              .beginValue()
              .append("0x").append(Long.toHexString(branchMap0))
              .endValue();
      notation.appendKey("branchMap1")
              .beginValue()
              .append("0x").append(Long.toHexString(branchMap1))
              .endValue();
      notation.appendKey("branchMap2")
              .beginValue()
              .append("0x").append(Long.toHexString(branchMap2))
              .endValue();
      notation.appendKey("branchMap3")
              .beginValue()
              .append("0x").append(Long.toHexString(branchMap3))
              .endValue();
      notation.appendField("size", this.size);
      notation.appendKey("flags")
              .beginValue()
              .append("0x").append(Integer.toHexString(this.flags))
              .endValue();
      notation.appendKey("branches")
              .beginValue();
      notation.beginArray();
      final StringTrieMap<V>[] branches = this.branches;
      int i = 0;
      while (branchMap0 != 0) {
        if ((branchMap0 & 1) != 0) {
          notation.appendElement(branches[i]);
          i += 1;
        }
        branchMap0 >>>= 1;
      }
      while (branchMap1 != 0) {
        if ((branchMap1 & 1) != 0) {
          notation.appendElement(branches[i]);
          i += 1;
        }
        branchMap1 >>>= 1;
      }
      while (branchMap2 != 0) {
        if ((branchMap2 & 1) != 0) {
          notation.appendElement(branches[i]);
          i += 1;
        }
        branchMap2 >>>= 1;
      }
      while (branchMap3 != 0) {
        if ((branchMap3 & 1) != 0) {
          notation.appendElement(branches[i]);
          i += 1;
        }
        branchMap3 >>>= 1;
      }
      notation.endArray();
      notation.endValue();
      notation.endObject();
    } else {
      notation.beginObject("StringTrieMap");
      this.writeFields(notation);
      notation.endObject();
    }
  }

  void writeFields(Notation notation) {
    if (this.isDefined()) {
      notation.appendField(this.prefix, this.value);
    }
    for (int i = 0; i < this.branches.length; i += 1) {
      this.branches[i].writeFields(notation);
    }
  }

  @Override
  public String toString() {
    return this.toMarkup();
  }

  static final int DEFINED_FLAG = 1 << 0;

  static final int CASE_INSENSITIVE_FLAG = 1 << 1;

  static final int INHERITED_MASK = CASE_INSENSITIVE_FLAG;

  static final StringTrieMap<Object>[] EMPTY_BRANCHES =
      Assume.conforms(new StringTrieMap<?>[0]);

  static final StringTrieMap<Object> EMPTY_CASE_SENSITIVE =
      new StringTrieMap<Object>(0L, 0L, 0L, 0L, 0, 0,
                                EMPTY_BRANCHES, "", null);

  static final StringTrieMap<Object> EMPTY_CASE_INSENSITIVE =
      new StringTrieMap<Object>(0L, 0L, 0L, 0L, 0, CASE_INSENSITIVE_FLAG,
                                EMPTY_BRANCHES, "", null);

  public static <V> StringTrieMap<V> empty() {
    return Assume.conforms(EMPTY_CASE_SENSITIVE);
  }

  public static <V> StringTrieMap<V> caseSensitive() {
    return Assume.conforms(EMPTY_CASE_SENSITIVE);
  }

  public static <V> StringTrieMap<V> caseInsensitive() {
    return Assume.conforms(EMPTY_CASE_INSENSITIVE);
  }

  static <V> StringTrieMap<V> emptyBranch(int flags, String prefix) {
    return new StringTrieMap<V>(0L, 0L, 0L, 0L, 0, flags,
                                Assume.conforms(EMPTY_BRANCHES), prefix, null);
  }

}

abstract class StringTrieMapIterator<V> {

  StringTrieMap<V>[] nodes;
  int[] indexes;
  int depth;

  StringTrieMapIterator(StringTrieMap<V> node) {
    this.nodes = Assume.conforms(new StringTrieMap<?>[8]);
    this.nodes[0] = node;
    this.indexes = new int[8];
    this.indexes[0] = -1;
    this.depth = 0;
  }

  public final boolean hasNext() {
    while (this.depth >= 0) {
      final StringTrieMap<V> node = this.nodes[this.depth];
      final int index = this.indexes[this.depth];
      if (index < 0) {
        if (node.isDefined()) {
          return true;
        } else {
          this.indexes[this.depth] = 0;
        }
      } else if (index < node.branches.length) { // descend
        final StringTrieMap<V> branch = node.branches[index];
        this.depth += 1;
        if (this.depth == this.nodes.length) {
          final StringTrieMap<V>[] newNodes =
              Assume.conforms(new StringTrieMap<?>[2 * this.nodes.length]);
          System.arraycopy(this.nodes, 0, newNodes, 0, this.depth);
          final int[] newIndexes = new int[2 * this.indexes.length];
          System.arraycopy(this.indexes, 0, newIndexes, 0, this.depth);
          this.nodes = newNodes;
          this.indexes = newIndexes;
        }
        this.nodes[this.depth] = branch;
        this.indexes[this.depth] = -1;
      } else { // ascend
        this.nodes[this.depth] = null;
        this.indexes[this.depth] = 0;
        this.depth -= 1;
        if (this.depth >= 0) {
          this.indexes[this.depth] += 1;
        }
      }
    }
    return false;
  }

  StringTrieMap<V> nextNode() {
    while (this.depth >= 0) {
      final StringTrieMap<V> node = this.nodes[this.depth];
      final int index = this.indexes[this.depth];
      if (index < 0) {
        this.indexes[this.depth] = 0;
        if (node.isDefined()) {
          return node;
        }
      } else if (index < node.branches.length) { // descend
        final StringTrieMap<V> branch = node.branches[index];
        this.depth += 1;
        if (this.depth == this.nodes.length) {
          final StringTrieMap<V>[] newNodes =
              Assume.conforms(new StringTrieMap<?>[2 * this.nodes.length]);
          System.arraycopy(this.nodes, 0, newNodes, 0, this.depth);
          final int[] newIndexes = new int[2 * this.indexes.length];
          System.arraycopy(this.indexes, 0, newIndexes, 0, this.depth);
          this.nodes = newNodes;
          this.indexes = newIndexes;
        }
        this.nodes[this.depth] = branch;
        this.indexes[this.depth] = -1;
      } else { // ascend
        this.nodes[this.depth] = null;
        this.indexes[this.depth] = 0;
        this.depth -= 1;
        if (this.depth >= 0) {
          this.indexes[this.depth] += 1;
        }
      }
    }
    throw new NoSuchElementException();
  }

}

final class StringTrieMapEntryIterator<V> extends StringTrieMapIterator<V> implements Iterator<Map.Entry<String, V>> {

  StringTrieMapEntryIterator(StringTrieMap<V> node) {
    super(node);
  }

  @Override
  public Map.Entry<String, V> next() {
    final StringTrieMap<V> node = this.nextNode();
    return new SimpleImmutableEntry<String, V>(node.prefix, node.value);
  }

}

final class StringTrieMapEntrySet<V> extends AbstractSet<Map.Entry<String, V>> {

  final StringTrieMap<V> map;

  StringTrieMapEntrySet(StringTrieMap<V> map) {
    this.map = map;
  }

  @Override
  public int size() {
    return this.map.size();
  }

  @Override
  public Iterator<Map.Entry<String, V>> iterator() {
    return this.map.iterator();
  }

}

final class StringTrieMapKeyIterator<V> extends StringTrieMapIterator<V> implements Iterator<String> {

  StringTrieMapKeyIterator(StringTrieMap<V> node) {
    super(node);
  }

  @Override
  public String next() {
    return this.nextNode().prefix;
  }

}

final class StringTrieMapKeySet<V> extends AbstractSet<String> {

  final StringTrieMap<V> map;

  StringTrieMapKeySet(StringTrieMap<V> map) {
    this.map = map;
  }

  @Override
  public int size() {
    return this.map.size();
  }

  @Override
  public Iterator<String> iterator() {
    return this.map.keyIterator();
  }

}

final class StringTrieMapValueIterator<V> extends StringTrieMapIterator<V> implements Iterator<V> {

  StringTrieMapValueIterator(StringTrieMap<V> node) {
    super(node);
  }

  @Override
  public @Nullable V next() {
    return this.nextNode().value;
  }

}

final class StringTrieMapValues<V> extends AbstractCollection<V> {

  final StringTrieMap<V> map;

  StringTrieMapValues(StringTrieMap<V> map) {
    this.map = map;
  }

  @Override
  public int size() {
    return this.map.size();
  }

  @Override
  public Iterator<V> iterator() {
    return this.map.valueIterator();
  }

}
