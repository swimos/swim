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

package swim.structure;

public class Interpreter {
  protected InterpreterSettings settings;

  Item[] scopeStack;
  int scopeDepth;

  protected Interpreter(InterpreterSettings settings, Item[] scopeStack, int scopeDepth) {
    this.settings = settings;
    this.scopeStack = scopeStack;
    this.scopeDepth = scopeDepth;
  }

  public Interpreter(InterpreterSettings settings) {
    this(settings, null, 0);
  }

  public Interpreter() {
    this(InterpreterSettings.standard(), null, 0);
  }

  public final InterpreterSettings settings() {
    return this.settings;
  }

  public Interpreter settings(InterpreterSettings settings) {
    this.settings = settings;
    return this;
  }

  public final int scopeDepth() {
    return this.scopeDepth;
  }

  public Item peekScope() {
    final int scopeDepth = this.scopeDepth;
    if (scopeDepth <= 0) {
      throw new InterpreterException("scope stack empty");
    }
    return this.scopeStack[scopeDepth - 1];
  }

  public Item getScope(int index) {
    if (index < 0 || index >= this.scopeDepth) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    return this.scopeStack[index];
  }

  public void pushScope(Item scope) {
    final int scopeDepth = this.scopeDepth;
    if (scopeDepth >= this.settings.maxScopeDepth) {
      throw new InterpreterException("scope stack overflow");
    }
    final Item[] oldScopeStack = this.scopeStack;
    final Item[] newScopeStack;
    if (oldScopeStack == null || scopeDepth + 1 > oldScopeStack.length) {
      newScopeStack = new Item[expand(scopeDepth + 1)];
      if (oldScopeStack != null) {
        System.arraycopy(oldScopeStack, 0, newScopeStack, 0, scopeDepth);
      }
      this.scopeStack = newScopeStack;
    } else {
      newScopeStack = oldScopeStack;
    }
    newScopeStack[scopeDepth] = scope;
    this.scopeDepth = scopeDepth + 1;
  }

  public Item popScope() {
    final int scopeDepth = this.scopeDepth;
    if (scopeDepth <= 0) {
      throw new InterpreterException("scope stack empty");
    }
    final Item[] scopeStack = this.scopeStack;
    final Item scope = scopeStack[scopeDepth - 1];
    scopeStack[scopeDepth - 1] = null;
    this.scopeDepth = scopeDepth - 1;
    return scope;
  }

  public Item swapScope(Item newScope) {
    final int scopeDepth = this.scopeDepth;
    if (scopeDepth <= 0) {
      throw new InterpreterException("scope stack empty");
    }
    final Item[] scopeStack = this.scopeStack;
    final Item oldScope = scopeStack[scopeDepth - 1];
    scopeStack[scopeDepth - 1] = newScope;
    return oldScope;
  }

  public void willOperate(Operator operator) {
    // stub
  }

  public void didOperate(Operator operator, Item result) {
    // stub
  }

  public void willSelect(Selector selector) {
    // stub
  }

  public void didSelect(Selector selector, Object result) {
    // stub
  }

  public void willTransform(Selector selector) {
    // stub
  }

  public void didTransform(Selector selector, Item result) {
    // stub
  }

  static int expand(int n) {
    n = Math.max(32, n) - 1;
    n |= n >> 1;
    n |= n >> 2;
    n |= n >> 4;
    n |= n >> 8;
    n |= n >> 16;
    return n + 1;
  }
}
