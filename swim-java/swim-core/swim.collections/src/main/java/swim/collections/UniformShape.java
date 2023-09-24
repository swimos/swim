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

import java.lang.invoke.MethodHandles;
import java.lang.invoke.VarHandle;
import java.lang.ref.SoftReference;
import java.util.Map;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.WriteMarkup;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class UniformShape<K, V> implements WriteMarkup, WriteSource {

  final int size;
  final @Nullable K key;
  UniformShape<K, V> @Nullable [] fields;
  Object @Nullable [] table; // [...(key: K | null, field: UniformShape<K, V> | null)*]
  final @Nullable UniformShape<K, V> parent;
  HashTrieMap<K, SoftReference<UniformShape<K, V>>> children;
  @Nullable K purgeKey;
  long purgeTime;

  UniformShape(int size, @Nullable K key, UniformShape<K, V> @Nullable [] fields,
               Object @Nullable [] table, @Nullable UniformShape<K, V> parent,
               HashTrieMap<K, SoftReference<UniformShape<K, V>>> children,
               @Nullable K purgeKey) {
    this.size = size;
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

  UniformShape<K, V>[] fields() {
    UniformShape<K, V>[] fields = this.fields;
    if (fields == null) {
      fields = Assume.conforms(new UniformShape<?, ?>[this.size]);
      UniformShape.buildFields(fields, this);
      this.fields = fields;
    }
    return fields;
  }

  static <K, V> void buildFields(UniformShape<K, V>[] fields, UniformShape<K, V> field) {
    if (field.parent != null) {
      UniformShape.buildFields(fields, field.parent);
    }
    if (field.size > 0) {
      fields[field.size - 1] = field;
    }
  }

  Object[] table() {
    Object[] table = this.table;
    if (table == null) {
      table = new Object[UniformShape.expand(this.size * 10 / 7) << 1];
      UniformShape.buildTable(table, this);
      this.table = table;
    }
    return table;
  }

  static <K, V> void buildTable(Object[] table, UniformShape<K, V> field) {
    if (field.parent != null) {
      UniformShape.buildTable(table, field.parent);
    }
    if (field.size <= 0 || field.key == null) {
      return;
    }
    final int hash = field.key.hashCode();
    final int n = table.length >>> 1;
    int x = Math.abs(hash % n);
    do {
      final int i = x << 1;
      if (table[i] == null) {
        table[i] = field.key;
        table[i + 1] = field;
        break;
      }
      x = (x + 1) % n;
    } while (x != hash);
  }

  int lookup(Object key) {
    if (this.size <= 0) {
      return -1;
    }
    final Object[] table = this.table();
    final int hash = key.hashCode();
    final int n = table.length >>> 1;
    int x = Math.abs(hash % n);
    do {
      final int i = x << 1;
      final K k = Assume.<K>conforms(table[i]);
      if (k == null) {
        return -1;
      } else if (key.equals(k)) {
        return Assume.<UniformShape<K, V>>conforms(table[i + 1]).size - 1;
      }
      x = (x + 1) % n;
    } while (x != hash);
    return -1;
  }

  @SuppressWarnings("ReferenceEquality")
  UniformShape<K, V> getChild(K key) {
    final int size = this.size;
    // Check if this is the dictionary shape.
    if (size < 0) {
      // Dictionaries have no children.
      return this;
    }

    // Get or create the child shape.
    HashTrieMap<K, SoftReference<UniformShape<K, V>>> children = (HashTrieMap<K, SoftReference<UniformShape<K, V>>>) CHILDREN.getOpaque(this);
    UniformShape<K, V> child = null;
    SoftReference<UniformShape<K, V>> childRef = null;
    do {
      final SoftReference<UniformShape<K, V>> oldChildRef = children.get(key);
      final UniformShape<K, V> oldChild = oldChildRef != null ? oldChildRef.get() : null;
      if (oldChild != null) {
        // Child shape already exists.
        child = oldChild;
        break;
      } else if (child == null) {
        // Create the new child shape.
        child = new UniformShape<K, V>(size + 1, key, null, null, this, HashTrieMap.empty(), null);
        childRef = new SoftReference<UniformShape<K, V>>(child);
      }
      // Try to add the new child shape to the children map.
      final HashTrieMap<K, SoftReference<UniformShape<K, V>>> oldChildren = children;
      final HashTrieMap<K, SoftReference<UniformShape<K, V>>> newChildren = oldChildren.updated(key, childRef);
      children = (HashTrieMap<K, SoftReference<UniformShape<K, V>>>) CHILDREN.compareAndExchangeRelease(this, oldChildren, newChildren);
      if (children != oldChildren) {
        // CAS failed; try again.
        continue;
      }
      // Successfully inserted the new child shape.
      children = newChildren;
      break;
    } while (true);

    // Periodically help purge child shape references cleared by the GC.
    final long t = System.currentTimeMillis();
    if (t - (long) PURGE_TIME.getOpaque(this) >= PURGE_INTERVAL) {
      // Load the most recently checked child key.
      final K oldPurgeKey = (K) PURGE_KEY.getOpaque(this);
      // Get the next child key to check.
      final K newPurgeKey = children.nextKey(oldPurgeKey);
      // Check if the GC has cleared the child shape referenced by the purge key.
      final SoftReference<UniformShape<K, V>> clearRef = children.get(newPurgeKey);
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
    notation.beginObject("UniformShape")
            .appendField("size", this.size);
    if (this.size > 0) {
      notation.appendKey("fields")
              .beginValue()
              .beginInlineArray();
      final UniformShape<K, V>[] fields = this.fields();
      for (int i = 0; i < fields.length; i += 1) {
        final UniformShape<K, V> field = fields[i];
        notation.appendElement(field.key);
      }
      notation.endArray()
              .endValue();
    }
    if (notation.options().verbose() && !this.children.isEmpty()) {
      notation.appendKey("children")
              .beginValue()
              .beginObject();
      for (Map.Entry<K, SoftReference<UniformShape<K, V>>> entry : this.children) {
        final UniformShape<K, V> child = entry.getValue().get();
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
      notation.beginInvoke("UniformShape", "dictionary").endInvoke();
    } else if (this.size == 0) {
      notation.beginInvoke("UniformShape", "empty").endInvoke();
    } else {
      notation.beginInvoke("UniformShape", "of");
      final UniformShape<K, V>[] fields = this.fields();
      for (int i = 0; i < fields.length; i += 1) {
        final UniformShape<K, V> field = fields[i];
        notation.appendArgument(field.key);
      }
      notation.endInvoke();
    }
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  public static <K, V> UniformShape<K, V> empty() {
    return Assume.conforms(EMPTY);
  }

  public static <K, V> UniformShape<K, V> dictionary() {
    return Assume.conforms(DICTIONARY);
  }

  @SuppressWarnings("unchecked")
  public static <K, V> UniformShape<K, V> of(K... keys) {
    UniformShape<K, V> shape = UniformShape.empty();
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

  static final UniformShape<?, ?> EMPTY;

  static final UniformShape<?, ?> DICTIONARY;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      CHILDREN = lookup.findVarHandle(UniformShape.class, "children", HashTrieMap.class);
      PURGE_KEY = lookup.findVarHandle(UniformShape.class, "purgeKey", Object.class);
      PURGE_TIME = lookup.findVarHandle(UniformShape.class, "purgeTime", Long.TYPE);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }

    EMPTY = new UniformShape<Object, Object>(0, null, null, null, null, HashTrieMap.empty(), null);
    DICTIONARY = new UniformShape<Object, Object>(-1, null, null, null, null, HashTrieMap.empty(), null);
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
