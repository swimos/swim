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
public final class ObjectShape implements ToMarkup, ToSource {

  final int size;
  final int rank;
  final @Nullable String key;
  ObjectShape @Nullable [] fields;
  Object @Nullable [] table; // [...(key: String | null, field: ObejctShape | null)*]
  final @Nullable ObjectShape parent;
  HashTrieMap<String, SoftReference<ObjectShape>> children;
  @Nullable String purgeKey;

  ObjectShape(int size, int rank, @Nullable String key,
              ObjectShape @Nullable [] fields,
              Object @Nullable [] table,
              @Nullable ObjectShape parent,
              HashTrieMap<String, SoftReference<ObjectShape>> children,
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

  ObjectShape[] fields() {
    ObjectShape[] fields = this.fields;
    if (fields == null) {
      fields = new ObjectShape[this.size];
      ObjectShape.buildFields(fields, this);
      this.fields = fields;
    }
    return fields;
  }

  static void buildFields(ObjectShape[] fields, ObjectShape field) {
    if (field.parent != null) {
      ObjectShape.buildFields(fields, field.parent);
    }
    if (field.size > 0) {
      fields[field.size - 1] = field;
    }
  }

  Object[] table() {
    Object[] table = this.table;
    if (table == null) {
      table = new Object[ObjectShape.expand(this.rank * 10 / 7) << 1];
      ObjectShape.buildTable(table, this);
      this.table = table;
    }
    return table;
  }

  static void buildTable(Object[] table, ObjectShape field) {
    if (field.parent != null) {
      ObjectShape.buildTable(table, field.parent);
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
          return ((ObjectShape) table[i + 1]).size - 1;
        } else {
          x = (x + 1) % n;
        }
      } while (x != hash);
    }
    return -1;
  }

  @SuppressWarnings("ReferenceEquality")
  ObjectShape getChild(@Nullable String key) {
    final int size = this.size;
    // Check if this is the dictionary shape.
    if (size < 0) {
      // Dictionaries have no children.
      return this;
    }

    // Get or create the child shape.
    HashTrieMap<String, SoftReference<ObjectShape>> children = (HashTrieMap<String, SoftReference<ObjectShape>>) CHILDREN.getOpaque(this);
    ObjectShape child = null;
    SoftReference<ObjectShape> childRef = null;
    do {
      final SoftReference<ObjectShape> oldChildRef = children.get(key);
      final ObjectShape oldChild = oldChildRef != null ? oldChildRef.get() : null;
      if (oldChild != null) {
        // Child shape already exists.
        child = oldChild;
        break;
      } else {
        if (child == null) {
          // Create the new child shape.
          child = new ObjectShape(size + 1, key != null ? this.rank + 1 : this.rank, key, null, null, this, HashTrieMap.empty(), null);
          childRef = new SoftReference<ObjectShape>(child);
        }
        // Try to add the new child shape to the children map.
        final HashTrieMap<String, SoftReference<ObjectShape>> oldChildren = children;
        final HashTrieMap<String, SoftReference<ObjectShape>> newChildren = oldChildren.updated(key, childRef);
        children = (HashTrieMap<String, SoftReference<ObjectShape>>) CHILDREN.compareAndExchangeRelease(this, oldChildren, newChildren);
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
      final SoftReference<ObjectShape> clearRef = children.get(newPurgeKey);
      if (clearRef != null && clearRef.get() == null) {
        // Try to remove the cleared child shape reference from the children map.
        final HashTrieMap<String, SoftReference<ObjectShape>> oldChildren = children;
        final HashTrieMap<String, SoftReference<ObjectShape>> newChildren = oldChildren.removed(newPurgeKey);
        children = (HashTrieMap<String, SoftReference<ObjectShape>>) CHILDREN.compareAndExchangeRelease(this, oldChildren, newChildren);
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
    notation.beginObject("ObjectShape")
            .appendField("size", this.size)
            .appendField("rank", this.rank);
    if (this.size > 0) {
      notation.appendKey("fields")
              .beginValue()
              .beginInlineArray();
      final ObjectShape[] fields = this.fields();
      for (int i = 0; i < fields.length; i += 1) {
        final ObjectShape field = fields[i];
        notation.appendElement(field.key);
      }
      notation.endArray()
              .endValue();
    }
    if (notation.options().verbose() && !this.children.isEmpty()) {
      notation.appendKey("children")
              .beginValue()
              .beginObject();
      for (Map.Entry<String, SoftReference<ObjectShape>> entry : this.children) {
        final ObjectShape child = entry.getValue().get();
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
      notation.beginInvoke("ObjectShape", "dictionary").endInvoke();
    } else if (this.size == 0) {
      notation.beginInvoke("ObjectShape", "empty").endInvoke();
    } else {
      notation.beginInvoke("ObjectShape", "of");
      final ObjectShape[] fields = this.fields();
      for (int i = 0; i < fields.length; i += 1) {
        final ObjectShape field = fields[i];
        notation.appendArgument(field.key);
      }
      notation.endInvoke();
    }
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static ObjectShape empty() {
    return EMPTY;
  }

  public static ObjectShape dictionary() {
    return DICTIONARY;
  }

  public static ObjectShape of(String... keys) {
    ObjectShape shape = ObjectShape.empty();
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

  private static final ObjectShape EMPTY;

  private static final ObjectShape DICTIONARY;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      CHILDREN = lookup.findVarHandle(ObjectShape.class, "children", HashTrieMap.class);
      PURGE_KEY = lookup.findVarHandle(ObjectShape.class, "purgeKey", String.class);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }

    EMPTY = new ObjectShape(0, 0, null, null, null, null, HashTrieMap.empty(), null);
    DICTIONARY = new ObjectShape(-1, -1, null, null, null, null, HashTrieMap.empty(), null);
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
