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
import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.collections.HashTrieMap;
import swim.util.Notation;
import swim.util.ToMarkup;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class TupleShape implements ToMarkup, ToSource {

  final int size;
  final int rank;
  final @Nullable String key;
  TupleShape @Nullable [] fields;
  Object @Nullable [] table; // [...(key: String | null, field: ObejctShape | null)*]
  final @Nullable TupleShape parent;
  HashTrieMap<String, SoftReference<TupleShape>> children;
  @Nullable String purgeKey;
  long purgeTime;

  TupleShape(int size, int rank, @Nullable String key,
             TupleShape @Nullable [] fields,
             Object @Nullable [] table,
             @Nullable TupleShape parent,
             HashTrieMap<String, SoftReference<TupleShape>> children,
             @Nullable String purgeKey) {
    this.size = size;
    this.rank = rank;
    this.key = key;
    this.fields = fields;
    this.table = table;
    this.parent = parent;
    this.children = children;
    this.purgeKey = purgeKey;
    this.purgeTime = 0L;
  }

  public int size() {
    return this.size;
  }

  public int rank() {
    return this.rank;
  }

  TupleShape[] fields() {
    TupleShape[] fields = this.fields;
    if (fields == null) {
      fields = new TupleShape[this.size];
      TupleShape.buildFields(fields, this);
      this.fields = fields;
    }
    return fields;
  }

  static void buildFields(TupleShape[] fields, TupleShape field) {
    if (field.parent != null) {
      TupleShape.buildFields(fields, field.parent);
    }
    if (field.size > 0) {
      fields[field.size - 1] = field;
    }
  }

  Object[] table() {
    Object[] table = this.table;
    if (table == null) {
      table = new Object[TupleShape.expand(this.rank * 10 / 7) << 1];
      TupleShape.buildTable(table, this);
      this.table = table;
    }
    return table;
  }

  static void buildTable(Object[] table, TupleShape field) {
    if (field.parent != null) {
      TupleShape.buildTable(table, field.parent);
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
          return ((TupleShape) table[i + 1]).size - 1;
        } else {
          x = (x + 1) % n;
        }
      } while (x != hash);
    }
    return -1;
  }

  @SuppressWarnings("ReferenceEquality")
  TupleShape getChild(@Nullable String key) {
    // Get or create the child shape.
    HashTrieMap<String, SoftReference<TupleShape>> children = (HashTrieMap<String, SoftReference<TupleShape>>) CHILDREN.getOpaque(this);
    TupleShape child = null;
    SoftReference<TupleShape> childRef = null;
    do {
      final SoftReference<TupleShape> oldChildRef = children.get(key);
      final TupleShape oldChild = oldChildRef != null ? oldChildRef.get() : null;
      if (oldChild != null) {
        // Child shape already exists.
        child = oldChild;
        break;
      } else {
        if (child == null) {
          // Create the new child shape.
          child = new TupleShape(this.size + 1, key != null ? this.rank + 1 : this.rank, key, null, null, this, HashTrieMap.empty(), null);
          childRef = new SoftReference<TupleShape>(child);
        }
        // Try to add the new child shape to the children map.
        final HashTrieMap<String, SoftReference<TupleShape>> oldChildren = children;
        final HashTrieMap<String, SoftReference<TupleShape>> newChildren = oldChildren.updated(key, childRef);
        children = (HashTrieMap<String, SoftReference<TupleShape>>) CHILDREN.compareAndExchangeRelease(this, oldChildren, newChildren);
        if (children == oldChildren) {
          // Successfully inserted the new child shape.
          children = newChildren;
          break;
        }
      }
    } while (true);

    // Periodically help purge child shape references cleared by the GC.
    final long t = System.currentTimeMillis();
    if (t - (long) PURGE_TIME.getOpaque(this) >= PURGE_INTERVAL) {
      // Load the most recently checked child key.
      final String oldPurgeKey = (String) PURGE_KEY.getOpaque(this);
      // Get the next child key to check.
      final String newPurgeKey = children.nextKey(oldPurgeKey);
      // Check if the GC has cleared the child shape referenced by the purge key.
      final SoftReference<TupleShape> clearRef = children.get(newPurgeKey);
      if (clearRef == null || clearRef.get() != null
          || CHILDREN.weakCompareAndSetRelease(this, children, children.removed(newPurgeKey))) {
        // Try to update the purge key so that the next helper will pick up where we left off.
        if (PURGE_KEY.weakCompareAndSetPlain(this, oldPurgeKey, newPurgeKey)) {
          PURGE_TIME.setOpaque(this, t);
        }
      }
    }

    // Return the child shape.
    return child;
  }

  @Override
  public void writeMarkup(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginObject("TupleShape")
            .appendField("size", this.size)
            .appendField("rank", this.rank);
    if (this.size > 0) {
      notation.appendKey("fields")
              .beginValue()
              .beginInlineArray();
      final TupleShape[] fields = this.fields();
      for (int i = 0; i < fields.length; i += 1) {
        final TupleShape field = fields[i];
        notation.appendElement(field.key);
      }
      notation.endArray()
              .endValue();
    }
    if (notation.options().verbose() && !this.children.isEmpty()) {
      notation.appendKey("children")
              .beginValue()
              .beginObject();
      for (Map.Entry<String, SoftReference<TupleShape>> entry : this.children) {
        final TupleShape child = entry.getValue().get();
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
    if (this.size == 0) {
      notation.beginInvoke("TupleShape", "empty").endInvoke();
    } else {
      notation.beginInvoke("TupleShape", "of");
      final TupleShape[] fields = this.fields();
      for (int i = 0; i < fields.length; i += 1) {
        final TupleShape field = fields[i];
        notation.appendArgument(field.key);
      }
      notation.endInvoke();
    }
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static TupleShape empty() {
    return EMPTY;
  }

  public static TupleShape of(@Nullable String... keys) {
    Objects.requireNonNull(keys);
    TupleShape shape = TupleShape.empty();
    for (int i = 0; i < keys.length; i += 1) {
      shape = shape.getChild(keys[i]);
    }
    return shape;
  }

  static final long PURGE_INTERVAL = 1000L;

  /**
   * {@code VarHandle} for atomically accessing the {@link #children} field.
   */
  static final VarHandle CHILDREN;

  /**
   * {@code VarHandle} for atomically accessing the {@link #purgeKey} field.
   */
  static final VarHandle PURGE_KEY;

  /**
   * {@code VarHandle} for atomically accessing the {@link #purgeTime} field.
   */
  static final VarHandle PURGE_TIME;

  private static final TupleShape EMPTY;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      CHILDREN = lookup.findVarHandle(TupleShape.class, "children", HashTrieMap.class);
      PURGE_KEY = lookup.findVarHandle(TupleShape.class, "purgeKey", String.class);
      PURGE_TIME = lookup.findVarHandle(TupleShape.class, "purgeTime", Long.TYPE);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }

    EMPTY = new TupleShape(0, 0, null, null, null, null, HashTrieMap.empty(), null);
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
