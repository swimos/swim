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

import swim.codec.Output;
import swim.structure.Interpreter;
import swim.structure.Item;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Selectee;
import swim.structure.Selector;
import swim.structure.Value;
import swim.util.Murmur3;

public final class GetItemSelector extends Selector {
  final Num index;
  final Selector then;

  public GetItemSelector(Num index, Selector then) {
    this.index = index;
    this.then = then;
  }

  public Num accessor() {
    return this.index;
  }

  @Override
  public Selector then() {
    return this.then;
  }

  @Override
  public <T> T forSelected(Interpreter interpreter, Selectee<T> callback) {
    T selected = null;
    interpreter.willSelect(this);
    final int index = this.index.intValue();
    if (interpreter.scopeDepth() != 0) {
      // Pop the current selection off of the stack to take it out of scope.
      final Value scope = interpreter.popScope().toValue();
      if (scope instanceof Record && index < scope.length()) {
        final Item item = scope.getItem(index);
        // Push the item onto the scope stack.
        interpreter.pushScope(item);
        // Subselect the item.
        selected = this.then.forSelected(interpreter, callback);
        // Pop the item off of the scope stack.
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
      final Value scope = interpreter.popScope().toValue();
      final int index = this.index.intValue();
      if (scope instanceof Record && index < scope.length()) {
        final Item oldItem = scope.getItem(index);
        // Push the item onto the scope stack.
        interpreter.pushScope(oldItem);
        // Transform the item.
        final Item newItem = this.then.mapSelected(interpreter, transform);
        // Pop the item off the scope stack.
        interpreter.popScope();
        if (newItem.isDefined()) {
          ((Record) scope).setItem(index, newItem);
        } else {
          ((Record) scope).remove(index);
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
    final int index = this.index.intValue();
    if (interpreter.scopeDepth() != 0) {
      // Pop the current selection off of the stack to take it out of scope.
      final Value scope = interpreter.popScope().toValue();
      final Item selected;
      if (scope instanceof Record && index < scope.length()) {
        final Item item = scope.getItem(index);
        // Substitute the item.
        selected = item.substitute(interpreter);
      } else {
        selected = null;
      }
      // Push the current selection back onto the stack.
      interpreter.pushScope(scope);
      if (selected != null) {
        return selected;
      }
    }
    Item then = this.then.substitute(interpreter);
    if (!(then instanceof Selector)) {
      then = this.then;
    }
    return new GetItemSelector(this.index, (Selector) then);
  }

  @Override
  public Selector andThen(Selector then) {
    return new GetItemSelector(index, this.then.andThen(then));
  }

  @Override
  public int typeOrder() {
    return 14;
  }

  @Override
  protected int compareTo(Selector that) {
    if (that instanceof GetItemSelector) {
      return compareTo((GetItemSelector) that);
    }
    return Integer.compare(typeOrder(), that.typeOrder());
  }

  int compareTo(GetItemSelector that) {
    int order = this.index.compareTo(that.index);
    if (order == 0) {
      order = this.then.compareTo(that.then);
    }
    return order;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof GetItemSelector) {
      final GetItemSelector that = (GetItemSelector) other;
      return index.equals(that.index) && then.equals(that.then);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(GetItemSelector.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
        this.index.hashCode()), this.then.hashCode()));
  }

  @Override
  public void debugThen(Output<?> output) {
    output = output.write('.').write("getItem").write('(').debug(this.index).write(')');
    this.then.debugThen(output);
  }

  private static int hashSeed;
}
