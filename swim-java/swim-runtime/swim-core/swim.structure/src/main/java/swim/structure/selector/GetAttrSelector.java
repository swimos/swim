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
import swim.structure.Attr;
import swim.structure.Field;
import swim.structure.Interpreter;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Selectee;
import swim.structure.Selector;
import swim.structure.Text;
import swim.structure.Value;
import swim.util.Murmur3;

public final class GetAttrSelector extends Selector {

  final Text key;
  final Selector then;

  public GetAttrSelector(Text key, Selector then) {
    this.key = key;
    this.then = then;
  }

  public Text accessor() {
    return this.key;
  }

  @Override
  public Selector then() {
    return this.then;
  }

  @Override
  public <T> T forSelected(Interpreter interpreter, Selectee<T> callback) {
    interpreter.willSelect(this);
    final Value key = this.key;
    final T selected = GetAttrSelector.forSelected(key, this.then, interpreter, callback);
    interpreter.didSelect(this, selected);
    return selected;
  }

  private static <T> T forSelected(Value key, Selector then, Interpreter interpreter, Selectee<T> callback) {
    T selected = null;
    if (interpreter.scopeDepth() != 0) {
      // Pop the next selection off of the stack to take it out of scope.
      final Value scope = interpreter.popScope().toValue();
      final Field field;
      // Only records can have members.
      if (scope instanceof Record) {
        field = scope.getField(key);
        if (field instanceof Attr) {
          // Push the field value onto the scope stack.
          interpreter.pushScope(field.toValue());
          // Subselect the field value.
          selected = then.forSelected(interpreter, callback);
          // Pop the field value off of the scope stack.
          interpreter.popScope();
        }
      } else {
        field = null;
      }
      if (field == null && selected == null) {
        GetAttrSelector.forSelected(key, then, interpreter, callback);
      }
      // Push the current selection back onto the stack.
      interpreter.pushScope(scope);
    }
    return selected;
  }

  @Override
  public Item mapSelected(Interpreter interpreter, Selectee<Item> transform) {
    final Item result;
    interpreter.willTransform(this);
    final Text key = this.key;
    if (interpreter.scopeDepth() != 0) {
      // Pop the current selection off of the stack to take it out of scope.
      final Value scope = interpreter.popScope().toValue();
      // Only records can have members.
      if (scope instanceof Record) {
        final Record record = (Record) scope;
        final Field oldField = record.getField(key);
        if (oldField instanceof Attr) {
          // Push the field value onto the scope stack.
          interpreter.pushScope(oldField.toValue());
          // Transform the field value.
          final Item newItem = this.then.mapSelected(interpreter, transform);
          // Pop the field value off the scope stack.
          interpreter.popScope();
          if (newItem instanceof Field) {
            // Replace the original field with the transformed field.
            if (key.equals(newItem.key())) {
              record.putAttr(key, newItem.toValue());
            } else {
              record.remove(key);
              record.add(newItem);
            }
          } else if (newItem.isDefined()) {
            // Update the field with the transformed value.
            record.putAttr(key, newItem.toValue());
          } else {
            // Remove the field.
            record.remove(key);
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
    final Text key = this.key;
    final Item value = GetAttrSelector.substitute(key, this.then, interpreter);
    if (value != null) {
      return value;
    }
    Item then = this.then.substitute(interpreter);
    if (!(then instanceof Selector)) {
      then = this.then;
    }
    return new GetAttrSelector(this.key, (Selector) then);
  }

  private static Item substitute(Text key, Selector then, Interpreter interpreter) {
    Item selected = null;
    if (interpreter.scopeDepth() != 0) {
      // Pop the next selection off of the stack to take it out of scope.
      final Value scope = interpreter.popScope().toValue();
      final Field field;
      // Only records can have members.
      if (scope instanceof Record) {
        field = scope.getField(key);
        if (field instanceof Attr) {
          // Substitute the field value.
          selected = field.toValue().substitute(interpreter);
        }
      } else {
        field = null;
      }
      if (field != null && selected != null) {
        GetAttrSelector.substitute(key, then, interpreter);
      }
      // Push the current selection back onto the stack.
      interpreter.pushScope(scope);
    }
    return selected;
  }

  @Override
  public Selector andThen(Selector then) {
    return new GetAttrSelector(this.key, this.then.andThen(then));
  }

  @Override
  public int typeOrder() {
    return 13;
  }

  @Override
  protected int compareTo(Selector that) {
    if (that instanceof GetAttrSelector) {
      return this.compareTo((GetAttrSelector) that);
    }
    return Integer.compare(this.typeOrder(), that.typeOrder());
  }

  int compareTo(GetAttrSelector that) {
    int order = this.key.compareTo(that.key);
    if (order == 0) {
      order = this.then.compareTo(that.then);
    }
    return order;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof GetAttrSelector) {
      final GetAttrSelector that = (GetAttrSelector) other;
      return this.key.equals(that.key) && this.then.equals(that.then);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (GetAttrSelector.hashSeed == 0) {
      GetAttrSelector.hashSeed = Murmur3.seed(GetAttrSelector.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(GetAttrSelector.hashSeed,
        this.key.hashCode()), this.then.hashCode()));
  }

  @Override
  public <T> Output<T> debugThen(Output<T> output) {
    output = output.write('.').write("getAttr").write('(').debug(this.key).write(')');
    output = this.then.debugThen(output);
    return output;
  }

}
