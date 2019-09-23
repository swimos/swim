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

package swim.dataflow.graph.impl.windows;

/**
 * Manages the window panes for a stream.
 * @param <T> The type of the values in the window.
 * @param <W> The type of the window.
 * @param <U> The result type when a window trigger fires.
 */
public interface PaneManager<T, W, U> {

  void setListener(Listener<W, U> listener);

  /**
   * Update with the next value.
   * @param data The next value.
   * @param timestamp The timestamp of the next value.
   * @param context Event scheduler.
   */
  void update(T data, long timestamp, TimeContext context);

  @FunctionalInterface
  interface Listener<W, U> {

    void accept(W window, U value);

  }

  @FunctionalInterface
  interface WindowCallback {

    void runEvent(long requested, long actual);

  }

  interface TimeContext {

    void scheduleAt(long timestamp, WindowCallback callback);

  }

  void close();


}
