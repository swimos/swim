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

package swim.structure.operator;

import swim.structure.Item;
import swim.structure.Operator;

/**
 * An {@link Operator} that represents a binary operation, i.e. an operation on
 * two operands.
 */
public abstract class BinaryOperator extends Operator {
  final Item operand1;
  final Item operand2;

  public BinaryOperator(Item operand1, Item operand2) {
    this.operand1 = operand1.commit();
    this.operand2 = operand2.commit();
  }

  public final Item operand1() {
    return this.operand1;
  }

  /**
   * Returns the token that identifiers this {@code Operator}'s operation.
   * Used to uniquely identify the type of operation, and to aid serialization.
   */
  public abstract String operator();

  public final Item operand2() {
    return this.operand2;
  }

  @Override
  public boolean isConstant() {
    return this.operand1.isConstant() && this.operand2.isConstant();
  }
}
