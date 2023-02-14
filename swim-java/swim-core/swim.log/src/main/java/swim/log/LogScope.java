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

package swim.log;

import java.lang.invoke.MethodHandles;
import java.lang.invoke.VarHandle;
import java.lang.ref.SoftReference;
import java.util.Map;
import java.util.Objects;
import swim.annotations.CheckReturnValue;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.collections.HashTrieMap;
import swim.expr.Term;
import swim.util.Notation;
import swim.util.ToMarkup;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class LogScope implements Term, ToMarkup, ToSource {

  final int depth;
  final @Nullable String key;
  final String path;
  final @Nullable LogScope parent;
  HashTrieMap<String, SoftReference<LogScope>> children;
  @Nullable String purgeKey;

  LogScope(int depth, @Nullable String key, String path,
           @Nullable LogScope parent,
           HashTrieMap<String, SoftReference<LogScope>> children,
           @Nullable String purgeKey) {
    this.depth = depth;
    this.key = key;
    this.path = path;
    this.parent = parent;
    this.children = children;
    this.purgeKey = purgeKey;
  }

  public int depth() {
    return this.depth;
  }

  public @Nullable LogScope parent() {
    return this.parent;
  }

  public LogScope[] stack() {
    final LogScope[] stack = new LogScope[this.depth];
    LogScope.buildStack(stack, this);
    return stack;
  }

  static void buildStack(LogScope[] stack, LogScope scope) {
    if (scope.parent != null) {
      LogScope.buildStack(stack, scope.parent);
    }
    if (scope.depth > 0) {
      stack[scope.depth - 1] = scope;
    }
  }

  @SuppressWarnings("ReferenceEquality")
  public LogScope getChild(String key) {
    Objects.requireNonNull(key);
    if (key.length() == 0) {
      throw new IllegalArgumentException("Blank scope key");
    }

    // Get or create the child scope.
    HashTrieMap<String, SoftReference<LogScope>> children = (HashTrieMap<String, SoftReference<LogScope>>) CHILDREN.getOpaque(this);
    LogScope child = null;
    SoftReference<LogScope> childRef = null;
    do {
      final SoftReference<LogScope> oldChildRef = children.get(key);
      final LogScope oldChild = oldChildRef != null ? oldChildRef.get() : null;
      if (oldChild != null) {
        // Child scope already exists.
        child = oldChild;
        break;
      } else {
        if (child == null) {
          // Create the new child scope.
          final String subpath = this.path.length() != 0 ? this.path + '.' + key : key;
          child = new LogScope(this.depth + 1, key, subpath, this, HashTrieMap.empty(), null);
          childRef = new SoftReference<LogScope>(child);
        }
        // Try to add the new child scope to the children map.
        final HashTrieMap<String, SoftReference<LogScope>> oldChildren = children;
        final HashTrieMap<String, SoftReference<LogScope>> newChildren = oldChildren.updated(key, childRef);
        children = (HashTrieMap<String, SoftReference<LogScope>>) CHILDREN.compareAndExchangeRelease(this, oldChildren, newChildren);
        if (children == oldChildren) {
          // Successfully inserted the new child scope.
          children = newChildren;
          break;
        }
      }
    } while (true);

    // Help incrementally purge child scope references cleared by the GC.
    // Load the most recently checked child key, synchronizing with concurrent purges.
    String purgeKey = (String) PURGE_KEY.getAcquire(this);
    // To keep the amount of work we do bounded, we don't retry CAS failures;
    // the "loop" is only used to support goto-style breaks.
    do {
      // Get the next child key to check.
      final String oldPurgeKey = purgeKey;
      final String newPurgeKey = children.nextKey(oldPurgeKey);
      // Check if the GC has cleared the child scope referenced by the purge key.
      final SoftReference<LogScope> clearRef = children.get(newPurgeKey);
      if (clearRef != null && clearRef.get() == null) {
        // Try to remove the cleared child scope reference from the children map.
        final HashTrieMap<String, SoftReference<LogScope>> oldChildren = children;
        final HashTrieMap<String, SoftReference<LogScope>> newChildren = oldChildren.removed(newPurgeKey);
        children = (HashTrieMap<String, SoftReference<LogScope>>) CHILDREN.compareAndExchangeRelease(this, oldChildren, newChildren);
        if (children == oldChildren) {
          // Successfully removed the cleared child scope reference.
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

    // Return the child scope.
    return child;
  }

  @Override
  public boolean isTruthy() {
    return this.depth != 0;
  }

  @Override
  public boolean isFalsey() {
    return this.depth == 0;
  }

  @Override
  public boolean isValidObject() {
    return true;
  }

  @Override
  public Object objectValue() {
    return this;
  }

  @Override
  public String formatValue() {
    return this.toString();
  }

  @Override
  public void writeMarkup(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginObject("LogScope")
            .appendField("depth", this.depth);
    if (this.depth > 0) {
      notation.appendKey("fields")
              .beginValue()
              .beginInlineArray();
      final LogScope[] stack = this.stack();
      for (int i = 0; i < stack.length; i += 1) {
        final LogScope scope = stack[i];
        notation.appendElement(scope.key);
      }
      notation.endArray()
              .endValue();
    }
    if (notation.options().verbose() && !this.children.isEmpty()) {
      notation.appendKey("children")
              .beginValue()
              .beginObject();
      for (Map.Entry<String, SoftReference<LogScope>> entry : this.children) {
        final LogScope child = entry.getValue().get();
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
    notation.beginInvoke("LogScope", "of");
    final LogScope[] stack = this.stack();
    for (int i = 0; i < stack.length; i += 1) {
      final LogScope scope = stack[i];
      notation.appendArgument(scope.key);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.path;
  }

  public static LogScope current() {
    LogScope scope = CURRENT.get();
    if (scope == null) {
      scope = ROOT;
      CURRENT.set(scope);
    }
    return scope;
  }

  public static void setCurrent(LogScope scope) {
    CURRENT.set(scope);
  }

  @CheckReturnValue
  public static LogScope swapCurrent(String key) {
    LogScope oldScope = CURRENT.get();
    if (oldScope == null) {
      oldScope = ROOT;
    }
    final LogScope newScope = ROOT.getChild(key);
    CURRENT.set(newScope);
    return oldScope;
  }

  public static void reset() {
    CURRENT.set(ROOT);
  }

  public static void push(String key) {
    LogScope scope = CURRENT.get();
    if (scope == null) {
      scope = ROOT;
    }
    scope = scope.getChild(key);
    CURRENT.set(scope);
  }

  public static void pop() {
    LogScope scope = CURRENT.get();
    if (scope != null) {
      scope = scope.parent;
    }
    if (scope == null) {
      scope = ROOT;
    }
    CURRENT.set(scope);
  }

  public static LogScope root() {
    return ROOT;
  }

  public static LogScope of(String... keys) {
    LogScope scope = ROOT;
    for (int i = 0; i < keys.length; i += 1) {
      scope = scope.getChild(keys[i]);
    }
    return scope;
  }

  public static LogScope parse(String path) {
    Objects.requireNonNull(path);
    final int length = path.length();
    if (length == 0) {
      throw new IllegalArgumentException("Blank scope path");
    }
    LogScope scope = ROOT;
    int dotIndex = -1;
    int index = 0;
    do {
      final int c = index < length ? path.codePointAt(index) : -1;
      if (c == '.' || c == -1) {
        if (index == dotIndex + 1) {
          throw new IllegalArgumentException(new Notation().append("Empty identifier in scope path: ")
                                                           .appendSource(path)
                                                           .toString());
        }
        scope = scope.getChild(path.substring(dotIndex + 1, index));
        dotIndex = index;
      } else if (!Logger.isIdentifierChar(c)) {
        throw new IllegalArgumentException(new Notation().append("Invalid identifier character (")
                                                         .appendSourceCodePoint(c)
                                                         .append(") in scope path: ")
                                                         .appendSource(path)
                                                         .toString());
      }
      if (index < length) {
        index = path.offsetByCodePoints(index, 1);
      } else {
        break;
      }
    } while (true);
    return scope;
  }

  public static LogScope fromJsonString(String value) {
    return LogScope.parse(value);
  }

  public static String toJsonString(LogScope scope) {
    return scope.toString();
  }

  public static LogScope fromWamlString(String value) {
    return LogScope.parse(value);
  }

  public static String toWamlString(LogScope scope) {
    return scope.toString();
  }

  /**
   * {@code VarHandle} for atomically accessing the {@link #children} field.
   */
  static final VarHandle CHILDREN;

  /**
   * {@code VarHandle} for atomically accessing the {@link #purgeKey} field.
   */
  static final VarHandle PURGE_KEY;

  static final LogScope ROOT;

  static final ThreadLocal<LogScope> CURRENT = new ThreadLocal<LogScope>();

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      CHILDREN = lookup.findVarHandle(LogScope.class, "children", HashTrieMap.class);
      PURGE_KEY = lookup.findVarHandle(LogScope.class, "purgeKey", String.class);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }

    ROOT = new LogScope(0, null, "", null, HashTrieMap.empty(), null);
  }

}
