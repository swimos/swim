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
import swim.structure.Field;
import swim.structure.Interpreter;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Selectee;
import swim.structure.Selector;
import swim.structure.Value;
import swim.util.Murmur3;

/**
 * A {@link Selector} that, when {@link #evaluate evaluated} against some {@link
 * Interpreter}, yields all of the "values" of the top {@code Item} in the
 * interpreter's frame stack.  Every {@code Item} that is not a {@code Record}
 * has exactly one "value" whose definition is consistent with {@link
 * Item#toValue}.  The "values" of a {@code Record} are defined as the set of
 * every such "value" for every (top-level) {@code Item} in the {@code Record}.
 */
public class ValuesSelector extends Selector {
  final Selector then;

  public ValuesSelector(Selector then) {
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
          // Push the child value onto the scope stack.
          interpreter.pushScope(child.toValue());
          // Subselect the child value.
          selected = this.then.forSelected(interpreter, callback);
          // Pop the child value off of the scope stack.
          interpreter.popScope();
        }
      } else {
        // Push the value onto the scope stack.
        interpreter.pushScope(scope.toValue());
        // Subselect the value.
        selected = this.then.forSelected(interpreter, callback);
        // Pop the value off of the scope stack.
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
            final Value oldValue = child.toValue();
            // Push the child value onto the scope stack.
            interpreter.pushScope(oldValue);
            // Transform the child value.
            final Item newItem = this.then.mapSelected(interpreter, transform);
            // Pop the child value off of the scope stack.
            interpreter.popScope();
            if (newItem.isDefined()) {
              if (newItem instanceof Field) {
                children.set(newItem);
              } else if (newItem != oldValue) {
                children.set(((Field) child).updatedValue(newItem.toValue()));
              }
            } else {
              children.remove();
            }
          } else {
            // Push the child onto the scope stack.
            interpreter.pushScope(child.toValue());
            // Transform the child.
            final Item newItem = this.then.mapSelected(interpreter, transform);
            // Pop the child off of the scope stack.
            interpreter.popScope();
            if (newItem.isDefined()) {
              if (child != newItem) {
                children.set(newItem);
              }
            } else {
              children.remove();
            }
          }
        }
      } else if (scope instanceof Field) {
        final Value oldValue = scope.toValue();
        // Push the field value onto the scope stack.
        interpreter.pushScope(oldValue);
        // Transform the field value.
        final Item newItem = this.then.mapSelected(interpreter, transform);
        // Pop the field value off of the scope stack.
        interpreter.popScope();
        if (newItem.isDefined()) {
          if (newItem instanceof Field) {
            scope = newItem;
          } else if (newItem != oldValue) {
            scope = ((Field) scope).updatedValue(newItem.toValue());
          }
        } else {
          scope = Item.absent();
        }
      } else {
        // Push the value onto the scope stack.
        interpreter.pushScope(scope);
        // Transform the value.
        scope = this.then.mapSelected(interpreter, transform);
        // Pop the value off of the scope stack.
        interpreter.popScope();
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
    return new ValuesSelector((Selector) then);
  }

  @Override
  public Selector andThen(Selector then) {
    return new ValuesSelector(this.then.andThen(then));
  }

  @Override
  public int typeOrder() {
    return 16;
  }

  @Override
  protected int compareTo(Selector that) {
    if (that instanceof ValuesSelector) {
      return compareTo((ValuesSelector) that);
    }
    return Integer.compare(typeOrder(), that.typeOrder());
  }

  int compareTo(ValuesSelector that) {
    return this.then.compareTo(that.then);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof ValuesSelector) {
      final ValuesSelector that = (ValuesSelector) other;
      return then.equals(that.then);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(ValuesSelector.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, this.then.hashCode()));
  }

  @Override
  public void debugThen(Output<?> output) {
    output = output.write('.').write("values").write('(').write(')');
    this.then.debugThen(output);
  }

  private static int hashSeed;
}
