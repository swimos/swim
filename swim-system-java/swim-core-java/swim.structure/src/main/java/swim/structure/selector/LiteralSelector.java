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
import swim.structure.Selectee;
import swim.structure.Selector;
import swim.util.Murmur3;

/**
 * A {@link Selector} that, when {@link #evaluate evaluated}, evaluates and
 * yields {@code item} against {@code interpreter}.  This allows us to express
 * various selection criteria without having to implement the corresponding
 * dedicated {@code Selectors}.
 * <p>
 * Such behavior is <i>especially</i> useful in conjunction with {@link
 * FilterSelector FilterSelectors}. For example, to select {@code Items} in some
 * {@code Interpreter} such that the sum of the results of {@code selecting} "a"
 * and "b" is less than 5, we could do
 * <p>
 * {@code Selector.literal(Selector.get("a").plus(Selector.get("b")).lt(5))}
 * <p>
 * This, notably, does not require a "ConditionalSelector" and only needs
 * correct implementations of {@link swim.structure.operator.LtOperator} and
 * {@link swim.structure.operator.PlusOperator}.
 */
public final class LiteralSelector extends Selector {
  final Item item;
  final Selector then;

  public LiteralSelector(Item item, Selector then) {
    this.item = item.commit();
    this.then = then;
  }

  public Item item() {
    return this.item;
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
      final Item literal = this.item.evaluate(interpreter);
      if (literal.isDefined()) {
        // Push the literal onto the scope stack.
        interpreter.pushScope(literal);
        // Subselect the literal.
        selected = this.then.forSelected(interpreter, callback);
        // Pop the literal off of the scope stack.
        interpreter.popScope();
      }
    }
    interpreter.didSelect(this, selected);
    return selected;
  }

  @Override
  public Item mapSelected(Interpreter interpreter, Selectee<Item> transform) {
    final Item result;
    interpreter.willTransform(this);
    if (interpreter.scopeDepth() != 0) {
      Item literal = this.item.evaluate(interpreter);
      if (literal.isDefined()) {
        // Push the literal onto the scope stack.
        interpreter.pushScope(literal);
        // Transform the literal.
        literal = this.then.mapSelected(interpreter, transform);
        // Pop the literal off of the scope stack.
        interpreter.popScope();
      }
      result = literal;
    } else {
      result = Item.absent();
    }
    interpreter.didTransform(this, result);
    return result;
  }

  @Override
  public Item substitute(Interpreter interpreter) {
    final Item item = this.item.substitute(interpreter);
    Item then = this.then.substitute(interpreter);
    if (!(then instanceof Selector)) {
      then = this.then;
    }
    return new LiteralSelector(item, (Selector) then);
  }

  @Override
  public Selector andThen(Selector that) {
    return new LiteralSelector(this.item, this.then.andThen(then));
  }

  @Override
  public int precedence() {
    return this.item.precedence();
  }

  @Override
  public int typeOrder() {
    return 11;
  }

  @Override
  protected int compareTo(Selector that) {
    if (that instanceof LiteralSelector) {
      return compareTo((LiteralSelector) that);
    }
    return Integer.compare(typeOrder(), that.typeOrder());
  }

  int compareTo(LiteralSelector that) {
    int order = this.item.compareTo(that.item);
    if (order == 0) {
      order = this.then.compareTo(that.then);
    }
    return order;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof LiteralSelector) {
      final LiteralSelector that = (LiteralSelector) other;
      return this.item.equals(that.item) && this.then.equals(that.then);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(LiteralSelector.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
        this.item.hashCode()), this.then.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("Selector").write('.').write("literal").write('(').debug(this.item).write(')');
    this.then.debugThen(output);
  }

  @Override
  public void debugThen(Output<?> output) {
    // nop
  }

  private static int hashSeed;
}
