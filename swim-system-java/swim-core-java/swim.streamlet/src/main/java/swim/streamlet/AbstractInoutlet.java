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

package swim.streamlet;

import java.util.Iterator;
import swim.util.Cursor;

public abstract class AbstractInoutlet<I, O> implements Inoutlet<I, O> {
  protected Outlet<? extends I> input;
  protected Inlet<? super O>[] outputs;
  protected int version;

  public AbstractInoutlet() {
    this.input = null;
    this.outputs = null;
    this.version = -1;
  }

  @Override
  public abstract O get();

  @Override
  public Outlet<? extends I> input() {
    return this.input;
  }

  @Override
  public void bindInput(Outlet<? extends I> input) {
    if (this.input != null) {
      this.input.unbindOutput(this);
    }
    this.input = input;
    if (this.input != null) {
      this.input.bindOutput(this);
    }
  }

  @Override
  public void unbindInput() {
    if (this.input != null) {
      this.input.unbindOutput(this);
    }
    this.input = null;
  }

  @Override
  public void disconnectInputs() {
    if (this.outputs == null) {
      final Outlet<? extends I> input = this.input;
      if (input != null) {
        input.unbindOutput(this);
        this.input = null;
        input.disconnectInputs();
      }
    }
  }

  @Override
  public Iterator<Inlet<? super O>> outputIterator() {
    return this.outputs != null ? Cursor.array(this.outputs) : Cursor.empty();
  }

  @SuppressWarnings("unchecked")
  @Override
  public void bindOutput(Inlet<? super O> output) {
    final Inlet<? super O>[] oldOutputs = this.outputs;
    final int n = oldOutputs != null ? oldOutputs.length : 0;
    final Inlet<? super O>[] newOutputs = (Inlet<? super O>[]) new Inlet<?>[n + 1];
    if (n > 0) {
      System.arraycopy(oldOutputs, 0, newOutputs, 0, n);
    }
    newOutputs[n] = output;
    this.outputs = newOutputs;
  }

  @SuppressWarnings("unchecked")
  @Override
  public void unbindOutput(Inlet<? super O> output) {
    final Inlet<? super O>[] oldOutputs = this.outputs;
    final int n = oldOutputs != null ? oldOutputs.length : 0;
    for (int i = 0; i < n; i += 1) {
      if (oldOutputs[i].equals(output)) {
        if (n > 1) {
          final Inlet<? super O>[] newOutputs = (Inlet<? super O>[]) new Inlet<?>[n - 1];
          System.arraycopy(oldOutputs, 0, newOutputs, 0, i);
          System.arraycopy(oldOutputs, i + 1, newOutputs, i, (n - 1) - i);
          this.outputs = newOutputs;
        } else {
          this.outputs = null;
        }
        break;
      }
    }
  }

  @Override
  public void unbindOutputs() {
    final Inlet<? super O>[] outputs = this.outputs;
    if (outputs != null) {
      this.outputs = null;
      for (int i = 0, n = outputs.length; i < n; i += 1) {
        final Inlet<? super O> output = outputs[i];
        output.unbindInput();
      }
    }
  }

  @Override
  public void disconnectOutputs() {
    if (this.input == null) {
      final Inlet<? super O>[] outputs = this.outputs;
      if (outputs != null) {
        this.outputs = null;
        for (int i = 0, n = outputs.length; i < n; i += 1) {
          final Inlet<? super O> output = outputs[i];
          output.unbindInput();
          output.disconnectOutputs();
        }
      }
    }
  }

  @Override
  public void invalidateOutput() {
    invalidate();
  }

  @Override
  public void invalidateInput() {
    invalidate();
  }

  public void invalidate() {
    if (this.version >= 0) {
      willInvalidate();
      this.version = -1;
      onInvalidate();
      final int n = this.outputs != null ? this.outputs.length : 0;
      for (int i = 0; i < n; i += 1) {
        this.outputs[i].invalidateOutput();
      }
      didInvalidate();
    }
  }

  @Override
  public void reconcileOutput(int version) {
    reconcile(version);
  }

  @Override
  public void reconcileInput(int version) {
    reconcile(version);
  }

  public void reconcile(int version) {
    if (this.version < 0) {
      willReconcile(version);
      this.version = version;
      if (this.input != null) {
        this.input.reconcileInput(version);
      }
      onReconcile(version);
      final int n = this.outputs != null ? this.outputs.length : 0;
      for (int i = 0; i < n; i += 1) {
        this.outputs[i].reconcileOutput(version);
      }
      didReconcile(version);
    }
  }

  protected void willInvalidate() {
    // stub
  }

  protected void onInvalidate() {
    // stub
  }

  protected void didInvalidate() {
    // stub
  }

  protected void willReconcile(int version) {
    // stub
  }

  protected void onReconcile(int version) {
    // stub
  }

  protected void didReconcile(int version) {
    // stub
  }
}
