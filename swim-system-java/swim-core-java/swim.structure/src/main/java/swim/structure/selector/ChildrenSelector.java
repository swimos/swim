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
import swim.structure.Interpreter;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Selectee;
import swim.structure.Selector;
import swim.structure.Value;
import swim.util.Murmur3;

/**
 * A {@link Selector} that, when {@link #evaluate evaluated} against some {@link
 * Interpreter}, yields all of the "children" of the top {@code Item} in the
 * interpreter's frame stack.  A "child" is defined to be a top-level {@link
 * Item} in a {@link Record}; it has no definition for any other type.
 */
public class ChildrenSelector extends Selector {
  final Selector then;

  ChildrenSelector(Selector then) {
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
      final Value scope = interpreter.popScope().toValue();
      // Only records can have children.
      if (scope instanceof Record) {
        final ListIterator<Item> children = ((Record) scope).listIterator();
        // For each child, while none have been selected:
        while (selected == null && children.hasNext()) {
          final Item child = children.next();
          // Push the child onto the scope stack.
          interpreter.pushScope(child);
          // Subselect the child.
          selected = this.then.forSelected(interpreter, callback);
          // Pop the child off of the scope stack.
          interpreter.popScope();
        }
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
      final Value scope = interpreter.popScope().toValue();
      // Only records can have children.
      if (scope instanceof Record) {
        final ListIterator<Item> children = ((Record) scope).listIterator();
        // For each child:
        while (children.hasNext()) {
          final Item oldChild = children.next();
          // Push the child onto the scope stack.
          interpreter.pushScope(oldChild);
          // Transform the child.
          final Item newChild = this.then.mapSelected(interpreter, transform);
          // Pop the child off the scope stack.
          interpreter.popScope();
          if (newChild.isDefined()) {
            // Update the child, if its identity changed.
            if (newChild != oldChild) {
              children.set(newChild);
            }
          } else {
            // Remove the child, if it transformed to Absent.
            children.remove();
          }
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
    return new ChildrenSelector((Selector) then);
  }

  @Override
  public Selector andThen(Selector then) {
    return new ChildrenSelector(this.then.andThen(then));
  }

  @Override
  public int typeOrder() {
    return 17;
  }

  @Override
  protected int compareTo(Selector that) {
    if (that instanceof ChildrenSelector) {
      return compareTo((ChildrenSelector) that);
    }
    return Integer.compare(typeOrder(), that.typeOrder());
  }

  int compareTo(ChildrenSelector that) {
    return this.then.compareTo(that.then);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof ChildrenSelector) {
      final ChildrenSelector that = (ChildrenSelector) other;
      return this.then.equals(that.then);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(ChildrenSelector.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, this.then.hashCode()));
  }

  @Override
  public void debugThen(Output<?> output) {
    output = output.write('.').write("children").write('(').write(')');
    this.then.debugThen(output);
  }

  private static int hashSeed;
}
