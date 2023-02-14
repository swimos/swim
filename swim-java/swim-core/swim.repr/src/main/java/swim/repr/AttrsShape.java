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

package swim.repr;

import java.lang.invoke.MethodHandles;
import java.lang.invoke.VarHandle;
import java.lang.ref.SoftReference;
import java.util.Map;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.collections.HashTrieMap;
import swim.util.Notation;
import swim.util.ToMarkup;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class AttrsShape implements ToMarkup, ToSource {

  final int size;
  final int rank;
  final @Nullable String key;
  AttrsShape @Nullable [] fields;
  Object @Nullable [] table; // [...(key: String | null, field: ObejctShape | null)*]
  final @Nullable AttrsShape parent;
  HashTrieMap<String, SoftReference<AttrsShape>> children;
  @Nullable String purgeKey;

  AttrsShape(int size, int rank, @Nullable String key,
             AttrsShape @Nullable [] fields,
             Object @Nullable [] table,
             @Nullable AttrsShape parent,
             HashTrieMap<String, SoftReference<AttrsShape>> children,
             @Nullable String purgeKey) {
    this.size = size;
    this.rank = rank;
    this.key = key;
    this.fields = fields;
    this.table = table;
    this.parent = parent;
    this.children = children;
    this.purgeKey = purgeKey;
  }

  public int size() {
    return this.size;
  }

  public int rank() {
    return this.rank;
  }

  AttrsShape[] fields() {
    AttrsShape[] fields = this.fields;
    if (fields == null) {
      fields = new AttrsShape[this.size];
      AttrsShape.buildFields(fields, this);
      this.fields = fields;
    }
    return fields;
  }

  static void buildFields(AttrsShape[] fields, AttrsShape field) {
    if (field.parent != null) {
      AttrsShape.buildFields(fields, field.parent);
    }
    if (field.size > 0) {
      fields[field.size - 1] = field;
    }
  }

  Object[] table() {
    Object[] table = this.table;
    if (table == null) {
      table = new Object[AttrsShape.expand(this.rank * 10 / 7) << 1];
      AttrsShape.buildTable(table, this);
      this.table = table;
    }
    return table;
  }

  static void buildTable(Object[] table, AttrsShape field) {
    if (field.parent != null) {
      AttrsShape.buildTable(table, field.parent);
    }
    final String key = field.key;
    if (field.size > 0 && key != null) {
      final int hash = key.hashCode();
      final int n = table.length >>> 1;
      int x = Math.abs(hash % n);
      do {
        final int i = x << 1;
        if (table[i] == null) {
          table[i] = key;
          table[i + 1] = field;
          break;
        } else {
          x = (x + 1) % n;
        }
      } while (x != hash);
    }
  }

  int lookup(String key) {
    if (this.size > 0) {
      final Object[] table = this.table();
      final int hash = key.hashCode();
      final int n = table.length >>> 1;
      int x = Math.abs(hash % n);
      do {
        final int i = x << 1;
        final String k = (String) table[i];
        if (k == null) {
          break;
        } else if (key.equals(k)) {
          return ((AttrsShape) table[i + 1]).size - 1;
        } else {
          x = (x + 1) % n;
        }
      } while (x != hash);
    }
    return -1;
  }

  @SuppressWarnings("ReferenceEquality")
  AttrsShape getChild(@Nullable String key) {
    final int size = this.size;
    // Check if this is the dictionary shape.
    if (size < 0) {
      // Dictionaries have no children.
      return this;
    }

    // Get or create the child shape.
    HashTrieMap<String, SoftReference<AttrsShape>> children = (HashTrieMap<String, SoftReference<AttrsShape>>) CHILDREN.getOpaque(this);
    AttrsShape child = null;
    SoftReference<AttrsShape> childRef = null;
    do {
      final SoftReference<AttrsShape> oldChildRef = children.get(key);
      final AttrsShape oldChild = oldChildRef != null ? oldChildRef.get() : null;
      if (oldChild != null) {
        // Child shape already exists.
        child = oldChild;
        break;
      } else {
        if (child == null) {
          // Create the new child shape.
          child = new AttrsShape(size + 1, key != null ? this.rank + 1 : this.rank, key, null, null, this, HashTrieMap.empty(), null);
          childRef = new SoftReference<AttrsShape>(child);
        }
        // Try to add the new child shape to the children map.
        final HashTrieMap<String, SoftReference<AttrsShape>> oldChildren = children;
        final HashTrieMap<String, SoftReference<AttrsShape>> newChildren = oldChildren.updated(key, childRef);
        children = (HashTrieMap<String, SoftReference<AttrsShape>>) CHILDREN.compareAndExchangeRelease(this, oldChildren, newChildren);
        if (children == oldChildren) {
          // Successfully inserted the new child shape.
          children = newChildren;
          break;
        }
      }
    } while (true);

    // Help incrementally purge child shape references cleared by the GC.
    // Load the most recently checked child key, synchronizing with concurrent purges.
    String purgeKey = (String) PURGE_KEY.getAcquire(this);
    // To keep the amount of work we do bounded, we don't retry CAS failures;
    // the "loop" is only used to support goto-style breaks.
    do {
      // Get the next child key to check.
      final String oldPurgeKey = purgeKey;
      final String newPurgeKey = children.nextKey(oldPurgeKey);
      // Check if the GC has cleared the child shape referenced by the purge key.
      final SoftReference<AttrsShape> clearRef = children.get(newPurgeKey);
      if (clearRef != null && clearRef.get() == null) {
        // Try to remove the cleared child shape reference from the children map.
        final HashTrieMap<String, SoftReference<AttrsShape>> oldChildren = children;
        final HashTrieMap<String, SoftReference<AttrsShape>> newChildren = oldChildren.removed(newPurgeKey);
        children = (HashTrieMap<String, SoftReference<AttrsShape>>) CHILDREN.compareAndExchangeRelease(this, oldChildren, newChildren);
        if (children == oldChildren) {
          // Successfully removed the cleared child shape reference.
          children = newChildren;
        } else {
          // Another thread concurrently updated the children map.
          // Don't update the purge key so that the next helper will try again.
          break;
        }
      }
      // Update the purge key so that the next helper will pick up where we left off.
      purgeKey = (String) PURGE_KEY.compareAndExchangeRelease(this, oldPurgeKey, newPurgeKey);
      if (purgeKey == oldPurgeKey) {
        // Successfully updated the purge key.
        purgeKey = newPurgeKey;
        break;
      } else {
        // Another thread concurrently checked the same key.
        break;
      }
    } while (true);

    // Return the child shape.
    return child;
  }

  @Override
  public void writeMarkup(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginObject("AttrsShape")
            .appendField("size", this.size)
            .appendField("rank", this.rank);
    if (this.size > 0) {
      notation.appendKey("fields")
              .beginValue()
              .beginInlineArray();
      final AttrsShape[] fields = this.fields();
      for (int i = 0; i < fields.length; i += 1) {
        final AttrsShape field = fields[i];
        notation.appendElement(field.key);
      }
      notation.endArray()
              .endValue();
    }
    if (notation.options().verbose() && !this.children.isEmpty()) {
      notation.appendKey("children")
              .beginValue()
              .beginObject();
      for (Map.Entry<String, SoftReference<AttrsShape>> entry : this.children) {
        final AttrsShape child = entry.getValue().get();
        if (child != null) {
          notation.appendField(entry.getKey(), child);
        }
      }
      notation.endObject()
              .endValue();
    }
    notation.endObject();
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.size < 0) {
      notation.beginInvoke("AttrsShape", "dictionary").endInvoke();
    } else if (this.size == 0) {
      notation.beginInvoke("AttrsShape", "empty").endInvoke();
    } else {
      notation.beginInvoke("AttrsShape", "of");
      final AttrsShape[] fields = this.fields();
      for (int i = 0; i < fields.length; i += 1) {
        final AttrsShape field = fields[i];
        notation.appendArgument(field.key);
      }
      notation.endInvoke();
    }
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static AttrsShape empty() {
    return EMPTY;
  }

  public static AttrsShape dictionary() {
    return DICTIONARY;
  }

  public static AttrsShape of(String... keys) {
    AttrsShape shape = AttrsShape.empty();
    for (int i = 0; i < keys.length; i += 1) {
      shape = shape.getChild(keys[i]);
    }
    return shape;
  }

  /**
   * {@code VarHandle} for atomically accessing the {@link #children} field.
   */
  static final VarHandle CHILDREN;

  /**
   * {@code VarHandle} for atomically accessing the {@link #purgeKey} field.
   */
  static final VarHandle PURGE_KEY;

  private static final AttrsShape EMPTY;

  private static final AttrsShape DICTIONARY;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      CHILDREN = lookup.findVarHandle(AttrsShape.class, "children", HashTrieMap.class);
      PURGE_KEY = lookup.findVarHandle(AttrsShape.class, "purgeKey", String.class);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }

    EMPTY = new AttrsShape(0, 0, null, null, null, null, HashTrieMap.empty(), null);
    DICTIONARY = new AttrsShape(-1, -1, null, null, null, null, HashTrieMap.empty(), null);
  }

  static int expand(int n) {
    n = Math.max(4, n) - 1;
    n |= n >> 1;
    n |= n >> 2;
    n |= n >> 4;
    n |= n >> 8;
    n |= n >> 16;
    return n + 1;
  }

}
