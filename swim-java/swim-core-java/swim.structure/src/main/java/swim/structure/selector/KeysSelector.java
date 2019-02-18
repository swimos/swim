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

package swim.structure.selector;

import java.util.ListIterator;
import swim.codec.Output;
import swim.structure.Attr;
import swim.structure.Field;
import swim.structure.Interpreter;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Selectee;
import swim.structure.Selector;
import swim.structure.Slot;
import swim.structure.Text;
import swim.structure.Value;
import swim.util.Murmur3;

/**
 * A {@link Selector} that, when {@link #evaluate evaluated} against some {@link
 * Interpreter}, yields all of the "keys" of the top {@code Item} in the
 * interpreter's frame stack.  The "keys" of an {@code Item} {@code item} are
 * defined to be either the sole {@link Field ((Field) item).key} if {@code
 * item} is a {@code Field}, or every such key of every {@code Field} in {@code
 * item} if {@code item} is a {@code Record}; "keys" are not defined for any
 * other type.
 */
public final class KeysSelector extends Selector {
  final Selector then;

  public KeysSelector(Selector then) {
    this.then = then;
  }

  @Override
  public Selector then() {
    return this.then;
  }

  @Override
  public <T> T forSelected(Interpreter interpreter, Selectee<T> callback) {
    T selected = null;
    interpreter.willSelect(this);
    if (interpreter.scopeDepth() != 0) {
      // Pop the current selection off of the stack to take it out of scope.
      final Item scope = interpreter.popScope();
      if (scope instanceof Record) {
        final ListIterator<Item> children = ((Record) scope).listIterator();
        // For each child, while none have been selected:
        while (selected == null && children.hasNext()) {
          final Item child = children.next();
          // Only fields can have keys.
          if (child instanceof Field) {
            // Push the child key onto the scope stack.
            interpreter.pushScope(child.key());
            // Subselect the child key.
            selected = this.then.forSelected(interpreter, callback);
            // Pop the child key off of the scope stack.
            interpreter.popScope();
          }
        }
      } else if (scope instanceof Field) {
        // Push the key onto the scope stack.
        interpreter.pushScope(scope.key());
        // Subselect the key.
        selected = this.then.forSelected(interpreter, callback);
        // Pop the key off of the scope stack.
        interpreter.popScope();
      }
      // Push the current selection back onto the stack.
      interpreter.pushScope(scope);
    }
    interpreter.didSelect(this, selected);
    return selected;
  }

  @Override
  public Item mapSelected(Interpreter interpreter, Selectee<Item> transform) {
    final Item result;
    interpreter.willTransform(this);
    if (interpreter.scopeDepth() != 0) {
      // Pop the current selection off of the stack to take it out of scope.
      Item scope = interpreter.popScope();
      if (scope instanceof Record) {
        final ListIterator<Item> children = ((Record) scope).listIterator();
        while (children.hasNext()) {
          final Item child = children.next();
          if (child instanceof Field) {
            final Value oldKey = child.key();
            // Push the key onto the scope stack.
            interpreter.pushScope(oldKey);
            // Subselect the key.
            final Value newKey = this.then.mapSelected(interpreter, transform).toValue();
            // Pop the key off of the scope stack.
            interpreter.popScope();
            if (newKey.isDefined()) {
              if (oldKey != newKey) {
                if (scope instanceof Attr && newKey instanceof Text) {
                  children.set(Attr.of((Text) newKey, scope.toValue()));
                } else {
                  children.set(Slot.of(newKey, scope.toValue()));
                }
              }
            } else {
              children.remove();
            }
          }
        }
      } else if (scope instanceof Field) {
        final Value oldKey = scope.key();
        // Push the key onto the scope stack.
        interpreter.pushScope(oldKey);
        // Subselect the key.
        final Value newKey = this.then.mapSelected(interpreter, transform).toValue();
        // Pop the key off of the scope stack.
        interpreter.popScope();
        if (newKey.isDefined()) {
          if (oldKey != newKey) {
            if (scope instanceof Attr && newKey instanceof Text) {
              scope = Attr.of((Text) newKey, scope.toValue());
            } else {
              scope = Slot.of(newKey, scope.toValue());
            }
          }
        } else {
          scope = Item.absent();
        }
      }
      // Push the transformed selection back onto the stack.
      interpreter.pushScope(scope);
      result = scope;
    } else {
      result = Item.absent();
    }
    interpreter.didTransform(this, result);
    return result;
  }

  @Override
  public Item substitute(Interpreter interpreter) {
    Item then = this.then.substitute(interpreter);
    if (!(then instanceof Selector)) {
      then = this.then;
    }
    return new KeysSelector((Selector) then);
  }

  @Override
  public Selector andThen(Selector then) {
    return new KeysSelector(this.then.andThen(then));
  }

  @Override
  public int typeOrder() {
    return 15;
  }

  @Override
  protected int compareTo(Selector that) {
    if (that instanceof KeysSelector) {
      return compareTo((KeysSelector) that);
    }
    return Integer.compare(typeOrder(), that.typeOrder());
  }

  int compareTo(KeysSelector that) {
    return this.then.compareTo(that.then);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof KeysSelector) {
      final KeysSelector that = (KeysSelector) other;
      return then.equals(that.then);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(KeysSelector.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, this.then.hashCode()));
  }

  @Override
  public void debugThen(Output<?> output) {
    output = output.write('.').write("keys").write('(').write(')');
    this.then.debugThen(output);
  }

  private static int hashSeed;
}
