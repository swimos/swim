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
 * An {@link Operator} that represents a unary operation, i.e. an operation on
 * one operand.
 */
public abstract class UnaryOperator extends Operator {
  final Item operand;

  public UnaryOperator(Item operand) {
    this.operand = operand.commit();
  }

  public final Item operand() {
    return this.operand;
  }

  /**
   * Returns the token that identifiers this {@code Operator}'s operation.
   * Used to uniquely identify the type of operation, and to aid serialization.
   */
  public abstract String operator();

  @Override
  public boolean isConstant() {
    return this.operand.isConstant();
  }
}
