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

package swim.streamlet;

/**
 * A {@code MapInlet} that decoheres a parameterized {@code Outlet} whenever
 * the {@code MapInlet} decoheres, and that recoheres the parameterized
 * {@code Outlet} whenever the {@code MapInlet} recoheres.
 */
public class OutletMapInlet<K, V, O> extends AbstractMapInlet<K, V, O> {

  protected final Outlet<?> outlet;

  public OutletMapInlet(Outlet<?> outlet) {
    this.outlet = outlet;
  }

  public Outlet<?> outlet() {
    return this.outlet;
  }

  @Override
  protected void onDecohereOutputKey(K key, KeyEffect effect) {
    this.outlet.decohereInput();
  }

  @Override
  protected void onDecohereOutput() {
    this.outlet.decohereInput();
  }

  @Override
  protected void onRecohereOutputKey(K key, KeyEffect effect, int version) {
    this.outlet.recohereInput(version);
  }

  @Override
  protected void onRecohereOutput(int version) {
    this.outlet.recohereInput(version);
  }

}
