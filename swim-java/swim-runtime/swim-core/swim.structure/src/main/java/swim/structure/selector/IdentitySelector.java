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

package swim.structure.selector;

import swim.codec.Output;
import swim.structure.Interpreter;
import swim.structure.Item;
import swim.structure.Num;
import swim.structure.Selectee;
import swim.structure.Selector;
import swim.structure.Text;
import swim.structure.Value;
import swim.util.Murmur3;

public final class IdentitySelector extends Selector {

  private IdentitySelector() {
    // singleton
  }

  @Override
  public Selector then() {
    return this;
  }

  @Override
  public <T> T forSelected(Interpreter interpreter, Selectee<T> callback) {
    T selected = null;
    interpreter.willSelect(this);
    if (interpreter.scopeDepth() != 0) {
      // Pop the current selection off of the stack to take it out of scope.
      final Item oldScope = interpreter.popScope();
      // Evaluate the current selection.
      final Item newScope = oldScope.evaluate(interpreter);
      // Push the evaluated selection onto the scope stack.
      interpreter.pushScope(newScope);
      // Visit the evaluated selection.
      selected = callback.selected(interpreter);
      // Restore the original selection to the top of the scope stack.
      interpreter.swapScope(oldScope);
    }
    interpreter.didSelect(this, selected);
    return selected;
  }

  @Override
  public Item mapSelected(Interpreter interpreter, Selectee<Item> transform) {
    return transform.selected(interpreter);
  }

  @Override
  public Item substitute(Interpreter interpreter) {
    return interpreter.peekScope().substitute(interpreter);
  }

  @Override
  public Selector get(Value key) {
    return new GetSelector(key, this);
  }

  @Override
  public Selector getAttr(Text key) {
    return new GetAttrSelector(key, this);
  }

  @Override
  public Selector getItem(Num index) {
    return new GetItemSelector(index, this);
  }

  @Override
  public Selector andThen(Selector then) {
    return then;
  }

  @Override
  public Selector keys() {
    if (IdentitySelector.keys == null) {
      IdentitySelector.keys = new KeysSelector(this);
    }
    return IdentitySelector.keys;
  }

  @Override
  public Selector values() {
    if (IdentitySelector.values == null) {
      IdentitySelector.values = new ValuesSelector(this);
    }
    return IdentitySelector.values;
  }

  @Override
  public Selector children() {
    if (IdentitySelector.children == null) {
      IdentitySelector.children = new ChildrenSelector(this);
    }
    return IdentitySelector.children;
  }

  @Override
  public Selector descendants() {
    if (IdentitySelector.descendants == null) {
      IdentitySelector.descendants = new DescendantsSelector(this);
    }
    return IdentitySelector.descendants;
  }

  @Override
  public int typeOrder() {
    return 10;
  }

  @Override
  protected int compareTo(Selector that) {
    return Integer.compare(this.typeOrder(), that.typeOrder());
  }

  @Override
  public boolean equals(Object other) {
    return this == other;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (IdentitySelector.hashSeed == 0) {
      IdentitySelector.hashSeed = Murmur3.seed(IdentitySelector.class);
    }
    return IdentitySelector.hashSeed;
  }

  @Override
  public <T> Output<T> debugThen(Output<T> output) {
    return output; // blank
  }

  private static Selector keys;
  private static Selector values;
  private static Selector children;
  private static Selector descendants;

  private static final IdentitySelector IDENTITY = new IdentitySelector();

  public static IdentitySelector identity() {
    return IdentitySelector.IDENTITY;
  }

}
